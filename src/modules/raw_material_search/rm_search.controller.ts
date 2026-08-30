import { Request, Response } from "express";
import RawMaterialsModel, {
  initializeRawMaterialModel,
} from "./rm_search.model.js";
import FrmlRawMaterialsModel, {
  initializeFrmlRawMaterialModel,
} from "./frm_rm_search.model.js";

export class RawMaterialSearchController {
  private collection;
  private rmCollection
  constructor(collection,rmCollection) {
    this.collection = collection;
    this.rmCollection = rmCollection
  }

  async getRMSeachCodes(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 300000;
    const initialLetters = (req.query.initialValue as string) || "";

    try {
      const regex = new RegExp(initialLetters, "i"); // 'i' for case-insensitive search
      const filter = {
        $or: [
          { "details.rawMaterialID": { $regex: regex } },
          { "details.tradeName": { $regex: regex } },
        ],
        "details.ecosphere_data_present": true,
        "details.gaia_data_present": true,
      };
      const data = await this.collection
        .find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      const records = [];
      data.map((frmData) => {
      if(frmData.compositions.length>0){
        records.push({
          tradeName: frmData.details.tradeName,
          rawMaterialId: frmData.details.rawMaterialID,
        });
      }
              
      });
      res.status(200).json(records);
    } catch (err) {
      res.status(500).send("Error fetching records");
    }
  }
  async getRMSearchDetails(req: Request, res: Response): Promise<void> {
    try {
      const regex = new RegExp(req.params.rmCode, "i"); // 'i' for case-insensitive search

      const query = {
        $or: [{ "details.rawMaterialID": { $regex: regex } }],
      };
      const rawmaterialDetails = await this.collection.findOne(query,{ sort: { _id: -1} });
      if (!rawmaterialDetails) {
        res.status(404).json({ message: "Raw Materials details not found" });
        return;
      }
      const rmDetails = {
        rawMaterial: rawmaterialDetails.details.rawMaterialID,
        tradeName: rawmaterialDetails.details.tradeName,
      };

      res.json(rmDetails);
    } catch (err) {
      res.status(500).send("Error fetching raw material details");
    }
  }
  async getFormulaRawMaterial(formulaId: string) {
    try {
      const rawmaterialDetails = await this.rmCollection.findOne({
        "details.objectKey": formulaId,
      }, { sort: { _id: -1, "details.objectKey": -1 } })
      if (!rawmaterialDetails) {
        return false;
      }
      return rawmaterialDetails;
    } catch (err) {
      return false;
    }
  }
  async getFormulaCode(req) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50000;
    const initialLetters = (req.query.initialLetters as string) || "";
    try {
      const filter = initialLetters
        ? { "details.objectKey": new RegExp("^" + initialLetters, "i"),"details.fml_raw_eco_gaia_data_present":true }
        : {"details.fml_raw_eco_gaia_data_present":true};

      const data = await this.rmCollection
        .find(filter, { projection: { "details.objectKey": 1, _id: 0 } })
        .sort({ _id: -1, "details.objectKey": -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const seenFmlCode = new Set();
      const uniqueFml: { frml_cd_vers_concat: string }[] = [];

      data.forEach((frmData) => {
        if (!seenFmlCode.has(frmData.details.objectKey)) {
          uniqueFml.push({ frml_cd_vers_concat: frmData.details.objectKey });
          seenFmlCode.add(frmData.details.objectKey);
        }
      });
      return uniqueFml;
    } catch (error) {
      return error;
    }
  }
}

export const initializeRawMaterialController = async () => {
  await initializeRawMaterialModel();
  await initializeFrmlRawMaterialModel()
  const RawMaterialsModelModels = RawMaterialsModel();
  const FrmlRawMaterialsModels = FrmlRawMaterialsModel();
  
  return new RawMaterialSearchController(RawMaterialsModelModels,FrmlRawMaterialsModels);
};

export default initializeRawMaterialController;
