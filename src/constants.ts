import { CustomHeader } from './interfaces/CustomHeader.js';

export const HTTP_STATUS = {
  success: 200,
  created: 201,
  accepted: 202,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  internalServerError: 500,
};

export const ApiHeaders: CustomHeader = {
  'x-consumer-userId': '',
  'x-consumer-system': 'Raw Materials',
  'x-consumer-correlationId': 'test 1',
  'x-consumer-timestamp': new Date().toISOString(),
  Authorization: 'Bearer token',
};

export const ApiEndPoints = {
  rawMaterialConstituents: '/rawMaterialConstituents',
  formulaDetails: '/formulaDetails',
  conDetails: '/conDetails',
  compositionAndAttribute: '/compositionAndAttribute',
  formulaDetailsCounts: '/counts',
  rawMaterialConstituentsCount: '/rawMaterialTotalPercentage'


};
