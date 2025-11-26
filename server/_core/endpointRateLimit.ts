/**
 * Endpoint-Specific Rate Limiting
 * Provides granular rate limiting for different API endpoints
 */

import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Rate limit configuration for different endpoint types
 */
const RATE_LIMITS = {
  // Payment endpoints - strict limits to prevent abuse
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many payment requests, please try again later",
  },

  // Notification endpoints - moderate limits
  notification: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 requests per window
    message: "Too many notification requests, please try again later",
  },

  // File upload endpoints - strict limits due to resource usage
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per window
    message: "Too many upload requests, please try again later",
  },

  // Webhook endpoints - moderate limits
  webhook: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 webhooks per window
    message: "Too many webhook requests, please slow down",
  },

  // Report generation - very strict limits (resource intensive)
  report: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 reports per hour
    message: "Too many report generation requests, please wait",
  },

  // Search endpoints - moderate limits
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 searches per minute
    message: "Too many search requests, please slow down",
  },

  // Export endpoints - strict limits
  export: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // 5 exports per window
    message: "Too many export requests, please try again later",
  },

  // Email sending - very strict
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 emails per hour per user
    message: "Too many email requests, please try again later",
  },
};

/**
 * Standard rate limit handler
 */
function rateLimitHandler(req: Request, res: Response) {
  const requestId = getRequestId(req);
  
  logger.warn("Rate limit exceeded", {
    context: "RateLimit",
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  res.status(429).json({
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
      category: "rate_limit",
      severity: "low",
      requestId,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Skip rate limiting for certain conditions
 */
function skipRateLimit(req: Request): boolean {
  // Skip for health checks
  if (req.path.startsWith("/health")) {
    return true;
  }

  // Skip for admin users in development
  if (process.env.NODE_ENV === "development" && (req as any).user?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Payment rate limiter
 */
export const paymentRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.payment.windowMs,
  max: RATE_LIMITS.payment.max,
  message: RATE_LIMITS.payment.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
});

/**
 * Notification rate limiter
 */
export const notificationRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.notification.windowMs,
  max: RATE_LIMITS.notification.max,
  message: RATE_LIMITS.notification.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
});

/**
 * Upload rate limiter
 */
export const uploadRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.upload.windowMs,
  max: RATE_LIMITS.upload.max,
  message: RATE_LIMITS.upload.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
});

/**
 * Webhook rate limiter
 */
export const webhookRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.webhook.windowMs,
  max: RATE_LIMITS.webhook.max,
  message: RATE_LIMITS.webhook.message,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // Webhooks typically come from external services, rate limit by IP
    return `webhook:${req.ip}`;
  },
});

/**
 * Report generation rate limiter
 */
export const reportRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.report.windowMs,
  max: RATE_LIMITS.report.max,
  message: RATE_LIMITS.report.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `report:user:${userId}` : `report:ip:${req.ip}`;
  },
});

/**
 * Search rate limiter
 */
export const searchRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.search.windowMs,
  max: RATE_LIMITS.search.max,
  message: RATE_LIMITS.search.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `search:user:${userId}` : `search:ip:${req.ip}`;
  },
});

/**
 * Export rate limiter
 */
export const exportRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.export.windowMs,
  max: RATE_LIMITS.export.max,
  message: RATE_LIMITS.export.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `export:user:${userId}` : `export:ip:${req.ip}`;
  },
});

/**
 * Email rate limiter
 */
export const emailRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.email.windowMs,
  max: RATE_LIMITS.email.max,
  message: RATE_LIMITS.email.message,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `email:user:${userId}` : `email:ip:${req.ip}`;
  },
});

/**
 * Get rate limit information for monitoring
 */
export function getRateLimitInfo() {
  return {
    payment: {
      window: `${RATE_LIMITS.payment.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.payment.max,
    },
    notification: {
      window: `${RATE_LIMITS.notification.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.notification.max,
    },
    upload: {
      window: `${RATE_LIMITS.upload.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.upload.max,
    },
    webhook: {
      window: `${RATE_LIMITS.webhook.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.webhook.max,
    },
    report: {
      window: `${RATE_LIMITS.report.windowMs / 1000 / 60 / 60} hours`,
      limit: RATE_LIMITS.report.max,
    },
    search: {
      window: `${RATE_LIMITS.search.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.search.max,
    },
    export: {
      window: `${RATE_LIMITS.export.windowMs / 1000 / 60} minutes`,
      limit: RATE_LIMITS.export.max,
    },
    email: {
      window: `${RATE_LIMITS.email.windowMs / 1000 / 60 / 60} hours`,
      limit: RATE_LIMITS.email.max,
    },
  };
}

/**
 * Log rate limit configuration on startup
 */
export function logRateLimitConfig() {
  const info = getRateLimitInfo();
  logger.info("Rate limit configuration loaded", {
    context: "RateLimit",
    config: info,
  });
}
