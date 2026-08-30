import { connections } from "../../lib/db.connection.js";
import { Connection } from "mongoose";

let internalConstituentModel: object;

export const initializeInternalConstituentModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  internalConstituentModel = mainDb.collection("internal_rawMaterial_constituents");
};

export default () => internalConstituentModel;