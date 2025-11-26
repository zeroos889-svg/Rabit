/**
 * Authentication Module
 * Handles user authentication and session management with enhanced security
 * Features:
 * - Login attempt tracking
 * - Account lockout protection (5 attempts, 15min lockout)
 * - IP-based security
 * - Password strength validation
 * - Security event logging
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { createSessionToken, verifySessionToken } from "./jwt";
import { hashPassword, verifyPassword } from "./password";
import { logger } from "./logger";
import { validateRequest, AuthSchemas } from "./validation";

// Security configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number; timestamp: number }>();

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/**
 * Check if account is locked
 */
function isAccountLocked(identifier: string): boolean {
  const attempt = loginAttempts.get(identifier);
  if (!attempt) return false;

  const isLocked =
    attempt.count >= MAX_LOGIN_ATTEMPTS &&
    Date.now() - attempt.timestamp < LOCKOUT_DURATION;

  // Reset if lockout period has passed
  if (!isLocked && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.delete(identifier);
  }

  return isLocked;
}

/**
 * Record login attempt
 */
function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  const attempt = loginAttempts.get(identifier);
  if (attempt) {
    attempt.count++;
    attempt.timestamp = Date.now();
  } else {
    loginAttempts.set(identifier, { count: 1, timestamp: Date.now() });
  }

  // Log security event
  if (attempt && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    logger.warn("Account locked due to multiple failed login attempts", {
      context: "Security",
      identifier,
      attempts: attempt.count,
    });
  }
}

/**
 * Log security event
 */
function logSecurityEvent(
  event: string,
  req: Request,
  additionalData?: Record<string, any>
): void {
  logger.info(event, {
    context: "Security",
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"],
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}

/**
 * Validate password strength
 */
function isPasswordStrong(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { valid: true };
}

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express, authLimiter?: any) {
  // Login with email and password
  const loginMiddleware = authLimiter ? [authLimiter] : [];
  app.post(
    "/api/auth/login",
    ...loginMiddleware,
    validateRequest(AuthSchemas.login, "body"),
    async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        const clientIp = getClientIp(req);

        // Check if account is locked
        if (isAccountLocked(email) || isAccountLocked(clientIp)) {
          logSecurityEvent("Blocked login attempt - Account locked", req, {
            email,
          });
          res.status(429).json({
            error: "Too many failed login attempts. Please try again later.",
          });
          return;
        }

        // Get user by email
        const user = await db.getUserByEmail(email);
        if (!user) {
          recordLoginAttempt(email, false);
          recordLoginAttempt(clientIp, false);
          logSecurityEvent("Failed login attempt - User not found", req, {
            email,
          });
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Get password from database
        const userPassword = await db.getPasswordByUserId(user.id);
        if (!userPassword) {
          recordLoginAttempt(email, false);
          recordLoginAttempt(clientIp, false);
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Verify password
        const isValid = await verifyPassword(
          password,
          userPassword.hashedPassword
        );
        if (!isValid) {
          recordLoginAttempt(email, false);
          recordLoginAttempt(clientIp, false);
          logSecurityEvent("Failed login attempt - Invalid password", req, {
            email,
            userId: user.id,
          });
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Successful login
        recordLoginAttempt(email, true);
        recordLoginAttempt(clientIp, true);

        // Update last signed in
        await db.updateUserLastSignedIn(user.id);

        // Create session token
        const sessionToken = await createSessionToken({
          userId: user.id,
          email: user.email || "",
          role: user.role,
        });

        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        logSecurityEvent("Successful login", req, {
          email,
          userId: user.id,
          role: user.role,
        });

        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } catch (error) {
        logger.error("Login failed", {
          context: "Auth",
          error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({ error: "Login failed" });
      }
    }
  );

  // Register new user
  app.post(
    "/api/auth/register",
    ...loginMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { email, password, name } = req.body;

        if (!email || !password) {
          res.status(400).json({ error: "Email and password are required" });
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({ error: "Invalid email format" });
          return;
        }

        // Validate password strength
        const passwordValidation = isPasswordStrong(password);
        if (!passwordValidation.valid) {
          res.status(400).json({ error: passwordValidation.message });
          return;
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          logSecurityEvent("Registration attempt - User exists", req, {
            email,
          });
          res.status(409).json({ error: "User already exists" });
          return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const userId = await db.createUser({
          email,
          name: name || null,
          role: "user",
        });

        // Save password
        await db.savePassword(userId, hashedPassword);

        // Save privacy consent
        const clientIp = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "unknown";

        await db.saveUserConsent({
          userId,
          policyVersion: "1.0",
          ipAddress: clientIp,
          userAgent,
        });

        // Create session token
        const sessionToken = await createSessionToken({
          userId,
          email,
          role: "user",
        });

        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        logSecurityEvent("Successful registration", req, {
          email,
          userId,
        });

        res.json({
          success: true,
          user: {
            id: userId,
            email,
            name: name || null,
            role: "user",
          },
        });
      } catch (error) {
        logger.error("Registration failed", {
          context: "Auth",
          error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({ error: "Registration failed" });
      }
    }
  );

  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.json({ success: true });
    } catch (error) {
      logger.error("Logout failed", {
        context: "Auth",
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const payload = await verifySessionToken(token);
      if (!payload) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }

      const user = await db.getUserById(payload.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      logger.error("Get user failed", {
        context: "Auth",
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}

/**
 * Authentication middleware
 */
export async function requireAuth(req: Request, res: Response, next: Function) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }

  // Attach user info to request
  (req as any).user = payload;
  next();
}

/**
 * Admin authentication middleware
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: Function
) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const payload = await verifySessionToken(token);
  if (!payload || payload?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  // Attach user info to request
  (req as any).user = payload;
  next();
}

// Clean up old login attempts periodically (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    if (now - attempt.timestamp > LOCKOUT_DURATION) {
      loginAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

