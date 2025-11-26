/**
 * Request/Response Logging Middleware
 * Comprehensive logging for debugging and monitoring
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "csrf",
  "sessionId",
  "session_id",
  "creditCard",
  "credit_card",
  "cvv",
  "ssn",
];

/**
 * Paths to skip logging (too noisy)
 */
const SKIP_PATHS = [
  "/health",
  "/health/live",
  "/health/ready",
  "/health/detailed",
  "/health/redis",
  "/favicon.ico",
  "/robots.txt",
];

/**
 * Redact sensitive information from object
 */
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field.toLowerCase())
    );

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Get safe request data for logging
 */
function getSafeRequestData(req: Request) {
  return {
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    query: redactSensitiveData(req.query),
    body: redactSensitiveData(req.body),
    headers: redactSensitiveData({
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
      "accept": req.headers.accept,
      "accept-language": req.headers["accept-language"],
      "referer": req.headers.referer,
    }),
    ip: req.ip,
    userId: (req as any).user?.id,
    userEmail: (req as any).user?.email,
  };
}

/**
 * Get safe response data for logging
 */
function getSafeResponseData(res: Response, body?: any) {
  return {
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    headers: {
      "content-type": res.getHeader("content-type"),
      "content-length": res.getHeader("content-length"),
    },
    body: body ? redactSensitiveData(body) : undefined,
  };
}

/**
 * Should skip logging for this path
 */
function shouldSkipLogging(path: string): boolean {
  return SKIP_PATHS.some((skipPath) => path.startsWith(skipPath));
}

/**
 * Request logging middleware
 * Logs incoming requests with full context
 */
export function requestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip logging for certain paths
  if (shouldSkipLogging(req.path)) {
    return next();
  }

  const requestId = getRequestId(req);
  const startTime = Date.now();

  // Log incoming request
  logger.info("Incoming request", {
    context: "RequestLogger",
    requestId,
    request: getSafeRequestData(req),
  });

  // Capture original res.json to log response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  // Override res.json to capture response body
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    // Log response
    const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[logLevel]("Outgoing response", {
      context: "ResponseLogger",
      requestId,
      duration: `${duration}ms`,
      response: getSafeResponseData(res, body),
    });

    return originalJson(body);
  };

  // Override res.send to capture non-JSON responses
  res.send = function (body: any) {
    const duration = Date.now() - startTime;

    // Only log if not already logged by res.json
    if (!res.headersSent || res.getHeader("content-type") !== "application/json") {
      const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      logger[logLevel]("Outgoing response", {
        context: "ResponseLogger",
        requestId,
        duration: `${duration}ms`,
        response: getSafeResponseData(res),
      });
    }

    return originalSend(body);
  };

  next();
}

/**
 * Error response logging middleware
 * Specifically logs error responses with additional context
 */
export function errorResponseLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = getRequestId(req);

  logger.error("Error response", {
    context: "ErrorLogger",
    requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    request: getSafeRequestData(req),
  });

  next(err);
}

/**
 * Slow request logging middleware
 * Warns about requests that take too long
 */
export function slowRequestLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (shouldSkipLogging(req.path)) {
    return next();
  }

  const requestId = getRequestId(req);
  const startTime = Date.now();

  // Check duration on response finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Log slow requests (>5 seconds)
    if (duration > 5000) {
      logger.warn("Slow request detected", {
        context: "SlowRequestLogger",
        requestId,
        duration: `${duration}ms`,
        request: {
          method: req.method,
          path: req.path,
          url: req.originalUrl,
        },
      });
    }
  });

  next();
}

/**
 * Large payload logging middleware
 * Warns about requests/responses with large payloads
 */
export function largePayloadLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (shouldSkipLogging(req.path)) {
    return next();
  }

  const requestId = getRequestId(req);

  // Check request body size
  if (req.body) {
    const bodySize = JSON.stringify(req.body).length;
    if (bodySize > 100000) {
      // >100KB
      logger.warn("Large request body detected", {
        context: "PayloadLogger",
        requestId,
        size: `${Math.round(bodySize / 1024)}KB`,
        path: req.path,
      });
    }
  }

  // Override res.json to check response size
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const bodySize = JSON.stringify(body).length;
    if (bodySize > 100000) {
      // >100KB
      logger.warn("Large response body detected", {
        context: "PayloadLogger",
        requestId,
        size: `${Math.round(bodySize / 1024)}KB`,
        path: req.path,
      });
    }

    return originalJson(body);
  };

  next();
}

/**
 * Log all registered sensitive fields
 */
export function getSensitiveFields(): string[] {
  return [...SENSITIVE_FIELDS];
}

/**
 * Add custom sensitive field to redact
 */
export function addSensitiveField(field: string): void {
  if (!SENSITIVE_FIELDS.includes(field)) {
    SENSITIVE_FIELDS.push(field);
    logger.info("Added sensitive field to logging redaction", {
      context: "RequestLogger",
      field,
    });
  }
}

/**
 * Log middleware configuration on startup
 */
export function logMiddlewareConfig(): void {
  logger.info("Request/Response logging middleware configured", {
    context: "RequestLogger",
    config: {
      sensitiveFields: SENSITIVE_FIELDS.length,
      skipPaths: SKIP_PATHS,
      slowRequestThreshold: "5000ms",
      largePayloadThreshold: "100KB",
    },
  });
}
