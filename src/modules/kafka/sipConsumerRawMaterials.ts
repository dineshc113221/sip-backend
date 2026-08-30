import { Router } from 'express';
import logger from '../../utils/logger/index.js';
import { initializeChemicalKafkaController, initializeKafkaController } from './spiConsumer.js';
import { ICompositionDetailsModel } from '../../interfaces/CompositionDetails.js';
import sendEmail from './emailUtils.js';
import errorMessageKafkaModel from './kafkaErrorMessage_model.js';
const ConsumerDataUpdateRouter = async (): Promise<Router> => {
  const router = Router();

  router.post('/updateConsumerData', async (req, res) => {
    try {
      const recievedMessage: ICompositionDetailsModel = req.body;

      const objClass = recievedMessage?.objClass;
      if (!objClass || !['RAW', 'CON', 'FML', 'TAB'].includes(objClass)) {
        const errorMessage = `Unsupported objClass: ${objClass}. Only RAW, CON, FML and TAB are processed.`;
        logger.error(errorMessage, '');

        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }

 let kafkaControllerCall;

const hasValidKey =
  ((objClass === 'RAW' || objClass === 'CON') &&
    recievedMessage?.keycode) ||
  ((objClass === 'FML' || objClass === 'TAB') &&
    recievedMessage?.objectKey);
    
if (hasValidKey) {
        // Determine which controller to initialize based on the objClass
        if (recievedMessage.objClass === "CON") {
          kafkaControllerCall = await initializeChemicalKafkaController();
        } else {
          kafkaControllerCall = await initializeKafkaController();
        }

        // Ensure the controller is initialized
        if (!kafkaControllerCall) {
          throw new Error('Kafka controller initialization failed.');
        }

        const kafkaResponse = await kafkaControllerCall.writeKafkaToDetails(recievedMessage);

        // Log the response for debugging
        logger.info(`Kafka API response for ${recievedMessage?.objClass}: ${JSON.stringify(kafkaResponse)}`, "");

        // Handle all response scenarios - spiConsumer already updated status tables
        if (!kafkaResponse) {
          // Undefined response
          const errorMsg = `Undefined response from Kafka controller for HTTP API call. Message: ${recievedMessage?.keycode || recievedMessage?.objectKey}`;
          logger.error(errorMsg, "");

          return res.status(500).json({
            success: false,
            message: errorMsg,
          });
        } else if (kafkaResponse?.success === true) {
          // Success - spiConsumer already recorded SUCCESS status
          return res.status(200).json({
            success: true,
            message: kafkaResponse.message || 'Details updated successfully',
          });
        } else if (kafkaResponse?.success === false) {
          // Failure - spiConsumer already recorded FAILED status
          return res.status(500).json({
            success: false,
            message: kafkaResponse.message || 'An error occurred while processing the request',
          });
        } else {
          // Invalid response structure
          const errorMsg = `Invalid response structure - success property missing. Response: ${JSON.stringify(kafkaResponse)}`;
          logger.error(errorMsg, "");

          return res.status(500).json({
            success: false,
            message: errorMsg,
          });
        }
      }
      else {
       const errorMessage =
  'Missing required business key. RAW/CON require keycode. FML/TAB require objectKey.';

logger.error(errorMessage, '');

return res.status(400).json({
  success: false,
  message: errorMessage,
});
      }
    } catch (error) {
      const errorMessage = `Error updating API details: ${error?.message || error}`;
      logger.error(errorMessage, '');

      try {
      const errorModel = errorMessageKafkaModel();

if (errorModel) {
  await errorModel.insertOne({
    error: 'Error in HTTP API endpoint /updateConsumerData',
    message: `${error?.message || error}`,
    kafkaMessage: req.body,
    reprocess: false,
    retry: 0,
    createdAt: new Date(),
  });
}
      } catch (dbError: any) {
  logger.error(
    `Failed to store Kafka error in DB: ${dbError?.stack || dbError}`,
    ''
  );
}
      // Send email notification with error details
      await sendEmail(errorMessage);

      return res.status(500).json({
        success: false,
        message: 'Error updating details',
        error: error?.message || error,
      });
    }
  });

  return router;
};

export default ConsumerDataUpdateRouter;