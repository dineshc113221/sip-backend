import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IRMSearch extends Document {
  rawMaterialId: string;
}

let RawMaterialsModels: Collection<IRMSearch>;

export const initializeRawMaterialModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  RawMaterialsModels = mainDb.collection<IRMSearch>('internal_rawMaterial_constituents');
};

export default () => RawMaterialsModels;