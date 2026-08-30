import logger from "../../utils/logger/index.js";
import kafkaProcessingStatusModel from "./kafkaProcessingStatus_model.js";
import errorMessageKafkaModel from "./kafkaErrorMessage_model.js";

/* eslint-disable  @typescript-eslint/no-explicit-any */

export type KafkaProcessingStatus =
  | "RECEIVED"
  | "SUCCESS"
  | "FAILED"
  | "SKIPPED";

export interface KafkaMeta {
  kafkaOffset?: string;
  kafkaUpdatedAt?: Date;
}

/** Kafka sends timestamps as epoch-millis strings; a Date stores them as UTC. */
export const toUtcDate = (timestamp: any): Date | null => {
  const millis = Number(timestamp);
  return Number.isFinite(millis) && millis > 0 ? new Date(millis) : null;
};

export const resolveKafkaIdentity = (kafkaMessage: any) => ({
  type: kafkaMessage?.objClass || "UNKNOWN",
  key: kafkaMessage?.objectKey || kafkaMessage?.keycode || "UNKNOWN",
});


const applyMeta = (
  target: Record<string, any>,
  kafkaMeta?: KafkaMeta
) => {
  if (!kafkaMeta) return target;

  if (kafkaMeta.kafkaOffset !== undefined) {
    target.kafkaOffset = kafkaMeta.kafkaOffset;
  }

  if (kafkaMeta.kafkaUpdatedAt !== undefined) {
    target.kafkaUpdatedAt = kafkaMeta.kafkaUpdatedAt;
  }

  return target;
};

/**
 * Audit tracking must never break message processing, so this resolves to false
 * instead of throwing when the status collection is unavailable.
 */
export const updateKafkaStatus = async ({
  type,
  key,
  status,
  reason = "",
  errorMessage = "",
  kafkaMessage,
  kafkaMeta,
}: {
  type: string;
  key: string;
  status: KafkaProcessingStatus | string;
  reason?: string;
  errorMessage?: string;
  kafkaMessage?: any;
  kafkaMeta?: KafkaMeta;
}): Promise<boolean> => {
  try {
    const model = kafkaProcessingStatusModel();

    if (!model) {
      logger.error("kafka_processing_status model is not initialized", "");
      return false;
    }

    const now = new Date();
const set: Record<string, any> = {
  type,
  status,
  reason,
  errorMessage,
  kafkaMessage,
  lastRefreshAt: now,
};



await model.updateOne(
  { key },
  {
    $set: applyMeta(set, kafkaMeta),
    $setOnInsert: { createdAt: now },
  },
  { upsert: true }
);

    return true;
  } catch (error: any) {
    logger.error(
      `Failed to update kafka_processing_status for ${type}/${key}: ${error?.stack || error}`,
      ""
    );
    return false;
  }
};

/** Every failure lands here so the daily cron job can pick it up for retry. */
export const saveKafkaError = async ({
  error,
  message,
  kafkaMessage,
  kafkaMeta,
}: {
  error: string;
  message: string;
  kafkaMessage?: any;
  kafkaMeta?: KafkaMeta;
}): Promise<boolean> => {
  try {
    const model = errorMessageKafkaModel();

    if (!model) {
      logger.error("kafka_consumer_errordetails model is not initialized", "");
      return false;
    }

    const { type, key } = resolveKafkaIdentity(kafkaMessage);

    const record: Record<string, any> = {
      error,
      message,
      kafkaMessage: kafkaMessage ?? null,
      type,
      key,
      reprocess: false,
      retry: 0,
      createdAt: new Date(),
    };

    await model.insertOne(applyMeta(record, kafkaMeta));
    return true;
  } catch (dbError: any) {
    logger.error(
      `Failed to store Kafka error in DB: ${dbError?.stack || dbError}`,
      ""
    );
    return false;
  }
};

/** Records the failure in both audit tables. */
export const recordKafkaFailure = async ({
  type,
  key,
  reason,
  errorLabel,
  kafkaMessage,
  kafkaMeta,
}: {
  type: string;
  key: string;
  reason: string;
  errorLabel: string;
  kafkaMessage?: any;
  kafkaMeta?: KafkaMeta;
}): Promise<void> => {
await updateKafkaStatus({
  type,
  key,
  status: "FAILED",
  reason: errorLabel,
  errorMessage: reason,
  kafkaMessage,
  kafkaMeta,
});


  await saveKafkaError({
    error: errorLabel,
    message: reason,
    kafkaMessage,
    kafkaMeta,
  });
};
