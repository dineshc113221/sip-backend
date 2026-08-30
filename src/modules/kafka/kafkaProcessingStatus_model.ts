import { connections } from "../../lib/db.connection.js";
import { Collection, Connection } from "mongoose";

let kafkaProcessingStatusModel: Collection;

export const initializeKafkaProcessingStatusModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;

  kafkaProcessingStatusModel = mainDb.collection(
    "kafka_processing_status"
  );
};

export default () => kafkaProcessingStatusModel;