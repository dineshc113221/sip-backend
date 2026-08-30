import { Schema } from "mongoose";

const CalculationErrorLogSchema = new Schema(
  {
    productId: { type: Schema.Types.String, required: true },
    assessmentId: { type: Schema.Types.String, required: true },
    assessmentType: { type: Schema.Types.String, required: true },
    input: { type: Object, default: {} },
    output: { type: Object, default: {} },
    executionARN: { type: Schema.Types.String, required: true }
  },
  { timestamps: true }
);

export default CalculationErrorLogSchema;
