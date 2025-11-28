/**
 * Advanced Rate Limiting Middleware
 * نظام متقدم لتحديد معدل الطلبات مع ميزات إضافية
 * 
 * New Features:
 * - IP-based rate limiting with Redis
 * - User-based rate limiting (authenticated users)
 * - Endpoint-specific limits
 * - Login attempt tracking with account lockout
 * - Suspicious activity detection
 * - Rate limit bypass for trusted IPs
 * - Detailed metrics and monitoring
 * - Automatic cleanup of old records
 * 
 * @module advancedRateLimiter
 */

import rateLimit, { type Options } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { type Request, type Response, type NextFunction } from "express";
import { getRedisInstance } from "../redis";
import { logger } from "../logger";
import { trackRateLimit } from "../metrics";
import { cache, CACHE_TTL } from "../cache";

// ============================================================================
// Types and Interfaces
// ============================================================================

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter: number;
}

interface LoginAttempt {
  email: string;
  ip: string;
  timestamp: number;
  success: boolean;
}

interface AccountLockInfo {
  email: string;
  lockedAt: number;
  unlockAt: number;
  attempts: number;
  reason: string;
}

interface SuspiciousActivity {
  ip: string;
  endpoint: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Account Lockout Settings
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // Suspicious Activity Thresholds
  SUSPICIOUS_THRESHOLD: 50, // requests per minute
  SUSPICIOUS_WINDOW: 60 * 1000, // 1 minute
  
  // Trusted IPs
  TRUSTED_IPS: process.env.TRUSTED_IPS?.split(",").map(ip => ip.trim()) || [],
  
  // Rate Limit Tiers
  TIERS: {
    STRICT: { windowMs: 5 * 60 * 1000, max: 3 },
    LOGIN: { windowMs: 15 * 60 * 1000, max: 5 },
    REGISTER: { windowMs: 60 * 60 * 1000, max: 3 },
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 },
    UPLOAD: { windowMs: 60 * 60 * 1000, max: 10 },
    ADMIN: { windowMs: 15 * 60 * 1000, max: 30 },
    GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
    AUTHENTICATED: { windowMs: 15 * 60 * 1000, max: 200 },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract client IP address safely
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip.trim();
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  
  return req.socket?.remoteAddress || req.ip || 'unknown';
};

/**
 * Check if IP is trusted
 */
const isTrustedIp = (ip: string): boolean => {
  return CONFIG.TRUSTED_IPS.includes(ip);
};

/**
 * Generate cache key for rate limiting
 */
const generateKey = (prefix: string, identifier: string): string => {
  return `ratelimit:${prefix}:${identifier}`;
};

/**
 * Create Redis store for rate limiting
 */
const createRedisStore = (prefix: string): any => {
  const redis = getRedisInstance();
  if (!redis) {
    logger.warn("Redis not available, using memory store for rate limiting", {
      context: "RateLimiter",
      prefix,
    });
    return undefined;
  }

  try {
    return new RedisStore({
      client: redis as any,
      prefix: `ratelimit:${prefix}:`,
    } as any);
  } catch (error) {
    logger.error("Failed to create Redis store for rate limiting", {
      context: "RateLimiter",
      prefix,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
};

// ============================================================================
// Account Lockout System
// ============================================================================

/**
 * Track login attempt
 */
export async function trackLoginAttempt(
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  const key = `login_attempts:${email}`;
  
  try {
    // Get existing attempts
    const attempts = await cache.get<LoginAttempt[]>(key) || [];
    
    // Add new attempt
    attempts.push({
      email,
      ip,
      timestamp: Date.now(),
      success,
    });
    
    // Keep only recent attempts (within window)
    const cutoff = Date.now() - CONFIG.ATTEMPT_WINDOW;
    const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
    
    // Save updated attempts
    await cache.set(key, recentAttempts, CONFIG.ATTEMPT_WINDOW / 1000);
    
    // Check if account should be locked
    const failedAttempts = recentAttempts.filter(a => !a.success);
    if (failedAttempts.length >= CONFIG.MAX_LOGIN_ATTEMPTS) {
      await lockAccount(email, ip, failedAttempts.length);
    }
    
    logger.info("Login attempt tracked", {
      context: "RateLimiter",
      email,
      ip,
      success,
      totalAttempts: recentAttempts.length,
      failedAttempts: failedAttempts.length,
    });
  } catch (error) {
    logger.error("Failed to track login attempt", {
      context: "RateLimiter",
      email,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Lock account after too many failed attempts
 */
async function lockAccount(
  email: string,
  ip: string,
  attempts: number
): Promise<void> {
  const key = `account_locked:${email}`;
  const now = Date.now();
  
  const lockInfo: AccountLockInfo = {
    email,
    lockedAt: now,
    unlockAt: now + CONFIG.LOCKOUT_DURATION,
    attempts,
    reason: `Too many failed login attempts from IP: ${ip}`,
  };
  
  await cache.set(key, lockInfo, CONFIG.LOCKOUT_DURATION / 1000);
  
  logger.warn("Account locked due to failed login attempts", {
    context: "RateLimiter",
    email,
    ip,
    attempts,
    unlockAt: new Date(lockInfo.unlockAt).toISOString(),
  });
  
  // Track metric
  trackRateLimit("user", "blocked", "login");
  
  // TODO: Send email notification to user
  // await sendAccountLockNotification(email, lockInfo);
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string): Promise<AccountLockInfo | null> {
  const key = `account_locked:${email}`;
  const lockInfo = await cache.get<AccountLockInfo>(key);
  
  if (!lockInfo) {
    return null;
  }
  
  // Check if lock has expired
  if (Date.now() > lockInfo.unlockAt) {
    await cache.delete(key);
    return null;
  }
  
  return lockInfo;
}

/**
 * Unlock account manually (admin action)
 */
export async function unlockAccount(email: string): Promise<void> {
  const key = `account_locked:${email}`;
  await cache.delete(key);
  await cache.delete(`login_attempts:${email}`);
  
  logger.info("Account unlocked manually", {
    context: "RateLimiter",
    email,
  });
}

/**
 * Get login attempts for an email
 */
export async function getLoginAttempts(email: string): Promise<LoginAttempt[]> {
  const key = `login_attempts:${email}`;
  return await cache.get<LoginAttempt[]>(key) || [];
}

// ============================================================================
// Suspicious Activity Detection
// ============================================================================

/**
 * Track suspicious activity
 */
export async function trackSuspiciousActivity(
  ip: string,
  endpoint: string
): Promise<void> {
  const key = `suspicious:${ip}:${endpoint}`;
  
  try {
    const activity = await cache.get<SuspiciousActivity>(key);
    const now = Date.now();
    
    if (activity) {
      activity.count++;
      activity.lastSeen = now;
      await cache.set(key, activity, CONFIG.SUSPICIOUS_WINDOW / 1000);
      
      // Check if threshold exceeded
      if (activity.count > CONFIG.SUSPICIOUS_THRESHOLD) {
        logger.warn("Suspicious activity detected", {
          context: "RateLimiter",
          ip,
          endpoint,
          count: activity.count,
          duration: now - activity.firstSeen,
        });
        
        trackRateLimit("ip", "blocked", endpoint);
      }
    } else {
      const newActivity: SuspiciousActivity = {
        ip,
        endpoint,
        count: 1,
        firstSeen: now,
        lastSeen: now,
      };
      await cache.set(key, newActivity, CONFIG.SUSPICIOUS_WINDOW / 1000);
    }
  } catch (error) {
    logger.error("Failed to track suspicious activity", {
      context: "RateLimiter",
      ip,
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Check if IP has suspicious activity
 */
export async function hasSuspiciousActivity(
  ip: string,
  endpoint: string
): Promise<boolean> {
  const key = `suspicious:${ip}:${endpoint}`;
  const activity = await cache.get<SuspiciousActivity>(key);
  
  if (!activity) {
    return false;
  }
  
  return activity.count > CONFIG.SUSPICIOUS_THRESHOLD;
}

// ============================================================================
// Custom Rate Limit Handler
// ============================================================================

/**
 * Custom rate limit exceeded handler
 */
const rateLimitHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
  options: Options
) => {
  const ip = getClientIp(req);
  const endpoint = req.path;
  const resetTime = new Date(Date.now() + (options.windowMs || 60000));
  
  const info: RateLimitInfo = {
    limit: options.max as number,
    remaining: 0,
    reset: resetTime,
    retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
  };
  
  // Track suspicious activity
  trackSuspiciousActivity(ip, endpoint);
  
  // Track metric
  const limiterType = ((options as any).limiterType || "ip") as "ip" | "endpoint" | "user" | "custom";
  trackRateLimit(limiterType, "blocked", endpoint);
  
  logger.warn("Rate limit exceeded", {
    context: "RateLimiter",
    ip,
    endpoint,
    limit: info.limit,
    retryAfter: info.retryAfter,
  });
  
  res.status(429).json({
    success: false,
    message: "تم تجاوز عدد الطلبات المسموح بها. الرجاء المحاولة لاحقاً.",
    messageEn: "Too many requests. Please try again later.",
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      limit: info.limit,
      remaining: info.remaining,
      resetAt: info.reset.toISOString(),
      retryAfter: info.retryAfter,
    },
  });
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req: Request): boolean => {
  const ip = getClientIp(req);
  
  // Skip for trusted IPs
  if (isTrustedIp(ip)) {
    logger.debug("Skipping rate limit for trusted IP", {
      context: "RateLimiter",
      ip,
    });
    return true;
  }
  
  // Skip for health check endpoints
  if (req.path === "/health" || req.path === "/api/health") {
    return true;
  }
  
  // Skip for development admin users (optional)
  if (process.env.NODE_ENV === "development" && (req as any).user?.role === "admin") {
    return true;
  }
  
  return false;
};

// ============================================================================
// Rate Limiters
// ============================================================================

/**
 * General API Rate Limiter
 * For all API endpoints
 */
export const generalLimiter = rateLimit({
  ...CONFIG.TIERS.GENERAL,
  message: "تم تجاوز عدد الطلبات المسموح بها",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("general"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
  limiterType: "general",
} as any);

/**
 * Login Rate Limiter with Account Lockout
 */
export const loginLimiter = rateLimit({
  ...CONFIG.TIERS.LOGIN,
  message: "تم تجاوز عدد محاولات تسجيل الدخول",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("login"),
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const email = req.body?.email || "unknown";
    return `${ip}:${email}`;
  },
  limiterType: "login",
} as any);

/**
 * Registration Rate Limiter
 */
export const registerLimiter = rateLimit({
  ...CONFIG.TIERS.REGISTER,
  message: "تم تجاوز عدد التسجيلات المسموح بها",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("register"),
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  skip: skipRateLimit,
  keyGenerator: (req) => getClientIp(req),
  limiterType: "register",
} as any);

/**
 * Password Reset Rate Limiter
 */
export const passwordResetLimiter = rateLimit({
  ...CONFIG.TIERS.PASSWORD_RESET,
  message: "تم تجاوز عدد طلبات إعادة تعيين كلمة المرور",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("password-reset"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const email = req.body?.email || "unknown";
    return `${ip}:${email}`;
  },
  limiterType: "password_reset",
} as any);

/**
 * Upload Rate Limiter
 */
export const uploadLimiter = rateLimit({
  ...CONFIG.TIERS.UPLOAD,
  message: "تم تجاوز عدد رفع الملفات المسموح به",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("upload"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
  limiterType: "upload",
} as any);

/**
 * Admin Actions Rate Limiter
 */
export const adminLimiter = rateLimit({
  ...CONFIG.TIERS.ADMIN,
  message: "تم تجاوز عدد الإجراءات الإدارية المسموح بها",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("admin"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || "anonymous";
    return `admin:${userId}`;
  },
  limiterType: "admin",
} as any);

/**
 * Strict Rate Limiter for sensitive endpoints
 */
export const strictLimiter = rateLimit({
  ...CONFIG.TIERS.STRICT,
  message: "تم تجاوز عدد الطلبات المسموح بها لهذا الإجراء الحساس",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("strict"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
  limiterType: "strict",
} as any);

/**
 * Authenticated User Rate Limiter (higher limits)
 */
export const authenticatedLimiter = rateLimit({
  ...CONFIG.TIERS.AUTHENTICATED,
  message: "تم تجاوز عدد الطلبات المسموح بها",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("authenticated"),
  handler: rateLimitHandler,
  skip: skipRateLimit,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || "anonymous";
    return `user:${userId}`;
  },
  limiterType: "authenticated",
} as any);

// ============================================================================
// Middleware for Account Lockout Check
// ============================================================================

/**
 * Middleware to check if account is locked before login
 */
export async function checkAccountLockout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const email = req.body?.email;
  
  if (!email) {
    return next();
  }
  
  try {
    const lockInfo = await isAccountLocked(email);
    
    if (lockInfo) {
      const remainingTime = Math.ceil((lockInfo.unlockAt - Date.now()) / 1000 / 60);
      
      logger.warn("Login attempt on locked account", {
        context: "RateLimiter",
        email,
        ip: getClientIp(req),
        remainingTime,
      });
      
      res.status(423).json({
        success: false,
        message: `تم قفل الحساب مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة. الرجاء المحاولة بعد ${remainingTime} دقيقة.`,
        messageEn: `Account temporarily locked due to multiple failed login attempts. Please try again in ${remainingTime} minutes.`,
        error: {
          code: "ACCOUNT_LOCKED",
          lockedAt: new Date(lockInfo.lockedAt).toISOString(),
          unlockAt: new Date(lockInfo.unlockAt).toISOString(),
          remainingMinutes: remainingTime,
          attempts: lockInfo.attempts,
        },
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error("Error checking account lockout", {
      context: "RateLimiter",
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    next();
  }
}

// ============================================================================
// Monitoring and Statistics
// ============================================================================

/**
 * Get rate limiting statistics
 */
export async function getRateLimitStats(): Promise<{
  totalBlocked: number;
  lockedAccounts: number;
  suspiciousIPs: number;
}> {
  try {
    const keys = await cache.getKeysByPattern("ratelimit:*");
    const lockedKeys = await cache.getKeysByPattern("account_locked:*");
    const suspiciousKeys = await cache.getKeysByPattern("suspicious:*");
    
    return {
      totalBlocked: keys.length,
      lockedAccounts: lockedKeys.length,
      suspiciousIPs: suspiciousKeys.length,
    };
  } catch (error) {
    logger.error("Failed to get rate limit stats", {
      context: "RateLimiter",
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      totalBlocked: 0,
      lockedAccounts: 0,
      suspiciousIPs: 0,
    };
  }
}

/**
 * Clear all rate limit data (for testing)
 */
export async function clearAllRateLimits(): Promise<void> {
  try {
    await cache.deletePattern("ratelimit:*");
    await cache.deletePattern("account_locked:*");
    await cache.deletePattern("login_attempts:*");
    await cache.deletePattern("suspicious:*");
    
    logger.info("All rate limit data cleared", {
      context: "RateLimiter",
    });
  } catch (error) {
    logger.error("Failed to clear rate limit data", {
      context: "RateLimiter",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  general: generalLimiter,
  login: loginLimiter,
  register: registerLimiter,
  passwordReset: passwordResetLimiter,
  upload: uploadLimiter,
  admin: adminLimiter,
  strict: strictLimiter,
  authenticated: authenticatedLimiter,
  checkAccountLockout,
  trackLoginAttempt,
  isAccountLocked,
  unlockAccount,
  getLoginAttempts,
  getRateLimitStats,
  clearAllRateLimits,
};
