import { Router } from "express";
import { initializeUserAppVersionController } from "./userappversion.controller.js";

const userAppVersionRouter = async (): Promise<Router> => {
  const router = Router();
  const userAppVersionController = await initializeUserAppVersionController();

   router.get("/:id", (req, res, next) =>
    userAppVersionController.findById(req, res, next)
  );
 
  router.post("/:id", (req, res, next) =>
    userAppVersionController.findByIdAndUpdate(req, res, next)
  );

  return router;
};

export default userAppVersionRouter;
