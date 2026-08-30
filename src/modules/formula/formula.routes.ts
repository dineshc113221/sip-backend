import { Router } from 'express';
import { initializeFormulaController } from './formula.controller.js';

const formulaRouter = async (): Promise<Router> => {
  const router = Router();
  const formulaController = await initializeFormulaController();

  router.get('/formula-codes', (req, res) => formulaController.getFormulaCodes(req, res));
  router.get('/formula-details/:formulaCode', (req, res) => formulaController.getFormulaDetails(req, res));

  return router;
};

export default formulaRouter;