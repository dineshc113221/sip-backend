import { connections } from "../../lib/db.connection.js";
import { Connection } from "mongoose";

let formulaKafkaModel: object;

export const initializeFormulaKafkaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  formulaKafkaModel = mainDb.collection("internal_fml_dtls");
};

export default () => formulaKafkaModel;
