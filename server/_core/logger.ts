import winston from "winston";

interface LogMeta extends Record<string, unknown> {
  context?: string;
}

const silent = process.env.LOG_SILENT === 'true';
const alertWebhookUrl = process.env.ALERT_WEBHOOK_URL;

async function sendAlertToWebhook(message: string, meta?: Record<string, unknown>) {
  if (!alertWebhookUrl) return;
  try {
    await fetch(alertWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, meta, ts: new Date().toISOString() }),
    });
  } catch {
    // Avoid throwing during logging
  }
}

const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      silent,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          return `${timestamp} [${level}] ${context ? `[${context}] ` : ""}${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ""
          }`;
        })
      ),
    }),
  ],
});

class Logger {
  debug(message: string, meta?: LogMeta) {
    winstonLogger.debug(message, meta);
  }

  info(message: string, meta?: LogMeta) {
    winstonLogger.info(message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    winstonLogger.warn(message, meta);
  }

  error(message: string, meta?: LogMeta) {
    winstonLogger.error(message, meta);
  }

  fatal(message: string, meta?: LogMeta) {
    winstonLogger.log("error", message, { ...meta, fatal: true });
    void sendAlertToWebhook(message, meta);
  }

  logError(error: Error, context?: string, meta?: LogMeta) {
    this.error(error.message, {
      context,
      stack: error.stack,
      name: error.name,
      ...meta,
    });
  }
}

export const logger = new Logger();

// Helper specifically for email provider lifecycle
export function logEmailProviderEvent(event: {
  stage: "init" | "resend" | "smtp" | "final";
  provider?: "resend" | "smtp" | "none";
  success?: boolean;
  message?: string;
  error?: string;
}) {
  logger.info("email-provider", event);
}
