/**
 * Professional Logger Service for Production
 * Replaces console.log with proper logging levels and formatting
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private readonly isDevelopment: boolean;
  private readonly minLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
    }[level];

    let formatted = `[${timestamp}] ${emoji} ${level.toUpperCase()}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, context);
      console.debug(formatted);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, context);
      console.info(formatted);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, context);
      console.warn(formatted);
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorName: error.name,
          errorMessage: error.message,
          stack: error.stack,
        }),
      };
      
      const formatted = this.formatMessage(LogLevel.ERROR, message, errorContext);
      console.error(formatted);
    }
  }

  // Special methods for AI operations
  aiOperation(operation: string, status: 'start' | 'success' | 'error', details?: LogContext): void {
    const statusEmojis = { start: '🚀', success: '✅', error: '❌' };
    const emoji = statusEmojis[status];
    const message = `${emoji} AI Operation: ${operation} - ${status}`;
    
    if (status === 'error') {
      this.error(message, details);
    } else {
      this.info(message, details);
    }
  }

  // Database operations logging
  dbOperation(operation: string, table: string, duration?: number): void {
    this.debug(`Database Operation: ${operation} on ${table}`, { 
      duration: duration ? `${duration}ms` : 'N/A' 
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, err?: unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
  aiOp: (op: string, status: 'start' | 'success' | 'error', details?: LogContext) => 
    logger.aiOperation(op, status, details),
  dbOp: (op: string, table: string, duration?: number) => 
    logger.dbOperation(op, table, duration),
};
