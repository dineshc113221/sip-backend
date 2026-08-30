import { Schema } from "mongoose";

const userAppVersionSchema = new Schema(
 {
    mail:  { type: Schema.Types.String, required: true },
    userPrincipalName:  { type: Schema.Types.String, required: true },
    sipVersionAcknowledged:  { type: Schema.Types.String, required: true }
  },
  { timestamps: true }
);
userAppVersionSchema.index({ sipVersionAcknowledged: 1 }, { unique: true });

export default userAppVersionSchema;
