import axios, { Method } from 'axios';
import { IQueryParam } from '../interfaces/QueryParam.js';
import logger from '../utils/logger/index.js';
import { IMicroServiceResponse } from '../interfaces/RequestResponse.js';
import httpStatus from '../config/http-status.js';
import sendEmail from '../modules/kafka/emailUtils.js';
/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function getDataFromMicroService(
  url: string,
  method: Method,
  headers: any = {},
  data: any = {}
): Promise<IMicroServiceResponse> {
  logger.info(`GetDataFromMicroService REST URL:: ${url}`, '');
  try {
    const responseData = await axios.request({
      method,
      url,
      headers,
      ...(method.toLowerCase() !== 'get' && { data }), // Avoid data for GET
    });
    return responseData?.data;
  } catch (error) {
    await sendEmail(
      `Error in REST call: ${JSON.stringify(
        error.response?.data || error.message
      )}  GetDataFromMicroService REST URL:: ${url}`
    );
    logger.error(
      `Error in REST call: ${JSON.stringify(error.response?.data || error.message)}`,
      ''
    );

    return {
      status: {
        statusCode: httpStatus.internalServerError.toString(),
        message: (error as Error).message,
      },
      results: [],
    };
  }
}

export const generateURL = (path: string, queryParms: IQueryParam[] = []) => {
  if (path == null || path === undefined) {
    return '';
  }
  if (!queryParms || queryParms.length === 0) {
    return `${path}`;
  }
  const equalSeparatedParms = queryParms.map(
    (param: IQueryParam) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`
  );
  return `${path}?${equalSeparatedParms.join('&')}`;
};
