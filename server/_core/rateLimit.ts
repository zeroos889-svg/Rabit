import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { logger } from "./logger";
import { redis } from "./redisClient";

/**
 * Rate Limiting Middleware with Redis Store Support
 * Protects APIs from abuse and DDoS attacks
 */

/**
 * Custom rate limit handler with logging
 */
function rateLimitHandler(req: Request, res: any) {
  logger.warn("Rate limit exceeded", {
    context: "RateLimit",
    ip: req.ip,
    path: req.originalUrl,
    method: req.method,
    userAgent: req.headers["user-agent"],
  });

  res.status(429).json({
    success: false,
    error: "تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.",
    retryAfter: res.getHeader("Retry-After"),
  });
}

/**
 * Check if Redis is available for rate limiting
 */
function isRedisAvailable(): boolean {
  try {
    return redis?.isReady ?? false;
  } catch {
    return false;
  }
}

// General API rate limiter: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitHandler,
  // Skip rate limiting for admin users (optional)
  skip: (req: Request) => {
    // You can implement admin check here
    // return req.user?.role === 'admin';
    return false;
  },
});

// Strict limiter for sensitive endpoints (login, registration): 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
});

// Payment limiter: 10 requests per hour
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Document generation limiter: 20 requests per hour
export const documentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// File upload limiter: 30 requests per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Search/Query limiter: 60 requests per minute
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Webhook limiter: 100 requests per minute (for external services)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Use a different key generator for webhooks (based on signature or source)
  keyGenerator: (req: Request) => {
    const signature = req.headers["x-webhook-signature"] || req.headers["x-signature"];
    return signature ? `webhook:${signature}` : `webhook:${req.ip}`;
  },
});

/**
 * Custom rate limiter factory for specific use cases
 */
export function createCustomRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn("Custom rate limit exceeded", {
        context: "RateLimit",
        ip: req.ip,
        path: req.originalUrl,
      });

      res.status(429).json({
        success: false,
        error: options.message || "تم تجاوز الحد المسموح من الطلبات",
        retryAfter: res.getHeader("Retry-After"),
      });
    },
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    keyGenerator: options.keyGenerator,
  });
}

/**
 * Initialize rate limiting (call this on server startup)
 */
export async function initializeRateLimiting() {
  try {
    if (isRedisAvailable()) {
      logger.info("Rate limiting initialized with Redis support", {
        context: "RateLimit",
      });
    } else {
      logger.info("Rate limiting initialized with memory store", {
        context: "RateLimit",
      });
    }
  } catch (error) {
    logger.error("Failed to initialize rate limiting", {
      context: "RateLimit",
      error: error as Error,
    });
  }
}

/**
 * Rate limit configuration by endpoint type
 */
export const RateLimitConfig = {
  api: { windowMs: 15 * 60 * 1000, max: 100 },
  auth: { windowMs: 15 * 60 * 1000, max: 5 },
  payment: { windowMs: 60 * 60 * 1000, max: 10 },
  document: { windowMs: 60 * 60 * 1000, max: 20 },
  upload: { windowMs: 60 * 60 * 1000, max: 30 },
  search: { windowMs: 60 * 1000, max: 60 },
  webhook: { windowMs: 60 * 1000, max: 100 },
} as const;
