import mongoose from "mongoose";
import { computeAssessmentScores } from "../computeAssessmentScores";

// ------------------
// Mocks
// ------------------
jest.mock("../../../modules/calculation_api/calculation.model.js", () => ({
  __esModule: true,
  default: jest.fn(),
  initializeCalculationModel: jest.fn(),
}));

jest.mock("../../../modules/product/product.model.js", () => ({
  __esModule: true,
  default: jest.fn(),
  initializeProductModel: jest.fn(),
}));

jest.mock("../../../modules/master/master-data.model.js", () => ({
  __esModule: true,
  default: jest.fn(),
  initializeMasterDataModel: jest.fn(),
}));

jest.mock("../tabExtractors.js", () => ({
  extractTabPercentage: jest.fn(),
}));

jest.mock("../dialCalculator.js", () => ({
  matchRange: jest.fn(),
}));
jest.mock("../../../modules/calculation_api/calculation-error-log.model.js", () => ({
  __esModule: true,
  default: jest.fn(),
  initializeCalculationErrorLogModel: jest.fn(),
}));
import CalculationsModel from "../../../modules/calculation_api/calculation.model.js";
import ProductModel from "../../../modules/product/product.model.js";
import MasterDataModel from "../../../modules/master/master-data.model.js";
import { extractTabPercentage } from "../tabExtractors.js";
import { matchRange } from "../dialCalculator.js";
import calculationErrorLogModel from "../../../modules/calculation_api/calculation-error-log.model.js"
describe("computeAssessmentScores", () => {
  const productId = new mongoose.Types.ObjectId().toString();
  const assessmentId = new mongoose.Types.ObjectId().toString();
let updateOneMock: jest.Mock;

const validAssessment = {
  assessmentId,
  totallca: {},
  "sustainablepackaging-rollup-compare": {},
  green_chemistry_rollup: {},
  baseline_green_chemistry_rollup: {},
};

  beforeEach(() => {
  jest.resetAllMocks();

  updateOneMock = jest.fn().mockResolvedValue({ modifiedCount: 1 });

  (CalculationsModel as jest.Mock).mockReturnValue({
    findOne: jest.fn().mockResolvedValue({
      productId,
      formula_input_output: {
        output: {
          baseline: [{ base: 1 }],
          final: [validAssessment],
          experimental: [validAssessment],
        },
      },
    }),
    updateOne: updateOneMock, // ✅ REQUIRED
  });

    // ---- product ----
    (ProductModel as jest.Mock).mockReturnValue({
      findById: jest.fn().mockResolvedValue({
        productSipId: "SIP123",
        projectId: "PROJ1",
        assessments: {
          final: { assessmentId: "FINAL-SIP" },
          experimental: [{ _id: assessmentId, assessmentId: "EXP-SIP" }],
        },
      }),
    });

    // ---- master ----
    (MasterDataModel as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        dialsRange: {
          productEnvironmental: {},
          carbonFootprint: {},
          sustainablePackaging: {},
          greenChemistry: {},
        },
      }),
    });
   calculationErrorLogModel as jest.Mock;
   

    // ---- helpers ----
    (extractTabPercentage as jest.Mock).mockReturnValue(10);
    (matchRange as jest.Mock).mockReturnValue({ description: "Good" });
  });

  // --------------------------------------------------
  // ✅ FINAL assessment happy path
  // --------------------------------------------------
  it("computes scores for FINAL assessment and saves", async () => {
    const result = await computeAssessmentScores(
      productId,
      assessmentId,
      "final"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      assessmentId,
      pef_score: 10,
      carbon_score: 10,
      pack_circularity_score: 10,
      green_chem_score: 10,
      passing_indicator: "Yes",
      assessment_sipId: "FINAL-SIP",
    });

    expect(updateOneMock).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // ✅ EXPERIMENTAL assessment happy path
  // --------------------------------------------------
  it("computes scores for EXPERIMENTAL assessment and assigns SIP ID", async () => {
    const result = await computeAssessmentScores(
      productId,
      assessmentId,
      "experimental"
    );

    expect(result[0].assessment_sipId).toBe("EXP-SIP");
    expect(updateOneMock).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // ❌ Invalid product id
  // --------------------------------------------------
  it("throws error for invalid product id", async () => {
    await expect(
      computeAssessmentScores("bad-id", assessmentId, "final")
    ).rejects.toThrow("Invalid Product ID");
  });

  // --------------------------------------------------
  // ❌ No calculation record
  // --------------------------------------------------
  it("throws when calculation record is missing", async () => {
    (CalculationsModel as jest.Mock).mockReturnValueOnce({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await expect(
      computeAssessmentScores(productId, assessmentId, "final")
    ).rejects.toThrow("No calculation record found");
  });

  // --------------------------------------------------
  // ❌ No product
  // --------------------------------------------------
  it("throws when product is missing", async () => {
    (ProductModel as jest.Mock).mockReturnValueOnce({
      findById: jest.fn().mockResolvedValue(null),
    });

    await expect(
      computeAssessmentScores(productId, assessmentId, "final")
    ).rejects.toThrow("Product not found");
  });

  // --------------------------------------------------
  // ❌ Missing dialsRange
  // --------------------------------------------------
  it("throws when dialsRange missing", async () => {
    (MasterDataModel as jest.Mock).mockReturnValueOnce({
      findOne: jest.fn().mockResolvedValue({}),
    });

    await expect(
      computeAssessmentScores(productId, assessmentId, "final")
    ).rejects.toThrow("Missing dialsRange");
  });

  // --------------------------------------------------
  // ❌ matchRange returns invalid description
  // --------------------------------------------------
  it("skips update if matchRange returns no description", async () => {
    (matchRange as jest.Mock).mockReturnValueOnce(null);

    const result = await computeAssessmentScores(
      productId,
      assessmentId,
      "final"
    );

    expect(result).toEqual([]);
  });

  // --------------------------------------------------
  // ❌ passing_indicator = No (Poor)
  // --------------------------------------------------
  it("sets passing_indicator to No when Poor found", async () => {
    (matchRange as jest.Mock).mockReturnValue({ description: "Poor" });

    const result = await computeAssessmentScores(
      productId,
      assessmentId,
      "final"
    );

    expect(result[0].passing_indicator).toBe("No");
  });

  // --------------------------------------------------
  // ❌ passing_indicator = No (No Improvement)
  // --------------------------------------------------
  it("sets passing_indicator to No when all are No Improvement", async () => {
    (matchRange as jest.Mock).mockReturnValue({
      description: "No Improvement",
    });

    const result = await computeAssessmentScores(
      productId,
      assessmentId,
      "final"
    );

    expect(result[0].passing_indicator).toBe("No");
  });
});
