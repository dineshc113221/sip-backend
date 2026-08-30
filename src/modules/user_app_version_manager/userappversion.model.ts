import { connections } from "../../lib/db.connection.js";
import userAppVersionSchema from "./userappversion.schema.js";
import { Connection} from "mongoose";

let userAppVersionModel: object;

export const initializeUserAppVersionModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  userAppVersionModel = mainDb.model('user_app_version', userAppVersionSchema);
};

export default () => userAppVersionModel;
