import { Router } from 'express';
import { initializeProductSegmentSearchController } from './product_segments.controller.js';

const ProductSegementsSearchRouter = async (): Promise<Router> => {
  const router = Router();
  const ProductSegmentSeachController = await initializeProductSegmentSearchController();

  router.post('/getUseDoseValue', (req, res) => ProductSegmentSeachController.getProductSegmentSearchDetails(req, res));

  return router;
};

export default ProductSegementsSearchRouter;