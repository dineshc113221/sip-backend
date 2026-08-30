import { Schema } from "mongoose";

const compositionSchema = new Schema({
  material_name: { type: Schema.Types.String, required: false },
  material_type: { type: Schema.Types.String, required: false },
  layer: { type: Schema.Types.String, required: false },
  converting_process: { type: Schema.Types.String, required: false },
  pcr_content: { type: Schema.Types.String, required: false },
  material_pct: { type: Schema.Types.String, required: false },
});
const materialFieldExistsSchema = new Schema({
  material_name: { type: Schema.Types.Boolean, default: false },
  material_type: { type: Schema.Types.Boolean, default: false },
  layer: { type: Schema.Types.String, required: false },
  converting_process: { type: Schema.Types.Boolean, default: false },
  pcr_content: { type: Schema.Types.Boolean, default: false },
  material_pct: { type: Schema.Types.Boolean, default: false },
});
const subComponentsExistsSchema = new Schema({
  name: { type: Schema.Types.Boolean, required: false },
  opacity: { type: Schema.Types.Boolean, required: false },
  color: { type: Schema.Types.Boolean, required: false },
  finishing_process: { type: Schema.Types.Boolean, required: false },
  material: { type: [materialFieldExistsSchema], default: false },
});
const componentFieldExistsSchema = new Schema(
  {
    pc_nm: { type: Schema.Types.Boolean, default: false },
    description: { type: Schema.Types.Boolean, default: false },
    recyclability_status: { type: Schema.Types.Boolean, default: false },
    component_type: { type: Schema.Types.Boolean, default: false },
    weight: { type: Schema.Types.Boolean, default: false },
    opacifier: { type: Schema.Types.Boolean, default: false },
    stage: { type: Schema.Types.Boolean, default: false },
    state: { type: Schema.Types.Boolean, default: false },
    template: { type: Schema.Types.Boolean, default: false },
    sub_components: { type: [subComponentsExistsSchema], required: false },
  },
  { _id: false }
);

const subComponentsSchema = new Schema({
  name: { type: Schema.Types.String, required: false },
  opacity: { type: Schema.Types.String, required: false },
  color: { type: Schema.Types.String, required: false },
  finishing_process: { type: Schema.Types.String, required: false },
  material: { type: [compositionSchema], required: false },
});
const primarySchema = new Schema({
  pc_nm: { type: Schema.Types.String, required: false },
  description: { type: Schema.Types.String, required: false },
  component_type: { type: Schema.Types.String, required: false },
  weight: { type: Schema.Types.String, required: false },
  opacifier: { type: [Schema.Types.String], required: false },
  recyclability_status: { type: Schema.Types.String, required: false },
  stage: { type: Schema.Types.String, required: false },
  state: { type: Schema.Types.String, required: false },
  template: { type: Schema.Types.String, required: false },
  sub_components: { type: [subComponentsSchema], required: false },
  isDataComplete: { type: Schema.Types.Boolean, required: false },
  isEdited: { type: Schema.Types.Boolean, required: false, default: false },
  isCalculated: { type: Schema.Types.Boolean, required: false, default: false },
  fieldsExist: { type: componentFieldExistsSchema, required: false },
});

const packagingSchema = new Schema({
  packaging_level: {
    type: Schema.Types.String,
    required: false,
  },
  isrecyclable: {
    type: Schema.Types.Boolean,
    required: false,
    default: false,
  },
  recyclability_status: {
    type: Schema.Types.String,
    required: false,
    default: "N/A",
  },
  productEvaluation: {
    type: Schema.Types.Number,
    required: false,
    min: 0,
    max: 100,
    default: 90,
  },
  isManualEdit: { type: Schema.Types.Boolean, default: false },
  components: {
    type: [primarySchema],
    required: false,
    default: [],
  },
});

const rawMaterialSchema = new Schema({
  tradeName: { type: Schema.Types.String, required: false },
  rawMaterialId: { type: Schema.Types.String, required: false },
  percentage: { type: Schema.Types.String, required: false },
  productEnvironmentalFootPrint: {
    type: Schema.Types.String,
    required: false,
  },
  carbonFootPrint: { type: Schema.Types.String, required: false },
  green_chemistry: {
    type: Schema.Types.String,
    required: false,
  },
});

const formulationFieldExistSchema = new Schema({
  fmlCode: { type: Schema.Types.Boolean, default: false },
  description: { type: Schema.Types.Boolean, default: false },
  netContent: { type: Schema.Types.Boolean, default: false },
  netContentUnit: { type: Schema.Types.Boolean, default: false },
  productionZone: { type: Schema.Types.Boolean, default: false },
  salesZone: { type: Schema.Types.Boolean, default: false },
  productSegment: { type: Schema.Types.Boolean, default: false },
  productSubSegment: { type: Schema.Types.Boolean, default: false },
  useDose: { type: Schema.Types.Boolean, default: false },
  consumablesUsed: { type: Schema.Types.Boolean, default: false },
  rawMaterials: { type: Schema.Types.Boolean, default: false },
});

const formulationSchema = new Schema({
  fmlCode: { type: Schema.Types.String, required: false },
  description: { type: Schema.Types.String, required: false },
  netContent: { type: Schema.Types.String, required: false },
  netContentUnit: { type: Schema.Types.String, required: false },
  productionZone: { type: Schema.Types.String, required: false },
  salesZone: { type: Schema.Types.String, required: false },
  productSegment: { type: Schema.Types.String, required: false },
  productSubSegment: { type: Schema.Types.String, required: false },
  useDose: { type: Schema.Types.String, required: false },
  useDoseUnit: { type: Schema.Types.String, required: false, default: "g" },
  useScenario: { type: Schema.Types.String, required: false },
  consumablesUsed: { type: Schema.Types.String, required: false },
  isDataComplete: { type: Schema.Types.Boolean, required: false },
  isEdited: { type: Schema.Types.Boolean, required: false, default: false },
  isCalculated: {
    type: Schema.Types.Boolean,
    required: false,
    default: false,
  },
  rawMaterials: { type: [rawMaterialSchema], required: false },
  fieldsExist: { type: formulationFieldExistSchema, required: false },
});

const assessmentsSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.String, required: true },
    name: {
      type: Schema.Types.String,
      required: [true, "Please enter assessment name"],
      minlength: 1,
      maxlength: 100,
    },
    isFormulationDataCompleted: { type: Schema.Types.Boolean, default: false },
    isPackagingDataCompleted: { type: Schema.Types.Boolean, default: false },
    isFormulationCalculated: { type: Schema.Types.Boolean, default: false },
    isFormulationEOLCalculated: { type: Schema.Types.Boolean, default: false },
    isPackagingCalculated: { type: Schema.Types.Boolean, default: false },
    isSpiceCalculated: { type: Schema.Types.Boolean, default: true },
    isGreenChemistryCalculated: { type: Schema.Types.Boolean, default: false },
    isSustainabilityPackagingCalculated: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isLCACalculated: { type: Schema.Types.Boolean, default: false },
    isGreenChemistryRollupCalculated: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isSustainabilityPackagingRollupCalculated: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isCalculatedButtonClicked: { type: Schema.Types.Boolean, default: false },
    isBaselineCalcUpdated:{ type: Schema.Types.Boolean, default: false },
    isBaselineSkipped: { type: Schema.Types.Boolean, default: false },
    justification: { type: Schema.Types.String, required: false },
    fg_spec: { type: Schema.Types.String, required: false },
    formula_number: { type: Schema.Types.String, required: false },
    lab_notebook_code: { type: Schema.Types.String, required: false },
    pc_spec: { type: Schema.Types.String, required: false },
    sku_erp_code: { type: Schema.Types.String, required: false },
    zone: { type: Schema.Types.String, required: false },
    net_content: { type: Schema.Types.String, required: false },
    formulation: { type: formulationSchema, default: {} },
    packaging_level: { type: [packagingSchema], required: false },
    createdBy: { type: Schema.Types.String },
    modifiedBy: { type: Schema.Types.String },
    isLPP: { type: Schema.Types.Boolean, default: false }
  },
  { timestamps: true }
);

const assessmentSchema = new Schema(
  {
    baseline: { type: assessmentsSchema, required: false },
    final: { type: assessmentsSchema, required: false },
    experimental: { type: [assessmentsSchema], required: false },
  },
  { _id: false, baseline: false, final: false, experimental: false }
);

const productSchema = new Schema(
  {
    productSipId: { type: Schema.Types.String, required: true },
    productName: {
      type: Schema.Types.String,
      required: [true, "Please enter product name"],
      minlength: 1,
      maxlength: 100,
    },
    brandName: {
      type: Schema.Types.String,
      required: [true, "Brand not found, please try again"],
    },
    projectId: { type: Schema.Types.String },
    projectName: { type: Schema.Types.String },
    description: { type: Schema.Types.String, maxlength: 500 },
    shortBrandCode: {
      type: Schema.Types.String,
      required: [true, "Brand not found, please try again"],
    },
    isDeleted: { type: Schema.Types.Boolean, default: false },
    createdBy: { type: Schema.Types.String },
    modifiedBy: { type: Schema.Types.String },
    users: { type: Schema.Types.Mixed },
    assessmentCount: { type: Schema.Types.Number, default: 0 },
    assessments: { type: assessmentSchema, required: false },
  },
  { timestamps: true }
);
productSchema.index({ productSipId: 1 }, { unique: true });

export default productSchema;
