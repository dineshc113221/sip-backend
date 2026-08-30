import { Request, Response } from "express";
import ProductSearchModel, {
  initializeComponentSearchModel,
} from "./component_search.model.js";
class ComponentSearchController {
  private collection;

  constructor(collection) {
    this.collection = collection;
  }

  preprocessMasterData(packagingMaster: object): Set<string> {
    const set = new Set<string>();

    Object.values(packagingMaster).forEach((values) => {
      values.forEach((item) => {
        let val: string | undefined;

        if (typeof item === "string") {
          val = item;
        } else if (typeof item === "object" && item.name) {
          val = item.name;
        }

        if (val && val.trim() !== "") {
          set.add(val.trim().toLowerCase());
        }
      });
    });

    return set;
  }

  safeLookup(value: string | null | undefined, set: Set<string>): boolean {
    if (!value || value.trim() === "") return false;
    return set.has(value.trim().toLowerCase());
  }

  async getComponentSeachCodes(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const initialLetters = (req.query.initialLetters as string) || "";

    try {
      const regex = new RegExp(initialLetters, "i");
      const filter = initialLetters
        ? { "PACKAGING_LVL.COMPONENT.CHILD_NM": { $regex: regex } }
        : {};

      const records = await this.collection
        .find(filter, {
          projection: { "PACKAGING_LVL.COMPONENT.CHILD_NM": 1, _id: 0 },
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const seenPCSpecCode = new Set();
      const uniquePCSpec: { CHILD_NM: string }[] = [];

      records.forEach((frmData: { PACKAGING_LVL }) => {
        frmData["PACKAGING_LVL"].forEach((element: { COMPONENT }) => {
          element["COMPONENT"].forEach((data: { CHILD_NM: string }) => {
            if (!seenPCSpecCode.has(data.CHILD_NM)) {
              uniquePCSpec.push(data);
              seenPCSpecCode.add(data.CHILD_NM);
            }
          });
        });
      });

      res.status(200).json(uniquePCSpec);
    } catch (err) {
      res.status(500).send("Error fetching records");
    }
  }

  async getComponentSeachDetails(req: Request, res: Response): Promise<void> {
    try {
      const { PCCode } = req.params;
      const productSearchDetails = await this.collection.findOne(
        {
          "PACKAGING_LVL.COMPONENT.CHILD_NM": PCCode,
        },
        { sort: { "PACKAGING_LVL.COMPONENT.CHILD_RVSN_NBR": -1 } }
      );

      if (!productSearchDetails) {
        res.status(404).json({ message: "PC details not found" });
        return;
      }

      let PCData = {};

      for (const object of productSearchDetails.PACKAGING_LVL) {
        const pcDetails = object.COMPONENT.find(
          (item: { CHILD_NM: string }) => item.CHILD_NM === PCCode
        );
        if (pcDetails) {
          let subComponent = [];
          let subComponentFieldExist = [];

          pcDetails.SUB_COMPONENTS.forEach((components) => {
            let materialData: {
              material_name: string;
              material_type: string;
              layer: string;
              converting_process: string;
              material_pct: string;
              fieldsExist: {};
            }[] = [];
            components.MATERIALS.forEach((material) => {
              materialData.push({
                material_name:
                  material.MATERIAL_CLEAN !== "Unknown"
                    ? material.MATERIAL_CLEAN
                    : "",
                material_type: material.CMPNT_SUB_MATL_CD,
                layer: material.SUB_CMPNT_LAYER,
                converting_process:
                  material.MANUFACTURING_PROCESS_CLEAN !== "Unknown"
                    ? material.MANUFACTURING_PROCESS_CLEAN
                    : "",
                material_pct: material.SUB_CMPNT_WT_VAL_G,
                fieldsExist: {
                  material_name:
                    !!material.MATERIAL_CLEAN &&
                    material.MATERIAL_CLEAN !== "Unknown",
                  material_type: !!material.CMPNT_SUB_MATL_CD,
                  layer: !!material.SUB_CMPNT_LAYER,
                  converting_process:
                    !!material.MANUFACTURING_PROCESS_CLEAN &&
                    material.MANUFACTURING_PROCESS_CLEAN !== "Unknown",
                  material_pct: !!material.SUB_CMPNT_WT_VAL_G,
                },
              });
            });
            subComponent.push({
              name: components.SUB_CMPNT_NAME,
              opacity: components.OPACITY_CD,
              color: components.COLOR_CLEAN,
              finishing_process: components.FINISHING_PROCESS,
              material: materialData,
            });
            subComponentFieldExist.push({
              name: !!components.SUB_CMPNT_NAME,
              opacity: !!components.OPACITY_CD,
              color: !!components.COLOR_CLEAN,
              finishing_process: !!components.FINISHING_PROCESS,
              material: materialData.map((material) => material.fieldsExist),
            });
          });

          PCData = {
            pc_nm: pcDetails.CHILD_NM,
            fg_spec: productSearchDetails.FG_NM,
            fg_revision: productSearchDetails.FG_RVSN_NBR,
            description: pcDetails.PC_DESC,
            component_type: pcDetails.CMPNT_FORM_CD,
            weight: pcDetails.CMPNT_WT_VAL_G,
            opacifier: pcDetails.RECYCLABILITY_DISRUPTORS,
            stage: pcDetails.PC_STAGE_CD,
            state: pcDetails.PC_STS_CD,
            template: pcDetails.PC_TEMPL_CD,
            sales_country: productSearchDetails.SaleCountry,
            ProductionCountry: productSearchDetails.ProductionCountry,
            sub_components: subComponent,
            fieldsExist: {
              pc_nm: !!pcDetails.CHILD_NM,
              fg_spec: !!productSearchDetails.FG_NM,
              fg_revision: !!productSearchDetails.FG_RVSN_NBR,
              description: !!pcDetails.PC_DESC,

              component_type: !!pcDetails.CMPNT_FORM_CD,
              weight: !!pcDetails.CMPNT_WT_VAL_G,
              opacifier: !!pcDetails.RECYCLABILITY_DISRUPTORS,

              stage: !!pcDetails.PC_STAGE_CD,
              state: !!pcDetails.PC_STS_CD,
              template: !!pcDetails.PC_TEMPL_CD,
              sales_country: !!productSearchDetails.SaleCountry,
              productionCountry: !!productSearchDetails.ProductionCountry,
              sub_components: subComponentFieldExist,
            },
          };
        }
      }
      res.json(PCData);
    } catch (err) {
      res.status(500).send("Error fetching PC details");
    }
  }

  async getComponentDetails(fg_spec: string) {
    try {
      const fg_nm_index = fg_spec.lastIndexOf("-");
      if (fg_nm_index === -1) {
        return [];
      }
      const fg_nm = fg_spec.slice(0, fg_nm_index);
      const fg_nm_revision = fg_spec.slice(fg_nm_index + 1);
      const data = await this.collection.findOne(
        {
          FG_NM: fg_nm,
          FG_RVSN_NBR: fg_nm_revision,
        },
        {},
        { sort: { _id: -1 } }
      );

      if (!data) {
        return [];
      }
      const packaging_level: {
        packaging_level: string;
        components;
        productEvaluation;
      }[] = [];

      let PCData = [];
      let productEvaluation = 90;

      data.PACKAGING_LVL.map((result: { PACKAGING_LVL: string; COMPONENT }) => {
        if (result.PACKAGING_LVL === "Primary") {
          PCData = [];

          for (const obj of result.COMPONENT) {
            if (obj.CMPNT_FORM_CD === "Pump") {
              productEvaluation = 80;
            }
            let subComponent = [];
            let subComponentFieldExist = [];
            obj.SUB_COMPONENTS.forEach((components) => {
              let materialData: {
                material_name: string;
                material_type: string;
                layer: string;
                converting_process: string;
                material_pct: string;
                fieldsExist: {};
              }[] = [];
              components.MATERIALS.forEach((material) => {
                materialData.push({
                  material_name:
                    material.MATERIAL_CLEAN !== "Unknown"
                      ? material.MATERIAL_CLEAN
                      : "",
                  material_type: material.CMPNT_SUB_MATL_CD,
                  layer: material.SUB_CMPNT_LAYER,
                  converting_process:
                    material.MANUFACTURING_PROCESS_CLEAN !== "Unknown"
                      ? material.MANUFACTURING_PROCESS_CLEAN
                      : "",
                  material_pct: material.SUB_CMPNT_WT_VAL_G,
                  fieldsExist: {
                    material_name:
                      !!material.MATERIAL_CLEAN &&
                      material.MATERIAL_CLEAN !== "Unknown",
                    material_type: !!material.CMPNT_SUB_MATL_CD,
                    layer: !!material.SUB_CMPNT_LAYER,
                    converting_process:
                      !!material.MANUFACTURING_PROCESS_CLEAN &&
                      material.MANUFACTURING_PROCESS_CLEAN !== "Unknown",
                    material_pct: !!material.SUB_CMPNT_WT_VAL_G,
                  },
                });
              });
              subComponent.push({
                name: components.SUB_CMPNT_NAME,
                opacity: components.OPACITY_CD,
                color: components.COLOR_CLEAN,
                finishing_process: components.FINISHING_PROCESS,
                material: materialData,
              });
              subComponentFieldExist.push({
                name: !!components.SUB_CMPNT_NAME,
                opacity: !!components.OPACITY_CD,
                color: !!components.COLOR_CLEAN,
                finishing_process: !!components.FINISHING_PROCESS,
                material: materialData.map((material) => material.fieldsExist),
              });
            });

            PCData.push({
              pc_nm: obj.CHILD_NM,
              fg_spec: data.FG_NM,
              fg_revision: data.FG_RVSN_NBR,
              description: obj.PC_DESC,
              component_type: obj.CMPNT_FORM_CD,
              weight: obj.CMPNT_WT_VAL_G,
              opacifier: obj.RECYCLABILITY_DISRUPTORS,
              stage: obj.PC_STAGE_CD,
              state: obj.PC_STS_CD,
              template: obj.PC_TEMPL_CD,
              sales_country: data.SaleCountry,
              ProductionCountry: data.ProductionCountry,
              sub_components: subComponent,
              fieldsExist: {
                pc_nm: !!obj.CHILD_NM,
                fg_spec: !!data.FG_NM,
                fg_revision: !!data.FG_RVSN_NBR,
                description: !!obj.PC_DESC,

                component_type: !!obj.CMPNT_FORM_CD,
                weight: !!obj.CMPNT_WT_VAL_G,
                opacifier: !!obj.RECYCLABILITY_DISRUPTORS,

                stage: !!obj.PC_STAGE_CD,
                state: !!obj.PC_STS_CD,
                template: !!obj.PC_TEMPL_CD,
                sales_country: !!data.SaleCountry,
                productionCountry: !!data.ProductionCountry,
                sub_components: subComponentFieldExist,
              },
            });
          }
          packaging_level.push({
            packaging_level: result.PACKAGING_LVL,
            productEvaluation: productEvaluation,
            components: PCData,
          });
        } else if (result.PACKAGING_LVL === "Secondary") {
          PCData = [];
          for (const obj of result.COMPONENT) {
            let subComponent = [];
            let subComponentFieldExist = [];
            obj.SUB_COMPONENTS.forEach((components) => {
              let materialData: {
                material_name: string;
                material_type: string;
                layer: string;
                converting_process: string;
                material_pct: string;
                fieldsExist: {};
              }[] = [];
              components.MATERIALS.forEach((material) => {
                materialData.push({
                  material_name:
                    material.MATERIAL_CLEAN !== "Unknown"
                      ? material.MATERIAL_CLEAN
                      : "",
                  material_type: material.CMPNT_SUB_MATL_CD,
                  layer: material.SUB_CMPNT_LAYER,
                  converting_process:
                    material.MANUFACTURING_PROCESS_CLEAN !== "Unknown"
                      ? material.MANUFACTURING_PROCESS_CLEAN
                      : "",
                  material_pct: material.SUB_CMPNT_WT_VAL_G,
                  fieldsExist: {
                    material_name:
                      !!material.MATERIAL_CLEAN &&
                      material.MATERIAL_CLEAN !== "Unknown",
                    material_type: !!material.CMPNT_SUB_MATL_CD,
                    layer: !!material.SUB_CMPNT_LAYER,
                    converting_process:
                      !!material.MANUFACTURING_PROCESS_CLEAN &&
                      material.MANUFACTURING_PROCESS_CLEAN !== "Unknown",
                    material_pct: !!material.SUB_CMPNT_WT_VAL_G,
                  },
                });
              });
              subComponent.push({
                name: components.SUB_CMPNT_NAME,
                opacity: components.OPACITY_CD,
                color: components.COLOR_CLEAN,
                finishing_process: components.FINISHING_PROCESS,
                material: materialData,
              });
              subComponentFieldExist.push({
                name: !!components.SUB_CMPNT_NAME,
                opacity: !!components.OPACITY_CD,
                color: !!components.COLOR_CLEAN,
                finishing_process: !!components.FINISHING_PROCESS,
                material: materialData.map((material) => material.fieldsExist),
              });
            });

            PCData.push({
              pc_nm: obj.CHILD_NM,
              fg_spec: data.FG_NM,
              fg_revision: data.FG_RVSN_NBR,
              description: obj.PC_DESC,
              component_type: obj.CMPNT_FORM_CD,
              weight: obj.CMPNT_WT_VAL_G,
              opacifier: obj.RECYCLABILITY_DISRUPTORS,
              stage: obj.PC_STAGE_CD,
              state: obj.PC_STS_CD,
              template: obj.PC_TEMPL_CD,
              sales_country: data.SaleCountry,
              ProductionCountry: data.ProductionCountry,
              sub_components: subComponent,
              fieldsExist: {
                pc_nm: !!obj.CHILD_NM,
                fg_spec: !!data.FG_NM,
                fg_revision: !!data.FG_RVSN_NBR,
                description: !!obj.PC_DESC,
                component_type: !!obj.CMPNT_FORM_CD,
                weight: !!obj.CMPNT_WT_VAL_G,
                opacifier: !!obj.RECYCLABILITY_DISRUPTORS,
                stage: !!obj.PC_STAGE_CD,
                state: !!obj.PC_STS_CD,
                template: !!obj.PC_TEMPL_CD,
                sales_country: !!data.SaleCountry,
                productionCountry: !!data.ProductionCountry,
                sub_components: subComponentFieldExist,
              },
            });
          }
          packaging_level.push({
            packaging_level: result.PACKAGING_LVL,
            productEvaluation: 0,
            components: PCData,
          });
        }
      });
      return packaging_level;
    } catch (err) {
      return [];
    }
  }
}

export const initializeComponentSearchController = async () => {
  await initializeComponentSearchModel();
  const ComponentSearchModels = ProductSearchModel();
  return new ComponentSearchController(ComponentSearchModels);
};

export default initializeComponentSearchController;
