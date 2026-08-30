import { Router } from "express";
import { initializeProductController } from "./product.controller.js";

const productRouter = async (): Promise<Router> => {
  const router = Router();
  const productController = await initializeProductController();

  router.get("/", (req, res, next) =>
    productController.pagination(req, res, next)
  );
  router.get("/myproduct", (req, res, next) =>
    productController.myProductPagination(req, res, next)
  );
  router.post("/add-product", (req, res, next) =>
    productController.create(req, res, next)
  );
  router.get("/product-details/auditreport/:id", (req, res, next) =>
    productController.auditReport(req, res, next)
  );
  router.get("/productDetails/:id", (req, res, next) =>
    productController.findById(req, res, next)
  );
  router.put("/edit-product/:id", (req, res, next) =>
      productController.findByIdAndUpdate(req, res, next)
  );
  router.delete("/delete/:id", (req, res, next) =>
    productController.findByIdAndDelete(req, res, next)
  );
  router.post("/add-assessment", (req, res, next) =>
    productController.createAssessment(req, res, next)
  );

  router.put("/edit-assessment/:id", (req, res, next) =>
    productController.updateAssessmentById(req, res, next)
  );

  router.delete("/delete-assessment/:id", (req, res, next) =>
    productController.deleteAssessmentById(req, res, next)
  );

  router.post("/add-member", (req, res, next) =>
    productController.addTeamMember(req, res, next)
  );

  router.put("/edit-member/:id", (req, res, next) =>
    productController.updateMemberById(req, res, next)
  );

  router.delete("/delete-member/:id", (req, res, next) =>
    productController.deleteMemberById(req, res, next)
  );
  router.post("/assessment/add-update-packaging", (req, res) =>
    productController.addEditPackagingDetails(req, res)
  );

  router.get("/assessment/details/:assessmentType/:id", (req, res, next) =>
    productController.experimentalAssessmentDetails(req, res, next)
  );

  router.get("/search/:searchString", (req, res, next) =>
    productController.getSearchDetails(req, res, next)
  );

  router.post("/assessment/add-update-formulation", (req, res) =>
    productController.addUpdateFormulationDetails(req, res)
  );

  router.delete("/assessment/delete-formulation", (req, res, next) =>
    productController.deleteFormulationDetails(req, res, next)
  );

  router.get("/assessmentDetails/:assessmentId", (req, res, next) =>
    productController.getAssessmentDetails(req, res, next)
  );

  router.get("/calculation/calculationScript", ( req,res) =>
    productController.calculationScript(req,res)
  );

  return router;
};

export default productRouter;
