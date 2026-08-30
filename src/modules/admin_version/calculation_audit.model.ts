import { Connection } from "mongoose";
import { connections } from "../../lib/db.connection.js";
import AssessmentAuditSchema from "./calculation_audit.schema.js";

let CalculationsAuditModel: object;
export const initializeCalculationAuditModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  CalculationsAuditModel = mainDb.model("sipinternal_assesment_audits", AssessmentAuditSchema);
};

export default () => CalculationsAuditModel;
