//
import { connections } from "../../lib/db.connection.js";
import CalculationErrorLogSchema from "./calculation-error-log.schema.js";
import { Connection, Model} from "mongoose";

let CalculationErrorLogModel: Model<any>;

export const initializeCalculationErrorLogModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  CalculationErrorLogModel = mainDb.model('internal_error_logs', CalculationErrorLogSchema);
};

export default () => CalculationErrorLogModel;
