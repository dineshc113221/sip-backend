import { Router } from "express";
import { initializeadminHistoryController } from "./admin.controller.js";

const adminRouter = async (): Promise<Router> => {
  const router = Router();
  const adminVersionController = await initializeadminHistoryController();

  router.post("/admin-version", (req, res) =>
    adminVersionController.createAdminVersion(req, res)
  );

  
  router.post("/rebuild-upversion", (req, res) =>
    adminVersionController.rebuildUpversion(req, res)
  );
  
  router.get("/admin-version", (req, res) =>
    adminVersionController.getAdminVersions(req, res)
  );
  router.get("/result/:assessmentType/:productId/:assessmentId/:version", (req, res) =>
    adminVersionController.calculationResult(req, res)
  );
    router.get("/admin_version/:assessmentType/:productId/:assessmentId/", (req, res) =>
    adminVersionController.getAdminVersionsTab(req, res)
  );


  return router;
};

export default adminRouter;
