export const sipReportConfig = {
  jsonMaskDataFields: [
    'createdBy',
    'createdTimestamp',
    'editedBy',
    'editedTimestamp',
    'objectKey',
    'operation',
    'operationType',

    'productSipId',
    'productName',
    'brandName',
    'projectId',
    'projectName',
    'description',
    'shortBrandCode',
    'isDeleted',
    'users(name,role,mail)',
    
  ].join(),
};

export const sipAssessmentReportConfig = {
  jsonMaskDataFields: [
    'createdBy',
    'createdTimestamp',
    'editedBy',
    'editedTimestamp',
    'objectKey',
    'operation',
    'operationType',

    'assessmentId',
    'name',
    'isFormulationDataCompleted',
    'isPackagingDataCompleted',
    'isFormulationCalculated',
    'isFormulationEOLCalculated',
    'isPackagingCalculated',
    'isSpiceCalculated',
     "isGreenChemistryCalculated",
      "isSustainabilityPackagingCalculated",
      "isLCACalculated",
      "isGreenChemistryRollupCalculated",
      "isSustainabilityPackagingRollupCalculated",
      "isCalculatedButtonClicked",
    'fg_spec',
    'formula_number',
    'lab_notebook_code',
    'pc_spec',
    'sku_erp_code',
    'zone',
    'net_content',
    'formulation(fmlCode,description,netContent,netContentUnit,productionZone,salesZone,productSegment,productSubSegment,useDose,useDoseUnit,useScenario,consumablesUsed,isEdited,isCalculated,isCalculating,rawMaterials(tradeName,rawMaterialId,percentage))',
    'packaging_level(packaging_level,isrecyclable,recyclability_status,productEvaluation,isManualEdit,components(pc_nm,description,component_type,weight,opacifier,recyclability_status,stage,state,template,isEdited,isDataComplete,isCalculated,sub_components(name,opacity,color,finishing_process,material(material_name,material_type,layer,converting_process,material_pct))))',
    'createdBy'
  ].join(),
};
