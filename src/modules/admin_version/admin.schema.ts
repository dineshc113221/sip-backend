import { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    version_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, maxlength: 500 },
    date: { type: Schema.Types.String },
    what_change: { type: Schema.Types.String },
    impact_assessment: { type: Schema.Types.String },
    type: { type: Schema.Types.String },
    isDeleted: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true }
);
adminSchema.index({ version_number: 1 }, { unique: true });

export default adminSchema;
