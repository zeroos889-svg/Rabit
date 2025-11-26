/**
 * Auth Helper Functions
 * دوال مساعدة لتبسيط منطق المصادقة المعقد
 */

import type { Request } from "express";
import * as db from "./db";
import { sendEmailDetailed } from "./_core/email";
import { sendSMS, getLoginOtpSMS, getLoginAlertSMS } from "./_core/sms";
import { recordAudit } from "./audit";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

interface OtpResult {
  success: boolean;
  requiresOtp: boolean;
  message: string;
}

/**
 * إرسال رمز OTP عبر البريد و SMS
 */
export async function sendOtpCode(params: {
  userId: number;
  email: string;
  phoneNumber: string | null;
  ip: string;
  userAgent: string;
}): Promise<OtpResult> {
  const { userId, email, phoneNumber, ip, userAgent } = params;
  
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.setLoginOtp({
    userId,
    code,
    expiresAt,
    ip,
    userAgent,
  });

  const smsOtpEnabled = ENV.enableSms2fa && Boolean(phoneNumber);

  // إرسال البريد الإلكتروني
  const emailPromise = sendEmailDetailed({
    to: email,
    subject: "رمز الدخول الآمن (OTP)",
    html: `<p>رمز الدخول الخاص بك هو <strong>${code}</strong></p><p>صالح لمدة 10 دقائق.</p>`,
    template: "login-otp",
    userId,
  }).catch(() => undefined);

  // إرسال SMS إذا كان مفعلاً
  const smsPromise = smsOtpEnabled
    ? sendSMS({
        to: phoneNumber!,
        message: getLoginOtpSMS({ code }),
        userId,
      }).catch(() => false)
    : Promise.resolve(false);

  await Promise.all([emailPromise, smsPromise]);

  recordAudit({
    action: "auth:otp_sent",
    actorId: userId,
    actorEmail: email,
    resource: "auth",
  });

  return {
    success: false,
    requiresOtp: true,
    message: "تم إرسال رمز تحقق إلى بريدك الإلكتروني",
  };
}

/**
 * التحقق من صحة رمز OTP
 */
export async function verifyOtpCode(params: {
  userId: number;
  otpInput: string;
}): Promise<void> {
  const { userId, otpInput } = params;
  
  const pendingOtp = await db.getLoginOtp(userId);

  if (!pendingOtp || pendingOtp.expiresAt < new Date()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "رمز التحقق منتهي أو غير موجود، أعد المحاولة",
    });
  }

  if (pendingOtp.attempts >= 5) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "تم تجاوز محاولات التحقق، الرجاء طلب رمز جديد",
    });
  }

  if (pendingOtp.code !== otpInput) {
    await db.incrementLoginOtpAttempt(userId);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "رمز التحقق غير صحيح",
    });
  }

  await db.clearLoginOtp(userId);
}

/**
 * فحص وإرسال تنبيهات الدخول من جهاز جديد
 */
export async function checkAndSendLoginAlerts(params: {
  userId: number;
  email: string;
  phoneNumber: string | null;
  ip: string;
  userAgent: string;
}): Promise<void> {
  const { userId, email, phoneNumber, ip, userAgent } = params;

  const previousMeta = await db.getLoginMeta(userId);
  
  await db.setLoginMeta(userId, {
    lastIp: ip,
    lastUserAgent: userAgent,
  });

  const shouldSendSmsAlert = ENV.enableSmsLoginAlerts && Boolean(phoneNumber);

  // فحص إذا كان الدخول من جهاز أو موقع مختلف
  const isNewDevice = previousMeta && (
    (previousMeta.lastIp && previousMeta.lastIp !== ip) ||
    (previousMeta.lastUserAgent && previousMeta.lastUserAgent !== userAgent)
  );

  if (isNewDevice) {
    // إرسال تنبيه عبر البريد
    await sendEmailDetailed({
      to: email,
      subject: "تنبيه: تسجيل دخول جديد",
      html: `<p>تم تسجيل الدخول إلى حسابك من جهاز أو موقع مختلف.</p><p>العنوان: ${ip}</p><p>User-Agent: ${userAgent}</p>`,
      template: "login-alert",
      userId,
    }).catch(() => undefined);

    // إرسال تنبيه عبر SMS
    if (shouldSendSmsAlert) {
      await sendSMS({
        to: phoneNumber!,
        message: getLoginAlertSMS({ ip, device: String(userAgent) }),
        userId,
      }).catch(() => false);
    }

    recordAudit({
      action: "auth:login_alert",
      actorId: userId,
      actorEmail: email,
      resource: "auth",
    });
  }
}

/**
 * استخراج معلومات IP و User Agent من الطلب
 */
export function extractRequestMetadata(req?: Request): {
  ip: string;
  userAgent: string;
} {
  const ip = req?.ip || (req?.headers["x-forwarded-for"] as string) || "unknown";
  const userAgent = req?.headers["user-agent"] || "unknown";
  
  return { ip, userAgent };
}
