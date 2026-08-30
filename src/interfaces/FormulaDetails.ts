export interface IFormulaDetail {
  formulaDetails: IDetail;
  details: IDetail;
  compositions: IComposition[];
  attributes: IAttributes;
}

interface IDetail {
  keycode: string,
  keycode2: string,
  revision: string,
  objectKey: string,
  description: string,
  uomcode: string,
  itemcode: string,
  yield: string,
  yield_PCT: string,
  phantom_ind: string,
  primaryFormula_ind: string,
  processYield: string,
  adjustParam: string,
  labBookCode: string,
  labBookPage: string,
  batchNumber: string,
  ownerCode: string,
  groupCode: string,
  status_ind: string,
  approval_code: string,
  hold_code: string,
  work_code: string,
  work_code_2: string,
  formulator_code: string,
  yieldCalc_ind: string,
  materialChange: string,
  comment: string,
  dateModified: string,
  createdDate: string,
  createdBy: string,
  modifiedBy: string,
  objClass: string,
  favorite: string,
  type_ind: string,
  parent_id: string,
  mfg_item_master: string,
  calcMode: string,
  rollup_id: string,
  formula_id: string,
  ownerSecurity: string,
  groupSecurity: string,
  roleSecurity: string,
  cacheChangeCnt: string,
  changecnt: string,
  technology: string,
  developmentSite: string,
  manufacturingSite: string[],
  processFormulaSpec: string,
  manufacturingInstrSpec: string,
  sap_no: string,
  chassis_id: string,
  premix_id: string,
  brand: string,
  sellLoc: string,
  screenLock: string,
  isAllRMFullComposition: string,
  HUTType: string,
  TaskID: string,
  approvedHUTType: string,
  isDraft: string,
  isWFLaunched: string,
  edited: string,
  compositionStatus: string,
  toStage: string,
  chsNotapplicable: string,
  queueAllTasks: string,
  products: string,
  isExceptionTaskRejected: string,
  parentFMLId: string,
  parentLaunchId: string,
  activeFamilyProducts: IActiveFamilyProducts[],
  hutTypeFlag: string,
  workflowtype: string,
  flagToCheckStdNewVerFlow: string,
  sourceFMLId: string,
  processInstructions: string,
  formulaDeviceManagement?: string[],
  fml_raw_eco_gaia_data_present?: boolean,
  fml_raw_eco_gaia_data_reason?: string,
}

interface IActiveFamilyProducts {
  index: string,
  label: string,
  text: string,
}

interface IComposition {
  rawMaterialId: string;
  tradeName: string;
  status: string;
  rmcStatus: string;
  EUINCIName: string;
  USINCIName: string;
  specNumber: string;
  cas: string;
  percentage: string;
  material_PCT: string;
}

interface IAttributes {
  project: IProject;
  product: IProduct;
  formula: IFormula;
}

interface IProject {
  projectCode: string,
  projectName: string,
  description: string,
  projectType: string,
  projectStatus: string,
  projectLeader: string,
  shipToTradeDate: string,
}

interface IProduct {
  productFunction: string[],
  productSpec: string[],
  deliverySystem: string[],
  keyClaims: string[],
  endUse: string[],
  endUser: string[],
  useCondition: string[],
  productType: string[],
  intendedDosagePerUse: string[],
  frequencyOfUse: string[],
  associatedProducts: IAssociatedProducts[]
  segment?: string[],
  subSegment?: string[],
}

interface IAssociatedProducts {
  lineNo: string,
  productName: string,
  brand: string,
  region: IIdValue,
  country: string[],
  regulatoryClassification: string,
}

interface IIdValue {
  id: string;
  value: string;
}

interface IFormula {
  description: string,
  labBookPage: string,
  batchNumber: string,
  technology: IIdValue[],
  devSite: IIdValue[],
  mfgSite: IIdValue[],
  prcFmlSpec: string,
  prdSpec: string,
  mfgWorkInstrSpec: string,
  sapMaterialNum: string,
  chassisCode: string,
  chassisCategory: IIdValue[]
  chassisSubCategory: IIdValue[]
  criticalTechGuidlines: string,
  associateChassis: string,
  chsNotApplicable: string,
  legacyFormulaNo: string,
  formulaDeviceManagement?: IIdValue[],
}
