/**
 * Request Tracking Middleware
 * Adds unique request ID to all requests for tracking and debugging
 */

import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return randomUUID();
}

/**
 * Request ID middleware
 * Adds unique ID to each request and includes it in logs
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get request ID from header or generate new one
  const requestId =
    (req.headers["x-request-id"] as string) ||
    (req.headers["x-correlation-id"] as string) ||
    generateRequestId();

  // Store request ID and start time
  req.requestId = requestId;
  req.startTime = Date.now();

  // Add request ID to response header
  res.setHeader("X-Request-ID", requestId);

  // Log request start
  logger.info("Request started", {
    context: "Request",
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - (req.startTime || Date.now());
    
    logger.info("Request completed", {
      context: "Request",
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      contentLength: res.getHeader("content-length"),
    });
  });

  next();
}

/**
 * Get request ID from request object
 */
export function getRequestId(req: Request): string {
  return req.requestId || "unknown";
}

/**
 * Performance tracking middleware
 * Logs slow requests and performance metrics
 */
export function performanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = process.hrtime.bigint();
  const originalWriteHead: Response["writeHead"] = res.writeHead.bind(res);
  let responseTimeHeaderSet = false;

  const calculateDurationMs = () => Number(process.hrtime.bigint() - start) / 1_000_000;

  const ensureResponseTimeHeader = (durationMs: number) => {
    if (responseTimeHeaderSet) {
      return;
    }

    try {
      res.setHeader("X-Response-Time", `${durationMs.toFixed(2)}ms`);
      responseTimeHeaderSet = true;
    } catch (error) {
      logger.warn("Failed to set response time header", {
        context: "Performance",
        requestId: getRequestId(req),
        method: req.method,
        path: req.originalUrl,
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  // Inject header right before the response is committed
  res.writeHead = function writeHeadPatched(...args: Parameters<typeof res.writeHead>) {
    if (!responseTimeHeaderSet) {
      const durationMs = calculateDurationMs();
      ensureResponseTimeHeader(durationMs);
    }

    return originalWriteHead(...args);
  } as Response["writeHead"];

  res.on("finish", () => {
    const duration = calculateDurationMs();

    if (!responseTimeHeaderSet && !res.headersSent) {
      ensureResponseTimeHeader(duration);
    }

    // Log slow requests (>2 seconds)
    if (duration > 2000) {
      logger.warn("Slow request detected", {
        context: "Performance",
        requestId: getRequestId(req),
        method: req.method,
        path: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        status: res.statusCode,
      });
    }

    // Log very slow requests (>5 seconds) as error
    if (duration > 5000) {
      logger.error("Very slow request detected", {
        context: "Performance",
        requestId: getRequestId(req),
        method: req.method,
        path: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        status: res.statusCode,
      });
    }

    // Restore original writeHead to avoid side effects in long-lived responses
    res.writeHead = originalWriteHead;
  });

  next();
}

/**
 * Error context middleware
 * Adds request context to errors for better debugging
 */
export function errorContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Enhance error with request context
  res.locals.getErrorContext = () => ({
    requestId: getRequestId(req),
    method: req.method,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
    },
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  next();
}

export default {
  requestIdMiddleware,
  performanceMiddleware,
  errorContextMiddleware,
  getRequestId,
};
