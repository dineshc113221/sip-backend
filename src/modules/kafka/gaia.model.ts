import { connections } from '../../lib/db.connection.js';
import { Connection } from 'mongoose';

let gaiaModel: object;

export const initializeGaiaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  gaiaModel = mainDb.collection('internal_meterial_gaiascore');
};

export default () => gaiaModel;
