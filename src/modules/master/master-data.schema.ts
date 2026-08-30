import { Schema } from "mongoose";

const masterSchema = new Schema(
  {
    formulation: { type: Schema.Types.Mixed },
    brand: { type: Schema.Types.Mixed },
    packaging: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);
export default masterSchema;
