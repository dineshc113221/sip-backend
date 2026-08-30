import { Router } from "express";
import { initializeMasterDataController } from "./master-data.controller.js";

const masterDataRouter = async (): Promise<Router> => {
  const router = Router();
  const masterController = await initializeMasterDataController();

  router.get("/", (req, res, next) =>
    masterController.pagination(req, res, next)
  );
  router.get('/findpackagingMaterial', (req, res) => masterController.findpackagingMaterial(req, res));


  return router;
};

export default masterDataRouter;
