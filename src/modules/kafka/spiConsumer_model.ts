import { connections } from '../../lib/db.connection.js';
import { Connection } from 'mongoose';

let kafkaModel: object;

export const initializeKafkaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  kafkaModel = mainDb.collection('internal_rawMaterial');
};

export default () => kafkaModel;
