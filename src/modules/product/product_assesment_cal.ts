import { Types } from "mongoose";
import Controller from "../../lib/controller.js";
import ProductModel, { initializeProductModel } from "./product.model.js";
import { initializeCalculationController } from "../calculation_api/calculation.controller.js";
import { transformPackaging } from "./structuring_destructing_packaging.js";
import { initializeMasterDataController } from "../master/master-data.controller.js";

interface RawMaterial {
  raw_material_id: string;
  raw_material_name: string;
  raw_material_value: string;
}

interface User {
  name: string;
  email: string;
}

interface AssessmentData {
  productId: string;
  assessmentId: string;
  assessmentType: string;
  user: User;
  [key: string]: any;
}

const getValue = <T>(
  obj: Record<string, any>,
  key: string,
  defaultValue: T,
): T => (obj?.[key] !== undefined ? obj[key] : defaultValue);

const getAssessmentPath = (
  assessmentType: string,
  index: number,
  field: string,
): string =>
  assessmentType === "experimental"
    ? `assessments.${assessmentType}.${index}.${field}`
    : `assessments.${assessmentType}.${field}`;

class AssessmentCalculationController extends Controller {
  constructor(model: any) {
    super(model);
  }

  norm = (v: unknown) => (v == null ? "" : String(v)).trim().toLowerCase();

  isNa = (v) => typeof v === "string" && v.trim() === "Not Applicable";

  // Build a per-dictionary mapper (name + per-material type) => O(1) lookups
  makeMaterialMapper(
    dict: any,
  ): (
    matName: unknown,
    typeName: unknown,
  ) => { material_spice: string; type_spice: string } {
    const mats = Array.isArray(dict[0]?.packaging.materials)
      ? dict[0].packaging.materials
      : [];
    const idx = new Map<
      string,
      { nameSpice?: string; typeIdx: Map<string, string> }
    >();

    for (const m of mats) {
      const k = this.norm(m?.name?.tru_name);
      if (!k) continue;
      const typeIdx = new Map<string, string>();
      for (const t of Array.isArray(m?.type) ? m.type : []) {
        const tk = this.norm(t?.tru_name);
        if (tk) typeIdx.set(tk, String(t?.spice_name ?? ""));
      }
      idx.set(k, {
        nameSpice: m?.name?.spice_name ? String(m.name.spice_name) : undefined,
        typeIdx,
      });
    }

    return (matName, typeName) => {
      const e = idx.get(this.norm(matName));
      return {
        material_spice: (e?.nameSpice ?? String(matName ?? "")).trim(),
        type_spice: (
          e?.typeIdx.get(this.norm(typeName)) ?? String(typeName ?? "")
        ).trim(),
      };
    };
  }

  private extractFinishingArray = (
    source: any,
  ): Array<{ tru_name: string; spice_name: string }> => {
    const candidates = Array.isArray(source) ? source : [source];
    const result: Array<{ tru_name: string; spice_name: string }> = [];

    for (const d of candidates) {
      // case 1: d itself is an array of mapping objects
      if (Array.isArray(d) && d.length) {
        for (const item of d.flat()) {
          if (
            item &&
            typeof item === "object" &&
            "tru_name" in item &&
            "spice_name" in item
          ) {
            result.push(item);
          }
        }
        continue;
      }

      // case 2: nested object shapes
      const a =
        d?.finishing_process ??
        d?.finishingprocess ??
        d?.packaging?.finishing_process ??
        d?.packaging?.finishingprocess;

      if (Array.isArray(a) && a.length) {
        for (const item of a.flat()) {
          if (
            item &&
            typeof item === "object" &&
            "tru_name" in item &&
            "spice_name" in item
          ) {
            result.push(item);
          }
        }
      }
    }

    return result;
  };

  makeFinishingProcessMapper(source: any) {
    const norm = (v: unknown) =>
      String(v ?? "")
        .trim()
        .toLowerCase();

    const arr = this.extractFinishingArray(source);

    return (truName: string): string => {
      if (!arr.length) return "NoProcess";

      const target = norm(truName);
      const hit = arr.find((f) => norm(f.tru_name) === target);

      return hit?.spice_name ?? "NoProcess";
    };
  }

  async processDataAndCallLambda(
    data: AssessmentData,
    formulaList: string[],
    callCalculationFormula: any,
  ): Promise<any> {
    try {
      const payload = {
        stepFunctionList: formulaList,
        productId: data.productId,
        assessmentId: data.assessmentId,
        assessmentType: data.assessmentType,
        assessmentId2: getValue(data, "assessmentId2", ""),
        assessmentType2: getValue(data, "assessmentType2", ""),
        formulaId: getValue(data, "fmlCode", ""),
        fg_spec: getValue(data, "fg_spec", ""),
        fg_revision: getValue(data, "fg_revision", ""),
        sales_country: getValue(data, "sales_country", ""),
        production_country: getValue(data, "production_country", ""),
        net_content: getValue(data, "net_content", 0),
        formula_id: getValue(data, "formula_id", ""),
        ConsumablesUsed: getValue(data, "consumablesUsed", 0),
        productSegment: getValue(data, "productSegment", ""),
        productSubSegment: getValue(data, "productSubSegment", ""),
        claimedVolumed: getValue(data, "net_content", 0),
        useDose: getValue(data, "useDose", ""),
        net_content_unit: getValue(data, "net_content_unit", ""),
        productEvaluation: getValue(data, "productEvaluation", 90),
        useScenario: getValue(data, "useScenario",""),
        user: data.user,
        raw_materials: getValue(data, "raw_materials", []),
        data: getValue(data, "raw_materials", []),
        packaging_level: getValue(data, "packaging_level", []),
      };
      return await callCalculationFormula.lambda_handler(payload);
    } catch (error) {
      console.log("Error in processDataAndCallLambda", formulaList, error);
      return null;
    }
  }

  async AssessmentCalculation(
    productId: string,
    assessmentId: string,
    assessmentType: string,
    product: any[],
    assessmentIndex: number,
  ) {
    try {
      const query = {
        isDeleted: false,
        _id: new Types.ObjectId(productId),
        [`assessments.${assessmentType}._id`]: new Types.ObjectId(assessmentId),
      };
      const updateQuery = {
        isDeleted: false,
        _id: new Types.ObjectId(productId),
      };
      const masterDataController = await initializeMasterDataController();
      const productData = await this.model.find(query).exec();
      if (!productData.length) return "fail";

      const result = productData[0].toJSON();
      const details =
        result.assessments[assessmentType]?.[assessmentIndex] ||
        result.assessments[assessmentType];
      const user = result.users;

      const callCalculationFormula = await initializeCalculationController();

      let data: AssessmentData = {
        productId,
        assessmentId,
        assessmentType,
        user,
      };
      let raw_materials: RawMaterial[] = [];
      let formulaLambdaCall: string[] = [],
        packagingLambdaCall: string[] = [];
      let sustainabilityData;
      let packagingInputData;
      let dicts;
      let finishingProcessDict;
      let isFormulationCalculated = false;
      let isFormulationEOLCalculated = false;
      let isPackagingCalculated = false;
      let isSpiceCalculated = true;
      let isGreenChemistryCalculated = false;
      let isSustainabilityPackagingCalculated = false;
      let isLCACalculated = false;
      let isGreenChemistryRollupCalculated = false;
      let isSustainabilityPackagingRollupCalculated = false;
      let isBaselineGreenChemistryRollup = false;

      const SPLambdaCall = [
        "sustainablepackaging-recyclable-content",
        "sustainablepackaging-pcr",
        "sustainablepackaging-material-efficiency",
        "sustainablepackaging-recyclability-disruptors",
      ];

      const GCLambdaCall = [
        "renewable_feedback_stock",
        "watchlist",
        "gaia_score",
      ];

      if (details?.isFormulationDataCompleted) {
        raw_materials = details.formulation.rawMaterials.map((item: any) => ({
          raw_material_id: item.rawMaterialId,
          raw_material_name: item.tradeName,
          raw_material_value: item.percentage || "0",
        }));

        formulaLambdaCall = [
          "rawmaterials",
          "manufacturing",
          "formula_end_of_life",
          "usephase",
        ];
        Object.assign(data, {
          ...details.formulation,
          formulaId: details.formulation.fmlCode,
          formula_id: details.formulation.fmlCode,
          claimedVolumed: parseFloat(details.formulation.netContent),
          ConsumablesUsed: parseFloat(details.formulation.consumablesUsed),
          net_content: parseFloat(details.formulation.netContent),
          raw_materials,
          productEvaluation: details.packaging_level[0].hasOwnProperty(
            "productEvaluation",
          )
            ? details.packaging_level[0].productEvaluation
            : details.packaging_level.length > 1
            ? details.packaging_level[1].productEvaluation
            : 90,
        });
      }
      const destructuringProduct = transformPackaging(details);
      if (destructuringProduct?.length > 0) {
        const uniq = new Set<string>();
        const uniqFinishing = new Set<string>();
        for (const pack of destructuringProduct) {
          for (const c of pack.components ?? []) {
            if (!c?.isDataComplete) continue;
            const f = this.norm(c?.finishing_process);
            if (f) uniqFinishing.add(f);
            for (const m of c?.material ?? []) {
              const k = this.norm(m?.material_name);
              if (k) uniq.add(k);
            }
          }
        }

        const names = Array.from(uniq);
        const FinsihingNames = Array.from(uniqFinishing);

        dicts = await Promise.all(
          names.map((n) => masterDataController.getSpicePackagingValue(n)),
        );
        const finishingDict = await Promise.all(
          FinsihingNames.map((n) =>
            masterDataController.getSpiceFinishingProcessValue(n),
          ),
        );
        finishingProcessDict =
          finishingDict.length > 0
            ? finishingDict.map((d) => this.extractFinishingArray(d))
            : finishingDict;

        const mapFinishing = this.makeFinishingProcessMapper(
          finishingProcessDict,
        );

        const mappers = new Map<
          string,
          (
            matName: unknown,
            typeName: unknown,
          ) => { material_spice: string; type_spice: string }
        >();
        for (let i = 0; i < names.length; i++)
          mappers.set(names[i], this.makeMaterialMapper(dicts[i]));

        const mapOne = (matName: unknown, typeName: unknown) => {
          const fn = mappers.get(this.norm(matName));
          return fn
            ? fn(matName, typeName)
            : {
                material_spice: String(matName ?? ""),
                type_spice: String(typeName ?? ""),
              };
        };

        const packagingData = (details.packaging_level ?? []).map(
          (pack: any) => {
            const components = [];

            for (const c of pack.components ?? []) {
              const sub_components = [];
              if (!c?.isDataComplete) continue;
              for (const sc of c.sub_components) {
                const materialList: any[] = [];

                for (const m of sc.material ?? []) {
                  const { material_spice, type_spice } = mapOne(
                    m?.material_name,
                    m?.converting_process,
                  );

                  //completely skip this material (don’t even push)
                  if (this.isNa(material_spice)) continue;
                  // if(!m?.material_type.includes("PCR")) continue
                  materialList.push({
                    ...m,
                    material_name: material_spice, // fallback preserved
                    converting_process: type_spice, // fallback preserved
                    tru_material_name: m?.material_name,
                    tru_converting_process: m?.converting_process,
                    materialId: m?._id,
                    material_pct:
                      m?.material_pct !== null ? m?.material_pct : 0,
                    pcr_content: m?.material_type.includes("PCR")
                      ? m?.material_pct !== null
                        ? m?.material_pct
                        : 0
                      : 0,
                  });
                }

                sub_components.push({
                  ...sc,
                  material: materialList,
                  componentId: c?._id,
                  finishing_process: mapFinishing(
                    sc?.finishing_process ?? "No Process",
                  ),
                  tru_finishing_process: sc?.finishing_process,
                });
              }
              components.push({ ...c, sub_components });
            }

            return {
              ...pack,
              components,
              rateOfRestitution: pack.productEvaluation,
            };
          },
        );

        const sustainabilityPackagingData = destructuringProduct
          .map((pack: any) => {
            const components = (pack.components ?? [])
              .filter((c: any) => c.isDataComplete)
              .map((c: any) => {
                const material = (c.material ?? []).map((m: any) => {
                  return {
                    ...m, // fallback preserved
                    materialId: m?._id,
                    material_pct:
                      m?.material_pct !== null ? m?.material_pct : 0,
                    pcr_content:
                      m?.material_type === "PCR"
                        ? m?.material_pct !== null
                          ? m?.material_pct || 0
                          : 0
                        : 0,
                  };
                });

                return {
                  ...c,
                  componentId: c?._id,
                  finishing_process:
                    c?.finishing_process === "No Process"
                      ? "NoProcess"
                      : c?.finishing_process,
                  material,
                };
              });

            if (!components.length) return null;

            return {
              ...pack,
              rateOfRestitution: pack.productEvaluation,
              components,
            };
          })
          .filter(Boolean);

        Object.assign(data, {
          fg_spec: details.fg_spec,
          fg_revision: details.fg_spec,
          sales_country: details.formulation.salesZone,
          production_country: details.formulation.productionZone,
          packagingType: "Primary",
          consumablesUsed: parseFloat(details.formulation.consumablesUsed),
          packaging_level: packagingData,
        });

        packagingInputData = structuredClone(data);
        delete packagingInputData.rawMaterials;
        delete packagingInputData.fieldsExist;
        delete packagingInputData.fieldsExist;
        delete packagingInputData.raw_materials;

        sustainabilityData = Object.assign(data, {
          fg_spec: details.fg_spec,
          fg_revision: details.fg_spec,
          sales_country: details.formulation.salesZone,
          production_country: details.formulation.productionZone,
          packagingType: "Primary",
          consumablesUsed: parseFloat(details.formulation.consumablesUsed),
          packaging_level: sustainabilityPackagingData,
        });
      }
      if (formulaLambdaCall.length > 0) {
        console.log("formula,packaging,sp,gc");
        console.time();
        const [formResult, packResult, spResult, gcResult] = await Promise.all([
          this.processDataAndCallLambda(
            data,
            formulaLambdaCall,
            callCalculationFormula,
          ),

          callCalculationFormula.callPackagingThreeLambdas(packagingInputData),

          this.processDataAndCallLambda(
            sustainabilityData,
            SPLambdaCall,
            callCalculationFormula,
          ),
          this.processDataAndCallLambda(
            data,
            GCLambdaCall,
            callCalculationFormula,
          ),
        ]);

        if (formResult === "Success") {
          isFormulationCalculated = true;
          isFormulationEOLCalculated = true;
        }
        if (packResult === "Success") isPackagingCalculated = true;
        if (spResult === "Success") isSustainabilityPackagingCalculated = true;
        if (gcResult === "Success") isGreenChemistryCalculated = true;
        if (isGreenChemistryCalculated === true) {
          if (
            Object.prototype.hasOwnProperty.call(
              product?.[0]?.assessments,
              "baseline",
            ) &&
            assessmentType !== "baseline"
          ) {
            if (
              Object.prototype.hasOwnProperty.call(
                product?.[0]?.assessments?.baseline,
                "_id",
              ) &&
              Object.prototype.hasOwnProperty.call(
                product?.[0]?.assessments?.baseline,
                "formulation",
              ) &&
              !product?.[0]?.assessments?.baseline?.isBaselineSkipped
            ) {
              const baselineId = product[0].assessments.baseline._id.toString();
              const greenRollup1 = await this.processDataAndCallLambda(
                {
                  ...data,
                  assessmentId: baselineId,
                  assessmentType: "baseline",
                  assessmentId2: assessmentId,
                  assessmentType2: assessmentType,
                },
                ["baseline_green_chemistry_rollup"],
                callCalculationFormula,
              );
              if (greenRollup1 === "Success") {
                isBaselineGreenChemistryRollup = true;
                const greenRollup2 = await this.processDataAndCallLambda(
                  {
                    ...data,
                    assessmentId2: baselineId,
                    assessmentType2: "baseline",
                  },
                  ["green_chemistry_rollup"],
                  callCalculationFormula,
                );
                if (greenRollup2 === "Success") {
                  isGreenChemistryRollupCalculated = true;
                }
              }
            } else if (product?.[0]?.assessments?.baseline?.isBaselineSkipped) {
              // rollup is N/A when baseline skipped — mark complete so calc flags are not false
              isGreenChemistryRollupCalculated = true;
            }
          } else {
            isBaselineGreenChemistryRollup = true;
          }
          console.log("ended formula,packaging,sp,gc");
          console.timeEnd();
        }
        if (formResult === "Success" && packResult === "Success") {
          const lcaResult = await this.processDataAndCallLambda(
            data,
            ["totallca"],
            callCalculationFormula,
          );
          if (lcaResult === "Success") isLCACalculated = true;
          if (lcaResult === "Success" && spResult === "Success") {
            if (
              Object.prototype.hasOwnProperty.call(
                product?.[0]?.assessments,
                "baseline",
              ) &&
              assessmentType !== "baseline"
            ) {
              if (
                Object.prototype.hasOwnProperty.call(
                  product?.[0]?.assessments?.baseline,
                  "_id",
                ) &&
                Object.prototype.hasOwnProperty.call(
                  product?.[0]?.assessments?.baseline,
                  "packaging_level",
                ) &&
                !product?.[0]?.assessments?.baseline?.isBaselineSkipped
              ) {
                const sprResult = await this.processDataAndCallLambda(
                  data,
                  ["sustainablepackaging-rollup-compare"],
                  callCalculationFormula,
                );
                if (sprResult === "Success")
                  isSustainabilityPackagingRollupCalculated = true;
              } else if (product?.[0]?.assessments?.baseline?.isBaselineSkipped) {
                // rollup is N/A when baseline skipped — mark complete so calc flags are not false
                isSustainabilityPackagingRollupCalculated = true;
              }
            } else {
              isSustainabilityPackagingRollupCalculated = true;
            }
          }
        }
      } else if (formulaLambdaCall.length > 0) {
        const formResult = await this.processDataAndCallLambda(
          data,
          formulaLambdaCall,
          callCalculationFormula,
        );
        if (formResult === "Success") {
          isFormulationCalculated = true;
          isFormulationEOLCalculated = true;
        }
      } else {
        if (packagingLambdaCall.length > 0) {
          const [packResult] = await Promise.all([
            callCalculationFormula.callPackagingThreeLambdas(
              packagingInputData,
            ),
          ]);
          if (packResult === "Success") isPackagingCalculated = true;
        }
      }

      const updateData = {
        $set: {
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isFormulationCalculated",
          )]: isFormulationCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isFormulationEOLCalculated",
          )]: isFormulationEOLCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isPackagingCalculated",
          )]: isPackagingCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isSpiceCalculated",
          )]: isSpiceCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isGreenChemistryCalculated",
          )]: isGreenChemistryCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isSustainabilityPackagingCalculated",
          )]: isSustainabilityPackagingCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isLCACalculated",
          )]: isLCACalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isGreenChemistryRollupCalculated",
          )]: isGreenChemistryRollupCalculated,
          [getAssessmentPath(
            assessmentType,
            assessmentIndex,
            "isSustainabilityPackagingRollupCalculated",
          )]: isSustainabilityPackagingRollupCalculated,
          [getAssessmentPath(
            "baseline",
            assessmentIndex,
            "isGreenChemistryRollupCalculated",
          )]: isBaselineGreenChemistryRollup,
        },
      };

      const updatedDoc = await this.model.findOneAndUpdate(
        updateQuery,
        updateData,
        {
          upsert: true,
          new: true,
        },
      );
      return updatedDoc ? "success" : "fail";
    } catch (error) {
      console.log("Error in AssessmentCalculation", error);
      return "fail";
    }
  }
}

export const initializeAssessmentCalculationController = async (): Promise<
  AssessmentCalculationController
> => {
  await initializeProductModel();
  const ProductModels = ProductModel();
  return new AssessmentCalculationController(ProductModels);
};

export default initializeAssessmentCalculationController;
