import { Request, Response } from "express";
import ProductSearchModel, {
  initializeProductSearchModel,
} from "./product_fg_search.model.js";

class ProductSearchController {
  private collection;

  constructor(collection) {
    this.collection = collection;
  }

  async getProductSeachCodes(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 300000;
    const initialLetters = ((req.query.initialLetters as string) || "").trim();

    if (!initialLetters) {
      res.status(400).json({ error: "initialLetters query param is required" });
      return;
    }

    try {
      const regex = new RegExp(initialLetters, "i");
      const filter = {
        $or: [
          { fg_nm_vers_concat: { $regex: regex } },
          { MATL_NUM: { $regex: regex } },
        ],
      };

      const data = await this.collection
        .find(filter, {
          projection: { fg_nm_vers_concat: 1, MATL_NUM: 1, _id: 0 },
        })
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const seen = new Set<string>();
      const results: string[] = [];

      data.forEach(
        (item: { fg_nm_vers_concat?: string; MATL_NUM?: string }) => {
          let matchedValue: string | undefined;

          if (item.fg_nm_vers_concat && regex.test(item.fg_nm_vers_concat)) {
            matchedValue = item.fg_nm_vers_concat;
          } else if (item.MATL_NUM && regex.test(item.MATL_NUM)) {
            matchedValue = item.MATL_NUM;
          }

          if (matchedValue && !seen.has(matchedValue)) {
            seen.add(matchedValue);
            results.push(matchedValue);
          }
        }
      );

      res.status(200).json(results);
    } catch (err) {
      console.error("Error in getProductSearchCodes:", err);
      res.status(500).send("Error fetching records");
    }
  }

  async getProductSearchDetails(req: Request, res: Response): Promise<void> {
    try {
      const regex = new RegExp(req.params.fgSpec, "i"); // 'i' for case-insensitive search

      const query = {
        $or: [
          { fg_nm_vers_concat: { $regex: regex } },
          { MATL_NUM: { $regex: regex } },
        ],
      };
      const productSearchDetails = await this.collection.findOne(query);
      if (!productSearchDetails) {
        res.status(404).json({ message: "FG Spec or SKU details not found" });
        return;
      }
      const fgDetails = {
        FG_SPEC: productSearchDetails.fg_nm_vers_concat,
        FG_NM: productSearchDetails.FG_NM,
        FG_Revision: productSearchDetails.FG_RVSN_NBR,
        SKU_ERP_CODE: productSearchDetails.MATL_NUM,
        PC_NM: productSearchDetails.CHILD_NM_AGG,
        NAME: productSearchDetails.FG_SPEC_NM,
        FRML_CODE: productSearchDetails.frml_cd_vers_concat,
        SALES_ZONE: productSearchDetails.SaleZone,
        FRML_LAB_CODE: productSearchDetails.formula_lab_book_code,
        BRAND_CODE: productSearchDetails.brand_code,
        PRODUCT_SEGMENT: "",
        PRODUCT_SUB_SEGMENT: "",
      };

      res.json(fgDetails);
    } catch (err) {
      res.status(500).send("Error fetching PC details");
    }
  }
}

export const initializeProductSearchController = async () => {
  await initializeProductSearchModel();
  const ProductSearchModels = ProductSearchModel();
  return new ProductSearchController(ProductSearchModels);
};

export default initializeProductSearchController;
