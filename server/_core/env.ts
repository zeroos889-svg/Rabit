/**
 * Environment Variables Configuration
 * Centralized environment variable management
 */

export const ENV = {
  // Node Environment
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Authentication & Security
  jwtSecret: process.env.JWT_SECRET ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? "",
  sessionMaxAge: Number.parseInt(process.env.SESSION_MAX_AGE ?? "604800000"),

  // Admin Configuration
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",

  // Application
  appUrl: process.env.VITE_APP_URL ?? "http://localhost:3000",
  appTitle: process.env.VITE_APP_TITLE ?? "رابِط - منصة إدارة الموارد البشرية",
  appLogo: process.env.VITE_APP_LOGO ?? "/logo.png",
  port: Number.parseInt(process.env.PORT ?? "3000"),
  trialMode:
    (process.env.VITE_TRIAL_MODE ?? process.env.TRIAL_MODE ?? "false")
      .toString()
      .toLowerCase() === "true",
  trialMessage:
    process.env.VITE_TRIAL_MESSAGE ??
    process.env.TRIAL_MESSAGE ??
    "بوابات الدفع متوقفة مؤقتاً خلال الفترة التجريبية ولن يتم خصم أي مبالغ.",

  // Analytics
  analyticsEndpoint: process.env.VITE_ANALYTICS_ENDPOINT ?? "",
  analyticsWebsiteId: process.env.VITE_ANALYTICS_WEBSITE_ID ?? "",

  // AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",

  // Cloudinary
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? "",

  // Payment Gateways
  moyasarApiKey: process.env.MOYASAR_API_KEY ?? "",
  moyasarSecretKey: process.env.MOYASAR_SECRET_KEY ?? "",
  moyasarWebhookSecret: process.env.MOYASAR_WEBHOOK_SECRET ?? "",
  tapApiKey: process.env.TAP_API_KEY ?? "",
  tapSecretKey: process.env.TAP_SECRET_KEY ?? "",
  tapWebhookSecret: process.env.TAP_WEBHOOK_SECRET ?? "",

  // Email Service
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number.parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  smtpFrom: process.env.SMTP_FROM ?? "noreply@rabit.sa",

  // SMS Service
  smsApiKey: process.env.SMS_API_KEY ?? "",
  smsSenderId: process.env.SMS_SENDER_ID ?? "Rabit",
  enableSms2fa: process.env.ENABLE_SMS_2FA === "true",
  enableSmsLoginAlerts: process.env.ENABLE_SMS_LOGIN_ALERT === "true",
  enableSmsBookingAlerts: process.env.ENABLE_SMS_BOOKING_ALERTS === "true",

  // Google Maps
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  // DeepSeek
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  deepseekApiUrl: process.env.DEEPSEEK_API_URL ?? "https://api.deepseek.com",
  deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",

  // Forge Storage API
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Redis Cache (optional)
  redisUrl: process.env.REDIS_URL || null,

  // LLM Provider Order (optional)
  llmProviderOrder: process.env.LLM_PROVIDER_ORDER ?? "",

  // Security flags
  enable2fa: process.env.ENABLE_2FA === "true",
};

/**
 * Validate required environment variables
 */
import { logger } from './logger';

export function validateEnv(): { valid: boolean; missing: string[]; weak: string[] } {
  const required = ["DATABASE_URL", "JWT_SECRET", "SESSION_SECRET"];

  const missing = required.filter(key => !process.env[key]);
  const weak: string[] = [];
  const hasAiProvider =
    !!(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.BUILT_IN_FORGE_API_KEY);

  if ((process.env.JWT_SECRET || "").length < 16) {
    weak.push("JWT_SECRET should be at least 16 characters");
  }
  if ((process.env.SESSION_SECRET || "").length < 16) {
    weak.push("SESSION_SECRET should be at least 16 characters");
  }
  if (!hasAiProvider) {
    weak.push("AI provider not configured (DeepSeek/OpenAI/Forge)");
  }

  return {
    valid: missing.length === 0 && weak.length === 0,
    missing,
    weak,
  };
}

/**
 * Check if environment is properly configured
 */
export function checkEnv(): void {
  const { valid, missing, weak } = validateEnv();
  const enforceStrict =
    ENV.isProduction || process.env.ENFORCE_ENV_STRICT === "true";

  if (missing.length > 0) {
    logger.error("Missing required environment variables", { missing });
  }

  if (weak.length > 0) {
    logger.warn("Weak secrets detected", { weak });
  }

  if ((missing.length > 0 || weak.length > 0) && enforceStrict) {
    logger.error("Critical environment validation failed. Exiting.");
    process.exit(1);
  }

  if (valid) {
    logger.info("Environment variables loaded successfully");
  } else if (!enforceStrict) {
    logger.warn("Continuing with non-production environment despite validation warnings");
  }
}
