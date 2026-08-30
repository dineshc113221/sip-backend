/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface IMicroServiceResponse {
  status: {
    statusCode: string;
    message: string;
  };
  results?: any;
}

export interface IIngredientResponse {
  status: {
    statusCode: number;
    message: string;
  };
  ingredientList?: any;
}
export interface ICopyIngredientResponse {
  status: {
    statusCode: string;
    message: string;
  };
  ingredientList?: any;
}
export interface IGetAllFmlInformationResponse {
  status: {
    statusCode: string;
    message: string;
  };
  formulaCanonical?: any;
}
export interface IFormulaTypeAheadResponse {
  Status: {
    statusCode: string;
    message: string;
  };
  response: {
    fmlsID?: any;
  };
}
