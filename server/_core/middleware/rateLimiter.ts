/**
 * Rate Limiting Middleware
 * 
 * يوفر حماية ضد abuse و brute-force attacks عبر تحديد عدد الطلبات
 * المسموح بها من IP واحد خلال فترة زمنية محددة.
 * 
 * Features:
 * - حدود مختلفة لكل endpoint (login, register, general API)
 * - Redis store للتوزيع على multiple servers
 * - رسائل خطأ مفصلة بالعربية/الإنجليزية
 * - Skip للـ trusted IPs (optional)
 * - Headers للـ rate limit info
 * 
 * @module rateLimiter
 */

import rateLimit, { type Options, ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { type Request, type Response } from "express";
import { getRedisInstance } from "../redis";

/**
 * معلومات Rate Limit
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * رسالة خطأ مخصصة عند تجاوز الحد
 */
const rateLimitMessage = (info: RateLimitInfo) => ({
  success: false,
  message: "تم تجاوز عدد المحاولات المسموح بها. الرجاء المحاولة لاحقاً.",
  messageEn: "Too many requests. Please try again later.",
  limit: info.limit,
  remaining: info.remaining,
  resetAt: info.reset.toISOString(),
  retryAfter: Math.ceil((info.reset.getTime() - Date.now()) / 1000), // بالثواني
});

/**
 * Redis Store Configuration
 * يستخدم Redis لتخزين rate limit counters
 * مما يسمح بالتوزيع على multiple servers
 */
const createRedisStore = (prefix: string): any => {
  const redis = getRedisInstance();
  if (!redis) {
    console.warn("⚠️ Redis not available, using memory store for rate limiting");
    return undefined;
  }

  try {
    return new RedisStore({
      client: redis as any,
      prefix: `ratelimit:${prefix}:`,
    } as any);
  } catch (error) {
    console.error("Failed to create Redis store for rate limiting:", error);
    return undefined;
  }
};

/**
 * Handler مخصص للأخطاء
 */
const rateLimitHandler = (
  req: Request,
  res: Response,
  _next: () => void,
  options: Options
) => {
  const resetTime = new Date(Date.now() + (options.windowMs || 60000));
  const info: RateLimitInfo = {
    limit: options.max as number,
    remaining: 0,
    reset: resetTime,
  };

  res.status(429).json(rateLimitMessage(info));
};

/**
 * Skip للـ trusted IPs (optional)
 * يمكن تفعيله لاستثناء IPs معينة من rate limiting
 */
const skipTrustedIps = (req: Request): boolean => {
  const trustedIps = process.env.TRUSTED_IPS?.split(",") || [];
  const clientIp = ipKeyGenerator(req);
  
  return trustedIps.includes(clientIp);
};

/**
 * General API Rate Limiter
 * 
 * حد عام لجميع API requests
 * - 100 طلب كل 15 دقيقة
 * - يطبق على جميع /api/* endpoints
 * 
 * @example
 * ```typescript
 * app.use('/api/', generalLimiter);
 * ```
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب
  message: "تم تجاوز عدد الطلبات المسموح بها",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: createRedisStore("general"),
  handler: rateLimitHandler,
  skip: skipTrustedIps,
  keyGenerator: (req) => {
    // استخدام IP + User ID (إذا كان متاح)
    const ip = ipKeyGenerator(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
});

/**
 * Login Rate Limiter
 * 
 * حد صارم لمحاولات تسجيل الدخول
 * - 5 محاولات كل 15 دقيقة
 * - يمنع brute-force attacks
 * 
 * @example
 * ```typescript
 * app.post('/api/auth/login', loginLimiter, authController.login);
 * ```
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  message: "تم تجاوز عدد محاولات تسجيل الدخول. الرجاء المحاولة بعد 15 دقيقة.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("login"),
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // لا تحسب المحاولات الناجحة
  keyGenerator: (req) => {
    // استخدام email + IP للدقة
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || "unknown";
    return `${ip}:${email}`;
  },
});

/**
 * Registration Rate Limiter
 * 
 * حد لتسجيلات الحسابات الجديدة
 * - 3 تسجيلات كل ساعة
 * - يمنع إنشاء حسابات وهمية
 * 
 * @example
 * ```typescript
 * app.post('/api/auth/register', registerLimiter, authController.register);
 * ```
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 تسجيلات فقط
  message: "تم تجاوز عدد التسجيلات المسموح بها. الرجاء المحاولة بعد ساعة.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("register"),
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  },
});

/**
 * Password Reset Rate Limiter
 * 
 * حد لطلبات إعادة تعيين كلمة المرور
 * - 3 طلبات كل ساعة
 * - يمنع spam و abuse
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 طلبات
  message: "تم تجاوز عدد طلبات إعادة تعيين كلمة المرور. الرجاء المحاولة بعد ساعة.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("password-reset"),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || "unknown";
    return `${ip}:${email}`;
  },
});

/**
 * File Upload Rate Limiter
 * 
 * حد لرفع الملفات
 * - 10 uploads كل ساعة
 * - يمنع استهلاك storage
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // 10 uploads
  message: "تم تجاوز عدد رفع الملفات المسموح به. الرجاء المحاولة بعد ساعة.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("upload"),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
});

/**
 * Admin Actions Rate Limiter
 * 
 * حد لإجراءات الإدارة الحساسة
 * - 30 إجراء كل 15 دقيقة
 * - حماية إضافية للـ admin endpoints
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 30, // 30 إجراء
  message: "تم تجاوز عدد الإجراءات الإدارية المسموح بها.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("admin"),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || "anonymous";
    return `admin:${userId}`;
  },
});

/**
 * Strict Rate Limiter
 * 
 * حد صارم جداً للـ endpoints الحساسة
 * - 3 طلبات كل 5 دقائق
 * - للاستخدام في APIs حرجة
 */
export const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 3, // 3 طلبات فقط
  message: "تم تجاوز عدد الطلبات المسموح بها لهذا الإجراء الحساس.",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("strict"),
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const userId = (req as any).user?.id || "anonymous";
    return `${ip}:${userId}`;
  },
});

/**
 * Create Custom Rate Limiter
 * 
 * إنشاء rate limiter مخصص بإعدادات محددة
 * 
 * @param options - خيارات Rate Limiter
 * @returns Rate Limiter middleware
 * 
 * @example
 * ```typescript
 * const customLimiter = createRateLimiter({
 *   windowMs: 60000,
 *   max: 10,
 *   prefix: 'custom'
 * });
 * ```
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  prefix: string;
  skipSuccessful?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || "تم تجاوز عدد الطلبات المسموح بها",
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(options.prefix),
    handler: rateLimitHandler,
    skipSuccessfulRequests: options.skipSuccessful || false,
    skip: skipTrustedIps,
  });
};

/**
 * Rate Limit Info Middleware
 * 
 * إضافة معلومات rate limit إلى response headers
 * مفيد للـ debugging و monitoring
 */
export const rateLimitInfo = (req: Request, res: Response, next: () => void) => {
  res.on("finish", () => {
    const limit = res.getHeader("RateLimit-Limit");
    const remaining = res.getHeader("RateLimit-Remaining");
    const reset = res.getHeader("RateLimit-Reset");

    if (limit && remaining && reset) {
      console.log(`📊 Rate Limit Info - IP: ${req.ip}, Limit: ${limit}, Remaining: ${remaining}, Reset: ${reset}`);
    }
  });

  next();
};

/**
 * Export all limiters
 */
export default {
  general: generalLimiter,
  login: loginLimiter,
  register: registerLimiter,
  passwordReset: passwordResetLimiter,
  upload: uploadLimiter,
  admin: adminLimiter,
  strict: strictLimiter,
  create: createRateLimiter,
  info: rateLimitInfo,
};
