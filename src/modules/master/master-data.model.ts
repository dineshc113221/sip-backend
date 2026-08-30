import { connections } from "../../lib/db.connection.js";
import { Collection, Connection, Document } from "mongoose";

interface IMasterData extends Document{
    brand:object,
    formulation:object,
  packaging: object,
  dialsRange:object
}
let MasterDataModel: Collection<IMasterData>;

export const initializeMasterDataModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  MasterDataModel = mainDb.collection<IMasterData>('internal_sip_master_data_v2');
};

export default () => MasterDataModel;