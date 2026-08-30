import { connections } from "../../lib/db.connection.js";
import { Collection, Connection } from "mongoose";

let errorMessageKafkaModel: Collection;

export const initializeerrorMessageKafkaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  errorMessageKafkaModel = mainDb.collection("kafka_consumer_errordetails");
};

export default () => errorMessageKafkaModel;
