import { connections } from "../../lib/db.connection.js";
import adminSchema from "./admin.schema.js";
import { Connection} from "mongoose";

let adminModel: object;

export const initializeadminModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  adminModel = mainDb.model('admin_version_histories', adminSchema);
};

export default () => adminModel;
