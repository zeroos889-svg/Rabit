/**
 * Request Timeout Middleware
 * Prevents requests from hanging indefinitely with configurable timeouts
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Default timeout configurations (in milliseconds)
 */
export const DEFAULT_TIMEOUTS = {
  api: 30000, // 30 seconds for general API requests
  upload: 120000, // 2 minutes for file uploads
  webhook: 15000, // 15 seconds for webhooks
  health: 5000, // 5 seconds for health checks
  longRunning: 300000, // 5 minutes for reports/exports
} as const;

/**
 * Create timeout middleware with custom timeout
 */
export function createTimeoutMiddleware(timeoutMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = getRequestId(req);
    let timeoutId: NodeJS.Timeout | null = null;
    let timedOut = false;

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        timedOut = true;

        logger.error("Request timeout", {
          context: "Timeout",
          requestId,
          method: req.method,
          path: req.originalUrl,
          timeout: timeoutMs,
        });

        res.status(408).json({
          error: "Request Timeout",
          message: `Request exceeded ${timeoutMs}ms timeout`,
          requestId,
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    res.on("finish", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    // Clear timeout when response closes (connection lost)
    res.on("close", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (timedOut) {
        logger.warn("Response closed after timeout", {
          context: "Timeout",
          requestId,
          method: req.method,
          path: req.originalUrl,
        });
      }
    });

    next();
  };
}

/**
 * General API timeout middleware (30 seconds)
 */
export const apiTimeout = createTimeoutMiddleware(DEFAULT_TIMEOUTS.api);

/**
 * Upload timeout middleware (2 minutes)
 */
export const uploadTimeout = createTimeoutMiddleware(DEFAULT_TIMEOUTS.upload);

/**
 * Webhook timeout middleware (15 seconds)
 */
export const webhookTimeout = createTimeoutMiddleware(DEFAULT_TIMEOUTS.webhook);

/**
 * Health check timeout middleware (5 seconds)
 */
export const healthTimeout = createTimeoutMiddleware(DEFAULT_TIMEOUTS.health);

/**
 * Long-running operation timeout middleware (5 minutes)
 */
export const longRunningTimeout = createTimeoutMiddleware(DEFAULT_TIMEOUTS.longRunning);

/**
 * Smart timeout middleware - automatically selects timeout based on path
 */
export function smartTimeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const path = req.originalUrl;

  // Health checks
  if (path.startsWith("/health")) {
    return createTimeoutMiddleware(DEFAULT_TIMEOUTS.health)(req, res, next);
  }

  // Webhooks
  if (path.includes("/webhook")) {
    return createTimeoutMiddleware(DEFAULT_TIMEOUTS.webhook)(req, res, next);
  }

  // File uploads
  if (path.includes("/upload") || req.headers["content-type"]?.includes("multipart/form-data")) {
    return createTimeoutMiddleware(DEFAULT_TIMEOUTS.upload)(req, res, next);
  }

  // Reports and exports
  if (path.includes("/report") || path.includes("/export") || path.includes("/download")) {
    return createTimeoutMiddleware(DEFAULT_TIMEOUTS.longRunning)(req, res, next);
  }

  // Default API timeout
  return createTimeoutMiddleware(DEFAULT_TIMEOUTS.api)(req, res, next);
}

/**
 * Get timeout configuration for a specific path
 */
export function getTimeoutForPath(path: string): number {
  if (path.startsWith("/health")) {
    return DEFAULT_TIMEOUTS.health;
  }

  if (path.includes("/webhook")) {
    return DEFAULT_TIMEOUTS.webhook;
  }

  if (path.includes("/upload")) {
    return DEFAULT_TIMEOUTS.upload;
  }

  if (path.includes("/report") || path.includes("/export") || path.includes("/download")) {
    return DEFAULT_TIMEOUTS.longRunning;
  }

  return DEFAULT_TIMEOUTS.api;
}

export default {
  createTimeoutMiddleware,
  apiTimeout,
  uploadTimeout,
  webhookTimeout,
  healthTimeout,
  longRunningTimeout,
  smartTimeoutMiddleware,
  getTimeoutForPath,
  DEFAULT_TIMEOUTS,
};
