import { logger } from './logger-config.js';

class Log {
  static error(stepName: string, message: string, eventId?: string) {
    logger.error(message, {
      stepName,
      eventId,
    });
  }

  static warn(stepName: string, message: string, eventId?: string) {
    logger.warn(message, {
      stepName,
      eventId,
    });
  }

  static info(stepName: string, message: string, eventId?: string) {
    logger.info(message, {
      stepName,
      eventId,
    });
  }

  static debug(stepName: string, message: string, eventId?: string) {
    logger.debug(message, {
      stepName,
      eventId,
    });
  }

  static http(stepName: string, message: string, eventId?: string) {
    logger.http(message, {
      stepName,
      eventId,
    });
  }

  static transaction(req) {
    const message = {
      headers: req.headers,
      httpVersion: req.httpVersion,
      method: req.method,
      originalUrl: req.originalUrl,
      url: req.url,
      query: req.query,
      params: req.params,
      body: req.body,
    };
    logger.http('Incoming request', message);
  }
}
export default Log;