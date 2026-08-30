import dotenv from "dotenv";

dotenv.config();

interface IEnvConfig {
  NODE_ENV: string;
  HOSTNAME: string | undefined;
  PORT: number;
  LOG_LEVEL: string;
  DB_CLIENT: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: number | undefined;
  DB_USER: string | undefined;
  DB_PASSWORD: string | undefined;
  DB_NAME: string | undefined;
  AUDIT_TABLE: string | undefined;
  DB_ROOT_CERT: string | undefined;
  DB_QUERY_LOGGING: boolean;
  KAFKA_CLIENT_ID: string | undefined;
  KAFKA_BROKERS: string;
  KAFKA_SESSION_TIMEOUT: number;
  KAFKA_CONSUMER_TOPIC: string;
  KAFKA_CONSUMER_FROM_BEGINNING: boolean;
  KAFKA_CONSUMER_GROUP_ID: string;
  KAFKA_PRODUCER_ACKS: number;
  KAFKA_PRODUCER_TOPIC: string;
  DISTRIBUTION: string;
  FORMULA_EOL: string;
  RAW_MATERIAL: string;
  PACK_PRODUCTION: string;
  PACKAGING_EOL: string;
  USE_PHASE: string;
  MANUFACTURING: string;
  TOTAL_LCA: string;
  PRECAL_RAW: string;
  RENEWABLE_FEEDSTOCK_ORIGIN: string;
  WATCHLIST: string;
  METRICS_ENABLED: string;
  LAMBDA_Packaging_Production_1: string;
  LAMBDA_Distribution_2: string;
  LAMBDA_Packaging_EOL_3: string;
}

const getConfig = (): IEnvConfig => ({
  NODE_ENV: process.env.NODE_ENV || "production",
  HOSTNAME: process.env.HOSTNAME,
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  LOG_LEVEL: process.env.LOG_LEVEL
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info",
  DB_CLIENT: process.env.DB_CLIENT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  AUDIT_TABLE:process.env.AUDIT_TABLE,
  DB_ROOT_CERT: process.env.DB_ROOT_CERT,
  DB_QUERY_LOGGING: process.env.DB_QUERY_LOGGING === "true" || false,
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "localhost:9092",
  KAFKA_SESSION_TIMEOUT: process.env.KAFKA_SESSION_TIMEOUT
    ? parseInt(process.env.KAFKA_SESSION_TIMEOUT, 10)
    : 30000,
  KAFKA_CONSUMER_TOPIC: process.env.KAFKA_CONSUMER_TOPIC || "test",
  KAFKA_CONSUMER_FROM_BEGINNING:
    process.env.KAFKA_CONSUMER_FROM_BEGINNING === "true" || false,
  KAFKA_CONSUMER_GROUP_ID:
    process.env.KAFKA_CONSUMER_GROUP_ID || "consumer-group",
  KAFKA_PRODUCER_ACKS: process.env.KAFKA_PRODUCER_ACKS
    ? parseInt(process.env.KAFKA_PRODUCER_ACKS, 10)
    : 1,
  KAFKA_PRODUCER_TOPIC: process.env.KAFKA_PRODUCER_TOPIC || "test",
  DISTRIBUTION: process.env.DISTRIBUTION,
  FORMULA_EOL: process.env.FORMULA_EOL,
  RAW_MATERIAL: process.env.RAW_MATERIAL,
  PACK_PRODUCTION: process.env.PACK_PRODUCTION,
  PACKAGING_EOL: process.env.PACKAGING_EOL,
  USE_PHASE: process.env.USE_PHASE,
  MANUFACTURING: process.env.MANUFACTURING,
  TOTAL_LCA: process.env.TOTAL_LCA,
  PRECAL_RAW: process.env.PRECAL_RAW,
  RENEWABLE_FEEDSTOCK_ORIGIN: process.env.RENEWABLE_FEEDSTOCK_ORIGIN,
  WATCHLIST: process.env.WATCHLIST,
  METRICS_ENABLED: process.env.METRICS_ENABLED,
  LAMBDA_Packaging_Production_1: process.env.LAMBDA_Packaging_Production_1,
  LAMBDA_Distribution_2: process.env.LAMBDA_Distribution_2,
  LAMBDA_Packaging_EOL_3: process.env.LAMBDA_Packaging_EOL_3,
});

export default getConfig();
