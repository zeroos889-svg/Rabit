import * as db from "../db";
import { ENV } from "./env";
import { logger } from "./logger";

/**
 * SMS Service
 * Supports multiple providers: Twilio, Unifonic, etc.
 */

interface SMSOptions {
  to: string;
  message: string;
  userId?: number;
}

/**
 * Send SMS
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  const { to, message, userId } = options;

  try {
    // Log the SMS attempt
    await db.logSMS({
      userId,
      toPhone: to,
      message,
      status: "pending",
    });

    // Select provider based on environment
    const provider = process.env.SMS_PROVIDER ?? "none";
    const senderId = process.env.SMS_SENDER_ID ?? ENV.smsSenderId;

    if (provider === "twilio") {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (sid && token && from) {
        const auth = Buffer.from(`${sid}:${token}`).toString("base64");
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: to,
            From: from,
            Body: message,
          }),
        });
        logger.info("[SMS] Sent via Twilio", { to, senderId: from });
      } else {
        logger.warn("[SMS] Twilio selected but credentials missing, skipping send", { to });
      }
    } else if (provider === "unifonic") {
      const appSid = process.env.UNIFONIC_APP_SID || ENV.smsApiKey;
      if (appSid) {
        await fetch("https://api.unifonic.com/rest/SMS/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AppSid: appSid,
            SenderID: senderId,
            Recipient: to,
            Body: message,
          }),
        });
        logger.info("[SMS] Sent via Unifonic", { to, senderId });
      } else {
        logger.warn("[SMS] Unifonic selected but AppSid missing, skipping send", { to });
      }
    } else {
      // No external provider configured; log only
      logger.warn("[SMS] No provider configured; SMS not sent", { to, senderId });
    }

    // Update log as sent
    await db.logSMS({
      userId,
      toPhone: to,
      message,
      status: "sent",
    });

    return true;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[SMS Service] Error sending SMS", { error: err.message, to });

    // Log the error
    await db.logSMS({
      userId,
      toPhone: to,
      message,
      status: "failed",
      errorMessage: err.message,
    });

    return false;
  }
}

/**
 * SMS Templates
 */

export function getBookingReminderSMS(data: {
  name: string;
  packageName: string;
  date: string;
}): string {
  return `مرحباً ${data.name}، تذكير بموعد استشارتك "${data.packageName}" في ${data.date}. منصة رابِط`;
}

export function getBookingConfirmationSMS(data: {
  name: string;
  packageName: string;
}): string {
  return `مرحباً ${data.name}، تم تأكيد حجزك "${data.packageName}" بنجاح. سيتم التواصل معك قريباً. منصة رابِط`;
}

export function getResponseNotificationSMS(data: {
  name: string;
  ticketTitle: string;
}): string {
  return `مرحباً ${data.name}، لديك رد جديد على استشارتك "${data.ticketTitle}". تفقد حسابك على منصة رابِط`;
}

export function getLoginOtpSMS(data: { code: string }): string {
  return `رمز التحقق لتسجيل الدخول إلى رابِط هو ${data.code}. صالح لمدة 10 دقائق.`;
}

export function getLoginAlertSMS(data: { ip: string; device: string }): string {
  return `تم تسجيل دخول جديد لحسابك من جهاز ${data.device} وعنوان ${data.ip}. إذا لم تكن أنت، قم بتغيير كلمة المرور فوراً.`;
}

export function getConsultantBookingSMS(data: {
  name: string;
  consultationType: string;
  date: string;
  time: string;
}): string {
  return `مرحباً ${data.name}، تم حجز استشارة "${data.consultationType}" لـ ${data.date} الساعة ${data.time}. تفقد تفاصيل الحجز عبر لوحة المستشار.`;
}
