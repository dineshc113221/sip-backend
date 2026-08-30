import pLimit from "p-limit";
// import { Types } from "mongoose";
import { initializeProductController } from "../product/product.controller.js";

type AssessmentType = "baseline" | "experimental" | "final";

interface Assessment {
  assessmentId: string;
  [key: string]: any;
}

interface ProductDoc {
  _id: any;
  productSipId?: string;
  net_content?: string;
  zone?: string;

  assessments?: {
    baseline?: Assessment | null;
    experimental?: Assessment[] | null;
    final?: Assessment | null;
  };

  [key: string]: any;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const REQUIRED_FLAGS = [
  "isFormulationDataCompleted",
  "isPackagingDataCompleted",
];

function hasAllRequiredFlagsTrue(assessment: Assessment | null | undefined) {
  if (!assessment) return false;
  return REQUIRED_FLAGS.every((flag) => Boolean(assessment[flag]));
}

function getAssessment(
  product: ProductDoc,
  type: AssessmentType,
  index: number
): Assessment | null {
  const a = product.assessments;
  if (!a) return null;

  if (type === "baseline") return a.baseline ?? null;
  if (type === "final") return a.final ?? null;

  if (!Array.isArray(a.experimental)) return null;
  return a.experimental[index] ?? null;
}

function buildPackagingInput(
  product: ProductDoc,
  assessment: Assessment,
  type: AssessmentType
) {
  const zone = assessment?.zone ?? product?.zone ?? "";
  const f = assessment?.formulation ?? {};

  return {
    productId: String(product?._id ?? ""),
    assessmentId: String(assessment?._id ?? ""),
    assessmentType: type,

    fg_spec: assessment?.fg_spec ?? "",
    fg_revision: assessment?.fg_revision ?? "",
    sales_country: zone,
    production_country: zone,
    net_content: f?.netContent ?? "",
    net_content_unit: "g",

    packaging_level: Array.isArray(assessment?.packaging_level)
      ? assessment.packaging_level
      : [],

    packagingType: assessment?.packagingType ?? "Primary",

    useDose: f?.useDose ?? "",
    useScenario: f?.useScenario ?? "",
    useDoseUnit: f?.useDoseUnit ?? "g",
    consumablesUsed: f?.consumablesUsed ?? "0",

    productSegment: f?.productSegment ?? "",
    productSubSegment: f?.productSubSegment ?? "",
    rawMaterials: Array.isArray(f?.rawMaterials) ? f.rawMaterials : [],

    isCalculating: true,
  };
}

async function runAssessment(
  product: ProductDoc,
  type: AssessmentType,
  index: number,
  baseReq,
  res,
  failures: string[],
  productModel
) {
  const assessment = getAssessment(product, type, index);
  if (!assessment) return;

  if (!hasAllRequiredFlagsTrue(assessment)) return;

  const productId = product._id;
  const basePath =
    type === "experimental"
      ? `assessments.experimental.${index}`
      : `assessments.${type}`;

  const updateObj: any = {
    [`${basePath}.formulation.isCalculated`]: true,
  };

  // packaging_level[].components[].isCalculated = true
  if (Array.isArray(assessment.packaging_level)) {
    assessment.packaging_level.forEach((level, lvlIndex) => {
      if (Array.isArray(level.components)) {
        level.components.forEach((_, compIndex) => {
          updateObj[
            `${basePath}.packaging_level.${lvlIndex}.components.${compIndex}.isCalculated`
          ] = true;
        });
      }
    });
  }

  // Perform Mongo update
  await productModel.updateOne({ _id: productId }, { $set: updateObj });
// keep memory in sync
assessment.formulation.isCalculated = true;
assessment.packaging_level?.forEach(l =>
  l.components?.forEach(c => (c.isCalculated = true))
);
  const packagingInput = buildPackagingInput(product, assessment, type);
  const productController = await initializeProductController();

  try {
    const clonedReq = {
      ...baseReq,
      body: packagingInput,
    };

    await productController.addEditPackagingDetails(clonedReq, res,true);

    assessment.isCalculationFailed = false;
    assessment.calculationErrorMessage = undefined;
  } catch (err) {
    assessment.isCalculationFailed = true;
    assessment.calculationErrorMessage = err?.message ?? "Unknown Error";
    failures.push(assessment.assessmentId ?? `${type}-${index}`);
  }
}

async function runProduct(product: ProductDoc, req, res, productModel) {
  const failures: string[] = [];

  // skip baseline run when user has explicitly skipped the baseline assessment
  if (!product.assessments?.baseline?.isBaselineSkipped) {
    await sleep(5000);
    await runAssessment(product, "baseline", 0, req, res, failures, productModel);
  }

  // experimental — SEQUENTIAL
  const experimental = product.assessments?.experimental ?? [];

  for (let i = 0; i < experimental.length; i++) {
    await sleep(5000);
    await runAssessment(
      product,
      "experimental",
      i,
      req,
      res,
      failures,
      productModel
    );
  }

  // final
  await sleep(5000);
  await runAssessment(product, "final", 0, req, res, failures, productModel);
  return { productId: String(product._id), failures };
}

export async function calculateForAllProducts(req, res, model) {
  const products = await model
    .find({ isDeleted: false })
    .lean();

  if (!products.length) {
    return { success: true, results: [] };
  }

  const limit = pLimit(5);

  const results = await Promise.all(
    products.map((p) =>
      limit(async () => {
        const result = await runProduct(p, req, res, model);
        return result;
      })
    )
  );

  return { success: true, results };
}
