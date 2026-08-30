import { Response } from "express";
import RawMaterialsModels, {
  initializeRawMaterialModel,
} from "./rm_consitutuent_data.model.js";
import FrmlRawMaterialsModel, {
  initializeFrmlRawMaterialModel,
} from "./formula_raw.model.js";
import pdrmSipCountModel, {
  initializePdrmSipCountModel,
} from "./pdrm_sip_data_save.model.js";
import {
  getFormulaDetailsCount,
  getRawMaterialDetailsCount,
} from "../../adapters/Api.js";

export class FormulaRawMaterialCountController {
  private collection;
  private rmCollection;
  private pdrmSipDataSave;
  constructor(collection, rmCollection, pdrmSipDataSave) {
    this.collection = collection;
    this.rmCollection = rmCollection;
    this.pdrmSipDataSave = pdrmSipDataSave;
  }

  async getPdrmSipFormulaCount(_req, res: Response): Promise<void> {
    try {
      const fmlDataDetail = await getFormulaDetailsCount(
        res.locals.user?.name || "xyz"
      );
      const rawMaterialDetailsCount = await getRawMaterialDetailsCount(
        res.locals.user?.name || "xyz"
      );
      const frmlDataCount = await this.collection.countDocuments({});
      const rawMaterialDataCount = await this.rmCollection.countDocuments({});
      const fmlDetailsTopicCount = fmlDataDetail["topics"].find(
        (topic) => topic.topicName === "topic.kv.global.pdrm.pd-formuladetails"
      );
      const requestBody = {
        concertoFrmlCount: fmlDetailsTopicCount.count,
        sipFrmlCount: frmlDataCount,
        concertoRawMaterialCount: rawMaterialDetailsCount["totalRawCount"],
        concertoTotalValidRawCount:
          rawMaterialDetailsCount["totalValidRawCount"],
        concertoTotalNonValidRawCount:
          rawMaterialDetailsCount["totalNonValidRawCount"],
        concertoNonExistingIngredientCount:
          rawMaterialDetailsCount["nonExistingIngredientCount"],
        sipRawMaterialCount: rawMaterialDataCount,
      };
      const doc = await this.pdrmSipDataSave.create(requestBody);
      if (!doc) {
        res
          .status(400)
          .json({ message: "Error while pdrm sip count saving data" });
      }

      res.status(200).json(doc);
    } catch (err) {
      res.status(500).send("Error fetching records");
    }
  }
}

export const initializeFormulaRawMaterialController = async () => {
  await initializeRawMaterialModel();
  await initializeFrmlRawMaterialModel();
  await initializePdrmSipCountModel();
  const RawMaterialsModelModels = RawMaterialsModels();
  const FrmlRawMaterialsModels = FrmlRawMaterialsModel();
  const PdrmSipCountModels = pdrmSipCountModel();

  return new FormulaRawMaterialCountController(
    FrmlRawMaterialsModels,
    RawMaterialsModelModels,
    PdrmSipCountModels
  );
};

export default initializeFormulaRawMaterialController;
