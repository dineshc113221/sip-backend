import { Schema } from "mongoose";

const pdrmSipDataCountSchema = new Schema(
  {
    concertoFrmlCount: { type: Schema.Types.Number, required: false },
    sipFrmlCount: { type: Schema.Types.Number, required: false },
    concertoRawMaterialCount: { type: Schema.Types.Number, required: false },
    concertoTotalValidRawCount: { type: Schema.Types.Number, required: false },
    concertoTotalNonValidRawCount: { type: Schema.Types.Number, required: false },
    concertoNonExistingIngredientCount: { type: Schema.Types.Number, required: false },
    sipRawMaterialCount: { type: Schema.Types.Number, required: false },
  },
  { timestamps: true }
);

export default pdrmSipDataCountSchema;
