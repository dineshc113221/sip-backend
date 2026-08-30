import {
  getCompositionAttribute,
  getConstituent,
  getFormulaDetails,
  getRawMaterialDetails,
} from "../../adapters/Api.js";
import logger from "../../utils/logger/index.js";
import { ICompositionDetailsModel } from "../../interfaces/CompositionDetails.js";
import kafkaModel, { initializeKafkaModel } from "./spiConsumer_model.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { config } from "../../data/config.js";
import sendEmail from "./emailUtils.js";
import chemicalKafkaModel, {
  initializeChemicalKafkaModel,
} from "./chemicalConsumer_model.js";
import formulaKafkaModel, {
  initializeFormulaKafkaModel,
} from "./formulaConsumer_model.js";
import internalConstituentModel, {
  initializeInternalConstituentModel,
} from "./internalConstituents_model.js";
import errorMessageKafkaModel, {
  initializeerrorMessageKafkaModel,
} from "./kafkaErrorMessage_model.js";
import { updateFormulaEcoGaiaFlag } from "./utils/formulaEcoGaiaFlag.js";
import { updateKafkaStatus } from "./kafkaProcessingUtils.js";
import { initializeKafkaProcessingStatusModel } from "./kafkaProcessingStatus_model.js";

class KafkaController {
  private collection1: any;
  private collection2: any;
  private collection3: any;
  private errorModel: any;

  constructor(collection1: any, collection2: any, collection3: any) {
    this.collection1 = collection1;
    this.collection2 = collection2;
    this.collection3 = collection3;
    this.errorModel = errorMessageKafkaModel();
  }

  private sumTwoValues(first: number, second: number, positions: number): number {
    const factor = 10 ** positions;
    return (
      (Number(first.toFixed(positions)) * factor +
        Number(second.toFixed(positions)) * factor) /
      factor
    );
  }

  async writeKafkaToDetails(receivedMessage: ICompositionDetailsModel) {
    try {
      if (receivedMessage?.objClass === "RAW" && receivedMessage?.keycode) {
        try {
          const rawDetail = await getRawMaterialDetails(
            receivedMessage?.modifiedBy,
            receivedMessage?.keycode
          );

          if (!rawDetail) {
            const missingRawDetailMessage = `Failed to fetch RAW material details for keycode: ${receivedMessage?.keycode}. API returned null/undefined.`;
            logger.warn(missingRawDetailMessage, "");
            await updateKafkaStatus({
              type: "RAW",
              key: receivedMessage.keycode,
              status: "FAILED",
              reason: "RAW material details API returned null/undefined",
              kafkaMessage: receivedMessage,
            });
            try {
              await this.errorModel.insertOne({
                error: `API returned null for getRawMaterialDetails: ${receivedMessage?.keycode}`,
                message: missingRawDetailMessage,
                kafkaMessage: receivedMessage,
                reprocess: false,
                retry: 0,
                createdAt: new Date(),
              });
            } catch (dbError) {
              logger.error(
                `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
                ""
              );
            }
            return { success: false, message: missingRawDetailMessage };
          }

          const totalPercentage = (rawDetail["compositions"]?.reduce(
            (sum, composition) => {
              const parsedPercentage = parseFloat(composition?.percentage) || 0;
              // Use sumTwoValues to sum and round to 6 decimal places
              return this.sumTwoValues(sum, parsedPercentage, 6);
            },
            0
          ) ?? 0);

          // Only proceed if the total percentage is exactly 100

          if (totalPercentage === 100) {
            const lambda = new LambdaClient({
              region: config.AWS_REGION,
              credentials: {
                accessKeyId: config.AWS_ACCESS_KEY,
                secretAccessKey: config.AWS_SECRET_KEY,
              },
            });

            const params = {
              FunctionName: config.PRECAL_RAW,
              Payload: JSON.stringify(rawDetail),
            };

            try {
              const command = new InvokeCommand(params);

              await lambda.send(command);

              logger.info(
                `Lambda invoked successfully for RAW material: ${JSON.stringify(
                  receivedMessage?.keycode
                )}`,
                ""
              );
              await updateKafkaStatus({
                type: "RAW",
                key: receivedMessage.keycode,
                status: "SUCCESS",
                kafkaMessage: receivedMessage,
              });

              return {
                success: true,
                message: `Lambda invoked successfully for RAW material: ${JSON.stringify(
                  receivedMessage?.keycode
                )}`,
              };
            } catch (lambdaError) {
              const lambdaErrorMessage = `Lambda invocation failed for RAW material: ${JSON.stringify(
                receivedMessage?.keycode
              )} Error: ${lambdaError}`;

              logger.error(lambdaErrorMessage, "");

              try {
                await updateKafkaStatus({
                  type: "RAW",
                  key: receivedMessage.keycode,
                  status: "FAILED",
                  reason: `${lambdaError}`,
                  kafkaMessage: receivedMessage,
                });
                await this.errorModel.insertOne({
                  error: `Lambda invocation failed for RAW material ${JSON.stringify(
                    receivedMessage?.keycode
                  )}`,
                  message: `${lambdaError}`,
                  kafkaMessage: receivedMessage,
                  reprocess: false,
                  retry: 0,
                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(
                  `Failed to store Kafka error in DB: ${
                    dbError.stack || dbError
                  }`,
                  ""
                );
              }

              await sendEmail(lambdaErrorMessage);

              return { success: false, message: lambdaErrorMessage };
            }
          } else {
            logger.warn(
              `Skipping Lambda invocation for RAW material: ${receivedMessage?.keycode} as total percentage is ${totalPercentage} instead of 100.`,
              ""
            );
            await updateKafkaStatus({
              type: "RAW",
              key: receivedMessage.keycode,
              status: "SKIPPED",
              reason: `Total percentage = ${totalPercentage}`,
              kafkaMessage: receivedMessage,
            });

            return {
              success: true,
              message: `Total percentage of compositions is ${totalPercentage}, skipping Lambda invocation.`,
            };
          }
        } catch (rawDetailError) {
          const rawDetailErrorMessage = `Error fetching RAW material details for keycode: ${receivedMessage?.keycode}, Error: ${rawDetailError}`;

          logger.error(rawDetailErrorMessage, "");

          try {
            await updateKafkaStatus({
              type: "RAW",
              key: receivedMessage.keycode,
              status: "FAILED",
              reason: `${rawDetailError}`,
              kafkaMessage: receivedMessage,
            });
            await this.errorModel.insertOne({
              error: `Error fetching RAW material details for keycode: ${receivedMessage?.keycode}`,
              message: `${rawDetailError}`,
              kafkaMessage: receivedMessage,
              reprocess: false,
              retry: 0,
              createdAt: new Date(),
            });
          } catch (dbError) {
            logger.error(
              `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
              ""
            );
          }

          await sendEmail(rawDetailErrorMessage);

          return { success: false, message: rawDetailErrorMessage };
        }
      } else if (receivedMessage?.objClass === "CON") {
        if (receivedMessage?.keycode) {
          try {
            const conDetails = await getConstituent(
              receivedMessage?.modifiedBy,
              receivedMessage?.keycode
            );

            if (!conDetails) {
              const missingConMessage = `Failed to fetch constituent details for keycode: ${receivedMessage?.keycode}. API returned null/undefined.`;
              logger.warn(missingConMessage, "");
              await updateKafkaStatus({
                type: "CON",
                key: receivedMessage.keycode,
                status: "FAILED",
                reason: "Constituent details API returned null/undefined",
                kafkaMessage: receivedMessage,
              });
              try {
                await this.errorModel.insertOne({
                  error: `API returned null for getConstituent: ${receivedMessage?.keycode}`,
                  message: missingConMessage,
                  kafkaMessage: receivedMessage,
                  reprocess: false,
                  retry: 0,
                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(
                  `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
                  ""
                );
              }
              return { success: false, message: missingConMessage };
            }

            if (conDetails?.Constituent) {
              const environmentalScore =
                conDetails?.Constituent?.environmentalScore;


              const conObject = {
                chemical_materialtype: receivedMessage?.objClass ?? "",
                chemical_material_code: receivedMessage?.keycode ?? "",
                gaiaScore: environmentalScore ?? "0", // Set to 0 if missing
                chemical_trade_name: conDetails?.Constituent?.commonName ?? "",
                chemical_gsrs_id: conDetails?.Constituent?.Synonyms?.[1] ?? "",
                chemical_gsrs_name:
                  conDetails?.Constituent?.Synonyms?.[0] ?? "",
                chemical_inci_eu: conDetails?.Constituent?.EUINCIName ?? "",
                chemical_inci_us: conDetails?.Constituent?.USINCIName ?? "",
                chemical_pheur_name: conDetails?.Constituent?.phEurName ?? "",
                chemical_usp_name: conDetails?.Constituent?.usp_name ?? "",
                chemical_prim_function:
                  conDetails?.Constituent?.primaryFunction ?? "",
                chemical_ctfa: conDetails?.Constituent?.CTFAIDNumber ?? "",
                chemical_created_date: receivedMessage?.createdDate ?? "",
                chemical_last_modified_date:
                  receivedMessage?.dateModified ?? "",
                DL_INS_TS: receivedMessage?.createdDate ?? "",
                DL_UPD_TS: receivedMessage?.dateModified ?? "",
                isProxy: "",
              };

              // Determine whether to include gaiaScore in the $set operation
              const { gaiaScore, isProxy, ...fieldsWithoutGaiaScore } =
                conObject;

              // Dynamically define update and insert logic based on the environment variable
              let updateOperations;

              if (config.PROCESS_UPDATE_GAIASCORE === "true") {
                updateOperations = {
                  $set: { ...fieldsWithoutGaiaScore, gaiaScore }, // Include gaiaScore in $set only if the condition is true
                  $setOnInsert: { isProxy }, // Insert isProxy only for new records
                };
              } else {
                // Conditional update: Exclude gaiaScore for existing records
                updateOperations = {
                  $set: fieldsWithoutGaiaScore,
                  $setOnInsert: { gaiaScore, isProxy }, // Insert gaiaScore and isProxy only for new records
                };
              }

              try {
                const result = await this.collection1.updateOne(
                  { CONNumber: conDetails?.Constituent?.CONNumber },
                  updateOperations,
                  { upsert: true }
                );
                // Check if a new document was inserted
                if (result.upsertedCount > 0) {
                  const emailMessage = `New constituent added: ${receivedMessage?.keycode}`;
                  await sendEmail(emailMessage);
                }

                logger.info(
                  `Successfully handled MongoDB upsert for constituent details: ${JSON.stringify(
                    receivedMessage?.keycode
                  )}`,
                  ""
                );
                await updateKafkaStatus({
                  type: "CON",
                  key: receivedMessage.keycode,
                  status: "SUCCESS",
                  kafkaMessage: receivedMessage,
                });

                return {
                  success: true,
                  message: `Successfully handled MongoDB upsert for constituent details: ${JSON.stringify(
                    receivedMessage?.keycode
                  )}`,
                };
              } catch (dbError) {
                const dbErrorMessage = `Error upserting MongoDB with constituent details: ${JSON.stringify(
                  receivedMessage?.keycode
                )} Error: ${dbError}`;
                logger.error(dbErrorMessage, "");
                await updateKafkaStatus({
                  type: "CON",
                  key: receivedMessage.keycode,
                  status: "FAILED",
                  reason: `${dbError}`,
                  kafkaMessage: receivedMessage,
                });
                try {
                  await this.errorModel.insertOne({
                    error: `Error upserting MongoDB with constituent details: ${JSON.stringify(
                      receivedMessage?.keycode
                    )}`,
                    message: `${dbError}`,
                    kafkaMessage: receivedMessage,
                    reprocess: false,
                    retry: 0,
                    createdAt: new Date(),
                  });
                } catch (dbError) {
                  logger.error(
                    `Failed to store Kafka error in DB: ${
                      dbError.stack || dbError
                    }`,
                    ""
                  );
                }
                await sendEmail(dbErrorMessage);
                return { success: false, message: dbErrorMessage };
              }
            } else {
              const noCompositionMessage = `No compositions found in pdrm for constituent with connid: ${receivedMessage?.keycode}`;
              logger.warn(noCompositionMessage, "");
              await updateKafkaStatus({
                type: "CON",
                key: receivedMessage.keycode,
                status: "SKIPPED",
                reason: "Constituent not found in source system",
                kafkaMessage: receivedMessage,
              });
              await sendEmail(noCompositionMessage);

              return { success: true, message: noCompositionMessage };
            }
          } catch (constituentDetailsError) {
            const constituentDetailsErrorMessage = `Error fetching constituent details for connid: ${receivedMessage?.keycode}, Error: ${constituentDetailsError}`;
            logger.error(constituentDetailsErrorMessage, "");

            try {
              await updateKafkaStatus({
                type: "CON",
                key: receivedMessage.keycode,
                status: "FAILED",
                reason: `${constituentDetailsError}`,
                kafkaMessage: receivedMessage,
              });
              await this.errorModel.insertOne({
                error: `Error fetching constituent details for objectKey: ${receivedMessage?.keycode}`,
                message: `${constituentDetailsError}`,
                kafkaMessage: receivedMessage,
                reprocess: false,
                retry: 0,
                createdAt: new Date(),
              });
            } catch (dbError) {
              logger.error(
                `Failed to store Kafka error in DB: ${
                  dbError.stack || dbError
                }`,
                ""
              );
            }
            await sendEmail(constituentDetailsErrorMessage);
            return { success: false, message: constituentDetailsErrorMessage };
          }
        }
      } else {
        if (receivedMessage?.objectKey) {
          try {
            const userId = receivedMessage?.modifiedBy
              ? receivedMessage?.modifiedBy
              : receivedMessage.createdBy;
            
            // Validate API calls for FML
            const fmlDetail = await getFormulaDetails(
              userId,
              receivedMessage?.objectKey
            );
            if (!fmlDetail) {
              const missingFormulaMessage = `Failed to fetch formula details for objectKey: ${receivedMessage?.objectKey}. API returned null/undefined.`;
              logger.warn(missingFormulaMessage, "");
              await updateKafkaStatus({
                type: "FML",
                key: receivedMessage.objectKey,
                status: "FAILED",
                reason: "Formula details API returned null/undefined",
                kafkaMessage: receivedMessage,
              });
              try {
                await this.errorModel.insertOne({
                  error: `API returned null for getFormulaDetails: ${receivedMessage?.objectKey}`,
                  message: missingFormulaMessage,
                  kafkaMessage: receivedMessage,
                  reprocess: false,
                  retry: 0,
                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(
                  `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
                  ""
                );
              }
              return { success: false, message: missingFormulaMessage };
            }

            const fmlDetails = await getCompositionAttribute(
              userId,
              receivedMessage?.objectKey
            );
            if (!fmlDetails) {
              const missingAttributesMessage = `Failed to fetch composition attributes for objectKey: ${receivedMessage?.objectKey}. API returned null/undefined.`;
              logger.warn(missingAttributesMessage, "");
              await updateKafkaStatus({
                type: "FML",
                key: receivedMessage.objectKey,
                status: "FAILED",
                reason: "Composition attributes API returned null/undefined",
                kafkaMessage: receivedMessage,
              });
              try {
                await this.errorModel.insertOne({
                  error: `API returned null for getCompositionAttribute: ${receivedMessage?.objectKey}`,
                  message: missingAttributesMessage,
                  kafkaMessage: receivedMessage,
                  reprocess: false,
                  retry: 0,
                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(
                  `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
                  ""
                );
              }
              return { success: false, message: missingAttributesMessage };
            }

            if (fmlDetail?.compositions?.length) {
              fmlDetail.compositions = fmlDetail?.compositions?.map((item) => ({
                ...item,
                percentage: isNaN(parseFloat(item?.material_PCT))
                  ? "0"
                  : parseFloat(item?.material_PCT).toFixed(6).toString(),
              }));

              try {
                let ecoGiaFlag = false;
                let ecoGiaReason = "";
                if (this.collection3 && fmlDetail.compositions) {
                  const ecoGiaResult = await updateFormulaEcoGaiaFlag(
                    this.collection3,
                    fmlDetail.compositions
                  );
                  ecoGiaFlag = ecoGiaResult.flag;
                  ecoGiaReason = ecoGiaResult.reason;
                }

                fmlDetail.details = {
                  ...fmlDetail.details,
                  fml_raw_eco_gaia_data_present: ecoGiaFlag,
                  fml_raw_eco_gaia_data_reason: ecoGiaReason,
                };

                await this.collection1.updateOne(
                  {
                    "details.objectKey": fmlDetail?.details?.objectKey,
                    "details.revision": fmlDetail?.details?.revision,
                  },
                  { $set: { ...fmlDetail, updatedAt: new Date() } },
                  { upsert: true }
                );
                logger.info(
                  `Successfully updated MongoDB with formula details (collection1): ${JSON.stringify(
                    receivedMessage?.objectKey
                  )}`,
                  ""
                );
              } catch (dbError) {
                const dbErrorMessage = `Error updating MongoDB with formula details: ${JSON.stringify(
                  receivedMessage?.objectKey
                )} Error: ${dbError}`;
                logger.error(dbErrorMessage, "");
                await updateKafkaStatus({
                  type: "FML",
                  key: receivedMessage.objectKey,
                  status: "FAILED",
                  reason: `${dbError}`,
                  kafkaMessage: receivedMessage,
                });
                try {
                  await this.errorModel.insertOne({
                    error: `Error updating MongoDB with formula details: ${JSON.stringify(
                      receivedMessage?.objectKey
                    )}`,
                    message: `${dbError}`,
                    kafkaMessage: receivedMessage,
                    reprocess: false,
                    retry: 0,
                    createdAt: new Date(),
                  });
                } catch (dbError) {
                  logger.error(
                    `Failed to store Kafka error in DB: ${
                      dbError.stack || dbError
                    }`,
                    ""
                  );
                }
                await sendEmail(dbErrorMessage);
                return { success: false, message: dbErrorMessage };
              }
            } else {
              const noCompositionMessage = `No compositions found for formula with objectKey: ${receivedMessage?.objectKey}`;
              logger.warn(noCompositionMessage, "");
              await updateKafkaStatus({
                type: "FML",
                key: receivedMessage.objectKey,
                status: "SKIPPED",
                reason: "No compositions found",
                kafkaMessage: receivedMessage,
              });

              return { success: true, message: noCompositionMessage };
            }

            if (fmlDetails?.formulaDetails && fmlDetails?.attributes) {
              const uniqueIds: Record<string, boolean> = {};
              const regions =
                fmlDetails?.attributes?.product?.associatedProducts
                  ?.filter((item) => {
                    if (!uniqueIds[item?.region?.[0]?.id]) {
                      uniqueIds[item?.region?.[0]?.id] = true;
                      return true;
                    }
                    return false;
                  })
                  .map((item) => item.region[0]);

              const chemicalData = {
                formula_id: fmlDetails?.formulaDetails?.keycode ?? "",
                formula_type: fmlDetails?.formulaDetails?.objClass ?? "",
                formula_code: fmlDetails?.formulaDetails?.keycode ?? "",
                formula_version: fmlDetails?.formulaDetails?.keycode2 ?? "",
                formula_description:
                  fmlDetails?.formulaDetails?.description ?? "",
                formula_status: fmlDetails?.formulaDetails?.status_ind ?? "",
                formula_development_site:
                  fmlDetails?.attributes.formula.devSite,
                dw_formula_owner:
                  fmlDetails?.formulaDetails?.formulator_code ?? "",
                formula_created_by: fmlDetails?.formulaDetails?.ownerCode ?? "",
                formula_created_date:
                  fmlDetails?.formulaDetails?.createdDate ?? "",
                formula_last_modified_by:
                  fmlDetails?.formulaDetails?.modifiedBy ?? "",
                formula_last_modified_date:
                  fmlDetails?.formulaDetails?.dateModified ?? "",
                formula_prod_function:
                  fmlDetails?.attributes?.product?.productFunction ?? "",
                formula_prod_type:
                  fmlDetails?.attributes?.product?.productType ?? "",
                brand_code: fmlDetails?.formulaDetails?.brand ?? "",
                formula_selling_location:
                  fmlDetails?.formulaDetails?.sellLoc ?? "",
                formula_end_use: fmlDetails?.attributes?.product?.endUse ?? "",
                formula_end_user:
                  fmlDetails?.attributes?.product?.endUser ?? "",
                formula_delivery_system:
                  fmlDetails?.attributes?.product?.deliverySystem ?? "",
                formula_approval_region: regions ?? [],
                formula_chassis_assoc:
                  fmlDetails?.attributes?.formula?.associateChassis ?? "",
                formula_tru_pf_spec:
                  fmlDetails?.attributes?.formula?.prcFmlSpec ?? "",
                formula_tru_pr_spec:
                  fmlDetails?.attributes?.formula?.prdSpec ?? "",
                formula_lab_book_code:
                  fmlDetails?.formulaDetails?.labBookCode ?? "",
                DL_INS_TS: fmlDetails?.formulaDetails?.createdDate ?? "",
                DL_UPD_TS: fmlDetails?.formulaDetails?.dateModified ?? "",
              };

              try {
                await this.collection2.updateOne(
                  {
                    formula_id: fmlDetails.formulaDetails.keycode,
                    formula_version: fmlDetails?.formulaDetails?.keycode2,
                  },
                  { $set: { ...chemicalData } },
                  { upsert: true }
                );
                await updateKafkaStatus({
                  type: "FML",
                  key: receivedMessage.objectKey,
                  status: "SUCCESS",
                  kafkaMessage: receivedMessage,
                });
                logger.info(
                  `Successfully updated MongoDB with formula details: ${JSON.stringify(
                    fmlDetails.formulaDetails.keycode
                  )}`,
                  ""
                );
                return {
                  success: true,
                  message: `Successfully updated MongoDB with formula details: ${JSON.stringify(
                    fmlDetails.formulaDetails.keycode
                  )}`,
                };
              } catch (dbError) {
                const dbErrorMessage = `Error updating MongoDB with formula details: ${JSON.stringify(
                  fmlDetails.formulaDetails.keycode
                )} Error: ${dbError}`;
                logger.error(dbErrorMessage, "");

                try {
                  await updateKafkaStatus({
                    type: "FML",
                    key: receivedMessage.objectKey,
                    status: "FAILED",
                    reason: `${dbError}`,
                    kafkaMessage: receivedMessage,
                  });
                  await this.errorModel.insertOne({
                    error: `Error updating MongoDB with formula details: ${JSON.stringify(
                      fmlDetails.formulaDetails.keycode
                    )}`,
                    message: `${dbError}`,
                    kafkaMessage: receivedMessage,
                    reprocess: false,
                    retry: 0,
                    createdAt: new Date(),
                  });
                } catch (dbError) {
                  logger.error(
                    `Failed to store Kafka error in DB: ${
                      dbError.stack || dbError
                    }`,
                    ""
                  );
                }
                await sendEmail(dbErrorMessage);
                return { success: false, message: dbErrorMessage };
              }
            } else {
              const incompleteDetailsMessage = `Incomplete formula details for objectKey: ${receivedMessage?.objectKey}. Missing formulaDetails or attributes.`;
              logger.warn(incompleteDetailsMessage, "");
              // Update status to SKIPPED because collection2 data is incomplete
              await updateKafkaStatus({
                type: "FML",
                key: receivedMessage.objectKey,
                status: "SKIPPED",
                reason: "Missing formulaDetails or attributes from API response",
                kafkaMessage: receivedMessage,
              });
              try {
                await this.errorModel.insertOne({
                  error: `Incomplete formula details for objectKey: ${receivedMessage?.objectKey}`,
                  message: incompleteDetailsMessage,
                  kafkaMessage: receivedMessage,
                  reprocess: true,
                  retry: 0,
                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(
                  `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
                  ""
                );
              }
              return { success: true, message: incompleteDetailsMessage };
            }
          } catch (formulaDetailsError) {
            const formulaDetailsErrorMessage = `Error fetching formula details for objectKey: ${receivedMessage?.objectKey}, Error: ${formulaDetailsError}`;
            logger.error(formulaDetailsErrorMessage, "");

            try {
              await updateKafkaStatus({
                type: "FML",
                key: receivedMessage.objectKey,
                status: "FAILED",
                reason: `${formulaDetailsError}`,
                kafkaMessage: receivedMessage,
              });
              await this.errorModel.insertOne({
                error: `Error fetching formula details for objectKey: ${receivedMessage?.objectKey}`,
                message: `${formulaDetailsError}`,
                kafkaMessage: receivedMessage,
                reprocess: false,
                retry: 0,
                createdAt: new Date(),
              });
            } catch (dbError) {
              logger.error(
                `Failed to store Kafka error in DB: ${
                  dbError.stack || dbError
                }`,
                ""
              );
            }
            await sendEmail(formulaDetailsErrorMessage);
            return { success: false, message: formulaDetailsErrorMessage };
          }
        }
      }
    } catch (error) {
      const errorMessage = `Error processing received message: ${error}`;
      logger.error(errorMessage, "");

      try {
        await updateKafkaStatus({
          type: receivedMessage?.objClass || "UNKNOWN",
          key: receivedMessage?.keycode || receivedMessage?.objectKey || "",
          status: "FAILED",
          reason: `${error}`,
          kafkaMessage: receivedMessage,
        });
        await this.errorModel.insertOne({
          error: "Error processing received message",
          message: `${error}`,
          kafkaMessage: receivedMessage,
          reprocess: false,
          retry: 0,
          createdAt: new Date(),
        });
      } catch (dbError) {
        logger.error(
          `Failed to store Kafka error in DB: ${dbError.stack || dbError}`,
          ""
        );
      }
      await sendEmail(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
}

export const initializeKafkaController = async () => {
  await initializeKafkaProcessingStatusModel();
  await initializeKafkaModel();
  await initializeerrorMessageKafkaModel();
  const kafkaModels = kafkaModel();
  await initializeFormulaKafkaModel();
  const formulaModels = formulaKafkaModel();
  await initializeInternalConstituentModel();
  const internalConstituentModels = internalConstituentModel();

  return new KafkaController(
    kafkaModels,
    formulaModels,
    internalConstituentModels
  );
};

export const initializeChemicalKafkaController = async () => {
  await initializeKafkaProcessingStatusModel();
  await initializeChemicalKafkaModel();
  await initializeerrorMessageKafkaModel();
  const chemicalKafkaModels = chemicalKafkaModel();
  return new KafkaController(chemicalKafkaModels, "", "");
};