export interface IRawMaterial {
  details: IRawDetails;
  compositions: IComposition[];
}

interface IRawDetails {
  rawMaterialID: string;
  tradeName: string;
  status: string;
  RMCStatus: string;
  primaryFunction: IIdValue;
  specNumber: string;
  origin: string;
  approvedRegion: IApprovedRegion[];
  supplier: string;
}

interface IIdValue {
  id: string;
  value: string;
}
interface IApprovedRegion {
  region: string;
  approvalDate: string;
  status: string;
}

interface IComposition {
  EUINCIName: string;
  USINCIName: string;
  primaryFunction: string;
  CASNumber: string;
  CONNumber: string;
  percentage: string;
  minPercentage: string;
  maxPercentage: string;
  intended: string;
}
