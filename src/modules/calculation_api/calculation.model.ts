import { Connection, Model } from "mongoose";
import { connections } from "../../lib/db.connection.js";
import AssessmentSchema from "./calculation.schema.js";

let CalculationsModel: Model<any>;;
export const initializeCalculationModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  CalculationsModel = mainDb.model("sipinternal_assessments", AssessmentSchema);
};

export default () => CalculationsModel;
