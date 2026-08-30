import oracledb from 'oracledb';
import logger from '../../../utils/logger/index.js';
import gaiaModel, { initializeGaiaModel } from '../gaia.model.js';
import sendEmail from '../emailUtils.js';

const ORACLE_USER = process.env.API_ORACLE_USER;
const ORACLE_PASSWORD = process.env.API_ORACLE_PASSWORD;
const ORACLE_CONNECT_STRING = process.env.API_ORACLE_CONNECT_STRING;
// Define a type for the row structure
type GaiaRow = [string | null, string | null, string | null]; 

class GaiaController {
  private collection;
  constructor(collection) {
    this.collection = collection;
  }

  // Helper method for safely closing Oracle connection
  private async closeOracleConnection(connection: oracledb.Connection) {
    try {
      await connection.close();
      logger.info('GaiaController', 'Oracle DB connection closed successfully.');
    } catch (error) {
      logger.error('GaiaController', `Error closing Oracle DB connection: ${error.message}`, error);
      await sendEmail(`Error closing Oracle DB connection: ${error.message}`);
    }
  }

  // Method to write Gaia data to MongoDB
  writeGaiaDataToDatabase = async () => {
    let oracleConnection;

    try {
      // Connect to Oracle DB
      oracleConnection = await oracledb.getConnection({
        user: ORACLE_USER,
        password: ORACLE_PASSWORD,
        connectString: ORACLE_CONNECT_STRING,
      });
      logger.info('GaiaController', 'Connected to Oracle DB successfully.');

      // Fetch data from Oracle DB
      const query = `
      SELECT m.materialcode, mp.VALUE AS GaiaScore, m.DESCRIPTION
      FROM CONC_EU_PROD_APPDB_MASTERDATA.materials m
      INNER JOIN CONC_EU_PROD_APPDB_MASTERDATA.materialproperties mp
      ON mp.materialid = m.id
      WHERE mp.propertycode = 'ENV_SCORE_ENTERED'
    `;
      const result = await oracleConnection.execute(query);
      if (!result.rows || result.rows.length === 0) {
        logger.warn('GaiaController', 'No data found in Oracle DB.');
        return;
      }

      // Map the rows to the desired format for bulk operations
      const bulkOperations = result.rows.map((row: GaiaRow) => ({
        updateOne: {
          filter: { materialCode: row[0] }, // Match documents by materialCode
          update: {
            $set: {
              materialCode: row[0] || null,
              gaiaScore: row[1] || null,
              materialDescription: row[2] || null,
            },
          },
          upsert: true, // Insert document if it does not exist
        },
      }));

      // Execute bulkWrite to perform upsert operations
      await this.collection.bulkWrite(bulkOperations);

      // Log processed document counts
      logger.info(
        'GaiaController',
        `Successfully processed ${result.rows.length} documents in MongoDB.`
      );
    } catch (error) {
      logger.error(
        'GaiaController',
        `Error during data extraction or insertion from Oracle DB to MongoDB: ${error.message}`,
        error
      );
      await sendEmail(`Error during data extraction or insertion: ${error.message}`);
    } finally {
      // Ensure Oracle connection is closed
      if (oracleConnection) {
        await this.closeOracleConnection(oracleConnection);
      }
    }
  };
}

// Initialize MongoDB model and start Gaia data extraction
export const extractGaiaData = async () => {
  try {
    // Initialize MongoDB model
    await initializeGaiaModel();
    logger.info('GaiaController', 'Initialized MongoDB model successfully.');
    const gaiaModels = gaiaModel();
    const controller = new GaiaController(gaiaModels);

    // Start writing Gaia data to the database
    await controller.writeGaiaDataToDatabase();
    logger.info('GaiaController', 'Gaia data extraction and insertion completed.');
  } catch (error) {
    logger.error(
      'GaiaController',
      `Failed to initialize Gaia data extraction or write to MongoDB: ${error.message}`,
      error
    );
    await sendEmail(`Failed to initialize Gaia data extraction: ${error.message}`);
  }
};
