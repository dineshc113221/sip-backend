import { Router } from 'express';
import { initializeCalculationController } from './calculation.controller.js';

const CalculationRouter = async (): Promise<Router> => {
  const router = Router();
  const CalculationController = await initializeCalculationController();

  router.get('/result/:assessmentType/:productId/:assessmentId', (req, res) => CalculationController.calculationResult(req, res));
  router.get('/formulation/result/:assessmentType/:productId/:assessmentId', (req, res) => CalculationController.formulationResult(req, res));
  router.get('/assessment/logs/:productId/:assessmentId', (req, res) => CalculationController.assessmentLogs(req, res));
  router.get('/assessment/input/logs/:id', (req, res) => CalculationController.assessmentInputLogs(req, res));

  return router;
};

export default CalculationRouter;