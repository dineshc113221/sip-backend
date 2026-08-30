import { Router } from 'express';
import { initializeProductSearchController } from './product_fg_search.controller.js';

const ProductSearchRouter = async (): Promise<Router> => {
  const router = Router();
  const ProductFGSeachController = await initializeProductSearchController();

  router.get('/findProduct', (req, res) => ProductFGSeachController.getProductSeachCodes(req, res));
  router.get('/findProduct/:fgSpec', (req, res) => ProductFGSeachController.getProductSearchDetails(req, res));

  return router;
};

export default ProductSearchRouter;