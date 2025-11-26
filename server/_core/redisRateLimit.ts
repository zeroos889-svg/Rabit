/**
 * Redis-Backed Rate Limiting
 * Distributed rate limiting using Redis for multi-instance support
 */

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import type { Request, Response } from "express";
import { redis } from "./redisClient";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Check if Redis is available for rate limiting
 */
export function isRedisAvailable(): boolean {
  return redis !== null && redis.isOpen;
}

/**
 * Rate limit configuration for different endpoint types
 * Same as in-memory limits but backed by Redis
 */
export const REDIS_RATE_LIMITS = {
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: "Too many payment requests, please try again later",
    prefix: "rl:payment:",
  },

  notification: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30,
    message: "Too many notification requests, please try again later",
    prefix: "rl:notification:",
  },

  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: "Too many upload requests, please try again later",
    prefix: "rl:upload:",
  },

  webhook: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50,
    message: "Too many webhook requests, please slow down",
    prefix: "rl:webhook:",
  },

  report: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: "Too many report generation requests, please wait",
    prefix: "rl:report:",
  },

  search: {
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: "Too many search requests, please slow down",
    prefix: "rl:search:",
  },

  export: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5,
    message: "Too many export requests, please wait",
    prefix: "rl:export:",
  },

  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: "Too many email requests, please wait",
    prefix: "rl:email:",
  },
};

/**
 * Custom rate limit handler with structured errors
 */
function redisRateLimitHandler(req: Request, res: Response): void {
  const requestId = getRequestId(req);

  logger.warn("Redis rate limit exceeded", {
    context: "RedisRateLimit",
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
      message: "Too many requests. Please try again later.",
      retryAfter: res.getHeader("Retry-After"),
    },
    requestId,
  });
}

/**
 * Skip rate limiting for certain paths
 */
function skipRedisRateLimit(req: Request): boolean {
  // Skip health checks
  if (req.path.startsWith("/health")) {
    return true;
  }

  // Skip in development for admin users (optional)
  if (process.env.NODE_ENV === "development") {
    const user = (req as any).user;
    if (user && user.role === "admin") {
      return true;
    }
  }

  return false;
}

/**
 * Smart key generation: use user ID if authenticated, otherwise IP
 */
function generateRedisKey(req: Request): string {
  const user = (req as any).user;
  if (user && user.id) {
    return `user:${user.id}`;
  }
  return `ip:${req.ip}`;
}

/**
 * Create Redis store configuration
 */
function createRedisStore(prefix: string) {
  if (!isRedisAvailable()) {
    logger.warn("Redis not available for rate limiting, using in-memory store", {
      context: "RedisRateLimit",
    });
    return undefined; // Fall back to in-memory
  }

  return new RedisStore({
    // @ts-expect-error - Type mismatch between redis versions
    client: redis,
    prefix,
    sendCommand: (...args: string[]) => redis!.sendCommand(args),
  });
}

/**
 * Payment rate limiter with Redis
 */
export const redisPaymentRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.payment.windowMs,
  max: REDIS_RATE_LIMITS.payment.max,
  message: REDIS_RATE_LIMITS.payment.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.payment.prefix),
});

/**
 * Notification rate limiter with Redis
 */
export const redisNotificationRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.notification.windowMs,
  max: REDIS_RATE_LIMITS.notification.max,
  message: REDIS_RATE_LIMITS.notification.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.notification.prefix),
});

/**
 * Upload rate limiter with Redis
 */
export const redisUploadRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.upload.windowMs,
  max: REDIS_RATE_LIMITS.upload.max,
  message: REDIS_RATE_LIMITS.upload.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.upload.prefix),
});

/**
 * Webhook rate limiter with Redis
 */
export const redisWebhookRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.webhook.windowMs,
  max: REDIS_RATE_LIMITS.webhook.max,
  message: REDIS_RATE_LIMITS.webhook.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.webhook.prefix),
});

/**
 * Report generation rate limiter with Redis
 */
export const redisReportRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.report.windowMs,
  max: REDIS_RATE_LIMITS.report.max,
  message: REDIS_RATE_LIMITS.report.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.report.prefix),
});

/**
 * Search rate limiter with Redis
 */
export const redisSearchRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.search.windowMs,
  max: REDIS_RATE_LIMITS.search.max,
  message: REDIS_RATE_LIMITS.search.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.search.prefix),
});

/**
 * Export rate limiter with Redis
 */
export const redisExportRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.export.windowMs,
  max: REDIS_RATE_LIMITS.export.max,
  message: REDIS_RATE_LIMITS.export.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.export.prefix),
});

/**
 * Email rate limiter with Redis
 */
export const redisEmailRateLimiter = rateLimit({
  windowMs: REDIS_RATE_LIMITS.email.windowMs,
  max: REDIS_RATE_LIMITS.email.max,
  message: REDIS_RATE_LIMITS.email.message,
  handler: redisRateLimitHandler,
  skip: skipRedisRateLimit,
  keyGenerator: generateRedisKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(REDIS_RATE_LIMITS.email.prefix),
});

/**
 * Get rate limit information
 */
export function getRedisRateLimitInfo() {
  return {
    payment: {
      window: `${REDIS_RATE_LIMITS.payment.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.payment.max,
      prefix: REDIS_RATE_LIMITS.payment.prefix,
    },
    notification: {
      window: `${REDIS_RATE_LIMITS.notification.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.notification.max,
      prefix: REDIS_RATE_LIMITS.notification.prefix,
    },
    upload: {
      window: `${REDIS_RATE_LIMITS.upload.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.upload.max,
      prefix: REDIS_RATE_LIMITS.upload.prefix,
    },
    webhook: {
      window: `${REDIS_RATE_LIMITS.webhook.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.webhook.max,
      prefix: REDIS_RATE_LIMITS.webhook.prefix,
    },
    report: {
      window: `${REDIS_RATE_LIMITS.report.windowMs / 1000 / 60 / 60} hours`,
      limit: REDIS_RATE_LIMITS.report.max,
      prefix: REDIS_RATE_LIMITS.report.prefix,
    },
    search: {
      window: `${REDIS_RATE_LIMITS.search.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.search.max,
      prefix: REDIS_RATE_LIMITS.search.prefix,
    },
    export: {
      window: `${REDIS_RATE_LIMITS.export.windowMs / 1000 / 60} minutes`,
      limit: REDIS_RATE_LIMITS.export.max,
      prefix: REDIS_RATE_LIMITS.export.prefix,
    },
    email: {
      window: `${REDIS_RATE_LIMITS.email.windowMs / 1000 / 60 / 60} hours`,
      limit: REDIS_RATE_LIMITS.email.max,
      prefix: REDIS_RATE_LIMITS.email.prefix,
    },
    redisAvailable: isRedisAvailable(),
  };
}

/**
 * Log Redis rate limiting configuration on startup
 */
export function logRedisRateLimitConfig(): void {
  const info = getRedisRateLimitInfo();
  
  logger.info("Redis rate limiting configured", {
    context: "RedisRateLimit",
    config: {
      redisAvailable: info.redisAvailable,
      limiters: Object.keys(info).filter((k) => k !== "redisAvailable").length,
      fallback: info.redisAvailable ? "none" : "in-memory",
    },
  });

  if (!info.redisAvailable) {
    logger.warn("Redis unavailable - rate limiting will use in-memory fallback", {
      context: "RedisRateLimit",
      note: "Rate limits will not be shared across multiple server instances",
    });
  }
}

/**
 * Clear all rate limit data from Redis (useful for testing)
 */
export async function clearRedisRateLimits(): Promise<void> {
  if (!isRedisAvailable()) {
    logger.warn("Redis not available, cannot clear rate limits", {
      context: "RedisRateLimit",
    });
    return;
  }

  try {
    const prefixes = Object.values(REDIS_RATE_LIMITS).map((limit) => limit.prefix);
    
    for (const prefix of prefixes) {
      const keys = await redis!.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redis!.del(keys);
        logger.info(`Cleared ${keys.length} rate limit keys`, {
          context: "RedisRateLimit",
          prefix,
        });
      }
    }
  } catch (error) {
    logger.error("Failed to clear Redis rate limits", {
      context: "RedisRateLimit",
      error: error as Error,
    });
  }
}
