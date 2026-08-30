import CalculationsModel, { initializeCalculationModel } from '../../modules/calculation_api/calculation.model.js'; 
import { extractTabPercentage } from './tabExtractors.js';
import { matchRange } from './dialCalculator.js';
import ProductModel, { initializeProductModel } from '../../modules/product/product.model.js'
import mongoose from 'mongoose';
import MasterDataModel, { initializeMasterDataModel } from '../../modules/master/master-data.model.js'
import calculationErrorLogModel, { initializeCalculationErrorLogModel } from '../../modules/calculation_api/calculation-error-log.model.js';

export const computeAssessmentScores = async (
  productId: string,
  assessmentId?: string,
  assessmentType?: "final" | "experimental"
): Promise<any[]> => {
  try {
    await initializeModels();

    validateProductId(productId);

    const { record, productDoc, dialsRange } =
      await fetchRequiredDocs(productId);


    const { output, baseline } = extractOutput(record);

    const selectedList = selectAssessments(
      output,
      assessmentType,
      assessmentId
    );

    const { scores } = computeScores(
      selectedList,
      baseline,
      dialsRange
    );

    const sipUpdated = assignSipId(
      assessmentType,
      assessmentId,
      output,
      productDoc,
      scores
    );
    if (sipUpdated && assessmentType && assessmentId) {
      const result = scores[0];
      if (!result) return scores;
      const assessmentPath = `formula_input_output.output.${assessmentType}`;

      const updateResult = await CalculationsModel().updateOne(
        { productId },
        {
          $set: {
            productSipId: productDoc.productSipId,
            projectId: productDoc.projectId,
            [`${assessmentPath}.$[elem].pef_score`]: result.pef_score,
            [`${assessmentPath}.$[elem].pef_description`]: result.pef_description,
            [`${assessmentPath}.$[elem].carbon_score`]: result.carbon_score,
            [`${assessmentPath}.$[elem].carbon_description`]: result.carbon_description,
            [`${assessmentPath}.$[elem].green_chem_score`]: result.green_chem_score,
            [`${assessmentPath}.$[elem].green_chem_description`]: result.green_chem_description,
            [`${assessmentPath}.$[elem].pack_circularity_score`]: result.pack_circularity_score,
            [`${assessmentPath}.$[elem].pack_circularity_description`]: result.pack_circularity_description,
            [`${assessmentPath}.$[elem].passing_indicator`]: result.passing_indicator,
            [`${assessmentPath}.$[elem].assessment_sipId`]: result.assessment_sipId,
            [`${assessmentPath}.$[elem].lpp_indicator`]: result.lpp_indicator,
          },
     
        },
        {
          arrayFilters: [{ "elem.assessmentId": assessmentId }],
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(
          `Assessment ${assessmentId} was not updated (possible filter mismatch)`
        );
      }
    }
    return scores;
  } catch (err: any) {
  const skipLoggingErrors = [
    "Baseline missing"
  ];
    if (!skipLoggingErrors.includes(err.message)) {
     await logCalculationError({
      productId,
      assessmentId,
      assessmentType,
      error: err,
    });
  }

    console.error("computeAssessmentScores failed:", err.message);
    throw err;
  }
};
const initializeModels = async () => {
  await Promise.all([
    initializeCalculationModel(),
    initializeProductModel(),
    initializeMasterDataModel(),
    initializeCalculationErrorLogModel()
  ]);
};
const validateProductId = (productId: string) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid Product ID");
  }
};
const fetchRequiredDocs = async (productId: string) => {
  const CalculationsModels = CalculationsModel();
  const ProductModels = ProductModel();
  const MasterDataModels = MasterDataModel();

  const [record, productDoc, masterDoc] = await Promise.all([
    CalculationsModels.findOne({ productId }),
    ProductModels.findById(productId),
    MasterDataModels.findOne({}, { projection: { dialsRange: 1, _id: 0 } })
  ]);

  if (!record) throw new Error("No calculation record found");
  if (!productDoc) throw new Error("Product not found");
  if (!masterDoc?.dialsRange) throw new Error("Missing dialsRange");

  return { record, productDoc, dialsRange: masterDoc.dialsRange };
};

const extractOutput = (record: any) => {
  const { output = {} } = record.formula_input_output ?? {};
  const baseline = output.baseline?.at(-1);

  if (!baseline) throw new Error("Baseline missing");

  return { output, baseline };
};
const logCalculationError = async ({
  productId,
  assessmentId,
  assessmentType,
  error,
}: {
  productId: string;
  assessmentId?: string;
  assessmentType?: string;
  error: Error;
}) => {
  try {
    const ErrorModel = calculationErrorLogModel();

    const errorDoc = new ErrorModel({
      productId,
      assessmentId,
      assessmentType,
      input: {}, 
      output: {
        message: error.message,
        stack: error.stack,
      },
      executionARN: "calculation scores failed",
    });

    await errorDoc.save();
  } catch (logErr) {
    console.error("Failed to log calculation error:", logErr);
  }
};

const selectAssessments = (
  output: any,
  assessmentType?: "final" | "experimental",
  assessmentId?: string
): any[] => {
  if (assessmentType === "final") {
    return (output.final ?? []).filter(
      a => String(a.assessmentId) === String(assessmentId)
    );
  }

  if (assessmentType === "experimental") {
    return (output.experimental ?? []).filter(
      a => String(a.assessmentId) === String(assessmentId)
    );
  }

  return [];
};
const tabs = {
  pef: "productEnvironmental",
  carbon: "carbonFootprint",
  pack_circularity: "sustainablePackaging",
  green_chem: "greenChemistry"
};

const requiredKeys = [
      'totallca',
      'sustainablepackaging-rollup-compare',
      'green_chemistry_rollup',
      'baseline_green_chemistry_rollup',
];

const computeScores = (
  selectedList: any[],
  baseline: any,
  dialsRangeValues: any
) => {
  const scores: any[] = [];

  for (const item of selectedList) {
    const computed = computeOne(item, baseline, dialsRangeValues);
    if (!computed) continue;

    scores.push(computed);
  }

  return { scores };
};

const computeOne = (
  obj: any,
  baseline: any,
  dialsRangeValues: any
) => {
  if (!obj) return null;
 const hasAll = requiredKeys.every((k) => obj?.[k] !== undefined);

  if (!hasAll) {
      const errKeys = requiredKeys.filter(k => obj?.[k] === undefined);
      throw new Error(`Missing fields in assessment ${obj?.assessmentId}: ${errKeys.join(', ')}`);
  }
  const result: any = { assessmentId: obj.assessmentId };
  const descriptions: string[] = [];

  for (const [key, tab] of Object.entries(tabs)) {
    const perc = extractTabPercentage(tab, obj, baseline);
    const score = Math.round(perc);
    const match = matchRange(perc, dialsRangeValues[tab]);

    if (!match?.description) return null;

    result[`${key}_score`] = score;
    result[`${key}_description`] = match.description;
    descriptions.push(match.description);
  }

  const hasBad = descriptions.some(d =>
    ["Poor", "Very Poor"].includes(d)
  );
  const noImprovement = descriptions.every(
    d => d === "No Improvement"
  );

  result.passing_indicator =
    hasBad || noImprovement ? "No" : "Yes";

  return result;
};
const assignSipId = (
  assessmentType: "final" | "experimental" | undefined,
  assessmentId: string | undefined,
  output: any,
  productDoc: any,
  scores: any[]
): boolean => {
  if (assessmentType === "final" && productDoc.assessments?.final) {
    const target = output.final?.find(
      f => String(f.assessmentId) === String(assessmentId)
    );

    if (target) {
      const sipId = productDoc.assessments.final.assessmentId;
      target.assessment_sipId = sipId;
      scores.forEach(s => (s.assessment_sipId = sipId));
      return true;
    }
  }

  if (assessmentType === "experimental") {
    const target = output.experimental?.find(
      e => String(e.assessmentId) === String(assessmentId)
    );

    if (!target) return false;

    const exp = productDoc.assessments.experimental.find(
      x => String(x._id) === String(assessmentId)
    );

    if (!exp) return false;
    const isLPP = exp.isLPP ?? false;
    target.lpp_indicator = isLPP;

    target.assessment_sipId = exp.assessmentId;
    scores.forEach(s => {
      s.assessment_sipId = exp.assessmentId;
      s.lpp_indicator = isLPP;
    }
    );
    return true;
  }

  return false;
  
};

