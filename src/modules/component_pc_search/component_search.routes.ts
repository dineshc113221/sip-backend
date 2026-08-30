import { Router } from 'express';
import { initializeComponentSearchController } from './component_search.controller.js';

const ComponentSearchRouter = async (): Promise<Router> => {
  const router = Router();
  const ComponentSeachController = await initializeComponentSearchController();
  router.get('/findComponent', (req, res) => ComponentSeachController.getComponentSeachCodes(req, res));
  router.get('/findComponent/:PCCode', (req, res) => ComponentSeachController.getComponentSeachDetails(req, res));

  return router;
};

export default ComponentSearchRouter;