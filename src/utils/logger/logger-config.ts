// Required imports
import rTracer from 'cls-rtracer';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import os from 'os';
import fs from 'fs';
//import { fileURLToPath } from 'url';

const { combine, timestamp, printf, json, label } = format;

// Resolve __dirname for ES modules
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

// Define the log file directory
//const LOG_DIR = path.join(__dirname, '../../logs');
//updated by Alankar
const LOG_DIR = path.join(os.tmpdir(), 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Get the current date in YYYY-MM-DD format
const getLogFileName = () => {
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return path.join(LOG_DIR, `${currentDate}.log`);
};

// Log level configuration
const LOGLEVEL = process.env.LOG_LEVEL || 'http';

const loggerConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
};

const logLevels = Object.keys(loggerConfig.levels);

// Correlation ID format
const rTracerFormat = printf((info) => {
  const rid = rTracer.id();
  const logInfo = { ...info, correlationId: rid };
  return JSON.stringify(logInfo);
});

// File transport for logging into date-wise log files
const fileTransport = new transports.File({
  filename: getLogFileName(), // Dynamic filename based on date
  level: 'http', // Minimum log level for file
  format: combine(
    label({ label: process.env.npm_package_name || 'App' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(), // Store log messages as JSON
    printf(({ timestamp, level, message, label, ...meta }) => {
      return `[${timestamp}] [${label}] [${level.toUpperCase()}] ${message} ${JSON.stringify(
        meta
      )}`;
    })
  ),
});

// Create the logger
const logger = createLogger({
  levels: loggerConfig.levels,
  level: LOGLEVEL && logLevels.includes(LOGLEVEL?.toLowerCase()) ? LOGLEVEL.toLowerCase() : 'http',
  transports: [
    new transports.Console({
      format: format.combine(
        format.label({ label: process.env.npm_package_name }),
        format.timestamp(),
        format.json(),
        rTracerFormat
      ),
    }),
    fileTransport,
  ],
});

// Export the logger and rTracer
export { rTracer, logger };
