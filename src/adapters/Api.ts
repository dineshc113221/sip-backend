import { generateURL, getDataFromMicroService } from "./index.js";
import { ApiHeaders, ApiEndPoints } from "../constants.js";
import { IFormulaDetail } from "../interfaces/FormulaDetails.js";
import { IQueryParam } from "../interfaces/QueryParam.js";
import { IRawMaterial } from "../interfaces/RawMaterialDetails.js";
import logger from "../utils/logger/index.js";
import sendEmail from "../modules/kafka/emailUtils.js";
import { IConstituent } from "../interfaces/ConstituentDetails.js";

/**
 * Get user details by userId
 * @param requesterUserId Logged in user Id
 * @param userIds UserId(s) sepeareted by comma
 */
export const getRawMaterialDetails = async (
  requesterUserId: string,
  objectKey: string
): Promise<IRawMaterial[]> => {
  try {
    const parms: IQueryParam[] = [{ key: "objectKey", value: objectKey }];
    const url = generateURL(
      `${process.env.RAW_MS_API_BASE_URL}${ApiEndPoints.rawMaterialConstituents}`,
      parms
    );
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders))
      .results as IRawMaterial[];
  } catch (error) {
    await sendEmail(`Error getting raw material details: ${error}`);

    logger.error(`Error getting raw material details: ${error}`, "");
    throw error;
  }
};

export const getFormulaDetails = async (
  requesterUserId: string,
  objectKey: string
): Promise<IFormulaDetail> => {
  try {
    const parms: IQueryParam[] = [{ key: "objectKey", value: objectKey }];
    const url = generateURL(
      `${process.env.FML_MS_API_BASE_URL}${ApiEndPoints.formulaDetails}`,
      parms
    );
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders))
      .results as IFormulaDetail;
  } catch (error) {
    await sendEmail(`Error getting formula details: ${error}`);
    logger.error(`Error getting formula details: ${error}`, "");
    throw error;
  }
};

export const getConstituent = async (
  requesterUserId: string,
  connumber: string
): Promise<IConstituent> => {
  try {
    const parms: IQueryParam[] = [{ key: "connumber", value: connumber }];
    const url = generateURL(
      `${process.env.CONSTITUENT_MS_API_BASE_URL}${ApiEndPoints.conDetails}`,
      parms
    );
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders))
      .results as IConstituent;
  } catch (error) {
    await sendEmail(`Error getting constituent details: ${error}`);
    logger.error(`Error getting constituent details: ${error}`, "");
    throw error;
  }
};

export const getCompositionAttribute = async (
  requesterUserId: string,
  objectKey: string
): Promise<IFormulaDetail> => {
  try {
    const parms: IQueryParam[] = [{ key: "objectKey", value: objectKey }];
    const url = generateURL(
      `${process.env.FML_MS_API_BASE_URL}${ApiEndPoints.compositionAndAttribute}`,
      parms
    );
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders))
      .results as IFormulaDetail;
  } catch (error) {
    await sendEmail(`Error getting formula details: ${error}`);
    logger.error(`Error getting formula details: ${error}`, "");
    throw error;
  }
};

export const getFormulaDetailsCount = async (
  requesterUserId: string
): Promise<Object> => {
  try {
    const url = generateURL(
      `${process.env.FML_MS_API_BASE_URL}${ApiEndPoints.formulaDetailsCounts}`
    );
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders))
      .results;
  } catch (error) {
    await sendEmail(`Error getting formula details: ${error}`);
    logger.error(`Error getting formula details: ${error}`, "");
    throw error;
  }
};

export const getRawMaterialDetailsCount = async (
  requesterUserId: string): Promise<Object> => {
  try {
    const url = generateURL(
      `${process.env.RAW_MS_API_BASE_URL}${ApiEndPoints.rawMaterialConstituentsCount}`);
    ApiHeaders["x-consumer-userId"] = requesterUserId;
    logger.info(`Connection URL:- ${url}`, "");
    return (await getDataFromMicroService(url, "get", ApiHeaders));
  } catch (error) {
    await sendEmail(`Error getting raw material details: ${error}`);

    logger.error(`Error getting raw material details: ${error}`, "");
    throw error;
  }
};
