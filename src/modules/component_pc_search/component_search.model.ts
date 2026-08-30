import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IComponentSearch extends Document {
  FG_NM: string;
}

let ComponentSearchModel: Collection<IComponentSearch>;

export const initializeComponentSearchModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  ComponentSearchModel = mainDb.collection<IComponentSearch>('curated_packaging_inputs_v2');
};

export default () => ComponentSearchModel;