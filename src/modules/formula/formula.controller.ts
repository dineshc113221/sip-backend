import { Request, Response } from "express";
import FormulaModel, { initializeFormulaModel } from "./formula.model.js";
import { initializeRawMaterialController } from "../raw_material_search/rm_search.controller.js";
import { initializeProductSegmentSearchController } from "../segments/product_segments.controller.js";

class FormulaController {
  private collection;

  constructor(collection) {
    this.collection = collection;
  }

  async getFormulaCodes(req: Request, res: Response): Promise<void> {
    try {
      const checkRawMaterialSeachControllers = await initializeRawMaterialController();
      const uniqueFml = await checkRawMaterialSeachControllers.getFormulaCode(
        req
      );
      res.status(200).json(uniqueFml);
    } catch (err) {
      res.status(500).send("Error fetching records");
    }
  }

  async getFormulaDetails(req: Request, res: Response): Promise<void> {
    try {
      const { formulaCode } = req.params;
      const checkRawMaterialSeachControllers = await initializeRawMaterialController();
      const formulaRawMaterialDetails = await checkRawMaterialSeachControllers.getFormulaRawMaterial(
        formulaCode
      );
      const data = await this.collection.findOne(
        {
          frml_cd_vers_concat: formulaCode,
        },
        {},
        { sort: { _id: -1, FRML_VERS_CD: -1 } }
      );

      const rawMaterials = formulaRawMaterialDetails?.compositions || [];
      const productSegment = formulaRawMaterialDetails?.details?.segment?.length > 0
        ? formulaRawMaterialDetails.details.segment[0].value : "";
      const productSubSegment = formulaRawMaterialDetails?.details?.subSegment?.length > 0
        ? formulaRawMaterialDetails.details.subSegment[0].value : "";

      let useDose = "";
      if (productSegment && productSubSegment) {
        const segCtrl = await initializeProductSegmentSearchController();
        const segRecord = await segCtrl["collection"].findOne({
          "Product Segment": productSegment,
          "Product Sub-Segment": productSubSegment,
        });
        useDose = segRecord?.["Use Dose / g"] ?? "";
      }

      const formulaDetails = {
        fgSpec: data?.fg_nm_vers_concat || "",
        SKU_ERP_Code: data?.MATL_NUM || "",
        brandName: formulaRawMaterialDetails?.details.brands?.[0] || "",
        fmlCode: formulaCode,
        description: formulaRawMaterialDetails?.details.description || "",
        labCode: formulaRawMaterialDetails?.details.labBookCode || "",
        netContent: data?.Number_Amount_net_content_min_weight_label || "",
        netContentUnit:
          data !== null
            ? data?.Unit_Of_Measure_net_content_min_weight_label === null ||
              data?.Unit_Of_Measure_net_content_min_weight_label === ""
              ? "g"
              : data.Unit_Of_Measure_product_content_size_label
            : "g",
        productionZone: data?.ProductionZone || "",
        salesZone: data?.SaleZone || "",
        productSegment,
        productSubSegment,
        useDose,
        useDoseUnit: "g",
        formula_status: formulaRawMaterialDetails?.details.statusInd || "",
        rawMaterials: rawMaterials,
        fieldsExist: {
          fmlCode: !!formulaCode,
          description: !!formulaRawMaterialDetails?.details?.description,
          productSegment:
            !!(formulaRawMaterialDetails?.details?.segment?.length > 0),
          productSubSegment:
            !!(formulaRawMaterialDetails?.details?.subSegment?.length > 0),
          netContent: !!data?.Number_Amount_net_content_min_weight_label,
          netContentUnit: !!data?.Unit_Of_Measure_net_content_min_weight_label,
          productionZone: !!data?.ProductionZone,
          salesZone: !!data?.SaleZone,
          rawMaterials: !!formulaRawMaterialDetails?.compositions,
        },
      };
      res.status(200).json(formulaDetails);
    } catch (err) {
      res.status(500).send("Error fetching formula details");
    }
  }

  async getFormulaRawMaterial(fg_nm: string) {
    try {
      const data = await this.collection.findOne(
        {
          fg_nm_vers_concat:fg_nm
        },
        {},
        { sort: { _id: -1, FRML_VERS_CD: -1 } }
      );

      if (!data) {
        return false;
      }
      return data;
    } catch (err) {
      return false;
    }
  }
}

export const initializeFormulaController = async () => {
  await initializeFormulaModel();
  const FormulaModels = FormulaModel();
  return new FormulaController(FormulaModels);
};

export default initializeFormulaController;
