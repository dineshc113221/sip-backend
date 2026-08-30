import { connections } from "../../lib/db.connection.js";
import productSchema from "./product.schema.js";
import { Connection, Model} from "mongoose";

let ProductModel: Model<any>;

export const initializeProductModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  ProductModel = mainDb.model('internal_products', productSchema);
};

export default () => ProductModel;
