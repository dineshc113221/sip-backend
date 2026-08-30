import { Router } from 'express';
import { initializeRawMaterialController } from './rm_search.controller.js';

const RawMaterialRouter = async (): Promise<Router> => {
  const router = Router();
  const RawMaterialSeachController = await initializeRawMaterialController();

  router.get('/findRawMaterial', (req, res) => RawMaterialSeachController.getRMSeachCodes(req, res));
  router.get('/findRawMaterial/:rmCode', (req, res) => RawMaterialSeachController.getRMSearchDetails(req, res));

  return router;
};

export default RawMaterialRouter;