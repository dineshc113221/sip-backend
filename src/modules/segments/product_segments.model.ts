import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IProductSugmentSearch extends Document {
  "Use Dose / g": string;
}

let ProductSegmentSearchModel: Collection<IProductSugmentSearch>;

export const initializeProductSegmentSearchModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  ProductSegmentSearchModel = mainDb.collection<IProductSugmentSearch>('segmentation');
};

export default () => ProductSegmentSearchModel;