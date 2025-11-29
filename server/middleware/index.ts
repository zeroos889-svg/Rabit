/**
 * Rabit HR Platform - Middleware
 * 
 * Express middleware for:
 * - Authentication verification
 * - Authorization checks
 * - Request logging
 * - Error handling
 * - Rate limiting
 * - CORS configuration
 * - Security headers
 * - CSRF protection
 * 
 * @module middleware
 */

/* eslint-disable no-undef */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifySessionToken } from "../_core/jwt";
import { COOKIE_NAME } from "@shared/const";
import type { Permission, Role } from "../security/rbac";
import { hasAnyPermission } from "../security/rbac";
import { logger } from "../_core/logger";
import { getRequestId } from "../_core/requestTracking";

// ============================================================================
// Types
// ============================================================================

export interface AuthenticatedUser {
  id: number;
  email: string;
  name?: string;
  role: Role;
  openId?: string;
  userType?: string;
  phoneNumber?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

// ============================================================================
// Rate Limiting (In-Memory with Sliding Window)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Creates a rate limiting middleware with sliding window algorithm
 */
export function createRateLimiter(config: RateLimitConfig): RequestHandler {
  const {
    windowMs,
    maxRequests,
    message = "طلبات كثيرة جداً، يرجى المحاولة لاحقاً",
    skipSuccessfulRequests = false,
    keyGenerator = (req: Request) => {
      // Use IP address as default key
      const forwarded = req.headers["x-forwarded-for"];
      if (typeof forwarded === "string") {
        return forwarded.split(",")[0]?.trim() || "unknown";
      }
      return req.ip || req.socket?.remoteAddress || "unknown";
    },
  } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let entry = rateLimitStore.get(key);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        timestamps: [],
      };
      rateLimitStore.set(key, entry);
    }

    // Filter out timestamps outside the current window (sliding window)
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);
    entry.count = entry.timestamps.length;

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      const firstTimestamp = entry.timestamps[0] ?? now;
      const retryAfter = Math.ceil((firstTimestamp + windowMs - now) / 1000);
      
      res.set("Retry-After", String(retryAfter));
      res.set("X-RateLimit-Limit", String(maxRequests));
      res.set("X-RateLimit-Remaining", "0");
      res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetTime / 1000)));

      logger.warn("Rate limit exceeded", {
        context: "RateLimit",
        key,
        count: entry.count,
        maxRequests,
        requestId: getRequestId(req),
      });

      res.status(429).json({
        error: "Too Many Requests",
        message,
        retryAfter,
      });
      return;
    }

    // Add current request timestamp
    entry.timestamps.push(now);
    entry.count = entry.timestamps.length;
    entry.resetTime = now + windowMs;

    // Set rate limit headers
    res.set("X-RateLimit-Limit", String(maxRequests));
    res.set("X-RateLimit-Remaining", String(Math.max(0, maxRequests - entry.count)));
    res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetTime / 1000)));

    // If skipSuccessfulRequests, remove timestamp on successful response
    if (skipSuccessfulRequests) {
      const originalEnd = res.end.bind(res) as (chunk?: unknown, encoding?: BufferEncoding, callback?: () => void) => Response;
      res.end = function (chunk?: unknown, encoding?: BufferEncoding | (() => void), callback?: () => void) {
        if (res.statusCode < 400) {
          const idx = entry.timestamps.indexOf(now);
          if (idx > -1) {
            entry.timestamps.splice(idx, 1);
            entry.count = entry.timestamps.length;
          }
        }
        if (typeof encoding === 'function') {
          return originalEnd(chunk, undefined, encoding);
        }
        return originalEnd(chunk, encoding, callback);
      } as typeof res.end;
    }

    next();
  };
}

// Pre-configured rate limiters
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "طلبات كثيرة جداً، يرجى المحاولة بعد دقيقة",
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: "محاولات كثيرة لتسجيل الدخول، يرجى المحاولة بعد 15 دقيقة",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: "تجاوزت الحد المسموح من طلبات API",
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: "عمليات كثيرة جداً، يرجى الانتظار",
});

// ============================================================================
// Security Headers
// ============================================================================

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | false;
  xFrameOptions?: "DENY" | "SAMEORIGIN" | false;
  xContentTypeOptions?: boolean;
  xXssProtection?: boolean;
  strictTransportSecurity?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.rabit.sa https://*.up.railway.app wss://*.rabit.sa wss://*.up.railway.app https://www.google-analytics.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Adds security headers to responses
 */
export function securityHeaders(config: SecurityHeadersConfig = {}): RequestHandler {
  const {
    contentSecurityPolicy = DEFAULT_CSP,
    xFrameOptions = "DENY",
    xContentTypeOptions = true,
    xXssProtection = true,
    strictTransportSecurity = true,
    referrerPolicy = "strict-origin-when-cross-origin",
    permissionsPolicy = "camera=(), microphone=(), geolocation=()",
  } = config;

  return (_req: Request, res: Response, next: NextFunction): void => {
    // Content Security Policy
    if (contentSecurityPolicy) {
      res.setHeader("Content-Security-Policy", contentSecurityPolicy);
    }

    // X-Frame-Options (clickjacking protection)
    if (xFrameOptions) {
      res.setHeader("X-Frame-Options", xFrameOptions);
    }

    // X-Content-Type-Options (MIME sniffing protection)
    if (xContentTypeOptions) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    }

    // X-XSS-Protection (legacy browsers)
    if (xXssProtection) {
      res.setHeader("X-XSS-Protection", "1; mode=block");
    }

    // Strict Transport Security (HTTPS enforcement)
    if (strictTransportSecurity) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // Referrer Policy
    if (referrerPolicy) {
      res.setHeader("Referrer-Policy", referrerPolicy);
    }

    // Permissions Policy (feature restrictions)
    if (permissionsPolicy) {
      res.setHeader("Permissions-Policy", permissionsPolicy);
    }

    // Remove X-Powered-By header
    res.removeHeader("X-Powered-By");

    next();
  };
}

// ============================================================================
// CSRF Protection
// ============================================================================

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_COOKIE_NAME = "_csrf";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generates a cryptographically secure CSRF token
 */
function generateCsrfToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const randomValues = new Uint32Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
    const idx = (randomValues[i] ?? 0) % chars.length;
    token += chars[idx];
  }
  return token;
}

/**
 * CSRF protection middleware
 * Uses double-submit cookie pattern
 */
export function csrfProtection(): RequestHandler {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip safe methods
    if (safeMethods.has(req.method)) {
      // Generate and set CSRF token for non-safe method requests
      let token = req.cookies?.[CSRF_COOKIE_NAME];
      if (!token) {
        token = generateCsrfToken();
        res.cookie(CSRF_COOKIE_NAME, token, {
          httpOnly: false, // Client needs to read this
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
      }
      // Expose token for client to use
      (req as AuthenticatedRequest & { csrfToken?: string }).csrfToken = token;
      next();
      return;
    }

    // Validate CSRF token for unsafe methods
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_TOKEN_HEADER] as string | undefined;

    if (!cookieToken || !headerToken) {
      logger.warn("CSRF token missing", {
        context: "CSRF",
        hasCookie: Boolean(cookieToken),
        hasHeader: Boolean(headerToken),
        requestId: getRequestId(req),
      });
      res.status(403).json({
        error: "Forbidden",
        message: "CSRF token missing",
      });
      return;
    }

    // Constant-time comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
      res.status(403).json({
        error: "Forbidden",
        message: "Invalid CSRF token",
      });
      return;
    }

    let mismatch = 0;
    for (let i = 0; i < cookieToken.length; i++) {
      mismatch |= (cookieToken.codePointAt(i) ?? 0) ^ (headerToken.codePointAt(i) ?? 0);
    }

    if (mismatch !== 0) {
      logger.warn("CSRF token mismatch", {
        context: "CSRF",
        requestId: getRequestId(req),
      });
      res.status(403).json({
        error: "Forbidden",
        message: "Invalid CSRF token",
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Request Logging
// ============================================================================

export interface RequestLoggingConfig {
  logBody?: boolean;
  logHeaders?: boolean;
  excludePaths?: string[];
  sensitiveHeaders?: string[];
}

/**
 * Logs incoming requests and outgoing responses
 */
export function requestLogging(config: RequestLoggingConfig = {}): RequestHandler {
  const {
    logBody = false,
    logHeaders = false,
    excludePaths = ["/health", "/favicon.ico"],
    sensitiveHeaders = ["authorization", "cookie", "x-api-key"],
  } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      next();
      return;
    }

    // Ensure request ID exists
    const requestId = getRequestId(req) || "unknown";
    const startTime = Date.now();

    // Build log data
    const logData: Record<string, unknown> = {
      context: "Request",
      requestId,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
    };

    if (logHeaders) {
      const headers = { ...req.headers };
      for (const header of sensitiveHeaders) {
        if (headers[header]) {
          headers[header] = "[REDACTED]";
        }
      }
      logData.headers = headers;
    }

    if (logBody && req.body && Object.keys(req.body).length > 0) {
      // Redact sensitive fields
      const body = { ...req.body };
      const sensitiveFields = ["password", "token", "secret", "creditCard", "cvv"];
      for (const field of sensitiveFields) {
        if (body[field]) {
          body[field] = "[REDACTED]";
        }
      }
      logData.body = body;
    }

    logger.info("Incoming request", logData);

    // Log response on finish
    const originalEnd = res.end.bind(res) as (chunk?: unknown, encoding?: BufferEncoding, callback?: () => void) => Response;
    res.end = function (chunk?: unknown, encoding?: BufferEncoding | (() => void), callback?: () => void) {
      const duration = Date.now() - startTime;
      
      logger.info("Response sent", {
        context: "Response",
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      if (typeof encoding === 'function') {
        return originalEnd(chunk, undefined, encoding);
      }
      return originalEnd(chunk, encoding, callback);
    } as typeof res.end;

    next();
  };
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Extracts and verifies user from session cookie
 * Does not block request if no user - use requireAuth for that
 */
export function extractUser(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    
    try {
      const token = req.cookies?.[COOKIE_NAME];
      
      if (!token) {
        next();
        return;
      }

      const payload = await verifySessionToken(token);
      
      if (payload) {
        authReq.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role as Role,
          name: payload.name,
          openId: payload.openId,
        };
      }
    } catch (error) {
      // Token invalid or expired - clear the cookie
      logger.debug("Invalid session token", {
        context: "Auth",
        error: error instanceof Error ? error.message : "Unknown error",
        requestId: getRequestId(req),
      });
      res.clearCookie(COOKIE_NAME);
    }

    next();
  };
}

/**
 * Requires authenticated user - blocks request if not authenticated
 */
export function requireAuth(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "يجب تسجيل الدخول للوصول إلى هذا المورد",
      });
      return;
    }

    next();
  };
}

/**
 * Requires specific role(s)
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "يجب تسجيل الدخول",
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      logger.warn("Insufficient role", {
        context: "Auth",
        userId: authReq.user.id,
        userRole: authReq.user.role,
        requiredRoles: roles,
        requestId: getRequestId(req),
      });
      res.status(403).json({
        error: "Forbidden",
        message: "ليس لديك صلاحية للوصول إلى هذا المورد",
      });
      return;
    }

    next();
  };
}

/**
 * Requires specific permission(s)
 */
export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "يجب تسجيل الدخول",
      });
      return;
    }

    const hasRequired = hasAnyPermission(authReq.user.role, permissions);
    
    if (!hasRequired) {
      logger.warn("Insufficient permissions", {
        context: "Auth",
        userId: authReq.user.id,
        userRole: authReq.user.role,
        requiredPermissions: permissions,
        requestId: getRequestId(req),
      });
      res.status(403).json({
        error: "Forbidden",
        message: "ليس لديك الصلاحيات المطلوبة",
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Global error handler middleware
 */
export function errorHandler(): (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (
    error: ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    const requestId = getRequestId(req);
    const statusCode = error.statusCode || 500;
    const isProduction = process.env.NODE_ENV === "production";

    // Log the error
    logger.error("Unhandled error", {
      context: "ErrorHandler",
      requestId,
      statusCode,
      code: error.code,
      message: error.message,
      stack: isProduction ? undefined : error.stack,
      path: req.path,
      method: req.method,
    });

    // Send error response
    res.status(statusCode).json({
      error: error.code || "InternalServerError",
      message: isProduction && statusCode === 500 
        ? "حدث خطأ غير متوقع" 
        : error.message,
      requestId,
      ...(isProduction ? {} : { details: error.details, stack: error.stack }),
    });
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(): RequestHandler {
  return (req: Request, res: Response): void => {
    const requestId = getRequestId(req);
    
    logger.warn("Route not found", {
      context: "Router",
      requestId,
      path: req.path,
      method: req.method,
    });

    res.status(404).json({
      error: "NotFound",
      message: `المسار ${req.path} غير موجود`,
      requestId,
    });
  };
}

// ============================================================================
// Request Sanitization
// ============================================================================

/**
 * Sanitizes request body to prevent XSS
 */
export function sanitizeInput(): RequestHandler {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      // Basic HTML entity encoding
      return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#x27;");
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === "object") {
      // Skip sanitization for specific content types
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("multipart/form-data")) {
        next();
        return;
      }
      req.body = sanitizeValue(req.body);
    }
    next();
  };
}

// ============================================================================
// CORS Configuration
// ============================================================================

export interface CorsConfig {
  origins?: string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * CORS middleware
 */
export function cors(config: CorsConfig = {}): RequestHandler {
  const {
    origins = ["http://localhost:3000", "http://localhost:5173", "https://rabit.sa", "https://www.rabit.sa", "https://rabit-app-production.up.railway.app"],
    methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID"],
    exposedHeaders = ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    credentials = true,
    maxAge = 86400, // 24 hours
  } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    // Check if origin is allowed
    if (origin && (origins.includes(origin) || origins.includes("*"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    if (credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "));
    res.setHeader("Access-Control-Expose-Headers", exposedHeaders.join(", "));
    res.setHeader("Access-Control-Max-Age", String(maxAge));

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  };
}

// ============================================================================
// Utility Middleware
// ============================================================================

/**
 * Adds request timing header
 */
export function requestTiming(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const durationNs = Number(end - start);
      const durationMs = (durationNs / 1_000_000).toFixed(2);
      res.setHeader("X-Response-Time", `${durationMs}ms`);
    });

    next();
  };
}

/**
 * Health check endpoint handler
 */
export function healthCheck(): RequestHandler {
  return (_req: Request, res: Response): void => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  };
}

// ============================================================================
// Export configured middleware stack
// ============================================================================

/**
 * Returns a commonly used middleware stack for API routes
 */
export function apiMiddlewareStack(): RequestHandler[] {
  return [
    requestTiming(),
    securityHeaders(),
    cors(),
    requestLogging(),
    extractUser(),
    generalRateLimiter,
  ];
}

/**
 * Returns middleware stack for authentication routes
 */
export function authMiddlewareStack(): RequestHandler[] {
  return [
    requestTiming(),
    securityHeaders(),
    cors(),
    requestLogging(),
    authRateLimiter,
  ];
}

// Re-export types
export type { Permission, Role } from "../security/rbac";
