import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IProductSearch extends Document {
  FG_NM: string;
}

let ProductSearchModel: Collection<IProductSearch>;

export const initializeProductSearchModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  ProductSearchModel = mainDb.collection<IProductSearch>('curated_product_search');
};

export default () => ProductSearchModel;