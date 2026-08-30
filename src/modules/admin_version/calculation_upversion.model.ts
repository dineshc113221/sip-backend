import { Connection } from "mongoose";
import { connections } from "../../lib/db.connection.js";
import AssessmentAuditSchema from "./calculation_audit.schema.js";

let CalculationsUpversionModel: object;
export const initializeCalculationUpversionModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  CalculationsUpversionModel = mainDb.model("sipinternal_assessment_upversions", AssessmentAuditSchema);
};

export default () => CalculationsUpversionModel;
