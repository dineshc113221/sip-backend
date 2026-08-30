import { config } from "../data/config.js";
import mongoose, { Connection } from "mongoose";

const connectDatabase = async (uri): Promise<Connection> => {
  try {
    console.log("Initializing database connection...");
    const connection = await mongoose.createConnection(uri).asPromise();
    console.log(connection);
    connection.on(
      "error",
      console.error.bind(console, "DB1 connection error:")
    );
    connection.once("open", () => {
      console.log("Connected to Database");
    });
    connection.once("close", () => {
      console.log("Database close");
    });
    console.log("Database connection initialized successfully.");
    return connection;
  } catch (error) {
    throw new Error(`Failed to connect to database: ${error} -  ${uri}`);
  }
};

export const connections = {
  mainDb: connectDatabase(config.MAIN_DB_URL),
};

export async function closeConnections(): Promise<void> {
  try {
    await Promise.all(
      [connections.mainDb].map((db) => db.then((conn) => conn.close()))
    );
    console.log("All MongoDB connections closed");
  } catch (error) {
    console.log("Error closing MongoDB connections:", error);
    return error;
  }
}
