/**
 * tRPC Redis Rate Limiting Middleware
 * 
 * Redis-backed rate limiting wrapper for tRPC endpoints in distributed environments.
 * Provides automatic fallback to in-memory rate limiting when Redis is unavailable.
 * 
 * Features:
 * - Redis-backed rate limiting for multi-instance deployments
 * - Automatic fallback to in-memory limiters
 * - Environment variable control (USE_REDIS_RATE_LIMIT)
 * - Per-endpoint rate limit configuration
 * - Request fingerprinting (user ID or IP-based)
 * 
 * @module server/_core/trpcRedisRateLimit
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import {
  redisPaymentRateLimiter,
  redisNotificationRateLimiter,
  redisUploadRateLimiter,
  redisReportRateLimiter,
  redisSearchRateLimiter,
  redisExportRateLimiter,
  redisEmailRateLimiter,
  logRedisRateLimitConfig,
  isRedisAvailable,
} from "./redisRateLimit";
import {
  paymentRateLimiter,
  notificationRateLimiter,
  uploadRateLimiter,
  reportRateLimiter,
  searchRateLimiter,
  exportRateLimiter,
  emailRateLimiter,
} from "./endpointRateLimit";

/**
 * Check if Redis rate limiting is enabled via environment variable
 */
function isRedisRateLimitEnabled(): boolean {
  return (
    process.env.USE_REDIS_RATE_LIMIT === "true" &&
    isRedisAvailable()
  );
}

/**
 * Get appropriate rate limiter based on Redis availability
 * 
 * @param redisLimiter - Redis-backed rate limiter
 * @param memoryLimiter - In-memory fallback rate limiter
 * @returns Active rate limiter (Redis or in-memory)
 */
function getRateLimiter(redisLimiter: any, memoryLimiter: any) {
  if (isRedisRateLimitEnabled()) {
    logger.debug("Using Redis-backed rate limiter", { context: "RedisRateLimit" });
    return redisLimiter;
  }
  logger.debug("Using in-memory rate limiter (Redis disabled or unavailable)", {
    context: "RedisRateLimit",
  });
  return memoryLimiter;
}

/**
 * Map tRPC procedure paths to their corresponding rate limiters
 * 
 * Paths are matched using includes() to handle nested procedures.
 * For example: "payments.createPayment" matches "payments"
 */
const TRPC_RATE_LIMIT_MAP = new Map<
  string,
  { redis: any; memory: any; name: string }
>([
  // Payment endpoints
  [
    "payments",
    {
      redis: redisPaymentRateLimiter,
      memory: paymentRateLimiter,
      name: "Payment",
    },
  ],
  [
    "payroll",
    {
      redis: redisPaymentRateLimiter,
      memory: paymentRateLimiter,
      name: "Payroll Payment",
    },
  ],

  // Notification endpoints
  [
    "notifications",
    {
      redis: redisNotificationRateLimiter,
      memory: notificationRateLimiter,
      name: "Notification",
    },
  ],

  // Upload endpoints
  [
    "upload",
    {
      redis: redisUploadRateLimiter,
      memory: uploadRateLimiter,
      name: "Upload",
    },
  ],
  [
    "files",
    {
      redis: redisUploadRateLimiter,
      memory: uploadRateLimiter,
      name: "File Upload",
    },
  ],

  // Report endpoints
  [
    "reports",
    {
      redis: redisReportRateLimiter,
      memory: reportRateLimiter,
      name: "Report",
    },
  ],
  [
    "analytics",
    {
      redis: redisReportRateLimiter,
      memory: reportRateLimiter,
      name: "Analytics Report",
    },
  ],

  // Search endpoints
  [
    "search",
    {
      redis: redisSearchRateLimiter,
      memory: searchRateLimiter,
      name: "Search",
    },
  ],

  // Export endpoints
  [
    "export",
    {
      redis: redisExportRateLimiter,
      memory: exportRateLimiter,
      name: "Export",
    },
  ],

  // Email endpoints
  [
    "email",
    {
      redis: redisEmailRateLimiter,
      memory: emailRateLimiter,
      name: "Email",
    },
  ],
]);

/**
 * Determine which rate limiter to use based on tRPC procedure path
 * 
 * @param procedurePath - tRPC procedure path (e.g., "payments.createPayment")
 * @returns Appropriate rate limiter or null if no specific limiter matches
 */
function selectRateLimiterForProcedure(procedurePath: string) {
  for (const [key, limiters] of TRPC_RATE_LIMIT_MAP.entries()) {
    if (procedurePath.toLowerCase().includes(key.toLowerCase())) {
      logger.debug(`Selected ${limiters.name} rate limiter for: ${procedurePath}`, {
        context: "RedisRateLimit",
        procedure: procedurePath,
        limiter: limiters.name,
        backend: isRedisRateLimitEnabled() ? "Redis" : "Memory",
      });
      return getRateLimiter(limiters.redis, limiters.memory);
    }
  }

  logger.debug(`No specific rate limiter for: ${procedurePath} (using default)`, {
    context: "RedisRateLimit",
    procedure: procedurePath,
  });
  return null;
}

/**
 * tRPC Redis Rate Limit Middleware
 * 
 * Intercepts tRPC requests and applies Redis-backed or in-memory rate limiting
 * based on the procedure path and system configuration.
 * 
 * Environment Variables:
 * - USE_REDIS_RATE_LIMIT: Enable Redis rate limiting (default: false)
 * - REDIS_URL: Redis connection URL (required for Redis mode)
 * 
 * Fallback Strategy:
 * - If Redis is disabled: Use in-memory rate limiters
 * - If Redis is unavailable: Automatically fall back to in-memory
 * - If no specific limiter matches: Allow request to proceed
 * 
 * @example
 * ```typescript
 * // In server/_core/index.ts
 * app.use("/api/trpc", trpcRedisRateLimitMiddleware, createExpressMiddleware(...));
 * ```
 */
export const trpcRedisRateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract tRPC procedure path from URL or body
  const procedurePath = extractTrpcProcedurePath(req);

  if (!procedurePath) {
    // If we can't determine the procedure path, proceed without rate limiting
    logger.debug("Unable to determine tRPC procedure path, skipping rate limit", {
      context: "RedisRateLimit",
      url: req.originalUrl,
      method: req.method,
    });
    return next();
  }

  // Select appropriate rate limiter based on procedure path
  const rateLimiter = selectRateLimiterForProcedure(procedurePath);

  if (!rateLimiter) {
    // No specific rate limiter for this procedure, proceed
    return next();
  }

  // Apply selected rate limiter
  logger.debug(`Applying rate limiter for: ${procedurePath}`, {
    context: "RedisRateLimit",
    procedure: procedurePath,
    backend: isRedisRateLimitEnabled() ? "Redis" : "Memory",
  });

  return rateLimiter(req, res, next);
};

/**
 * Extract tRPC procedure path from request
 * 
 * tRPC sends procedure path via:
 * 1. URL query parameter: ?batch=1&input={"0":{"path":"payments.create"}}
 * 2. POST body: { path: "payments.create", input: {...} }
 * 3. URL pathname: /api/trpc/payments.create
 * 
 * @param req - Express request object
 * @returns Procedure path or null if not found
 */
function extractTrpcProcedurePath(req: Request): string | null {
  try {
    // Method 1: Check URL query for batch requests
    const pathFromQuery = extractFromQuery(req);
    if (pathFromQuery) return pathFromQuery;

    // Method 2: Check POST body
    const pathFromBody = extractFromBody(req);
    if (pathFromBody) return pathFromBody;

    // Method 3: Parse URL pathname
    const pathFromUrl = extractFromUrl(req);
    if (pathFromUrl) return pathFromUrl;

    return null;
  } catch (error) {
    logger.error("Error extracting tRPC procedure path", {
      context: "RedisRateLimit",
      error: error as Error,
      url: req.originalUrl,
    });
    return null;
  }
}

/**
 * Extract procedure path from URL query parameters
 */
function extractFromQuery(req: Request): string | null {
  if (!req.query.batch || !req.query.input) return null;

  const input =
    typeof req.query.input === "string"
      ? JSON.parse(req.query.input)
      : req.query.input;

  if (typeof input !== "object" || input === null) return null;

  const firstBatch = input["0"];
  return firstBatch?.path || null;
}

/**
 * Extract procedure path from POST body
 */
function extractFromBody(req: Request): string | null {
  if (!req.body || typeof req.body !== "object") return null;

  // Direct path property
  if (req.body.path) return req.body.path;

  // Batch request in body
  if (Array.isArray(req.body) && req.body[0]?.path) {
    return req.body[0].path;
  }

  return null;
}

/**
 * Extract procedure path from URL pathname
 */
function extractFromUrl(req: Request): string | null {
  const urlPath = req.path;
  const trpcPrefix = "/api/trpc/";

  if (!urlPath.startsWith(trpcPrefix)) return null;

  const procedurePath = urlPath.substring(trpcPrefix.length);
  return procedurePath || null;
}

/**
 * Get Redis rate limiting status and configuration
 * 
 * @returns Object with Redis status and configuration details
 */
export function getRedisRateLimitStatus() {
  const enabled = isRedisRateLimitEnabled();
  const redisAvailable = isRedisAvailable();

  return {
    enabled,
    redisAvailable,
    backend: enabled && redisAvailable ? "Redis" : "Memory",
    redisUrl: process.env.REDIS_URL ? "Configured" : "Not Configured",
    useRedisRateLimit: process.env.USE_REDIS_RATE_LIMIT || "false",
    procedureCount: TRPC_RATE_LIMIT_MAP.size,
    procedures: Array.from(TRPC_RATE_LIMIT_MAP.keys()),
  };
}

/**
 * Log Redis rate limiting configuration at server startup
 */
export function logTrpcRedisRateLimitConfig() {
  const status = getRedisRateLimitStatus();

  logger.info("=".repeat(60), { context: "RedisRateLimit" });
  logger.info("📊 tRPC Redis Rate Limiting Configuration", { context: "RedisRateLimit" });
  logger.info("=".repeat(60), { context: "RedisRateLimit" });

  logger.info(`Backend: ${status.backend}`, { context: "RedisRateLimit" });
  logger.info(`Redis Available: ${status.redisAvailable}`, { context: "RedisRateLimit" });
  logger.info(`Redis Rate Limiting Enabled: ${status.enabled}`, { context: "RedisRateLimit" });
  logger.info(`USE_REDIS_RATE_LIMIT: ${status.useRedisRateLimit}`, { context: "RedisRateLimit" });
  logger.info(`Redis URL: ${status.redisUrl}`, { context: "RedisRateLimit" });
  logger.info(`Protected Procedures: ${status.procedureCount}`, { context: "RedisRateLimit" });

  if (status.procedureCount > 0) {
    logger.info("\nProtected tRPC Procedures:", { context: "RedisRateLimit" });
    for (const [key, limiters] of TRPC_RATE_LIMIT_MAP.entries()) {
      logger.info(`  - ${key} -> ${limiters.name} Rate Limiter`, {
        context: "RedisRateLimit",
      });
    }
  }

  logger.info("=".repeat(60), { context: "RedisRateLimit" });

  // Log underlying Redis rate limiter configuration
  if (status.enabled && status.redisAvailable) {
    logRedisRateLimitConfig();
  }
}

/**
 * Export rate limiters for direct use in specific routes
 */
export {
  redisPaymentRateLimiter,
  redisNotificationRateLimiter,
  redisUploadRateLimiter,
  redisReportRateLimiter,
  redisSearchRateLimiter,
  redisExportRateLimiter,
  redisEmailRateLimiter,
} from "./redisRateLimit";
