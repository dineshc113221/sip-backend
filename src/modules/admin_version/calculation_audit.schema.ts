import { Schema } from "mongoose";

// input schema for each step function
const InputSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.String },
    rawmaterials: { type: Schema.Types.Mixed },
    formula_end_of_life: { type: Schema.Types.Mixed },
    distribution: { type: Schema.Types.Mixed },
    packproduction: { type: Schema.Types.Mixed },
    packagingeol: { type: Schema.Types.Mixed },
    usephase: { type: Schema.Types.Mixed },
    manufacturing: { type: Schema.Types.Mixed },
    totallca: { type: Schema.Types.Mixed },
    "sustainablepackaging-material-efficiency": { type: Schema.Types.Mixed },
    "sustainablepackaging-recyclable-content": { type: Schema.Types.Mixed },
    "sustainablepackaging-pcr": { type: Schema.Types.Mixed },
    "sustainablepackaging-recyclability-disruptors": {
      type: Schema.Types.Mixed,
    },
    "sustainablepackaging-rollup-compare": { type: Schema.Types.Mixed },
    renewable_feedback_stock: { type: Schema.Types.Mixed },
    watchlist: { type: Schema.Types.Mixed },
    gaia_score: { type: Schema.Types.Mixed },
    green_chemistry_rollup: { type: Schema.Types.Mixed },
    baseline_green_chemistry_rollup: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// output schema for each step function
const OutputSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.String },
    version: { type: Schema.Types.String },
    rawmaterials: { type: Schema.Types.Mixed },
    formula_end_of_life: { type: Schema.Types.Mixed },
    distribution: { type: Schema.Types.Mixed },
    packproduction: { type: Schema.Types.Mixed },
    packagingeol: { type: Schema.Types.Mixed },
    usephase: { type: Schema.Types.Mixed },
    manufacturing: { type: Schema.Types.Mixed },
    totallca: { type: Schema.Types.Mixed },
    "sustainablepackaging-material-efficiency": { type: Schema.Types.Mixed },
    "sustainablepackaging-recyclable-content": { type: Schema.Types.Mixed },
    "sustainablepackaging-pcr": { type: Schema.Types.Mixed },
    "sustainablepackaging-recyclability-disruptors": {
      type: Schema.Types.Mixed,
    },
    "sustainablepackaging-rollup-compare": { type: Schema.Types.Mixed },
    renewable_feedback_stock: { type: Schema.Types.Mixed },
    watchlist: { type: Schema.Types.Mixed },
    gaia_score: { type: Schema.Types.Mixed },
    green_chemistry_rollup: { type: Schema.Types.Mixed },
    baseline_green_chemistry_rollup: { type: Schema.Types.Mixed },
    
  },
  { timestamps: true }
);
const assessmentTypeInputSchema = new Schema(
  {
    baseline: { type: [InputSchema], required: false },
    final: { type: [InputSchema], required: false },
    experimental: { type: [InputSchema], required: false },
  },
  {
    _id: false,
    baseline: false,
    final: false,
    experimental: false,
    timestamps: true,
  }
);
const assessmentTypeOutputSchema = new Schema(
  {
    baseline: { type: [OutputSchema], required: false },
    final: { type: [OutputSchema], required: false },
    experimental: { type: [OutputSchema], required: false },
  },
  {
    _id: false,
    baseline: false,
    final: false,
    experimental: false,
    timestamps: true,
  }
);
// The main schema to store the input and output for each assessment
const FormulaInputOutputSchema = new Schema({
  input: { type: assessmentTypeInputSchema, required: false },
  output: { type: assessmentTypeOutputSchema, required: false },
});

// Main schema for the product and its assessment details
const AssessmentAuditSchema = new Schema(
  {
    productId: { type: Schema.Types.String, required: true },
    formula_input_output: FormulaInputOutputSchema, // Holds input/output data
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default AssessmentAuditSchema;
