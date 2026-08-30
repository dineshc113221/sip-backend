/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import Controller from "../../lib/controller.js";
import ProductModel, { initializeProductModel } from "./product.model.js";
import { initializeRawMaterialController } from "../raw_material_search/rm_search.controller.js";
import { initializeComponentSearchController } from "../component_pc_search/component_search.controller.js";
import { initializeFormulaController } from "../formula/formula.controller.js";
import { initializeProductSegmentSearchController } from "../segments/product_segments.controller.js";
import { formatAndSaveAuditData } from "../audit/audit.service.js";
import { auditPdf } from "../../controllers/ReportController.js";
import initializeAuditController from "../audit/audit.controller.js";
import { initializeAssessmentCalculationController } from "./product_assesment_cal.js";
import { calculateForAllProducts } from "./new_calculation_Script.js";
import adminModel, {
  initializeadminModel,
} from "../admin_version/admin.model.js";
import CalculationsModel, {
  initializeCalculationModel,
} from "../calculation_api/calculation.model.js";
import { computeAssessmentScores } from "../../utils/Reporting/computeAssessmentScores.js";
import {
  copyBaselineSnapshotToAssessment,
  saveCalculationSnapshot,
  updateOrCreateToPostgres,
  propagateBaselineStateToAssessment,
} from "../../helpers/postgresAudit.service.js";
import { assessmentBaseLineMapping } from "../../helpers/mapInputRecord.js";

class productController extends Controller {
  CalculationsModel: any;
  adminModel: any;
  constructor(model, adminModel, CalculationsModel) {
    super(model);
    this.adminModel = adminModel;
    this.CalculationsModel = CalculationsModel;
  }

  async calculationScenariosData(assessmentId, assesmentType) {
    const query = {
      isDeleted: false,
      [`assessments.${assesmentType}._id`]: assessmentId,
    };
    let isBaselinePresent = false;
    let isBaselinePackagingPartialDataComplete = false;
    let isMyProductPackagingPartialDataComplete = false;

    let flags: {};
    let doc = await this.model.find(query).exec();
    if (doc == null) {
      return flags;
    }

    await doc.map((result) => {
      result = result.toJSON();
    if (
      Object.prototype.hasOwnProperty.call(result.assessments, "baseline")
    ) {
      const isBaselineSkipped =
        result.assessments.baseline?.isBaselineSkipped === true;

      if (isBaselineSkipped) {
        isBaselinePresent = false;

        flags = {
          ...flags,
          isBaselinePresent: false,
          isBaselineSkipped: true,
        };
      } else {
        isBaselinePresent = true;
      }
        if (!isBaselineSkipped && result.assessments.baseline.packaging_level?.length > 0) {
          const packagingData = result.assessments.baseline.packaging_level
            .map((pack: any) => {
              const components = (pack.components || [])
                .filter((c: any) => c.isDataComplete)
                .map((c: any) => ({
                  ...c,
                  componentId: c._id,
                  finishing_process:
                    c.finishing_process === "No Process"
                      ? "NoProcess"
                      : c.finishing_process,
                  material: (c.material || []).map((m: any) => ({
                    ...m,
                    materialId: m._id,
                    pcr_content:
                      m.material_type === "PCR" ? m.material_pct || 0 : 0,
                  })),
                }));
              if (components.length > 0) {
                return {
                  ...pack,
                  rateOfRestitution: pack.productEvaluation,
                  components,
                };
              }
            })
            .filter(Boolean);

          if (packagingData.length > 0) {
            isBaselinePackagingPartialDataComplete = true;
          }
        }
        if (!isBaselineSkipped) flags = {
          ...flags,
          isBaselinePresent,
          isBaselineSkipped: false,
          baseline: {
            isBaselinePackagingPartialDataComplete,
            isFormulationDataCompleted:
              result.assessments.baseline.isFormulationDataCompleted,
            isPackagingDataCompleted:
              result.assessments.baseline.isPackagingDataCompleted,
            isFormulationCalculated:
              result.assessments.baseline.isFormulationCalculated,
            isFormulationEOLCalculated:
              result.assessments.baseline.isFormulationEOLCalculated,
            isPackagingCalculated:
              result.assessments.baseline.isPackagingCalculated,
            isSpiceCalculated: result.assessments.baseline.isSpiceCalculated,
            isGreenChemistryCalculated:
              result.assessments.baseline.isGreenChemistryCalculated,
            isSustainabilityPackagingCalculated:
              result.assessments.baseline.isSustainabilityPackagingCalculated,
            isLCACalculated: result.assessments.baseline.isLCACalculated,
            isGreenChemistryRollupCalculated:
              result.assessments.baseline.isGreenChemistryRollupCalculated,
            isSustainabilityPackagingRollupCalculated:
              result.assessments.baseline
                .isSustainabilityPackagingRollupCalculated,
            isCalculatedButtonClicked:
              result.assessments.baseline.isCalculatedButtonClicked,
          },
        };
      }
      if (
        assesmentType === "final" &&
        Object.prototype.hasOwnProperty.call(result.assessments, "final")
      ) {
        if (result.assessments.final.packaging_level?.length > 0) {
          const packagingData = result.assessments.final.packaging_level
            .map((pack: any) => {
              const components = (pack.components || [])
                .filter((c: any) => c.isDataComplete)
                .map((c: any) => ({
                  ...c,
                  componentId: c._id,
                  finishing_process:
                    c.finishing_process === "No Process"
                      ? "NoProcess"
                      : c.finishing_process,
                  material: (c.material || []).map((m: any) => ({
                    ...m,
                    materialId: m._id,
                    pcr_content:
                      m.material_type === "PCR" ? m.material_pct || 0 : 0,
                  })),
                }));
              if (components.length > 0) {
                return {
                  ...pack,
                  rateOfRestitution: pack.productEvaluation,
                  components,
                };
              }
            })
            .filter(Boolean);

          if (packagingData.length > 0) {
            isMyProductPackagingPartialDataComplete = true;
          }
        }
        flags = {
          ...flags,
          isBaselinePresent,
          myProduct: {
            isMyProductPackagingPartialDataComplete,
            isFormulationDataCompleted:
              result.assessments.final.isFormulationDataCompleted,
            isPackagingDataCompleted:
              result.assessments.final.isPackagingDataCompleted,
            isFormulationCalculated:
              result.assessments.final.isFormulationCalculated,
            isFormulationEOLCalculated:
              result.assessments.final.isFormulationEOLCalculated,
            isPackagingCalculated:
              result.assessments.final.isPackagingCalculated,
            isSpiceCalculated: result.assessments.final.isSpiceCalculated,
            isGreenChemistryCalculated:
              result.assessments.final.isGreenChemistryCalculated,
            isSustainabilityPackagingCalculated:
              result.assessments.final.isSustainabilityPackagingCalculated,
            isLCACalculated: result.assessments.final.isLCACalculated,
            isGreenChemistryRollupCalculated:
              result.assessments.final.isGreenChemistryRollupCalculated,
            isSustainabilityPackagingRollupCalculated:
              result.assessments.final
                .isSustainabilityPackagingRollupCalculated,
            isCalculatedButtonClicked:
              result.assessments.final.isCalculatedButtonClicked,
            isBaselineSkipped: result.assessments.final.isBaselineSkipped === true,
            isBaselineCalcUpdated: result.assessments.final.isBaselineCalcUpdated === true,
          },
        };
      }
      if (
        assesmentType === "experimental" &&
        Object.prototype.hasOwnProperty.call(result.assessments, "experimental")
      ) {
        result.assessments[assesmentType].forEach((item) => {
          if (item._id.equals(assessmentId)) {
            if (item.packaging_level?.length > 0) {
              const packagingData = item.packaging_level
                .map((pack: any) => {
                  const components = (pack.components || [])
                    .filter((c: any) => c.isDataComplete)
                    .map((c: any) => ({
                      ...c,
                      componentId: c._id,
                      finishing_process:
                        c.finishing_process === "No Process"
                          ? "NoProcess"
                          : c.finishing_process,
                      material: (c.material || []).map((m: any) => ({
                        ...m,
                        materialId: m._id,
                        pcr_content:
                          m.material_type === "PCR" ? m.material_pct || 0 : 0,
                      })),
                    }));
                  if (components.length > 0) {
                    return {
                      ...pack,
                      rateOfRestitution: pack.productEvaluation,
                      components,
                    };
                  }
                })
                .filter(Boolean);

              if (packagingData.length > 0) {
                isMyProductPackagingPartialDataComplete = true;
              }
            }
            flags = {
              ...flags,
              isBaselinePresent,
              myProduct: {
                isMyProductPackagingPartialDataComplete,
                isFormulationDataCompleted: item.isFormulationDataCompleted,
                isPackagingDataCompleted: item.isPackagingDataCompleted,
                isFormulationCalculated: item.isFormulationCalculated,
                isFormulationEOLCalculated: item.isFormulationEOLCalculated,
                isPackagingCalculated: item.isPackagingCalculated,
                isSpiceCalculated: item.isSpiceCalculated,
                isGreenChemistryCalculated: item.isGreenChemistryCalculated,
                isSustainabilityPackagingCalculated:
                  item.isSustainabilityPackagingCalculated,
                isLCACalculated: item.isLCACalculated,
                isGreenChemistryRollupCalculated:
                  item.isGreenChemistryRollupCalculated,
                isSustainabilityPackagingRollupCalculated:
                  item.isSustainabilityPackagingRollupCalculated,
                isCalculatedButtonClicked: item.isCalculatedButtonClicked,
                isBaselineSkipped: item.isBaselineSkipped === true,
                isBaselineCalcUpdated: item.isBaselineCalcUpdated === true,
              },
            };
          }
        });
      }
    });
    return flags;
  }

  determineAssessmentType(assessments): string {
    const hasBaseline = !!assessments.baseline;
    const hasExperimental =
      !!assessments.experimental && assessments.experimental.length > 0;
    const hasFinal = !!assessments.final;

    if (hasBaseline && hasExperimental && hasFinal) {
      return "Final";
    } else if (hasBaseline && hasFinal) {
      return "Final";
    } else if (hasBaseline && hasExperimental) {
      return "Experimental";
    } else if (hasBaseline) {
      return "Experimental";
    }

    return "Experimental";
  }

  async getPcIdFromComponents(req): Promise<String> {
    const result = []; // Default value is false

    req.body?.packaging_level?.map(
      (items: { components; uctEvaluation: number }) => {
        // Ensure components is a valid array, otherwise log an error and return the original items
        if (!Array.isArray(items?.components)) {
          return result; // Return original items if components are invalid
        }
        if (items.components.length > 0) {
          items.components.map((data) => {
            if (data.pc_nm !== "") {
              result.push(data.pc_nm);
            }
          });
        }
      }
    );
    return result.toString();
  }
async processPackaging(packaging): Promise<boolean> {
  const levelsWithData = packaging.filter(
    (pkg) => pkg.components?.length > 0
  );

  if (levelsWithData.length === 0) {
    return false;
  }

  return levelsWithData.every((pkg) =>
    pkg.components.every(
      (comp) => comp.isDataComplete === true
    )
  );
}
  async isProductEvaluationUpdated(productEvaluation: number) {
    let isValueChanged = true;
    if (productEvaluation === 90) {
      isValueChanged = false;
      return isValueChanged;
    }
    return isValueChanged;
  }

  async checkDataValues(
    productSegment: string,
    productSubSegment: string,
    netContent: string,
    rawMaterials: [],
    useDose: string,
    consumableUse: string,
    productionZone: string,
    SalesZone: string,
    useScenario: string,
    rawMaterialsPercentage: number
  ): Promise<boolean> {
const flag = !!(
  productSegment &&
  productSubSegment &&
  Number(netContent) > 0 &&
  Array.isArray(rawMaterials) &&
  rawMaterials.length > 0 &&
  Number(useDose) > 0 &&
  rawMaterialsPercentage === 100 &&
  consumableUse &&
  productionZone &&
  SalesZone &&
  useScenario
);

    return flag;
  }

  async generateProductSipId(brandName: string): Promise<string> {
    const latestProduct = await this.model.findOne().sort({ _id: -1 });

    let newSipId: string;
    if (latestProduct) {
      const lastSipIdNumber = parseInt(
        latestProduct.productSipId.split("_")[2],
        10
      );
      const newSipIdNumber = lastSipIdNumber + 1;
      newSipId = `SIP_${brandName}_${newSipIdNumber
        .toString()
        .padStart(7, "0")}`;
    } else {
      newSipId = `SIP_${brandName}_0000001`;
    }

    return newSipId;
  }

  async generateAssessmentSipId(
    productId: string,
    count: number,
    type: string
  ): Promise<string> {
    const typeAbbreviation =
      type === "final" ? "FIN" : type === "baseline" ? "BSL" : "EXP";
    return `${productId}_${String(count).padStart(3, "0")}_${typeAbbreviation}`;
    return "";
  }

  async checkAssessmentId(assessmentId: string, product, type: string) {
    let assessmentIndex: number;
    const assessmentIdValue = new Types.ObjectId(assessmentId);
    type === "experimental"
      ? (assessmentIndex = product[0].assessments.experimental?.findIndex(
          (assess) => assess._id.equals(assessmentIdValue)
        ))
      : type === "baseline"
      ? product[0].assessments.baseline._id.equals(
          new Types.ObjectId(assessmentId)
        )
        ? (assessmentIndex = 0)
        : (assessmentIndex = -1)
      : type === "final"
      ? product[0].assessments.final._id.equals(
          new Types.ObjectId(assessmentId)
        )
        ? (assessmentIndex = 0)
        : (assessmentIndex = -1)
      : (assessmentIndex = -1);

    return assessmentIndex;
  }

  async checkRecycleStatus(
    productId: string,
    assessmentId: string,
    packagingType: string,
    assessmentType: string
  ) {
    const statusQuery = {
      isDeleted: false,
      _id: new Types.ObjectId(productId),
      [`assessments.${assessmentType}.assessmentId`]: assessmentId,
      [`assessments.${assessmentType}.packaging.${packagingType}.component.recyclabilityStatus`]: "Not Recycle Ready",
    };
    const countPipeline = [{ $match: statusQuery }, { $count: "count" }];
    const nonRecyclableCount = await this.model.aggregate(countPipeline).exec();
    return nonRecyclableCount.length === 0 ? 0 : 1;
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const productSipId = await this.generateProductSipId(
        req.body.shortBrandCode
      );
      const requestBody = { ...req.body, productSipId, assessmentCount: 0 };
      const doc = await this.model.create(requestBody);
      if (!doc) {
        res.status(404).json({ message: "Unable to create product" });
      }

      formatAndSaveAuditData(
        productSipId,
        "Create Product",
        "Insert",
        doc,
        res.locals.user?.name
      );
      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async findByIdAndDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const productId = req.params.id;
      const data = await this.model.findByIdAndUpdate(
        productId,
        { isDeleted: true },
        { new: true, returnDocument: "after" }
      );
      initializeCalculationModel();
      const calculationsRepo = CalculationsModel();

      await calculationsRepo.updateOne(
        { productId },
        {
          $set: {
            isDelete: true,
          },
        }
      );
      formatAndSaveAuditData(
        data.productSipId,
        "Delete Product",
        "Delete",
        data,
        res.locals.user?.name
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async pagination(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { skip = 0, sortOrder = -1 } = req.query;
      const query = { isDeleted: false };

      const pipelines = [
        { $match: query },
        { $sort: { updatedAt: parseFloat(sortOrder as string) } },
        { $skip: parseFloat(skip as string) },
      ];

      let docs = await this.model.aggregate(pipelines).exec();
      const countPipeline = [{ $match: query }, { $count: "count" }];
      const count = await this.model.aggregate(countPipeline).exec();
      docs = docs.map((data) => {
        if (Object.prototype.hasOwnProperty.call(data, "assessments")) {
          const getAssessmentType = this.determineAssessmentType(
            data.assessments
          );
          Object.assign(data, { type: getAssessmentType });
          return data;
        } else {
          Object.assign(data, { type: "Experimental" });
          return data;
        }
      });
      res.status(200).json({ count: count[0]?.count ?? 0, data: docs });
    } catch (error) {
      next(error);
    }
  }

  async myProductPagination(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { skip = 0, sortOrder = -1 } = req.query;
      const query = {
        isDeleted: false,
        "users.mail": {
          $regex: res.locals.user.unique_name.toLowerCase(),
          $options: "i",
        },
      };

      const pipelines = [
        { $match: query },
        { $sort: { updatedAt: parseFloat(sortOrder as string) } },
        { $skip: parseFloat(skip as string) },
      ];

      let docs = await this.model.aggregate(pipelines).exec();
      const countPipeline = [{ $match: query }, { $count: "count" }];
      const count = await this.model.aggregate(countPipeline).exec();
      docs = docs.map((data) => {
        if (Object.prototype.hasOwnProperty.call(data, "assessments")) {
          const getAssessmentType = this.determineAssessmentType(
            data.assessments
          );
          Object.assign(data, { type: getAssessmentType });
          return data;
        } else {
          Object.assign(data, { type: "Experimental" });
          return data;
        }
      });
      res.status(200).json({ count: count[0]?.count ?? 0, data: docs });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async findByIdAndUpdate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      
await this.CalculationsModel.updateOne(
  {
    productId:req.params.id,
  },
  {
    $set: {
      [`projectId`]: req.body.projectId,
    },
  }
);   

      formatAndSaveAuditData(
        doc?.productSipId,
        "Edit Product",
        "Update",
        doc,
        res.locals.user?.name
      );

      res.status(204).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = {
        _id: new Types.ObjectId(req.params.id),
        isDeleted: false,
      };
      const pipelines = [{ $match: query }];
      const doc = await this.model.aggregate(pipelines).exec();
      res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async auditReport(req, res, next) {
    try {
      const isAssessment = req.query?.isAssessment || "false";

      if (isAssessment === "true") {
        await auditPdf(req.params.id, res, isAssessment);
        return; // prevent double send
      }

      const query = { _id: new Types.ObjectId(req.params.id) };
      const pipelines = [{ $match: query }];
      const doc = await this.model.aggregate(pipelines).exec();

      await auditPdf(doc[0].productSipId, res, isAssessment);
      return; // prevent double send
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        _id: new Types.ObjectId(req.body.productId),
        isDeleted: false,
      };
      const formulaId = req.body.formula_number;
      const assessmentType = req.body.type.toLowerCase();
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        return res.status(404).json({ message: "Incorrect Product Id" });
      }
      const assessmentCount = product[0].assessmentCount;

      const isBaselineSkipped =
        req.body.isBaselineSkipped ?? false;      
      const justification = req.body.justification || "";
      const isSkippedBaseline = assessmentType === "baseline" && isBaselineSkipped;

      let truFormulaDataDetails: {
        Number_Amount_net_content_min_weight_label;
        ProductionZone: string;
        SaleZone: string;
        Unit_Of_Measure_net_content_min_weight_label: string;
        Unit_Of_Measure_product_content_size_label: string;
      };
      let formulaRawMaterialDetails: {
        compositions;
        details: {
          objectKey: string;
          description: string;
          segment;
          subSegment;
        };
      };
      let packagingData: boolean | { packaging_level: string; components }[];
      let formulation;

      if (!isSkippedBaseline) {
        const checkTruFormulaData = await initializeFormulaController();
        truFormulaDataDetails = await checkTruFormulaData.getFormulaRawMaterial(
          req.body.fg_spec
        );
        if (truFormulaDataDetails) {
          formulation = {
            productionZone: truFormulaDataDetails?.ProductionZone || "",
            salesZone: truFormulaDataDetails?.SaleZone || "",
            netContent:
              truFormulaDataDetails?.Number_Amount_net_content_min_weight_label ||
              "",
            netContentUnit:
              truFormulaDataDetails?.Unit_Of_Measure_net_content_min_weight_label ===
                null ||
              truFormulaDataDetails?.Unit_Of_Measure_net_content_min_weight_label ===
                ""
                ? "g"
                : truFormulaDataDetails?.Unit_Of_Measure_product_content_size_label,
          };
        }
        if (req.body.formula_number !== "" && req.body.formula_number !== null) {
          const checkRawMaterialSeachControllers = await initializeRawMaterialController();
          formulaRawMaterialDetails = await checkRawMaterialSeachControllers.getFormulaRawMaterial(
            formulaId
          );
          if (formulaRawMaterialDetails && truFormulaDataDetails) {
            const isDataComplete = await this.checkDataValues(
              formulaRawMaterialDetails?.details.segment.length > 0
                ? formulaRawMaterialDetails?.details.segment[0]
                : "",
              formulaRawMaterialDetails?.details.subSegment.length > 0
                ? formulaRawMaterialDetails?.details.subSegment[0]
                : "",
              truFormulaDataDetails?.Number_Amount_net_content_min_weight_label ||
                "",
              formulaRawMaterialDetails?.compositions || "",
              "",
              "",
              truFormulaDataDetails?.ProductionZone || "",
              truFormulaDataDetails?.SaleZone || "",
              "",
              0
            );
            formulation = {
              ...formulation,
              fmlCode: formulaRawMaterialDetails?.details.objectKey || "",
              description: formulaRawMaterialDetails?.details.description || "",
              productSegment:
                formulaRawMaterialDetails?.details.segment.length > 0
                  ? formulaRawMaterialDetails?.details.segment[0].value
                  : "",
              productSubSegment:
                formulaRawMaterialDetails?.details.subSegment.length > 0
                  ? formulaRawMaterialDetails?.details.subSegment[0].value
                  : "",
              useDose: await (async () => {
                const seg = formulaRawMaterialDetails?.details.segment.length > 0
                  ? formulaRawMaterialDetails?.details.segment[0].value : "";
                const subSeg = formulaRawMaterialDetails?.details.subSegment.length > 0
                  ? formulaRawMaterialDetails?.details.subSegment[0].value : "";
                if (seg && subSeg) {
                  const segCtrl = await initializeProductSegmentSearchController();
                  const segRecord = await segCtrl["collection"].findOne({
                    "Product Segment": seg,
                    "Product Sub-Segment": subSeg,
                  });
                  return segRecord?.["Use Dose / g"] ?? "";
                }
                return "";
              })(),
              useScenario: "",
              consumablesUsed: "",
              rawMaterials: formulaRawMaterialDetails?.compositions || "",
              isDataComplete: isDataComplete,
              fieldsExist: {
                fmlCode: !!formulaRawMaterialDetails?.details?.objectKey,
                description: !!formulaRawMaterialDetails?.details?.description,
                productSegment: !!(
                  formulaRawMaterialDetails?.details?.segment?.length > 0
                ),
                productSubSegment: !!(
                  formulaRawMaterialDetails?.details?.subSegment?.length > 0
                ),
                netContent: !!truFormulaDataDetails?.Number_Amount_net_content_min_weight_label,
                netContentUnit: !!truFormulaDataDetails?.Unit_Of_Measure_net_content_min_weight_label,
                productionZone: !!truFormulaDataDetails?.ProductionZone,
                salesZone: !!truFormulaDataDetails?.SaleZone,
                rawMaterials: !!formulaRawMaterialDetails?.compositions,
              },
            };
          }
        }
        if (req.body.fg_spec !== "") {
          if (packagingData !== false) {
            const callPCSpecDetails = await initializeComponentSearchController();
            packagingData = await callPCSpecDetails.getComponentDetails(
              req.body.fg_spec
            );
          }
        }
      }
// ---------------------------------------------------
// CONVERT EXISTING SKIPPED BASELINE INTO REAL BASELINE
// ---------------------------------------------------
if (
  assessmentType === "baseline" &&
  product[0]?.assessments?.baseline &&
  isBaselineSkipped === false
) {

  const updatedBaseline = await this.model.findOneAndUpdate(
    query,
    {
      $set: {
        "assessments.baseline.name": req.body.name,
        "assessments.baseline.fg_spec": req.body.fg_spec,
        "assessments.baseline.formula_number":
          req.body.formula_number,
        "assessments.baseline.lab_notebook_code":
          req.body.lab_notebook_code,
        "assessments.baseline.pc_spec":
          req.body.pc_spec,
        "assessments.baseline.sku_erp_code":
          req.body.sku_erp_code,
        "assessments.baseline.zone":
          req.body.zone,

        "assessments.baseline.net_content":
          truFormulaDataDetails
            ?.Number_Amount_net_content_min_weight_label || "",

        "assessments.baseline.formulation":
          formulation || {},

        "assessments.baseline.packaging_level":
          packagingData || [],

        "assessments.baseline.modifiedBy":
          req.body.modifiedBy,

        "assessments.baseline.isBaselineSkipped":
          false,

        "assessments.baseline.justification":
          "",

      },
    },
    {
      new: true,
    }
  );

  if (!updatedBaseline) {
    return res.status(404).json({
      message: "Unable to update skipped baseline",
    });
  }

  const updatedAssessment =
    updatedBaseline.assessments.baseline;

  // Audit
  try {
    const auditData =
      await initializeAuditController();

    await auditData.formatAndSaveAuditDataForAssessment(
      req.body.productId,
      updatedAssessment._id.toString(),
      "baseline",
      "Baseline Activated",
      "Update",
      res.locals.user?.name
    );
  } catch (auditErr) {
    console.error(
      "Audit write failed:",
      auditErr
    );
  }

  // remove baseline skipped flag from sibling assessments
  const propagateSet: any = {};

  if (
    updatedBaseline.assessments.experimental?.length > 0
  ) {
    propagateSet[
      "assessments.experimental.$[].isBaselineSkipped"
    ] = false;
  }

  if (
    updatedBaseline.assessments.final?._id
  ) {
    propagateSet[
      "assessments.final.isBaselineSkipped"
    ] = false;
  }

if (Object.keys(propagateSet).length) {
  await this.model.updateOne(
    {
      _id: new Types.ObjectId(req.body.productId),
    },
    {
      $set: propagateSet,
    }
  );
}

const baselineData = {
  assessmentId: updatedBaseline.assessments.baseline.assessmentId,
  isBaselineSkipped: false,
  justification: "",
};

for (const exp of updatedBaseline.assessments.experimental || []) {
  await propagateBaselineStateToAssessment({
    baselineData,
    targetAssessmentId: exp.assessmentId,
    userName: res.locals.user?.name,
    operation: "Baseline Activated",
  });
}

if (updatedBaseline.assessments.final?.assessmentId) {
  await propagateBaselineStateToAssessment({
    baselineData,
    targetAssessmentId:
      updatedBaseline.assessments.final.assessmentId,
    userName: res.locals.user?.name,
    operation: "Baseline Activated",
  });
}

return res.status(200).json(updatedAssessment);

}

      const assessmentSipId = await this.generateAssessmentSipId(
        req.body.productSipId,
        assessmentCount + 1,
        assessmentType
      );

      const baselineIsSkipped = isSkippedBaseline || (assessmentType !== "baseline" && !!product[0]?.assessments?.baseline?.isBaselineSkipped);

      let updateData;
      if (assessmentType === "experimental") {
        updateData = {
          $set: { assessmentCount: assessmentCount + 1 },
          $push: {
            "assessments.experimental": {
              assessmentId: assessmentSipId,
              name: req.body.name,
              fg_spec: req.body.fg_spec,
              formula_number: req.body.formula_number,
              lab_notebook_code: req.body.lab_notebook_code,
              pc_spec: req.body.pc_spec,
              sku_erp_code: req.body.sku_erp_code,
              zone: req.body.zone,
              net_content:
                truFormulaDataDetails?.Number_Amount_net_content_min_weight_label ||
                "",
              netContentUnit:
                truFormulaDataDetails?.Unit_Of_Measure_net_content_min_weight_label ===
                  null ||
                truFormulaDataDetails?.Unit_Of_Measure_net_content_min_weight_label ===
                  ""
                  ? "g"
                  : truFormulaDataDetails?.Unit_Of_Measure_product_content_size_label,
              createdBy: req.body.createdBy,
              modifiedBy: req.body.modifiedBy,
              formulation: formulation,
              packaging_level: packagingData,
              isLPP: false,
              isBaselineSkipped: baselineIsSkipped,
              justification: assessmentType === "baseline" ? justification : ""
            },
          },
        };
      } else if (assessmentType === "baseline") {
        updateData = {
          $set: {
            assessmentCount: assessmentCount + 1,
           [`assessments.${assessmentType}`]: {
          assessmentId: assessmentSipId,
          name: req.body.name,
          fg_spec: req.body.fg_spec,
          formula_number: req.body.formula_number,
          lab_notebook_code: req.body.lab_notebook_code,
          pc_spec: req.body.pc_spec,
          sku_erp_code: req.body.sku_erp_code,
          zone: req.body.zone,
          net_content:
            truFormulaDataDetails?.Number_Amount_net_content_min_weight_label || "",

          createdBy: req.body.createdBy,
          modifiedBy: req.body.modifiedBy,

          formulation: formulation || {},
          packaging_level: packagingData || [],

         isBaselineSkipped: isBaselineSkipped,
          justification: isBaselineSkipped ? justification : "",
        },
          },
        };
      } else {
        updateData = {
          $set: {
            assessmentCount: assessmentCount + 1,
            [`assessments.${assessmentType}`]: {
              assessmentId: assessmentSipId,
              name: req.body.name,
              fg_spec: req.body.fg_spec,
              formula_number: req.body.formula_number,
              lab_notebook_code: req.body.lab_notebook_code,
              pc_spec: req.body.pc_spec,
              sku_erp_code: req.body.sku_erp_code,
              zone: req.body.zone,
              net_content:
                truFormulaDataDetails?.Number_Amount_net_content_min_weight_label ||
                "",
              createdBy: req.body.createdBy,
              modifiedBy: req.body.modifiedBy,
              formulation: formulation,
              packaging_level: packagingData,
              isBaselineSkipped: baselineIsSkipped,
              justification: ""
            },
          },
        };
      }
      const updateOptions = { new: true, upsert: true };

      const doc = await this.model.findOneAndUpdate(
        query,
        updateData,
        updateOptions
      );
      let newlyAddedAssessment = {};
      if (!doc) {
        res.status(404).json({ message: "Error in creating Assessment" });
      } else {
        let updatedAssessments = doc.assessments[assessmentType];
        if (assessmentType === "experimental") {
          newlyAddedAssessment =
            doc.assessments[assessmentType][
              doc.assessments[assessmentType].length - 1
            ];
        } else {
          newlyAddedAssessment = updatedAssessments;
        }
      }

const auditData = await initializeAuditController();

      try {
        await auditData.formatAndSaveAuditDataForAssessment(
          req.body.productId,
          newlyAddedAssessment["_id"].toString(),
          assessmentType,
          "Create Assessment",
          "Insert",
          res.locals.user?.name
        );
      } catch (auditErr) {
        console.error("Audit write failed (createAssessment):", auditErr);
      }
if (assessmentType === "baseline" && isBaselineSkipped) {
  const propagateQuery = {
    _id: new Types.ObjectId(req.body.productId),
  };

  const propagateSet: any = {};

  if (product[0]?.assessments?.experimental?.length > 0) {
    propagateSet[
      "assessments.experimental.$[].isBaselineSkipped"
    ] = true;
  }

  if (product[0]?.assessments?.final?._id) {
    propagateSet[
      "assessments.final.isBaselineSkipped"
    ] = true;
  }

  if (Object.keys(propagateSet).length) {
    await this.model.updateOne(
      propagateQuery,
      { $set: propagateSet }
    );
  }

  //
  // NEW AUDIT PROPAGATION
  //
const baselineData = {
  assessmentId: doc.assessments.baseline.assessmentId,
  createdBy: req.body.createdBy,
  isBaselineSkipped: true,
  justification,
};

  for (const exp of doc.assessments.experimental || []) {
    await propagateBaselineStateToAssessment({
      baselineData,
      targetAssessmentId: exp.assessmentId,
      userName: res.locals.user?.name,
      operation: "Baseline Skip Enabled",
    });
  }

  if (doc.assessments.final?.assessmentId) {
    await propagateBaselineStateToAssessment({
      baselineData,
      targetAssessmentId:
        doc.assessments.final.assessmentId,
      userName: res.locals.user?.name,
      operation: "Baseline Skip Enabled",
    });
  }
}
if (
  (assessmentType === "experimental" ||
    assessmentType === "final") &&
  baselineIsSkipped
) {
        const baselineAssessmentId =
          product[0]?.assessments?.baseline?.assessmentId;

        if (baselineAssessmentId) {
         
            // Baseline exists but was skipped (no snapshot will ever exist
            // for it) — write an explicit "Baseline Skipped" record onto
            // the new exp/final assessment's own audit trail instead of
            // relying on the sibling-propagation loop above, which only
            // reaches assessments that already existed at the time the
            // baseline was skipped.
         const baseline = product[0]?.assessments?.baseline;

if (baseline?.isBaselineSkipped) {

  const baselineData = {
    assessmentId: baseline.assessmentId,
    isBaselineSkipped: true,
    justification: baseline.justification || "",
  };



            await propagateBaselineStateToAssessment({
              baselineData,
              targetAssessmentId: assessmentSipId,
              userName: res.locals.user?.name,
              operation: "Baseline Skipped",
            });
          
        }
      }
      }
      res.status(200).send(newlyAddedAssessment);
    } catch (error) {
      next(error);
    }
  }

async updateAssessmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assessmentType = req.body.type.toLowerCase();
      const assessmentId = req.body.assessmentId;
      const query = {
        _id: new Types.ObjectId(req.params.id),
        [`assessments.${assessmentType}._id`]: new Types.ObjectId(assessmentId),
        isDeleted: false,
      };

      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();

      const oldSkip =
        product[0]?.assessments?.baseline?.isBaselineSkipped === true;

      const oldJustification =
        product[0]?.assessments?.baseline?.justification || "";
      if (!product) {
        res.status(404).json({ message: "Product not found" });
      }

      let updateData: any = { $set: {} };
const hasExperimental =
  Array.isArray(product[0]?.assessments?.experimental) &&
  product[0].assessments.experimental.length > 0;

const hasFinal =
  product[0]?.assessments?.final &&
  typeof product[0].assessments.final === "object";
      if (assessmentType === "baseline") {
  const currentSkipStatus =
    product[0]?.assessments?.baseline?.isBaselineSkipped === true;

  const isBaselineSkippedField =
    "assessments.baseline.isBaselineSkipped";
  const justificationField =
    "assessments.baseline.justification";

  if (req.body.isBaselineSkipped === false && currentSkipStatus) {
    updateData.$set[isBaselineSkippedField] = false;
    updateData.$set[justificationField] = "";

    if (hasExperimental) {
      updateData.$set[
        "assessments.experimental.$[].isBaselineSkipped"
      ] = false;
    }

    if (hasFinal) {
      updateData.$set[
        "assessments.final.isBaselineSkipped"
      ] = false;
    }
  } else if (
    req.body.isBaselineSkipped === true &&
    !currentSkipStatus
  ) {
    updateData.$set[isBaselineSkippedField] = true;
    updateData.$set[justificationField] =
      req.body.justification || "";

    if (hasExperimental) {
      updateData.$set[
        "assessments.experimental.$[].isBaselineSkipped"
      ] = true;
    }

    if (hasFinal) {
      updateData.$set[
        "assessments.final.isBaselineSkipped"
      ] = true;
    }
  } else if (
    req.body.isBaselineSkipped === true &&
    currentSkipStatus
  ) {
    updateData.$set[justificationField] =
      req.body.justification || "";
  }
}

      const updateField =
        assessmentType === "experimental"
          ? "assessments.experimental.$.name"
          : `assessments.${assessmentType}.name`;

      updateData.$set[updateField] = req.body.name;

      if ("isLPP" in req.body && assessmentType == "experimental") {
        const fieldName = "assessments.experimental.$.isLPP";
        updateData.$set[fieldName] = req.body.isLPP;

        await this.CalculationsModel.updateOne(
          {
            productId: req.params.id,
            [`formula_input_output.output.${assessmentType}.assessmentId`]: assessmentId,
          },
          {
            $set: {
              [`formula_input_output.output.${assessmentType}.$.lpp_indicator`]: req.body.isLPP,
            },
          }
        );
      }

const doc = await this.model.findOneAndUpdate(
  query,
  updateData,
  { new: true }
);

if (!doc) {
        res.status(404).json({ message: "Error in updating Assessment" });
      }

      const auditData = await initializeAuditController();

      try {
        await auditData.formatAndSaveAuditDataForAssessment(
          req.params.id,
          assessmentId,
          assessmentType,
          "Edit Assessment",
          "Update",
          res.locals.user?.name
        );
      } catch (auditErr) {
        console.error("Audit write failed (updateAssessmentById):", auditErr);
      }

      if (assessmentType === "baseline") {
        let baselineOperation = "";

        if (!oldSkip && req.body.isBaselineSkipped === true) {
          baselineOperation = "Baseline Skip Enabled";
        }

        if (
          oldSkip &&
          req.body.isBaselineSkipped === true &&
          oldJustification !== (req.body.justification || "")
        ) {
          baselineOperation = "Baseline Justification Updated";
        }

       

 if (baselineOperation) {
  let baselineData: any = {};

  // Skip enabled
  if (baselineOperation === "Baseline Skip Enabled") {
    baselineData = {
      assessmentId: product[0].assessments.baseline.assessmentId,
      isBaselineSkipped: true,
      justification: req.body.justification || "",
    };
  }

  // Justification changed
  else if (
    baselineOperation === "Baseline Justification Updated"
  ) {
    baselineData = {
      assessmentId: product[0].assessments.baseline.assessmentId,
      justification: req.body.justification || "",
    };
  }


  for (const exp of product[0]?.assessments?.experimental || []) {
    try {
      await propagateBaselineStateToAssessment({
        baselineData,
        targetAssessmentId: exp.assessmentId,
        userName: res.locals.user?.name,
        operation: baselineOperation,
      });
    } catch (auditErr) {
      console.error(
        "Audit propagation failed (exp):",
        auditErr
      );
    }
  }

  if (product[0]?.assessments?.final?.assessmentId) {
    try {
      await propagateBaselineStateToAssessment({
        baselineData,
        targetAssessmentId:
          product[0].assessments.final.assessmentId,
        userName: res.locals.user?.name,
        operation: baselineOperation,
      });
    } catch (auditErr) {
      console.error(
        "Audit propagation failed (final):",
        auditErr
      );
    }
  }
}
      }

      res.status(200).json(doc);
      return;
    } catch (error) {
      next(error);
    }
  }

async deleteAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let deleteData: object;
      const query = { _id: new Types.ObjectId(req.params.id), isDeleted: false };
      const assessmentType = req.body.type.toLowerCase();
      const assessmentId = req.body.assessmentId;
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (!product?.length) {
  res.status(404).json({ message: "Product not found" });
  return;
}
      const assessmentIndex = await this.checkAssessmentId(assessmentId, product, assessmentType);
      const productAssessmentId =
        assessmentType != "experimental"
          ? product[0]["assessments"][assessmentType]["assessmentId"]
          : product[0]["assessments"][assessmentType][assessmentIndex]["assessmentId"];

      // NEW — capture full pre-delete state for the audit trail, before it's removed
      const preDeleteSnapshot =
        assessmentType === "experimental"
          ? product[0]?.assessments?.experimental?.[assessmentIndex]
          : product[0]?.assessments?.[assessmentType];

      if (assessmentIndex === -1 && ["experimental", "baseline", "final"].includes(assessmentType)) {
        res.status(404).json({ message: "Assessment Id Not Found" });
        return;
      }
      if (assessmentType === "experimental") {
        deleteData = { $pull: { [`assessments.${assessmentType}`]: { _id: assessmentId } } };
      } else {
        deleteData = { $unset: { [`assessments.${assessmentType}`]: 1 } };
      }
      const updateOptions = { new: true, returnDocument: "after" };

      if (assessmentType === "baseline") {
       const baselineData =
  assessmentBaseLineMapping(
    product[0].assessments.baseline
  );
  const baselineDeletionSummary = {
  assessmentId: baselineData.assessmentId,
  name: baselineData.name,
};
        for (const exp of product[0]?.assessments?.experimental || []) {
          await propagateBaselineStateToAssessment({
            baselineData: baselineDeletionSummary,
            targetAssessmentId: exp.assessmentId,
            userName: res.locals.user?.name,
            operation: "Baseline Deleted",
          });
        }
        if (product[0]?.assessments?.final?.assessmentId) {
          await propagateBaselineStateToAssessment({
            baselineData: baselineDeletionSummary,
            targetAssessmentId: product[0].assessments.final.assessmentId,
            userName: res.locals.user?.name,
            operation: "Baseline Deleted",
          });
        }
      }

      const doc = await this.model.findByIdAndUpdate(query, deleteData, updateOptions);

if (assessmentType === "baseline") {
  if (product[0]?.assessments?.experimental?.length) {
    await this.model.updateOne(
      { _id: new Types.ObjectId(req.params.id) },
      {
        $set: {
          "assessments.experimental.$[].isBaselineCalcUpdated": false,
          "assessments.experimental.$[].isBaselineSkipped": false,
        },
      }
    );
  }

  if (product[0]?.assessments?.final) {
    await this.model.updateOne(
      { _id: new Types.ObjectId(req.params.id) },
      {
        $set: {
          "assessments.final.isBaselineCalcUpdated": false,
          "assessments.final.isBaselineSkipped": false,
        },
      }
    );
  }
}

      await this.CalculationsModel.updateOne(
        { productId: req.params.id, [`formula_input_output.output.${assessmentType}.assessmentId`]: assessmentId },
        { $set: { [`formula_input_output.output.${assessmentType}.$.isDeleted`]: true, [`formula_input_output.output.${assessmentType}.$.lpp_indicator`]: false } }
      );

      const auditData = await initializeAuditController();

      // UPDATED — pass real pre-delete snapshot instead of relying on the broken empty-object fallback
      await auditData.formatAndSaveAuditDataForAssessment(
        doc.toJSON(),
        productAssessmentId,
        assessmentType,
        "Delete Assessment",
        "Delete",
        res.locals.user?.name,
        preDeleteSnapshot
      );

      res.status(204).json(doc);
    } catch (error) {
      next(error);
    }
  }

  async addTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        productSipId: req.body.productId,
        isDeleted: false,
      };
      const newUsers = req.body.users;
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (!product) {
        res.status(404).json({ message: "Incorrect Product Id" });
      }
      const uniqueNewUsers = newUsers.filter(
        (newUser: { mail: string }) =>
          !product[0].users.some(
            (existingUser: { mail: string }) =>
              existingUser.mail === newUser.mail
          )
      );
      if (uniqueNewUsers.length === 0) {
        return res
          .status(400)
          .json({ message: "All users already exist in the product" });
      }

      const doc = await this.model.findOneAndUpdate(
        { productSipId: req.body.productId },
        { $push: { users: { $each: uniqueNewUsers } } },
        { returnDocument: "after" }
      );

      formatAndSaveAuditData(
        req.body.productId,
        "Add Team Member",
        "Insert",
        doc,
        res.locals.user?.name
      );

      res.status(200).send(doc);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        _id: new Types.ObjectId(req.params.id),
        isDeleted: false,
      };
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        res.status(404).send({ message: "Incorrect Id" });
      }
      if (
        product[0].users.filter(
          (e: { mail: string; role: string }) =>
            e.role !== req.body.role && e.mail === req.body.mail
        ).length === 0
      ) {
        res.status(500).send({ message: "At least one owner must remain" });
      }
      const doc = await this.model.findOneAndUpdate(
        { _id: new Types.ObjectId(req.params.id), "users.mail": req.body.mail },
        { $set: { "users.$.role": req.body.role } },
        { new: true }
      );
      formatAndSaveAuditData(
        doc.productSipId,
        "Edit Team Member",
        "Update",
        doc,
        res.locals.user?.name
      );

      res.status(204).send(doc);
    } catch (error) {
      next(error);
    }
  }

  async deleteMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        _id: new Types.ObjectId(req.params.id),
        isDeleted: false,
      };
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        res.status(404).send({ message: "Incorrect Id" });
      }
      if (
        product[0].users.filter(
          (e: { mail: string; role: string }) =>
            e.mail !== req.body.mail && e.role === "Owner"
        ).length === 0
      ) {
        res.status(500).send({ message: "At least one owner must remain" });
      } else {
        const doc = await this.model.findOneAndUpdate(
          { _id: new Types.ObjectId(req.params.id) },
          { $pull: { users: { mail: req.body.mail } } },
          { new: true, returnDocument: "before" }
        );
        formatAndSaveAuditData(
          doc.productSipId,
          "Delete Team Member",
          "Delete",
          doc,
          res.locals.user?.name
        );
        res.status(204).send(doc);
      }
    } catch (error) {
      next(error);
    }
  }

  async addEditPackagingDetails(
    req: Request,
    res: Response,
    systemCalcTriggered: boolean = false
  ) {
    try {
      const assessmentType = req.body.assessmentType.toLowerCase();
      const query = {
        _id: new Types.ObjectId(req.body.productId),
        [`assessments.${assessmentType}._id`]: new Types.ObjectId(
          req.body.assessmentId
        ),
        isDeleted: false,
      };
      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        res.status(404).json({ message: "Incorrect Product Id" });
      }

      req.body.packaging_level.forEach(
        (packaging: {
          components: [];
          recyclability_status: string;
          isrecyclable: boolean;
        }) => {
          const allComponentsRecycleReady = packaging.components.every(
            (component: {
              recyclability_status: string;
              isrecyclable: boolean;
            }) => component.recyclability_status === "Recycle Ready"
          );
          const allComponentsNonRecycle = packaging.components.some(
            (component: {
              recyclability_status: string;
              isrecyclable: boolean;
            }) => component.recyclability_status === "Not Recycle Ready"
          );
          if (allComponentsRecycleReady) {
            if (packaging.components.length > 0) {
              packaging.recyclability_status = "Recycle Ready";
              packaging.isrecyclable = true;
            } else {
              packaging.recyclability_status = "N/A";
              packaging.isrecyclable = false;
            }
          } else {
            if (allComponentsNonRecycle) {
              packaging.recyclability_status = "Not Recycle Ready";
              packaging.isrecyclable = false;
              return;
            } else {
              packaging.recyclability_status = "N/A";
              packaging.isrecyclable = false;
              return;
            }
          }
        }
      );

      const assessmentIndex = await this.checkAssessmentId(
        req.body.assessmentId,
        product,
        assessmentType
      );
      if (assessmentIndex === -1) {
        res.status(404).json({ message: "Assessment ID Not Found" });
      }
      const isDataComplete = await this.processPackaging(
        req.body.packaging_level
      );

      const pcIdValue = await this.getPcIdFromComponents(req);
      const isCalculatedButtonClicked =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isCalculatedButtonClicked"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isCalculatedButtonClicked"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isCalculatedButtonClicked"
            )
          ? product[0]["assessments"][assessmentType][
              "isCalculatedButtonClicked"
            ]
          : false;
      const asessmentPackagingData =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.packaging_level`]
          : [`assessments.${assessmentType}.packaging_level`];

      const isFormulaCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isFormulationCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isFormulationCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isFormulationCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isFormulationCalculated"]
          : false;
      const isFormulaEolCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isFormulationEOLCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isFormulationEOLCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isFormulationEOLCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isFormulationEOLCalculated"
            ]
          : false;
      const isPackagingCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isPackagingCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isPackagingCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isPackagingCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isPackagingCalculated"]
          : false;

      const isSpiceCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSpiceCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSpiceCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSpiceCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isSpiceCalculated"]
          : false;

      const isGreenChemistryCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isGreenChemistryCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isGreenChemistryCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isGreenChemistryCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isGreenChemistryCalculated"
            ]
          : false;

      const isSustainabilityPackagingCalculatednCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSustainabilityPackagingCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSustainabilityPackagingCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSustainabilityPackagingCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isSustainabilityPackagingCalculated"
            ]
          : false;

      const isLCACalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isLCACalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isLCACalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isLCACalculated"
            )
          ? product[0]["assessments"][assessmentType]["isLCACalculated"]
          : false;

      const isSustainabilityPackagingRollupCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSustainabilityPackagingRollupCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSustainabilityPackagingRollupCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSustainabilityPackagingRollupCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isSustainabilityPackagingRollupCalculated"
            ]
          : false;

      const isGreenChemistryRollupCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isGreenChemistryRollupCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isGreenChemistryRollupCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isGreenChemistryRollupCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isGreenChemistryRollupCalculated"
            ]
          : false;

      const dataPackagingCompletion =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isPackagingDataCompleted`,
            ]
          : [`assessments.${assessmentType}.isPackagingDataCompleted`];
      const pcIdData =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.pc_spec`]
          : [`assessments.${assessmentType}.pc_spec`];
      const calculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isCalculatedButtonClicked`,
            ]
          : [`assessments.${assessmentType}.isCalculatedButtonClicked`];
      const formulaCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isFormulationCalculated`,
            ]
          : [`assessments.${assessmentType}.isFormulationCalculated`];
      const formulaEolCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isFormulationEOLCalculated`,
            ]
          : [`assessments.${assessmentType}.isFormulationEOLCalculated`];
      const packagingCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isPackagingCalculated`,
            ]
          : [`assessments.${assessmentType}.isPackagingCalculated`];
      const SpiceCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSpiceCalculated`,
            ]
          : [`assessments.${assessmentType}.isSpiceCalculated`];
      const GreenChemistryCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isGreenChemistryCalculated`,
            ]
          : [`assessments.${assessmentType}.isGreenChemistryCalculated`];
      const sustainabilityPackagingCalculatednCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSustainabilityPackagingCalculated`,
            ]
          : [
              `assessments.${assessmentType}.isSustainabilityPackagingCalculated`,
            ];
      const LCACalculationCompleted =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.isLCACalculated`]
          : [`assessments.${assessmentType}.isLCACalculated`];
      const sustainabilityPackagingRollupCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSustainabilityPackagingRollupCalculated`,
            ]
          : [
              `assessments.${assessmentType}.isSustainabilityPackagingRollupCalculated`,
            ];
      const greenChemistryRollupCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isGreenChemistryRollupCalculated`,
            ]
          : [`assessments.${assessmentType}.isGreenChemistryRollupCalculated`];
      const updateData = {
        $set: {
          [`${dataPackagingCompletion}`]:
            isDataComplete === true &&
            req.body.packaging_level[0].productEvaluation > 0 &&
            req.body.packaging_level[0].productEvaluation <= 100
              ? true
              : false,
          [`${calculationCompleted}`]: isCalculatedButtonClicked,
          [`${asessmentPackagingData}`]: req.body.packaging_level,
          [`${formulaCalculationCompleted}`]: isFormulaCalculationCompleted,
          [`${formulaEolCalculationCompleted}`]: isFormulaEolCalculationCompleted,
          [`${packagingCalculationCompleted}`]: isPackagingCalculationCompleted,
          [`${SpiceCalculationCompleted}`]: isSpiceCalculationCompleted,
          [`${GreenChemistryCompleted}`]: isGreenChemistryCompleted,
          [`${sustainabilityPackagingCalculatednCompleted}`]: isSustainabilityPackagingCalculatednCompleted,
          [`${LCACalculationCompleted}`]: isLCACalculationCompleted,
          [`${sustainabilityPackagingRollupCalculationCompleted}`]: isSustainabilityPackagingRollupCalculationCompleted,
          [`${greenChemistryRollupCalculationCompleted}`]: isGreenChemistryRollupCalculationCompleted,
          [`${pcIdData}`]: pcIdValue,
        },
      };
      const updateOptions = { new: true, upsert: true };
      let updatedDoc;

      updatedDoc = await this.model.findOneAndUpdate(
        query,
        updateData,
        updateOptions
      );
      if (!updatedDoc) {
        return res
          .status(404)
          .json({ message: "Failed to update packaging details" });
      }
      updatedDoc = updatedDoc.toJSON();

      if (
        req.body.isCalculating === true &&
        req.body.packaging_level?.[0]?.productEvaluation > 0 &&
        req.body.packaging_level?.[0]?.productEvaluation <= 100
      ) {
        const assessmentCalculation = await initializeAssessmentCalculationController();

        const calculationResult = await assessmentCalculation.AssessmentCalculation(
          req.body.productId,
          req.body.assessmentId,
          assessmentType,
          product,
          assessmentIndex
        );

        if (calculationResult !== "success") {
          return res.status(400).send({
            message:
              "Enter both your formulation and packaging data and hit 'calculate' to view results",
          });
        }

        const isBaselineCalcUpdatedFlag =
          req?.body?.isBaselineCalcUpdated === true;

        const updateQuery = {
          isDeleted: false,
          _id: new Types.ObjectId(req.body.productId),
        };

        const query = {
          ...updateQuery,
          [`assessments.${assessmentType}._id`]: new Types.ObjectId(
            req.body.assessmentId
          ),
        };

        const productDoc = await this.model.findOne(updateQuery).lean();

        if (!productDoc) {
          return res.status(404).json({ error: "Product not found" });
        }

        const hasExperimental =
          productDoc?.assessments?.experimental?.length > 0;
        const hasFinal = !!productDoc?.assessments?.final;

        if (assessmentType === "baseline" && isBaselineCalcUpdatedFlag) {
          if (hasExperimental) {
            await this.model.updateOne(updateQuery, {
              $set: {
                "assessments.experimental.$[].isBaselineCalcUpdated": true,
              },
            });
          }

          if (hasFinal) {
            await this.model.updateOne(updateQuery, {
              $set: {
                "assessments.final.isBaselineCalcUpdated": true,
              },
            });
          }
        }

        if (assessmentType === "experimental" && hasExperimental) {
          await this.model.updateOne(query, {
            $set: {
              "assessments.experimental.$.isBaselineCalcUpdated": false,
            },
          });
        }

        if (assessmentType === "final" && hasFinal) {
          await this.model.updateOne(updateQuery, {
            $set: {
              "assessments.final.isBaselineCalcUpdated": false,
            },
          });
        }

        updatedDoc = await this.model.findOneAndUpdate(
          query,
          { $set: { [`${calculationCompleted}`]: true } },
          updateOptions
        );
const auditData = await initializeAuditController();
        await auditData.formatAndSaveAuditDataForAssessment(
          req.body.productId,
          req.body.assessmentId,
          assessmentType,
          "Edit Assessment",
          "Update",
          res.locals.user?.name
        );
        const admin_version = await this.adminModel
          .findOne({ type: "major" })
          .sort({ updatedAt: -1 });
        
        const assessmentId = req.body.assessmentId;
        const newVersion = !admin_version?'1':admin_version.version_number;

        const inputField = `formula_input_output.input.${assessmentType}`;
        const outputField = `formula_input_output.output.${assessmentType}`;

        const inputExpr = `$${inputField}`;
        const outputExpr = `$${outputField}`;

        const result = await this.CalculationsModel.updateOne(
          { productId: req.body.productId },
          [
            {
              $set: {
                [inputField]: {
                  $cond: [
                    { $isArray: inputExpr },
                    {
                      $map: {
                        input: inputExpr,
                        as: "a",
                        in: {
                          $cond: [
                            { $eq: ["$$a.assessmentId", assessmentId] },
                            {
                              $mergeObjects: ["$$a", { version: newVersion }],
                            }, // updates if exists, adds if missing
                            "$$a",
                          ],
                        },
                      },
                    },
                    inputExpr, // keep original if not array
                  ],
                },

                [outputField]: {
                  $cond: [
                    { $isArray: outputExpr },
                    {
                      $map: {
                        input: outputExpr,
                        as: "a",
                        in: {
                          $cond: [
                            { $eq: ["$$a.assessmentId", assessmentId] },
                            {
                              $mergeObjects: ["$$a", { version: newVersion }],
                            },
                            "$$a",
                          ],
                        },
                      },
                    },
                    outputExpr,
                  ],
                },
              },
            },
          ]
        );
        if (!result) {
          return res
            .status(404)
            .json({ message: "Failed to update version number" });
        }
        if (!updatedDoc) {
          return res.status(404).json({
            message: "Failed to update calculation status",
          });
        }

        const userName = res.locals.user?.name;

        if (assessmentType === "baseline") {
          const baselineData = productDoc?.assessments?.baseline || {};

          const formattedData = assessmentBaseLineMapping(baselineData);

          await saveCalculationSnapshot({
            assessmentId: formattedData.assessmentId,
            formattedData,
            operation: "Edit Assessment",
            operationType: "Update",
            userName,
          });

          for (const exp of productDoc?.assessments?.experimental || []) {
            await copyBaselineSnapshotToAssessment({
              baselineAssessmentId: formattedData.assessmentId,
              targetAssessmentId: exp.assessmentId,
              userName,
              operation: "Baseline Calculated",
            });
          }

          if (productDoc?.assessments?.final?.assessmentId) {
            await copyBaselineSnapshotToAssessment({
              baselineAssessmentId: formattedData.assessmentId,
              targetAssessmentId: productDoc.assessments.final.assessmentId,
              userName,
              operation: "Baseline Calculated",
            });
          }
        }

        // no baseline (deleted) or baseline explicitly skipped — skip score computation
        const isBaselineSkipped = !productDoc?.assessments?.baseline || productDoc?.assessments?.baseline?.isBaselineSkipped === true;
        if ((assessmentType === "experimental" || assessmentType === "final") && !isBaselineSkipped) {
       try {
            const computedScores = await computeAssessmentScores(
              req.body.productId,
              req.body.assessmentId,
              assessmentType
            );

            const scoreEntry = computedScores?.[0];
            if (scoreEntry?.assessment_sipId) {
              await initializeAuditController();

              await updateOrCreateToPostgres({
                auditKey: scoreEntry.assessment_sipId,
                records: {
                  createdTimestamp: new Date(),
                  objectKey: scoreEntry.assessment_sipId,
                  operation: systemCalcTriggered
                    ? "System method generated calculation upgrade"
                    : "User generated calculation",
                  operationType: "Result change event",
                  pef_score: scoreEntry.pef_score,
                  pef_description: scoreEntry.pef_description,
                  carbon_score: scoreEntry.carbon_score,
                  carbon_description: scoreEntry.carbon_description,
                  pack_circularity_score: scoreEntry.pack_circularity_score,
                  pack_circularity_description:
                    scoreEntry.pack_circularity_description,
                  green_chem_score: scoreEntry.green_chem_score,
                  green_chem_description: scoreEntry.green_chem_description,
                  createdBy: res.locals.user?.name,
                  version: newVersion,
                },
              });
            }
          }
          catch (err) {
          console.error("Score computation failed:", err.message);
}

        }
      }
      const isSaveRequest =
        req.body.isCalculating !== true && req.body.packaging_level.length >= 2;

      if (isSaveRequest) {
        const auditData = await initializeAuditController();
        await auditData.formatAndSaveAuditDataForAssessment(
          req.body.productId,
          req.body.assessmentId,
          assessmentType,
          "Edit Assessment",
          "Update",
          res.locals.user?.name
        );
      }

      res.status(200).send(updatedDoc);
    } catch (error) {
      res.status(400).send({
        message: error,
      });
    }
  }

  async experimentalAssessmentDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assessmentsType = req.params.assessmentType;
      const query = {
        isDeleted: false,
        $or: [
          { "assessments.experimental._id": new Types.ObjectId(req.params.id) },
          { "assessments.baseline._id": new Types.ObjectId(req.params.id) },
          { "assessments.final._id": new Types.ObjectId(req.params.id) },
        ],
      };
      let isBaselinePresent = false;
      let isBaselineDataComplete = false;
      let filteredArray = [];
      const doc = await this.model.find(query).exec();
      const filteredResults = doc.map((result) => {
        result = result.toJSON();
        if (assessmentsType === "experimental") {
          filteredArray = result.assessments[assessmentsType].filter((item) =>
            item._id.equals(new Types.ObjectId(req.params.id))
          );
        }
        if (Object.prototype.hasOwnProperty.call(result, "assessments")) {
          if (
            Object.prototype.hasOwnProperty.call(result.assessments, "baseline")
          ) {
          if (result.assessments.baseline) {
          isBaselinePresent =
            result.assessments.baseline.isBaselineSkipped !== true;
              if (
                result.assessments.baseline.isFormulationDataCompleted ===
                  true &&
                result.assessments.baseline.isPackagingDataCompleted === true
              ) {
                isBaselineDataComplete = true;
              }
            }
          }
        }

        const assessmentDoc =
          assessmentsType === "experimental"
            ? filteredArray[0]
            : result.assessments[assessmentsType];

        return {
          productId: result._id,
          productName: result.productName,
          brandName: result.brandName,
          productSipId: result.productSipId,
          user: result.users,
          isBaselinePresent: isBaselinePresent,
          isBaselineDataComplete: isBaselineDataComplete,
          isBaselineSkipped: result.assessments?.baseline?.isBaselineSkipped === true,
          details: assessmentDoc,
        };
      });

      if (filteredResults.length > 0) {
        res.status(200).json(filteredResults);
      } else {
        res
          .status(404)
          .json({ message: "No objects found with the specified Id" });
      }
    } catch (error) {
      next(error);
    }
  }

  async getSearchDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const regex = new RegExp(req.params.searchString, "i"); // 'i' for case-insensitive search
      const email = new RegExp(res.locals.user.unique_name, "i");
      const query = {
        isDeleted: false,
        $or: [
          { productName: { $regex: regex } },
          { brandName: { $regex: regex } },
          { projectId: { $regex: regex } },
          { projectName: { $regex: regex } },
          { productSipId: { $regex: regex } },
          { description: { $regex: regex } },
          { "users.name": { $regex: regex } },
          { "users.role": { $regex: regex } },
          { "users.mail": { $regex: regex } },
        ],
      };
      req.query.type !== "all"
        ? Object.assign(query, { "users.mail": { $regex: email } })
        : query;
      let results = await this.model.aggregate([{ $match: query }]).exec();
      const countPipeline = [{ $match: query }, { $count: "count" }];
      const count = await this.model.aggregate(countPipeline).exec();
      results = results.map((data) => {
        if (Object.prototype.hasOwnProperty.call(data, "assessments")) {
          const getAssessmentType = this.determineAssessmentType(
            data.assessments
          );
          Object.assign(data, { type: getAssessmentType });
          return data;
        } else {
          Object.assign(data, { type: "Experimental" });
          return data;
        }
      });
      res.status(200).json({ count: count[0]?.count ?? 0, data: results });
    } catch (error) {
      next(error);
    }
  }

  async addUpdateFormulationDetails(req: Request, res: Response) {
    try {
      const assessmentType = req.body.type.toLowerCase();
      const assessmentId = req.body.assessmentId;
      const query = {
        _id: new Types.ObjectId(req.body.productId),
        [`assessments.${assessmentType}._id`]: new Types.ObjectId(assessmentId),
        isDeleted: false,
      };

      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        return res.status(404).json({ message: "Incorrect Product Id" });
      }
      let isBaselinePresent = Object.prototype.hasOwnProperty.call(
        product[0]["assessments"],
        "baseline"
      );
      console.log(isBaselinePresent);
      const assessmentIndex = await this.checkAssessmentId(
        assessmentId,
        product,
        assessmentType
      );
      if (assessmentIndex === -1) {
        res.status(404).json({ message: "Assessment ID Not Found" });
      }
      const asessmentData =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.formulation`]
          : [`assessments.${assessmentType}.formulation`];
      const dataCompletion =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isFormulationDataCompleted`,
            ]
          : [`assessments.${assessmentType}.isFormulationDataCompleted`];
      const isDataComplete = await this.checkDataValues(
        req.body.formulation.productSegment,
        req.body.formulation.productSubSegment,
        req.body.formulation.netContent,
        req.body.formulation.rawMaterials,
        req.body.formulation.useDose,
        req.body.formulation.consumablesUsed,
        req.body.formulation.productionZone,
        req.body.formulation.salesZone,
        req.body.formulation.useScenario,
        req.body.formulation.rawMaterialsPercentage
      );

      const isCalculatedButtonClicked =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isCalculatedButtonClicked"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isCalculatedButtonClicked"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isCalculatedButtonClicked"
            )
          ? product[0]["assessments"][assessmentType][
              "isCalculatedButtonClicked"
            ]
          : false;

      const isFormulaCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isFormulationCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isFormulationCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isFormulationCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isFormulationCalculated"]
          : false;
      const isFormulaEolCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isFormulationEOLCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isFormulationEOLCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isFormulationEOLCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isFormulationEOLCalculated"
            ]
          : false;
      const isPackagingCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isPackagingCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isPackagingCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isPackagingCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isPackagingCalculated"]
          : false;

      const isSpiceCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSpiceCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSpiceCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSpiceCalculated"
            )
          ? product[0]["assessments"][assessmentType]["isSpiceCalculated"]
          : false;

      const isGreenChemistryCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isGreenChemistryCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isGreenChemistryCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isGreenChemistryCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isGreenChemistryCalculated"
            ]
          : false;

      const isSustainabilityPackagingCalculatednCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSustainabilityPackagingCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSustainabilityPackagingCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSustainabilityPackagingCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isSustainabilityPackagingCalculated"
            ]
          : false;

      const isLCACalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isLCACalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isLCACalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isLCACalculated"
            )
          ? product[0]["assessments"][assessmentType]["isLCACalculated"]
          : false;

      const isSustainabilityPackagingRollupCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isSustainabilityPackagingRollupCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isSustainabilityPackagingRollupCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isSustainabilityPackagingRollupCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isSustainabilityPackagingRollupCalculated"
            ]
          : false;

      const isGreenChemistryRollupCalculationCompleted =
        assessmentType === "experimental"
          ? Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType][assessmentIndex],
              "isGreenChemistryRollupCalculated"
            )
            ? product[0]["assessments"][assessmentType][assessmentIndex][
                "isGreenChemistryRollupCalculated"
              ]
            : false
          : Object.prototype.hasOwnProperty.call(
              product[0]["assessments"][assessmentType],
              "isGreenChemistryRollupCalculated"
            )
          ? product[0]["assessments"][assessmentType][
              "isGreenChemistryRollupCalculated"
            ]
          : false;

      const calculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isCalculatedButtonClicked`,
            ]
          : [`assessments.${assessmentType}.isCalculatedButtonClicked`];
      const formulaCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isFormulationCalculated`,
            ]
          : [`assessments.${assessmentType}.isFormulationCalculated`];
      const formulaEolCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isFormulationEOLCalculated`,
            ]
          : [`assessments.${assessmentType}.isFormulationEOLCalculated`];
      const packagingCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isPackagingCalculated`,
            ]
          : [`assessments.${assessmentType}.isPackagingCalculated`];
      const SpiceCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSpiceCalculated`,
            ]
          : [`assessments.${assessmentType}.isSpiceCalculated`];
      const GreenChemistryCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isGreenChemistryCalculated`,
            ]
          : [`assessments.${assessmentType}.isGreenChemistryCalculated`];
      const sustainabilityPackagingCalculatednCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSustainabilityPackagingCalculated`,
            ]
          : [
              `assessments.${assessmentType}.isSustainabilityPackagingCalculated`,
            ];
      const LCACalculationCompleted =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.isLCACalculated`]
          : [`assessments.${assessmentType}.isLCACalculated`];
      const sustainabilityPackagingRollupCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isSustainabilityPackagingRollupCalculated`,
            ]
          : [
              `assessments.${assessmentType}.isSustainabilityPackagingRollupCalculated`,
            ];
      const greenChemistryRollupCalculationCompleted =
        assessmentType === "experimental"
          ? [
              `assessments.${assessmentType}.${assessmentIndex}.isGreenChemistryRollupCalculated`,
            ]
          : [`assessments.${assessmentType}.isGreenChemistryRollupCalculated`];

      const netContentValue =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.net_content`]
          : [`assessments.${assessmentType}.net_content`];

      const SalesZoneValue =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.zone`]
          : [`assessments.${assessmentType}.zone`];
      const formulaIdData =
        assessmentType === "experimental"
          ? [`assessments.${assessmentType}.${assessmentIndex}.formula_number`]
          : [`assessments.${assessmentType}.formula_number`];
      const updateData = {
        $set: {
          [`${calculationCompleted}`]: isCalculatedButtonClicked,
          [`${formulaCalculationCompleted}`]: isFormulaCalculationCompleted,
          [`${formulaEolCalculationCompleted}`]: isFormulaEolCalculationCompleted,
          [`${packagingCalculationCompleted}`]: isPackagingCalculationCompleted,
          [`${SpiceCalculationCompleted}`]: isSpiceCalculationCompleted,
          [`${GreenChemistryCompleted}`]: isGreenChemistryCompleted,
          [`${sustainabilityPackagingCalculatednCompleted}`]: isSustainabilityPackagingCalculatednCompleted,
          [`${LCACalculationCompleted}`]: isLCACalculationCompleted,
          [`${sustainabilityPackagingRollupCalculationCompleted}`]: isSustainabilityPackagingRollupCalculationCompleted,
          [`${greenChemistryRollupCalculationCompleted}`]: isGreenChemistryRollupCalculationCompleted,
          [`${netContentValue}`]:
            req.body.formulation.netContent +
            " " +
            req.body.formulation.netContentUnit,
          [`${SalesZoneValue}`]: req.body.formulation.salesZone,
          [`${asessmentData}`]: req.body.formulation,
          [`${formulaIdData}`]: req.body.formulation.fmlCode,
          [`${dataCompletion}`]:
            isDataComplete === true && req.body.formulation.isDataValid === true
              ? true
              : false,
        },
      };
      const updateOptions = { upsert: true, new: true };

      const updatedDoc = await this.model.findOneAndUpdate(
        query,
        updateData,
        updateOptions
      );
      if (!updatedDoc) {
        return res
          .status(404)
          .json({ message: "Failed to add or update formulation details" });
      }

      if (req.body.isCalculating) {
        const assessmentCalculation = await initializeAssessmentCalculationController();
        if (isDataComplete) {
          const calculationResult = await assessmentCalculation.AssessmentCalculation(
            req.body.productId,
            assessmentId,
            assessmentType,
            product,
            assessmentIndex
          );

          if (calculationResult === "success") {
            
            const assessmentType = req.body.type;
           
            const isBaselineCalcUpdatedFlag = req?.body?.isBaselineCalcUpdated;

            const query = {
              isDeleted: false,
              _id: new Types.ObjectId(req.body.productId),
              [`assessments.${assessmentType}._id`]: new Types.ObjectId(
                req.body.assessmentId
              ),
            };

            const updateQuery = {
              isDeleted: false,
              _id: new Types.ObjectId(req.body.productId),
            };
            // Fetch product once
            const product = await this.model.findOne(updateQuery).lean();

            if (!product) {
              return res.status(404).json({ error: "Product not found" });
            }

            const hasExperimental =
              product?.assessments?.experimental?.length > 0;
            const hasFinal = !!product?.assessments?.final;

            // ⭐ CASE-1: BASELINE Update
            if (
              assessmentType === "baseline" &&
              isBaselineCalcUpdatedFlag === true
            ) {
              if (hasExperimental) {
                await this.model.updateOne(updateQuery, {
                  $set: {
                    "assessments.experimental.$[].isBaselineCalcUpdated": true,
                  },
                });
              }

              if (hasFinal) {
                await this.model.updateOne(updateQuery, {
                  $set: { "assessments.final.isBaselineCalcUpdated": true },
                });
              }
            }

            // ⭐ CASE-2: EXPERIMENTAL Update
            if (assessmentType === "experimental" && hasExperimental) {
              await this.model.updateOne(query, {
                $set: {
                  "assessments.experimental.$.isBaselineCalcUpdated": false,
                },
              });
            }

            // ⭐ CASE-3: FINAL Update
            if (assessmentType === "final" && hasFinal) {
              await this.model.updateOne(updateQuery, {
                $set: {
                  "assessments.final.isBaselineCalcUpdated": false,
                },
              });
            }
            const updatedDoc = await this.model.findOneAndUpdate(
              query,
              { $set: { [`${calculationCompleted}`]: true } },
              updateOptions
            );

            const admin_version = await this.adminModel
              .findOne({ type: "major" })
              .sort({ updatedAt: -1 });
            
            const assessmentId = req.body.assessmentId;
            const newVersion = !admin_version?'1':admin_version.version_number;

            const inputField = `formula_input_output.input.${assessmentType}`;
            const outputField = `formula_input_output.output.${assessmentType}`;

            const inputExpr = `$${inputField}`;
            const outputExpr = `$${outputField}`;

            const result = await this.CalculationsModel.updateOne(
              { productId: req.body.productId },
              [
                {
                  $set: {
                    [inputField]: {
                      $cond: [
                        { $isArray: inputExpr },
                        {
                          $map: {
                            input: inputExpr,
                            as: "a",
                            in: {
                              $cond: [
                                { $eq: ["$$a.assessmentId", assessmentId] },
                                {
                                  $mergeObjects: [
                                    "$$a",
                                    { version: newVersion },
                                  ],
                                }, // updates if exists, adds if missing
                                "$$a",
                              ],
                            },
                          },
                        },
                        inputExpr, // keep original if not array
                      ],
                    },

                    [outputField]: {
                      $cond: [
                        { $isArray: outputExpr },
                        {
                          $map: {
                            input: outputExpr,
                            as: "a",
                            in: {
                              $cond: [
                                { $eq: ["$$a.assessmentId", assessmentId] },
                                {
                                  $mergeObjects: [
                                    "$$a",
                                    { version: newVersion },
                                  ],
                                },
                                "$$a",
                              ],
                            },
                          },
                        },
                        outputExpr,
                      ],
                    },
                  },
                },
              ]
            );
            if (!result) {
              return res
                .status(404)
                .json({ message: "Failed to update version number" });
            }
            if (!updatedDoc) {
              return res.status(404).json({
                message: "Failed to add or update formulation details",
              });
            }

            // no baseline (deleted) or baseline explicitly skipped — skip score computation
            const isBaselineSkipped = !product?.assessments?.baseline || product?.assessments?.baseline?.isBaselineSkipped === true;
            if ((assessmentType === "experimental" || assessmentType === "final") && !isBaselineSkipped) {
              try {
                const computedScores = await computeAssessmentScores(
                  req.body.productId,
                  req.body.assessmentId,
                  assessmentType
                );
                const scoreEntry = computedScores?.[0];
                if (scoreEntry?.assessment_sipId) {
                  await updateOrCreateToPostgres({
                    auditKey: scoreEntry.assessment_sipId,
                    records: {
                      createdTimestamp: new Date(),
                      objectKey: scoreEntry.assessment_sipId,
                      operation: "User generated calculation",
                      operationType: "Result change event",
                      pef_score: scoreEntry.pef_score,
                      pef_description: scoreEntry.pef_description,
                      carbon_score: scoreEntry.carbon_score,
                      carbon_description: scoreEntry.carbon_description,
                      pack_circularity_score: scoreEntry.pack_circularity_score,
                      pack_circularity_description: scoreEntry.pack_circularity_description,
                      green_chem_score: scoreEntry.green_chem_score,
                      green_chem_description: scoreEntry.green_chem_description,
                      createdBy: res.locals.user?.name,
                      version: newVersion,
                    },
                  });
                }
              } catch (err) {
                console.error("Score computation failed:", err.message);
              }
            }
          } else {
            res.status(400).send({ message: "Calculation failed." });
          }
        } else {
          res.status(400).send({
            message:
              "Enter both your formulation and packaging data and hit 'calculate' to view results",
          });
        }
      }
      const isSaveRequest =
        req.body.isCalculating !== true && req.body.formulation;

      if (isSaveRequest) {
        const auditData = await initializeAuditController();

        await auditData.formatAndSaveAuditDataForAssessment(
          req.body.productId,
          req.body.assessmentId,
          assessmentType,
          "Edit Assessment",
          "Update",
          res.locals.user?.name
        );
      }
      res.status(200).send(updatedDoc);
    } catch (error) {
      res.status(400).send({
        message: error,
      });
    }
  }

  async deleteFormulationDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const assessmentType = req.body.type.toLowerCase();
      const assessmentId = req.body.assessmentId;
      const query = {
        _id: new Types.ObjectId(req.body.productId),
        [`assessments.${assessmentType}._id`]: assessmentId,
        isDeleted: false,
      };

      const pipelines = [{ $match: query }];
      const product = await this.model.aggregate(pipelines).exec();
      if (product.length === 0) {
        res.status(404).json({ message: "Incorrect Product Id" });
      }

      const assessmentIndex = await this.checkAssessmentId(
        assessmentId,
        product,
        assessmentType
      );
      if (assessmentIndex === -1) {
        res.status(404).json({ message: "Assessment ID Not Found" });
      }
      const updateData = {
        $set: {
          [`assessments.${assessmentType}.${assessmentIndex}.formulation`]: {},
        },
      };
      const updateOptions = { new: true };

      const updatedDoc = await this.model.findOneAndUpdate(
        query,
        updateData,
        updateOptions
      );
      if (!updatedDoc) {
        return res
          .status(404)
          .json({ message: "Failed to delete formulation details" });
      }
      res.status(204).send(updatedDoc);
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assessmentSipId = req.params.assessmentId;
      const query = {
        isDeleted: false,
        $or: [
          { "assessments.experimental.assessmentId": assessmentSipId },
          { "assessments.baseline.assessmentId": assessmentSipId },
          { "assessments.final.assessmentId": assessmentSipId },
        ],
      };
      const doc = await this.model.find(query).exec();
      const filteredResults = doc.map((result) => {
        result = result.toJSON();
        const getAssessmentType = assessmentSipId.split("_")[
          assessmentSipId.split("_").length - 1
        ];
        if (getAssessmentType === "BSL" || getAssessmentType === "FIN") {
          return {
            productId: result._id,
            productName: result.productName,
            brandName: result.brandName,
            productSipId: result.productSipId,
            user: result.users,
            assessmentType: getAssessmentType === "BSL" ? "baseline" : "final",
            assessmentId:
              getAssessmentType === "BSL"
                ? result.assessments.baseline._id
                : result.assessments.final._id,
            assessmentName:
              getAssessmentType === "BSL"
                ? result.assessments.baseline.name
                : result.assessments.final.name,
          };
        } else {
          const assessmentData = result.assessments.experimental.map(
            (expAssessmentData) => {
              if (expAssessmentData.assessmentId === assessmentSipId)
                return expAssessmentData;
            }
          );
          const filteredArray = assessmentData.filter(
            (item): item is object => item !== undefined
          );
          return {
            productId: result._id,
            productName: result.productName,
            brandName: result.brandName,
            productSipId: result.productSipId,
            assessmentType: "experimental",
            assessmentId: filteredArray[0]._id,
            assessmentName: filteredArray[0].name,
            user: result.users,
          };
        }
      });

      if (filteredResults.length > 0) {
        res.status(200).json(filteredResults);
      } else {
        res
          .status(404)
          .json({ message: "No objects found with the specified Id" });
      }
    } catch (error) {
      next(error);
    }
  }

  async calculationScript(req: Request, res: Response): Promise<void> {
    try {
      const result = await calculateForAllProducts(req, res, this.model);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export const initializeProductController = async () => {
  await initializeProductModel();
  await initializeadminModel();
  await initializeCalculationModel();
  const ProductModels = ProductModel();
  const AdminModels = adminModel();
  const CalculationsModels = CalculationsModel();

  return new productController(ProductModels, AdminModels, CalculationsModels);
};

export default initializeProductController;
