import { Request, Response } from "express";
import ProductSegmentSearchModel, {
  initializeProductSegmentSearchModel,
} from "./product_segments.model.js";

class ProductSegmentSearchController {
  private collection;

  constructor(collection) {
    this.collection = collection;
  }

  async getProductSegmentSearchDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      
      
      const query = {
       "Product Segment":req.body.productSegment,
       "Product Sub-Segment":req.body.productSubSegment
      };
      const productSegmentSearchDetails = await this.collection.findOne(query);
      if (!productSegmentSearchDetails) {
        res.status(404).json({ message: "Not data found" });
        return;
      }

      res.json(productSegmentSearchDetails);
    } catch (err) {
      res.status(500).send("Error fetching PC details");
    }
  }
}

export const initializeProductSegmentSearchController = async () => {
  await initializeProductSegmentSearchModel();
  const ProductSegmentSearchModels = ProductSegmentSearchModel();
  return new ProductSegmentSearchController(ProductSegmentSearchModels);
};

export default initializeProductSegmentSearchController;
