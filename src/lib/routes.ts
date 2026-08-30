import { Router } from 'express';
const router = Router();
import productRouter from '../modules/product/product.routes.js';
import masterDataRouter from '../modules/master/master-data.routes.js';
import formulaRouter from '../modules/formula/formula.routes.js';
import ProductSeachRouter from '../modules/product_fg_search/product_fg_search.routes.js';
import ComponentSeachRouter from '../modules/component_pc_search/component_search.routes.js';
import RawMaterialSeachRouter from '../modules/raw_material_search/rm_search.routes.js';
import CalculationRouter from '../modules/calculation_api/calculation.routes.js';
import adminRouter from '../modules/admin_version/admin.routes.js';
import ProductSegmentRouter from '../modules/segments/product_segments.routes.js';
import { verifyToken } from '../helpers/auth.service.js';
import ConsumerDataUpdateRouter from '../modules/kafka/sipConsumerRawMaterials.js';
import PdrmSipFormulaRawMaterialRouter from '../modules/pdrm_sip_data/pdrm_sip_count.routes.js';
import userAppVersionRouter from '../modules/user_app_version_manager/userappversion.routes.js';

productRouter().then((productRoutes) => {
  router.use('/api/product', verifyToken, productRoutes);
});
masterDataRouter().then((masterDataRoutes) => {
  router.use('/api/master-data', verifyToken, masterDataRoutes);
});

formulaRouter().then((formulaRoutes) => {
  router.use('/api/formula', verifyToken, formulaRoutes);
});
ProductSeachRouter().then((productSearchRoutes) => {
  router.use('/api/product-search', verifyToken, productSearchRoutes);
});

ComponentSeachRouter().then((ComponentSeachRouter) => {
  router.use('/api/component-search', verifyToken, ComponentSeachRouter);
});
RawMaterialSeachRouter().then((RawMaterialSeachRouter) => {
  router.use('/api/rm-search', verifyToken, RawMaterialSeachRouter);
});
CalculationRouter().then((CalculationRouter) => {
  router.use('/api/calculate', verifyToken, CalculationRouter);
});

ProductSegmentRouter().then((ProductSegmentRouter) => {
  router.use('/api/segment', verifyToken, ProductSegmentRouter);
});

adminRouter().then((adminRouter) => {
  router.use('/api/admin', verifyToken, adminRouter);
});

ConsumerDataUpdateRouter().then((ConsumerDataUpdateRouter) => {
  router.use('/consumer-data', verifyToken, ConsumerDataUpdateRouter);
});

PdrmSipFormulaRawMaterialRouter().then((PdrmSipFormulaRawMaterialRoutes) => {
  router.use('/pdrm-sip', PdrmSipFormulaRawMaterialRoutes);
});

userAppVersionRouter().then((userAppVersionRouter)=>{
  router.use('/api/user', verifyToken, userAppVersionRouter)
})

// Export the router
export default router;
