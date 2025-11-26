/**
 * API Validation Middleware
 * Provides validation utilities and middleware for API endpoints
 */

import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

/**
 * Common validation schemas used across the application
 */
export const CommonSchemas = {
  // Email validation with proper format
  email: z.string().email("البريد الإلكتروني غير صالح"),

  // Password validation (8+ chars, uppercase, lowercase, number, special char)
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير")
    .regex(/[a-z]/, "كلمة المرور يجب أن تحتوي على حرف صغير")
    .regex(/\d/, "كلمة المرور يجب أن تحتوي على رقم")
    .regex(/[^A-Za-z0-9]/, "كلمة المرور يجب أن تحتوي على رمز خاص"),

  // Phone number validation (Saudi format)
  phone: z
    .string()
    .regex(/^(05|5)\d{8}$/, "رقم الجوال يجب أن يكون بصيغة صحيحة"),

  // Positive integer ID
  id: z.number().int().positive("المعرف يجب أن يكون رقماً موجباً"),

  // Optional positive integer ID
  optionalId: z.number().int().positive().optional(),

  // Non-empty string with min/max length
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),

  // Date validation (ISO 8601 format)
  date: z.string().datetime("التاريخ يجب أن يكون بصيغة ISO 8601"),

  // UUID validation
  uuid: z.string().uuid("المعرف الفريد غير صالح"),

  // URL validation
  url: z.string().url("الرابط غير صالح"),

  // Amount validation (positive number with 2 decimal places)
  amount: z
    .number()
    .positive("المبلغ يجب أن يكون موجباً")
    .multipleOf(0.01, "المبلغ يجب أن يكون برقمين عشريين"),

  // Currency code (ISO 4217)
  currency: z.enum(["SAR", "USD", "EUR", "GBP"], {
    errorMap: () => ({ message: "العملة غير مدعومة" }),
  }),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),

  // Language code
  language: z.enum(["ar", "en"], {
    errorMap: () => ({ message: "اللغة غير مدعومة" }),
  }),
};

/**
 * Validation middleware factory for Express routes
 * Validates request body, query, or params against a Zod schema
 */
export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Validation failed", {
          context: "Validation",
          path: req.originalUrl,
          method: req.method,
          source,
          errors,
        });

        return res.status(400).json({
          success: false,
          message: "بيانات غير صالحة",
          errors,
        });
      }

      // Replace the original data with validated and transformed data
      req[source] = result.data;
      next();
    } catch (error) {
      logger.error("Validation error", {
        context: "Validation",
        path: req.originalUrl,
        error: error as Error,
      });

      return res.status(500).json({
        success: false,
        message: "خطأ في التحقق من البيانات",
      });
    }
  };
}

/**
 * Validation schemas for authentication endpoints
 */
export const AuthSchemas = {
  register: z.object({
    email: CommonSchemas.email,
    password: CommonSchemas.password,
    fullName: CommonSchemas.name,
    phone: CommonSchemas.phone.optional(),
    organizationName: z.string().min(2).max(200).optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "يجب الموافقة على الشروط والأحكام",
    }),
  }),

  login: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, "كلمة المرور مطلوبة"),
    rememberMe: z.boolean().optional().default(false),
  }),

  resetPassword: z.object({
    email: CommonSchemas.email,
  }),

  updatePassword: z.object({
    token: z.string().min(1, "رمز التحقق مطلوب"),
    newPassword: CommonSchemas.password,
  }),

  verifyEmail: z.object({
    token: z.string().min(1, "رمز التحقق مطلوب"),
  }),
};

/**
 * Validation schemas for payment endpoints
 */
export const PaymentSchemas = {
  createPayment: z.object({
    amount: CommonSchemas.amount,
    currency: CommonSchemas.currency,
    description: z.string().min(3).max(500).optional(),
    metadata: z.record(z.string()).optional(),
  }),

  processRefund: z.object({
    paymentId: z.string().min(1, "معرف الدفع مطلوب"),
    amount: CommonSchemas.amount.optional(),
    reason: z.string().min(3).max(500).optional(),
  }),

  webhookSignature: z.object({
    signature: z.string().min(1, "التوقيع مطلوب"),
    payload: z.string().min(1, "البيانات مطلوبة"),
  }),
};

/**
 * Validation schemas for user management endpoints
 */
export const UserSchemas = {
  updateProfile: z.object({
    fullName: CommonSchemas.name.optional(),
    phone: CommonSchemas.phone.optional(),
    avatar: CommonSchemas.url.optional(),
    language: CommonSchemas.language.optional(),
  }),

  updateEmail: z.object({
    email: CommonSchemas.email,
    password: z.string().min(1, "كلمة المرور مطلوبة للتحقق"),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: CommonSchemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  }),

  deleteAccount: z.object({
    password: z.string().min(1, "كلمة المرور مطلوبة للتحقق"),
    confirmation: z.literal("DELETE", {
      errorMap: () => ({ message: 'يجب كتابة "DELETE" للتأكيد' }),
    }),
  }),
};

/**
 * Validation schemas for employee management
 */
export const EmployeeSchemas = {
  create: z.object({
    fullName: CommonSchemas.name,
    email: CommonSchemas.email,
    phone: CommonSchemas.phone.optional(),
    position: z.string().min(2).max(100),
    department: z.string().min(2).max(100).optional(),
    salary: CommonSchemas.amount.optional(),
    hireDate: CommonSchemas.date,
    nationalId: z.string().min(10).max(20).optional(),
  }),

  update: z.object({
    id: CommonSchemas.id,
    fullName: CommonSchemas.name.optional(),
    email: CommonSchemas.email.optional(),
    phone: CommonSchemas.phone.optional(),
    position: z.string().min(2).max(100).optional(),
    department: z.string().min(2).max(100).optional(),
    salary: CommonSchemas.amount.optional(),
  }),

  delete: z.object({
    id: CommonSchemas.id,
  }),

  list: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    department: z.string().optional(),
    search: z.string().optional(),
  }),
};

/**
 * Validation schemas for notifications
 */
export const NotificationSchemas = {
  create: z.object({
    userId: CommonSchemas.optionalId,
    title: z.string().min(2).max(200),
    body: z.string().min(2).max(1000),
    type: z.enum(["info", "success", "warning", "error"], {
      errorMap: () => ({ message: "نوع الإشعار غير صالح" }),
    }),
    link: CommonSchemas.url.optional(),
    expiresAt: CommonSchemas.date.optional(),
  }),

  markAsRead: z.object({
    notificationIds: z.array(CommonSchemas.id).min(1),
  }),

  delete: z.object({
    notificationIds: z.array(CommonSchemas.id).min(1),
  }),

  preferences: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    notificationTypes: z.array(z.string()),
  }),
};

/**
 * Validation schemas for file uploads
 */
export const FileSchemas = {
  upload: z.object({
    file: z.instanceof(File),
    maxSize: z.number().int().positive().default(5 * 1024 * 1024), // 5MB default
    allowedTypes: z.array(z.string()).default([
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ]),
  }),

  delete: z.object({
    fileId: z.string().min(1),
  }),
};

/**
 * Sanitization utilities
 */
export const Sanitize = {
  /**
   * Remove HTML tags from string
   */
  stripHtml: (str: string): string => {
    return str.replaceAll(/<[^>]*>/g, "");
  },

  /**
   * Trim and normalize whitespace
   */
  normalizeWhitespace: (str: string): string => {
    return str.trim().replaceAll(/\s+/g, " ");
  },

  /**
   * Remove SQL injection characters
   */
  sanitizeSql: (str: string): string => {
    return str.replaceAll(/[;'"\\]/g, "");
  },

  /**
   * Sanitize email address
   */
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },

  /**
   * Sanitize phone number (remove spaces, dashes, etc.)
   */
  sanitizePhone: (phone: string): string => {
    return phone.replaceAll(/[^\d+]/g, "");
  },
};

/**
 * Type-safe validation helper for tRPC procedures
 */
export function createValidatedProcedure<T extends z.ZodTypeAny>(schema: T) {
  return {
    input: schema,
    validate: (data: unknown) => schema.parse(data),
  };
}

/**
 * Batch validation for multiple schemas
 */
export async function validateMultiple(
  validations: Array<{
    schema: z.ZodTypeAny;
    data: unknown;
    name: string;
  }>
): Promise<{ success: boolean; errors?: Record<string, string[]> }> {
  const errors: Record<string, string[]> = {};

  for (const { schema, data, name } of validations) {
    const result = schema.safeParse(data);
    if (!result.success) {
      errors[name] = result.error.errors.map((err) => err.message);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true };
}

export default {
  CommonSchemas,
  AuthSchemas,
  PaymentSchemas,
  UserSchemas,
  EmployeeSchemas,
  NotificationSchemas,
  FileSchemas,
  validateRequest,
  Sanitize,
  createValidatedProcedure,
  validateMultiple,
};
