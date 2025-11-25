import { TRPCClientError } from "@trpc/client";

/**
 * Enhanced API Error Handler
 * Provides utilities for handling API errors with user-friendly messages
 */

export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

/**
 * Parse API error and extract user-friendly message
 */
export function parseApiError(error: unknown): ApiErrorResponse {
  // Handle tRPC errors
  if (error instanceof TRPCClientError) {
    const statusCode = error.data?.httpStatus || 500;
    
    return {
      message: error.message || "حدث خطأ في الخادم",
      code: error.data?.code,
      statusCode,
      details: error.data?.zodError?.fieldErrors,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  // Handle unknown errors
  return {
    message: "حدث خطأ غير متوقع",
    statusCode: 500,
  };
}

/**
 * Get Arabic error message based on status code
 */
export function getArabicErrorMessage(statusCode: number, defaultMessage?: string): string {
  const errorMessages: Record<number, string> = {
    400: "البيانات المرسلة غير صحيحة",
    401: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
    403: "ليس لديك صلاحية للوصول إلى هذا المحتوى",
    404: "المحتوى المطلوب غير موجود",
    409: "هذا السجل موجود مسبقاً",
    422: "البيانات المدخلة غير صالحة",
    429: "عدد كبير من المحاولات، يرجى المحاولة لاحقاً",
    500: "خطأ في الخادم، يرجى المحاولة لاحقاً",
    502: "الخادم غير متاح حالياً",
    503: "الخدمة غير متاحة مؤقتاً",
  };

  return errorMessages[statusCode] || defaultMessage || "حدث خطأ غير متوقع";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("Failed to fetch")
    );
  }

  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.statusCode === 401;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const parsed = parseApiError(error);
  return parsed.statusCode === 422 || parsed.statusCode === 400;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: unknown): string[] {
  const parsed = parseApiError(error);
  
  if (!parsed.details) {
    return [parsed.message];
  }

  const errors: string[] = [];
  for (const [field, messages] of Object.entries(parsed.details)) {
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        errors.push(`${field}: ${msg}`);
      }
    }
  }

  return errors.length > 0 ? errors : [parsed.message];
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on auth or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(lastError?.message || "Unknown error after retries");
}
