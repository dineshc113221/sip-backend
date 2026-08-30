import { Collection, Connection, Document } from 'mongoose';
import { connections } from "../../lib/db.connection.js";

interface IFormula extends Document {
  formula_code: string;
}

let FormulaModel: Collection<IFormula>;

export const initializeFormulaModel = async (): Promise<void> => {
  const mainDb: Connection = await connections.mainDb;
  FormulaModel = mainDb.collection<IFormula>('curated_fg_fml_dtls');
};

export default () => FormulaModel;