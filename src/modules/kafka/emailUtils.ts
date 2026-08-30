import { initializeEmailController } from '../email/email.controller.js'; // Adjust the path to your EmailController file
import { config } from '../../data/config.js'; // Adjust the path to your config file

/**
 * Sends a failure email with the provided data.
 *
 * @param data - The error data or message to be included in the email.
 * @param heading - The subject of the email.
 * @param user - The recipient's information containing the email address.
 * @param formatted - If true, the data is treated as preformatted HTML. Defaults to false.
 */
export const sendEmail = async (

  data: object | string,
 
  formatted: boolean = false
 
 ): Promise<void> => {
 
  const emailBody =
 
   'There is an error occurred in the execution of the Kafka Consumer. Check the following stringified error message for a technical preview of the error.</br>';
 
  try {
 
   const emailController = await initializeEmailController();
 
 
 
   let header = 'Kafka Consumer Error';
 
   let body = formatted ? (data as string) : emailBody + JSON.stringify(data);
 
   const recipients = [config.TEST_EMAIL]; // Array of recipients
 
 
 
   // Check if the data contains "Environmental score"
 
   if (typeof data === 'string' && data.includes('Environmental score')) {
 
    const conNumber = data.split(':')[1]?.trim(); // Extract #connumber
 
    const currentDateTime = new Date().toLocaleString(); // Insert Date and Time
 
    header = `Gaia Score Blank or Null in PDRM System for con - ${conNumber}`;
 
    body = `
 
     Dear Support Team, <br/><br/>
 
 
 
     We encountered an issue where the Gaia score was either blank or null.<br/><br/>
 
 
 
     Details of the data pull:<br/>
 
     - Date and Time: ${currentDateTime}<br/>
 
     - System: PDRM<br/>
 
     - Issue: Gaia score blank or null<br/>
 
     - Chemical: ${conNumber}<br/><br/>
 
 
 
     Thanks.
 
    `;
 
   }
 
   if (typeof data === 'string' && data.includes('New constituent added')) {
 
    const conNumber = data.split(':')[1]?.trim(); 
 
    const currentDateTime = new Date().toLocaleString(); 
    header = `New constituent has been added - ${conNumber}`;
    body = `
      Dear Support Team, <br/><br/>
  
      A new constituent has been successfully added.<br/><br/>
  
      Details of the new constituent:<br/>
      - Chemical: ${conNumber}<br/>
      - Date and Time: ${currentDateTime}<br/><br/>
      Thanks.
    `;
  
   }
 
   // Send the email
 
   await emailController.send(recipients, config.SUPPORT_EMAIL, header, body);
 
  } catch (error) {
 
   console.error('Failed to send error email', error);
 
   throw error;
 
  }
 
 };
 
 export default sendEmail;
 