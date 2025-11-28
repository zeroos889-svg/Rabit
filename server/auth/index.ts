/**
 * Rabit HR Platform - Authentication Module
 * 
 * This module handles user authentication including:
 * - Email/Password registration and login
 * - OAuth integration (Google, Apple, etc.)
 * - Session management
 * - JWT token generation
 * - Password reset functionality
 * - Two-factor authentication (2FA)
 * - Account security features
 * 
 * @module auth
 */

import crypto from "node:crypto";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { createSessionToken, verifySessionToken, refreshSessionToken } from "../_core/jwt";
import { validatePasswordStrength, hashPassword } from "../_core/password";
import { sendEmailDetailed, sendPasswordResetEmail, sendWelcomeEmail } from "../_core/email";
import { sendSMS, getLoginOtpSMS, getLoginAlertSMS, getWelcomeSMS } from "../_core/sms";
import { logger } from "../_core/logger";
import { ENV } from "../_core/env";
import { recordAudit } from "../audit";
import * as db from "../db";

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: string;
  userType?: string | null;
  phoneNumber?: string | null;
  openId?: string | null;
  profilePicture?: string | null;
  profileCompleted?: boolean | null;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  userType?: "employee" | "individual" | "company" | "consultant";
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  otp?: string;
}

export interface OAuthProfile {
  provider: "google" | "apple" | "microsoft" | "github";
  openId: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  name?: string;
  openId?: string;
  userType?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  message?: string;
  requiresOtp?: boolean;
  requiresVerification?: boolean;
}

export interface RequestMetadata {
  ip: string;
  userAgent: string;
  country?: string;
  city?: string;
}

// ============================================================================
// Constants
// ============================================================================

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_EXPIRY_HOURS = 1;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts request metadata (IP, User Agent)
 */
export function extractRequestMetadata(req?: Request): RequestMetadata {
  if (!req) {
    return { ip: "unknown", userAgent: "unknown" };
  }
  
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" 
    ? forwarded.split(",")[0]?.trim() || "unknown"
    : req.ip || req.socket?.remoteAddress || "unknown";
  
  const userAgent = req.headers["user-agent"] || "unknown";
  
  // Could extract geo info from IP in production using GeoIP service
  return { ip, userAgent };
}

/**
 * Generates a secure random OTP code
 */
export function generateOtpCode(length = 6): string {
  const digits = "0123456789";
  let code = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    const idx = (randomBytes[i] ?? 0) % 10;
    code += digits[idx];
  }
  return code;
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Checks if an account is locked due to too many failed attempts
 */
async function isAccountLocked(userId: number): Promise<boolean> {
  const loginAttempts = await db.getLoginAttempts(userId);
  
  if (!loginAttempts || loginAttempts.failedCount < MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  
  const lockoutEnd = new Date(loginAttempts.lastAttempt);
  lockoutEnd.setMinutes(lockoutEnd.getMinutes() + LOCKOUT_DURATION_MINUTES);
  
  return new Date() < lockoutEnd;
}

/**
 * Records a failed login attempt
 */
async function recordFailedLogin(userId: number, ip: string): Promise<void> {
  await db.incrementLoginAttempts(userId);
  
  const attempts = await db.getLoginAttempts(userId);
  
  if (attempts && attempts.failedCount >= MAX_LOGIN_ATTEMPTS) {
    logger.warn("Account locked due to failed attempts", {
      context: "Auth",
      userId,
      ip,
      failedCount: attempts.failedCount,
    });
    
    recordAudit({
      action: "auth:account_locked",
      actorId: userId,
      resource: "auth",
      metadata: { ip, failedCount: attempts.failedCount },
      summary: "الحساب مقفل بسبب محاولات فاشلة متعددة",
    });
  }
}

/**
 * Clears failed login attempts after successful login
 */
async function clearFailedLogins(userId: number): Promise<void> {
  await db.clearLoginAttempts(userId);
}

// ============================================================================
// Registration
// ============================================================================

/**
 * Registers a new user with email and password
 */
export async function register(
  input: RegisterInput,
  req?: Request
): Promise<AuthResult> {
  const { name, email, password, phoneNumber, userType = "employee" } = input;
  const metadata = extractRequestMetadata(req);

  try {
    // Check password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return {
        success: false,
        message: passwordCheck.errors.join(" | "),
      };
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        message: "البريد الإلكتروني مستخدم مسبقاً",
      };
    }

    // Create user
    const user = await db.createUserWithPassword({
      name,
      email,
      password,
      phoneNumber,
      userType,
    });

    if (!user) {
      return {
        success: false,
        message: "فشل في إنشاء الحساب",
      };
    }

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS);
    
    await db.setEmailVerificationToken(user.id, verificationToken, verificationExpiry);

    // Send welcome email with verification link
    sendWelcomeEmail({
      to: email,
      name,
      verificationToken,
      userId: user.id,
    }).catch(err => {
      logger.error("Failed to send welcome email", {
        context: "Auth",
        userId: user.id,
        error: err instanceof Error ? err.message : "Unknown",
      });
    });

    // Send welcome SMS if phone number provided
    if (phoneNumber && ENV.enableSmsWelcome) {
      sendSMS({
        to: phoneNumber,
        message: getWelcomeSMS({ name }),
        userId: user.id,
      }).catch(() => undefined);
    }

    // Record audit
    recordAudit({
      action: "auth:register",
      actorId: user.id,
      actorEmail: email,
      resource: "auth",
      metadata: { userType, ip: metadata.ip },
      summary: `${name} سجل حساباً جديداً`,
    });

    logger.info("User registered", {
      context: "Auth",
      userId: user.id,
      email,
      userType,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.name || name,
        role: user.role || "user",
        userType: user.userType || userType,
      },
      requiresVerification: true,
      message: "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني",
    };
  } catch (error) {
    logger.error("Registration failed", {
      context: "Auth",
      email,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى",
    };
  }
}

// ============================================================================
// Login
// ============================================================================

/**
 * Handles OTP sending for 2FA
 */
async function handleOtpSending(
  user: { id: number; email?: string | null; phoneNumber?: string | null }
): Promise<AuthResult> {
  const otpCode = generateOtpCode();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + OTP_EXPIRY_MINUTES);

  await db.setLoginOtp({
    userId: user.id,
    code: otpCode,
    expiresAt: otpExpiry,
    ip: "",
    userAgent: "",
  });

  // Send OTP via email
  if (user.email) {
    sendEmailDetailed({
      to: user.email,
      subject: "رمز الدخول الآمن (OTP)",
      html: `<p>رمز الدخول الخاص بك هو <strong>${otpCode}</strong></p><p>صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق.</p>`,
      template: "login-otp",
      userId: user.id,
    }).catch(() => undefined);
  }

  // Send OTP via SMS if enabled
  if (user.phoneNumber && ENV.enableSms2fa) {
    sendSMS({
      to: user.phoneNumber,
      message: getLoginOtpSMS({ code: otpCode }),
      userId: user.id,
    }).catch(() => undefined);
  }

  recordAudit({
    action: "auth:otp_sent",
    actorId: user.id,
    actorEmail: user.email || "",
    resource: "auth",
  });

  return {
    success: false,
    requiresOtp: true,
    message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
  };
}

/**
 * Verifies OTP code for 2FA
 */
async function verifyOtpCode(userId: number, otp: string): Promise<{ valid: boolean; message?: string }> {
  const pendingOtp = await db.getLoginOtp(userId);

  if (!pendingOtp || pendingOtp.expiresAt < new Date()) {
    return { valid: false, message: "رمز التحقق منتهي أو غير موجود" };
  }

  if (pendingOtp.attempts >= OTP_MAX_ATTEMPTS) {
    await db.clearLoginOtp(userId);
    return { valid: false, message: "تم تجاوز محاولات التحقق، الرجاء طلب رمز جديد" };
  }

  if (pendingOtp.code !== otp) {
    await db.incrementLoginOtpAttempt(userId);
    return { valid: false, message: "رمز التحقق غير صحيح" };
  }

  await db.clearLoginOtp(userId);
  return { valid: true };
}

/**
 * Creates session and sets cookie after successful login
 */
async function createLoginSession(
  user: { id: number; email?: string | null; name?: string | null; role?: string | null; userType?: string | null },
  email: string,
  rememberMe: boolean | undefined,
  req: Request | undefined,
  res: Response | undefined
): Promise<void> {
  const sessionToken = await createSessionToken({
    userId: user.id,
    email: user.email || email,
    role: user.role || "user",
    name: user.name ?? undefined,
    userType: user.userType ?? undefined,
  });

  if (res && req) {
    const cookieOptions = getSessionCookieOptions(req);
    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
  }
}

/**
 * Authenticates user with email and password
 */
export async function login(
  input: LoginInput,
  req?: Request,
  res?: Response
): Promise<AuthResult> {
  const { email, password, rememberMe, otp } = input;
  const metadata = extractRequestMetadata(req);

  try {
    // Find user by email
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return { success: false, message: "بيانات الدخول غير صحيحة" };
    }

    // Check if account is locked
    if (await isAccountLocked(user.id)) {
      return { success: false, message: `الحساب مقفل مؤقتاً. يرجى المحاولة بعد ${LOCKOUT_DURATION_MINUTES} دقيقة` };
    }

    // Verify password
    const passwordValid = await db.verifyUserLogin(email, password);
    if (!passwordValid) {
      await recordFailedLogin(user.id, metadata.ip);
      return { success: false, message: "بيانات الدخول غير صحيحة" };
    }

    // Handle 2FA if enabled
    if (ENV.enable2fa) {
      if (!otp) {
        return handleOtpSending(user);
      }
      const otpResult = await verifyOtpCode(user.id, otp);
      if (!otpResult.valid) {
        return { success: false, message: otpResult.message || "رمز التحقق غير صحيح" };
      }
    }

    // Clear failed login attempts and create session
    await clearFailedLogins(user.id);
    await createLoginSession(user, email, rememberMe, req, res);

    // Check for suspicious login
    await checkLoginSecurity(
      {
        ...user,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        userType: user.userType ?? undefined,
      },
      metadata
    );

    // Record audit
    recordAudit({
      action: "auth:login",
      actorId: user.id,
      actorEmail: email,
      resource: "auth",
      metadata: { ip: metadata.ip, rememberMe: Boolean(rememberMe) },
      summary: `${user.name || email} سجل الدخول`,
    });

    logger.info("User logged in", {
      context: "Auth",
      userId: user.id,
      email,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.name,
        role: user.role || "user",
        userType: user.userType,
        profilePicture: user.profilePicture,
        profileCompleted: user.profileCompleted,
      },
      message: "تم تسجيل الدخول بنجاح",
    };
  } catch (error) {
    logger.error("Login failed", {
      context: "Auth",
      email,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في تسجيل الدخول",
    };
  }
}

/**
 * Checks for suspicious login activity and sends alerts
 */
async function checkLoginSecurity(
  user: Partial<AuthUser> & { id: number },
  metadata: RequestMetadata
): Promise<void> {
  try {
    const previousMeta = await db.getLoginMeta(user.id);
    
    await db.setLoginMeta(user.id, {
      lastIp: metadata.ip,
      lastUserAgent: metadata.userAgent,
    });

    // Check if login is from a new device or location
    const isNewDevice = previousMeta && (
      (previousMeta.lastIp && previousMeta.lastIp !== metadata.ip) ||
      (previousMeta.lastUserAgent && previousMeta.lastUserAgent !== metadata.userAgent)
    );

    if (isNewDevice && user.email) {
      // Send alert email
      sendEmailDetailed({
        to: user.email,
        subject: "تنبيه: تسجيل دخول جديد",
        html: `
          <p>تم تسجيل الدخول إلى حسابك من جهاز أو موقع مختلف.</p>
          <p><strong>العنوان:</strong> ${metadata.ip}</p>
          <p><strong>الجهاز:</strong> ${metadata.userAgent}</p>
          <p>إذا لم تكن أنت، يرجى تغيير كلمة المرور فوراً.</p>
        `,
        template: "login-alert",
        userId: user.id,
      }).catch(() => undefined);

      // Send SMS alert if enabled
      if (user.phoneNumber && ENV.enableSmsLoginAlerts) {
        sendSMS({
          to: user.phoneNumber,
          message: getLoginAlertSMS({ ip: metadata.ip, device: metadata.userAgent }),
          userId: user.id,
        }).catch(() => undefined);
      }

      recordAudit({
        action: "auth:login_alert",
        actorId: user.id,
        actorEmail: user.email,
        resource: "auth",
        metadata: { ip: metadata.ip, isNewDevice: true },
      });
    }
  } catch (error) {
    logger.error("Login security check failed", {
      context: "Auth",
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

// ============================================================================
// Logout
// ============================================================================

/**
 * Logs out the current user
 */
export function logout(req?: Request, res?: Response): AuthResult {
  if (res && req) {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  }

  return {
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  };
}

// ============================================================================
// Password Reset
// ============================================================================

/**
 * Initiates password reset process
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const user = await db.getUserByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: "إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور",
      };
    }

    const resetToken = generateSecureToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

    await db.setPasswordResetToken(user.id, resetToken, resetExpiry);

    sendPasswordResetEmail({
      to: user.email || email,
      name: user.name,
      token: resetToken,
      userId: user.id,
    }).catch(err => {
      logger.error("Failed to send password reset email", {
        context: "Auth",
        userId: user.id,
        error: err instanceof Error ? err.message : "Unknown",
      });
    });

    recordAudit({
      action: "auth:password_reset_request",
      actorId: user.id,
      actorEmail: email,
      resource: "auth",
    });

    return {
      success: true,
      message: "إذا كان البريد مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور",
    };
  } catch (error) {
    logger.error("Password reset request failed", {
      context: "Auth",
      email,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "حدث خطأ. يرجى المحاولة مرة أخرى",
    };
  }
}

/**
 * Completes password reset with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return {
        success: false,
        message: passwordCheck.errors.join(" | "),
      };
    }

    // Find user by reset token
    const user = await db.findUserByResetToken(token);
    
    if (!user) {
      return {
        success: false,
        message: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await db.updateUserPassword(user.id, hashedPassword);

    // Clear reset token
    await db.clearPasswordResetToken(user.id);

    // Clear any login attempts
    await clearFailedLogins(user.id);

    // Send confirmation email
    if (user.email) {
      sendEmailDetailed({
        to: user.email,
        subject: "تم تغيير كلمة المرور",
        html: `<p>تم تغيير كلمة المرور بنجاح.</p><p>إذا لم تقم بهذا الإجراء، يرجى التواصل معنا فوراً.</p>`,
        template: "password-changed",
        userId: user.id,
      }).catch(() => undefined);
    }

    recordAudit({
      action: "auth:password_reset",
      actorId: user.id,
      actorEmail: user.email,
      resource: "auth",
    });

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    };
  } catch (error) {
    logger.error("Password reset failed", {
      context: "Auth",
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في تغيير كلمة المرور",
    };
  }
}

// ============================================================================
// Email Verification
// ============================================================================

/**
 * Verifies user email with token
 */
export async function verifyEmail(token: string): Promise<AuthResult> {
  try {
    const user = await db.findUserByVerificationToken(token);
    
    if (!user) {
      return {
        success: false,
        message: "رابط التحقق غير صالح أو منتهي الصلاحية",
      };
    }

    await db.markEmailVerified(user.id);

    recordAudit({
      action: "auth:email_verified",
      actorId: user.id,
      actorEmail: user.email,
      resource: "auth",
    });

    return {
      success: true,
      message: "تم التحقق من البريد الإلكتروني بنجاح",
    };
  } catch (error) {
    logger.error("Email verification failed", {
      context: "Auth",
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في التحقق من البريد الإلكتروني",
    };
  }
}

/**
 * Resends email verification
 */
export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  try {
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return {
        success: true,
        message: "إذا كان البريد مسجلاً، ستصلك رسالة التحقق",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "البريد الإلكتروني محقق مسبقاً",
      };
    }

    const verificationToken = generateSecureToken();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS);
    
    await db.setEmailVerificationToken(user.id, verificationToken, verificationExpiry);

    sendEmailDetailed({
      to: email,
      subject: "تأكيد البريد الإلكتروني",
      html: `<p>اضغط على الرابط التالي لتأكيد بريدك الإلكتروني:</p><a href="${ENV.appUrl}/verify-email?token=${verificationToken}">تأكيد البريد</a>`,
      template: "email-verification",
      userId: user.id,
    }).catch(() => undefined);

    return {
      success: true,
      message: "تم إرسال رسالة التحقق",
    };
  } catch (error) {
    logger.error("Resend verification failed", {
      context: "Auth",
      email,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في إرسال رسالة التحقق",
    };
  }
}

// ============================================================================
// OAuth
// ============================================================================

/**
 * Authenticates or registers user via OAuth
 */
export async function authenticateOAuth(
  profile: OAuthProfile,
  req?: Request,
  res?: Response
): Promise<AuthResult> {
  const { provider, openId, email, name, picture } = profile;
  const metadata = extractRequestMetadata(req);

  try {
    // Check if user exists with this OAuth ID
    let user = await db.getUserByOpenId(openId);

    if (!user) {
      // Check if user exists with this email
      const existingUser = await db.getUserByEmail(email);
      
      if (existingUser) {
        // Link OAuth to existing account
        await db.linkOAuthAccount(existingUser.id, provider, openId);
        user = existingUser;
        
        logger.info("OAuth account linked", {
          context: "Auth",
          userId: existingUser.id,
          provider,
        });
      } else {
        // Create new user
        user = await db.createUserFromOAuth({
          openId,
          email,
          name,
          profilePicture: picture,
          provider,
          providerUserId: openId,
        });

        if (!user) {
          return {
            success: false,
            message: "فشل في إنشاء الحساب",
          };
        }

        // Send welcome email
        if (name) {
          sendWelcomeEmail({
            to: email,
            name,
            userId: user.id,
          }).catch(() => undefined);
        }

        recordAudit({
          action: "auth:oauth_register",
          actorId: user.id,
          actorEmail: email,
          resource: "auth",
          metadata: { provider, ip: metadata.ip },
          summary: `${name || email} سجل عبر ${provider}`,
        });
      }
    }

    // Create session
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email || email,
      role: user.role || "user",
      name: user.name || name,
      openId,
    });

    // Set session cookie
    if (res && req) {
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    }

    // Check login security
    await checkLoginSecurity({
      ...user,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      phoneNumber: user.phoneNumber ?? undefined,
      openId: user.openId ?? undefined,
      profilePicture: user.profilePicture ?? undefined,
      userType: user.userType ?? undefined,
    }, metadata);

    recordAudit({
      action: "auth:oauth_login",
      actorId: user.id,
      actorEmail: user.email || email,
      resource: "auth",
      metadata: { provider, ip: metadata.ip },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.name || name,
        role: user.role || "user",
        userType: user.userType,
        profilePicture: user.profilePicture || picture,
        profileCompleted: user.profileCompleted,
        openId,
      },
      message: "تم تسجيل الدخول بنجاح",
    };
  } catch (error) {
    logger.error("OAuth authentication failed", {
      context: "Auth",
      provider,
      email,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في تسجيل الدخول",
    };
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Validates and returns the current session user
 */
export async function getCurrentUser(req?: Request): Promise<AuthUser | null> {
  try {
    if (!req) return null;
    
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Fetch fresh user data
    const user = await db.getUserById(payload.userId);
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || "",
      name: user.name,
      role: user.role || "user",
      userType: user.userType,
      phoneNumber: user.phoneNumber,
      openId: user.openId,
      profilePicture: user.profilePicture,
      profileCompleted: user.profileCompleted,
    };
  } catch {
    return null;
  }
}

/**
 * Refreshes the session token
 */
export async function refreshSession(
  req?: Request,
  res?: Response
): Promise<AuthResult> {
  try {
    if (!req) {
      return { success: false, message: "No request context" };
    }

    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return { success: false, message: "No session" };
    }

    const newToken = await refreshSessionToken(token);
    if (!newToken) {
      return { success: false, message: "Invalid session" };
    }

    if (res) {
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, newToken, cookieOptions);
    }

    return {
      success: true,
      message: "Session refreshed",
    };
  } catch {
    return { success: false, message: "Failed to refresh session" };
  }
}

// ============================================================================
// Change Password (Authenticated)
// ============================================================================

/**
 * Changes password for authenticated user
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    // Get user
    const user = await db.getUserById(userId);
    if (!user?.email) {
      return {
        success: false,
        message: "المستخدم غير موجود",
      };
    }

    // Verify current password
    const passwordValid = await db.verifyUserLogin(user.email, currentPassword);
    if (!passwordValid) {
      return {
        success: false,
        message: "كلمة المرور الحالية غير صحيحة",
      };
    }

    // Validate new password
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return {
        success: false,
        message: passwordCheck.errors.join(" | "),
      };
    }

    // Hash and update
    const hashedPassword = await hashPassword(newPassword);
    await db.updateUserPassword(userId, hashedPassword);

    // Send notification
    sendEmailDetailed({
      to: user.email,
      subject: "تم تغيير كلمة المرور",
      html: `<p>تم تغيير كلمة المرور بنجاح.</p>`,
      template: "password-changed",
      userId,
    }).catch(() => undefined);

    recordAudit({
      action: "auth:password_changed",
      actorId: userId,
      actorEmail: user.email,
      resource: "auth",
    });

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    };
  } catch (error) {
    logger.error("Change password failed", {
      context: "Auth",
      userId,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return {
      success: false,
      message: "فشل في تغيير كلمة المرور",
    };
  }
}

// ============================================================================
// Export all functions
// ============================================================================

export {
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
} from "../_core/password";
