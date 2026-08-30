import { Kafka } from 'kafkajs';
import logger from '../../../utils/logger/index.js';

import { writeKafkaDataToDatabase } from '../dataExtract/dataExtract.js';
import sendEmail from '../emailUtils.js';
import errorMessageKafkaModel, {
  initializeerrorMessageKafkaModel,
} from '../kafkaErrorMessage_model.js';
import { initializeKafkaProcessingStatusModel } from '../kafkaProcessingStatus_model.js';
import {
  KafkaMeta,
  recordKafkaFailure,
  resolveKafkaIdentity,
  toUtcDate,
  updateKafkaStatus,
} from '../kafkaProcessingUtils.js';

let lastProcessedMessage: any = null;
export const kafkaConsumer = async (extractTopic: string = '') => {
  const KAFKA_GROUP_ID: string = process.env.KAFKA_GROUP_ID ?? 'dev';
  const brokers: string[] = process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS?.split(',')
    : [''];
    logger.info('====================================================', '');
logger.info('Kafka Consumer Initialization Started', '');
logger.info(`Topic           : ${extractTopic}`, '');
logger.info(`Group ID        : ${KAFKA_GROUP_ID}`, '');
logger.info(`Brokers         : ${brokers.join(', ')}`, '');
logger.info('====================================================', '');
logger.info('Creating Kafka client...', '');

  const kafka = new Kafka({
    brokers,
    ssl: true,
    sasl: {
      mechanism: 'plain',
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    },
  });
  logger.info('Kafka client created successfully.', '');

logger.info('Creating Kafka consumer...', '');

  const consumer = kafka.consumer({
    groupId: KAFKA_GROUP_ID,
  });
  logger.info('Kafka consumer created.', '');

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  try {
    logger.info('Connecting to Kafka brokers...', '');

    await consumer.connect();
    logger.info('Connected to Kafka successfully.', '');

    await consumer.subscribe({ topic: extractTopic, fromBeginning: true });
    logger.info(`Successfully subscribed to ${extractTopic}.`, '');

    await consumer
      .run({
        eachMessage: async ({
          topic,
          partition,
          message,
        }: {
          topic: string;
          partition: any;
          message: any;
        }) => {
                     let currentMessage: any;

 const kafkaMeta: KafkaMeta = {
  kafkaOffset:
    message?.offset != null ? String(message.offset) : undefined,
  kafkaUpdatedAt:
    toUtcDate(message?.timestamp) ?? undefined,
};

          try {
            logger.info(
              `Received message from topic: ${topic}, partition: ${partition}, offset: ${kafkaMeta.kafkaOffset}`,
              ''
            );


try {
  currentMessage = JSON.parse(message?.value?.toString());
  lastProcessedMessage = currentMessage;
} catch (parseError: any) {
              await recordKafkaFailure({
                type: 'UNKNOWN',
                key: `${topic}:${partition}:${kafkaMeta.kafkaOffset}`,
                reason: `Unable to parse Kafka message: ${parseError?.message || parseError}`,
                errorLabel: 'Invalid Kafka message payload',
                kafkaMessage: { raw: message?.value?.toString()?.slice(0, 2000) ?? null },
                kafkaMeta,
              });
              logger.error(
                `Unable to parse Kafka message at ${topic}:${partition}:${kafkaMeta.kafkaOffset}: ${parseError?.stack || parseError}`,
                ''
              );
              return;
            }

            const correlationId = message?.headers?.['x-consumer-correlation-id']?.toString() ?? '';
            logger.debug(
              `kafkaConsumer:: Kafka Recieved Message: ${JSON.stringify(currentMessage)} correlationId: ${correlationId}`,
              ''
            );

            const { type, key } = resolveKafkaIdentity(currentMessage);

            await updateKafkaStatus({
              type,
              key,
              status: 'RECEIVED',
              reason: 'Message received from Kafka',
              kafkaMessage: currentMessage,
              kafkaMeta,
            });

            await writeKafkaDataToDatabase(topic, currentMessage);
          } catch (error: any) {
            // Throwing here would stall the partition, so the failure is recorded instead.
            const { type, key } = resolveKafkaIdentity(currentMessage);

            await recordKafkaFailure({
              type,
              key,
              reason: `${error?.stack || error}`,
              errorLabel: 'Error in consumer.run',
              kafkaMessage: currentMessage,
              kafkaMeta,
            });

            logger.error(`error in consumer.run: ${error?.stack || error}`, '');
            await sendEmail(`error in consumer.run: ${error?.stack || error}`);
          }
        },
      })
      .catch(async (e) => {
        logger.error(`kafkaConsumer: Error: ${e}`, '');
        if (consumer) {
          try {
            await consumer.disconnect();
          } catch (disconnectError) {
            try {
              const errorModel = errorMessageKafkaModel();

              await errorModel.insertOne({
                error: 'Error disconnecting Kafka consumer',

                message: `${disconnectError?.stack || disconnectError}`,
                kafkaMessage:lastProcessedMessage,

                reprocess: false,

                retry: 0,

                createdAt: new Date(),
              });
            } catch (dbError) {
              logger.error(`Failed to store Kafka error in DB: ${dbError?.stack || dbError}`, '');
            }
            // Send an email notification about the error
            await sendEmail(
              `Error disconnecting Kafka consumer: ${disconnectError?.stack || disconnectError}`
            );
            logger.error(
              `Error disconnecting Kafka consumer: ${disconnectError?.stack || disconnectError}`,
              ''
            );
          }
        }
        process.exit(1);
      });
  } catch (error) {
    try {
      const errorModel = errorMessageKafkaModel();

      await errorModel.insertOne({
        error: 'Error in consumer',

        message: `${error?.stack || error}`,
        kafkaMessage:lastProcessedMessage,

        reprocess: false,

        retry: 0,

        createdAt: new Date(),
      });
    } catch (dbError) {
      logger.error(`Failed to store Kafka error in DB: ${dbError?.stack || dbError}`, '');
    }
    // Send an email notification about the error
    await sendEmail(`error in consumer ${error?.stack || error}`);
    logger.error(`error in consumer ${error?.stack || error}`, '');
  }
};

export const extractKafkaData = async () => {
  try {
    // Initialize the Kafka error model before consuming messages

    await initializeerrorMessageKafkaModel();
    await initializeKafkaProcessingStatusModel();
    const topics = {
      sipComposition: process.env.FML_CONSUMER_QUERY_SIP_COMPOSITION,
    };

    const topicValues = Object.values(topics);
    const topicKeys = Object.keys(topics);

    if (topicValues.length > 0) {
      // Using Promise.all to handle all asynchronous kafkaConsumers properly
      await Promise.all(
        topicValues.map(async (topic, index) => {
          if (topic && topic !== 'undefined') {
            try {
              await kafkaConsumer(topic); // Await for kafkaConsumer to handle errors
            } catch (consumerError) {
              // Insert error details into MongoDB

              try {
                const errorModel = errorMessageKafkaModel();

                await errorModel.insertOne({
                  error: 'Error while consuming Kafka topic',

                  message: `${topicKeys[index]}: ${consumerError?.stack || consumerError}`,
                  kafkaMessage:lastProcessedMessage,

                  reprocess: false,

                  retry: 0,

                  createdAt: new Date(),
                });
              } catch (dbError) {
                logger.error(`Failed to store Kafka error in DB: ${dbError?.stack || dbError}`, '');
              }
              // Send an email notification about the error
              await sendEmail(
                `Error while consuming Kafka topic ${topicKeys[index]}: ${
                  consumerError?.stack || consumerError
                }`
              );
              logger.error(
                `Error while consuming Kafka topic ${topicKeys[index]}: ${
                  consumerError?.stack || consumerError
                }`,
                ''
              );
            }
          } else {
            logger.warn(`Invalid topic name or undefined: ${topicKeys[index]}`, '');
          }
        })
      );
    } else {
      logger.warn(`No topics found for extraction: ${JSON.stringify(topicValues)}`, '');
    }
  } catch (error) {
    try {
      const errorModel = errorMessageKafkaModel();

      await errorModel.insertOne({
        error: 'Error in extractKafkaData',

        message: `${error?.stack || error}`,
        kafkaMessage:lastProcessedMessage,

        reprocess: false,

        retry: 0,

        createdAt: new Date(),
      });
    } catch (dbError) {
      logger.error(`Failed to store Kafka error in DB: ${dbError?.stack || dbError}`, '');
    }
    // Send an email notification about the error
    await sendEmail(`Error in extractKafkaData: ${error?.stack || error}`);
    // Catch any unexpected errors during the extraction process
    logger.error(`Error in extractKafkaData: ${error?.stack || error}`, '');
  }
};
