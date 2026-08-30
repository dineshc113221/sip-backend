import { Router } from 'express';
import { initializeFormulaRawMaterialController } from './pdrm_sip_count.controller.js';

const PdrmSipFormulaRawMaterialRouter = async (): Promise<Router> => {
  const router = Router();
  const FormulaRawMaterialSeachController = await initializeFormulaRawMaterialController();

  router.get('/formulaRawCount', (req, res) => FormulaRawMaterialSeachController.getPdrmSipFormulaCount(req,res));

  return router;
};

export default PdrmSipFormulaRawMaterialRouter;