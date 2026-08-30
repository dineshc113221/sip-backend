import errorMessageKafkaModel, { initializeerrorMessageKafkaModel } from './kafkaErrorMessage_model.js';

import logger from '../../utils/logger/index.js';
import { initializeChemicalKafkaController, initializeKafkaController } from './spiConsumer.js';

// After 2 failed retries a record stays with reprocess=false and is never picked up again.
const MAX_RETRIES = 2;

export const processFailedKafkaMessages = async () => {

    try {
   
     await initializeerrorMessageKafkaModel();
   
     const errorModel = errorMessageKafkaModel();
   
   
   
     // Fetch messages with reprocess = false and retry < 2
   
     const messages = await errorModel.find({ reprocess: false, retry: { $lt: MAX_RETRIES } }).toArray();

     logger.info(`Cron job picked up ${messages.length} failed Kafka message(s) for retry`, '');
   
   
   
     for (const message of messages) {
   
      try {
   
       const recievedMessage = message?.kafkaMessage;
   
   
   
       if (!recievedMessage) {
   
        logger.warn(`Skipping message due to missing kafkaMessage: ${JSON.stringify(message)}`,'');

        // Without the original payload it can never be replayed, so retire it.
        await errorModel.updateOne(
          { _id: message._id },
          { $set: { retry: MAX_RETRIES, unprocessable: true, lastRetryAt: new Date() } }
        );
   
        continue;
   
       }
   
   
   
       let kafkaControllerCall;
   
   
   
       // Determine the appropriate Kafka controller based on objClass
   
       if (recievedMessage.objClass === "CON") {
   
        kafkaControllerCall = await initializeChemicalKafkaController();
   
       } else {
   
        kafkaControllerCall = await initializeKafkaController();
   
       }
   
   
   
       if (!kafkaControllerCall) {
   
        throw new Error('Kafka controller initialization failed.');
   
       }
   
   
   
       const kafkaResponse = await kafkaControllerCall.writeKafkaToDetails(recievedMessage);
   
   
   
       if (kafkaResponse?.success === true) {
   
        await errorModel.updateOne({ _id: message._id }, { $set: { reprocess: true, lastRetryAt: new Date() } });
   
        logger.info(`Successfully reprocessed message: ${recievedMessage?.keycode || recievedMessage?.objectKey}`,'');
   
       } else {
   
        await errorModel.updateOne({ _id: message._id }, { $inc: { retry: 1 }, $set: { lastRetryAt: new Date(), lastError: kafkaResponse?.message ?? 'No response from controller' } });
   
        const attempt = (message?.retry ?? 0) + 1;
        logger.warn(`Failed to reprocess message: ${recievedMessage?.keycode || recievedMessage?.objectKey}, retry ${attempt}/${MAX_RETRIES}`,'');
   
        if (attempt >= MAX_RETRIES) {
          logger.error(`Message permanently failed after ${MAX_RETRIES} retries: ${recievedMessage?.keycode || recievedMessage?.objectKey}`,'');
        }
   
       }
   
      } catch (error) {
   
       await errorModel.updateOne({ _id: message._id }, { $inc: { retry: 1 }, $set: { lastRetryAt: new Date(), lastError: `${error?.message || error}` } });
   
       logger.error(`Error processing message: ${message?.kafkaMessage?.keycode}, Error: ${error?.message}`,'');
   
      }
   
     }
   
    } catch (error) {
   
     logger.error(`Cron job error: ${error?.message}`,'');
   
    }
   
   };