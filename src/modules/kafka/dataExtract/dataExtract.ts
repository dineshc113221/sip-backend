import {
  initializeChemicalKafkaController,
  initializeKafkaController
} from "../spiConsumer.js";
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const writeKafkaDataToDatabase = async (
  topic: string,
  recievedMessage: any
) => {
  let kafkaControllerCall;
  if (recievedMessage?.objClass === "CON") {
    kafkaControllerCall = await initializeChemicalKafkaController();
  } else {
    kafkaControllerCall = await initializeKafkaController();
  }
  if (kafkaControllerCall) {
    switch (topic) {
      case process.env.FML_CONSUMER_QUERY_SIP_COMPOSITION:        
        await kafkaControllerCall.writeKafkaToDetails(recievedMessage);
        break;
      default:
      // do nothing
    }
  }
};
