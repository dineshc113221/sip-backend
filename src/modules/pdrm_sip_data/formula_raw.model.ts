import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IRMSearch extends Document {
  rawMaterialId: string;
}

let FrmlRawMaterialsModel: Collection<IRMSearch>;

export const initializeFrmlRawMaterialModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  FrmlRawMaterialsModel = mainDb.collection<IRMSearch>('internal_rawMaterial');
};

export default () => FrmlRawMaterialsModel;