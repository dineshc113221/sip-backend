import { Request, Response, NextFunction } from "express";
import MasterDataModel, {
  initializeMasterDataModel,
} from "./master-data.model.js";

class masterController {
  private collection;
  constructor(collection) {
    this.collection = collection;
  }
  async pagination(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { skip = 0, take = 20 } = req.query;
      const docs = await this.collection
        .find({})
        .skip(skip)
        .limit(take)
        .toArray();
      res.status(200).json(docs);
    } catch (error) {
      next(error);
    }
  }
escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
  async findpackagingMaterial(req: Request, res: Response): Promise<void> {
    const initialValue = (req.query.initialValue as string) || "";
    const regex = new RegExp(this.escapeRegExp(initialValue), "i");
    try {
      const query = {
        "packaging.materials.name.tru_name": {$regex:regex}, // Case-insensitive partial match
      };

      // Find the documents, retrieving the full document
      const packagingMaterial = await this.collection.find(query).toArray();
      const filteredProducts = packagingMaterial.map(
        (product: { packaging: { materials: [] }; _id }) => {
          const filteredMaterials = product.packaging.materials.filter(
            (material: { name: string }) =>
              material.name["tru_name"].match(regex) // Match with case-insensitive regex
          );
          return {
            _id: product._id,
            packaging: {
              materials: filteredMaterials, // Include only the matching materials
            },
          };
        }
      );

      // Send the filtered products as a response
      res.status(200).json(filteredProducts);
    } catch (err) {
      res.status(500).send("Error fetching records");
    }
  }

  async getMasterData(): Promise<void> {
    try {
      const docs = await this.collection
        .find({})
        .toArray();
      return docs
    } catch (error) {
      return error;
    }
  }
  async getSpicePackagingValue(name){
    const initialValue = (name as string) || "";
    const regex = new RegExp(this.escapeRegExp(initialValue), "i");
    try {
      const query = {
        "packaging.materials.name.tru_name": {$regex:regex}, // Case-insensitive partial match
      };
      // Find the documents, retrieving the full document
      const packagingMaterial = await this.collection.find(query).toArray();
      const filteredProducts = packagingMaterial.map(
        (product: { packaging: { materials: [] }; _id }) => {
          const filteredMaterials = product.packaging.materials.filter(
            (material: { name: string }) =>
              material.name["tru_name"].match(regex) // Match with case-insensitive regex
          );
          return {
            _id: product._id,
            packaging: {
              materials: filteredMaterials, // Include only the matching materials
            },
          };
        }
      );

      // Send the filtered products as a response
      return filteredProducts
    } catch (err) {
      return err
    }
  }
    async getSpiceFinishingProcessValue(name){
    const initialValue = (name as string) || "";
    const regex = new RegExp(this.escapeRegExp(initialValue), "i");
    try {
      const query = {
        "packaging.finishing_process.tru_name": {$regex:regex}, // Case-insensitive partial match
      };
      // Find the documents, retrieving the full document
      const packagingMaterial = await this.collection.find(query).toArray();
      const filteredProducts = packagingMaterial.map(
        (product: { packaging: { finishing_process: [] }; _id }) => {
          const filteredMaterials = product.packaging.finishing_process.filter(
            (finishingprocess: { name: string }) =>
              finishingprocess["tru_name"].match(regex) // Match with case-insensitive regex
          );
          return {
            _id: product._id,
            packaging: {
              finishingprocess: filteredMaterials, // Include only the matching materials
            },
          };
        }
      );

      // Send the filtered products as a response
      return filteredProducts
    } catch (err) {
      return err
    }
  }
}

export const initializeMasterDataController = async () => {
  await initializeMasterDataModel();
  const MasterDataModels = MasterDataModel();
  return new masterController(MasterDataModels);
};

export default initializeMasterDataController;
