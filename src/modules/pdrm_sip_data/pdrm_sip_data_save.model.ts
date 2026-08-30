import { connections } from "../../lib/db.connection.js";
import { Connection} from "mongoose";
import pdrmSipDataCountSchema from './pdrm_sip_data.schema.js'

let pdrmSipCountModel: object;

export const initializePdrmSipCountModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  pdrmSipCountModel = mainDb.model('pdrm_sip_data_count',pdrmSipDataCountSchema);
};

export default () => pdrmSipCountModel;
