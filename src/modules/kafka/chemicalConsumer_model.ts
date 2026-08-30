import { connections } from "../../lib/db.connection.js";
import { Connection } from "mongoose";

let chemicalKafkaModel: object;

export const initializeChemicalKafkaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  chemicalKafkaModel = mainDb.collection("internal_chemical_dtls");
};

export default () => chemicalKafkaModel;
