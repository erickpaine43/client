/**
 * Logging Service
 *
 * Provides request/response logging functionality for API operations
 */

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

export class LoggingService {
  private static instance: LoggingService;

  private constructor() {}

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  logRequest(method: string, url: string, userId?: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'info',
      message: `Request: ${method} ${url}`,
      metadata: {
        userId,
        ...metadata,
      },
    };
    console.log(JSON.stringify(entry));
  }

  logResponse(statusCode: number, responseTime: number, userId?: string, metadata?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'info',
      message: `Response: ${statusCode} (${responseTime}ms)`,
      metadata: {
        userId,
        responseTime,
        ...metadata,
      },
    };
    console.log(JSON.stringify(entry));
  }

  logError(error: Error, context?: string, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'error',
      message: `Error: ${error.message}`,
      metadata: {
        context,
        userId,
        stack: error.stack,
      },
    };
    console.error(JSON.stringify(entry));
  }
}

export const getLoggingService = (): LoggingService => {
  return LoggingService.getInstance();
};
