#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from './app.js';
import http from 'http';
import { extractKafkaData } from './modules/kafka/consumer/kafkaConsumer.js';
import { processFailedKafkaMessages } from './modules/kafka/kafkaErrorMessageCronJob.js';
import cron from 'node-cron';
import logger from './utils/logger/index.js';

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.API_PORT);
app.set('port', port);
console.log('Port', port);
/**
 * Create HTTP server.
 */
const server = http.createServer(app);

const initializeMetrics = async (): Promise<void> => {
  const processEnv = (globalThis as any)?.process?.env ?? {};

  if (processEnv.METRICS_ENABLED === 'true') {
    const { setupMetrics } = await import('@observability/ts-prom-client-express-ts-lib');
    setupMetrics(app, { namespace: process.env.CLUSTER_PROJECT + '-sip-namespace' });
  } else {
    // Log Disabled
  }
};
const startServer = async (): Promise<void> => {
  await initializeMetrics();
  server.listen(port);
};

/**
 * Listen on provided port, on all network interfaces.
 */
console.log('listening');
app.get('/test', async (_req, res) => {
  try {
    console.log('API Called');
    res.status(200).json({ message: 'API IS CALLED' });
  } catch (err) {
    res.status(500).send('Error in API');
  }
});
startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: NodeJS.ErrnoException): void {
  console.log('Error', error);
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(): void {
  console.log('in onListening');
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + (addr?.port || 'unknown');

if (process.env.IS_KAFKA_TRIGGERED === "true") {
    logger.info('Kafka Trigger Enabled. Starting Kafka Consumers...', '');
    extractKafkaData();
} else {
    logger.warn('Kafka Trigger Disabled.', '');
}
cron.schedule('0 10 * * *', () => {
    processFailedKafkaMessages();
});
  console.log('Listening on ' + bind); // Use bind here
}

export default server;
