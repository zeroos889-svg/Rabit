import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  handleError: (error: Error, options?: ErrorHandlerOptions) => void;
  clearError: () => void;
  retry: (() => void) | null;
}

/**
 * Custom hook for handling errors with toast notifications and retry mechanism
 * 
 * @example
 * const { handleError, retry } = useErrorHandler();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err as Error, { showToast: true, retryable: true });
 * }
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCallback(null);
  }, []);

  const handleError = useCallback(
    (err: Error, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logToConsole = true,
        retryable = false,
      } = options;

      // Set error state
      setError(err);

      // Log to console if enabled
      if (logToConsole && process.env.NODE_ENV === "development") {
        console.error("Error handled by useErrorHandler:", err);
      }

      // Show toast notification if enabled
      if (showToast) {
        const errorMessage = getErrorMessage(err);
        
        toast.error(errorMessage.ar, {
          description: errorMessage.en,
          duration: 5000,
          action: retryable && retryCallback ? {
            label: "إعادة المحاولة",
            onClick: () => {
              clearError();
              retryCallback();
            },
          } : undefined,
        });
      }

      // TODO: Send to error monitoring service in production
      if (process.env.NODE_ENV === "production") {
        // Example: Sentry.captureException(err);
      }
    },
    [retryCallback, clearError]
  );

  return {
    error,
    handleError,
    clearError,
    retry: retryCallback,
  };
}

/**
 * Get user-friendly error message from Error object
 */
function getErrorMessage(error: Error): { ar: string; en: string } {
  // Network errors
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return {
      ar: "خطأ في الاتصال بالشبكة",
      en: "Network connection error",
    };
  }

  // Authorization errors
  if (error.message.includes("401") || error.message.includes("unauthorized")) {
    return {
      ar: "جلستك انتهت، يرجى تسجيل الدخول مرة أخرى",
      en: "Session expired, please login again",
    };
  }

  // Permission errors
  if (error.message.includes("403") || error.message.includes("forbidden")) {
    return {
      ar: "ليس لديك صلاحية للوصول إلى هذه الصفحة",
      en: "You don't have permission to access this page",
    };
  }

  // Not found errors
  if (error.message.includes("404") || error.message.includes("not found")) {
    return {
      ar: "المحتوى المطلوب غير موجود",
      en: "The requested content was not found",
    };
  }

  // Server errors
  if (error.message.includes("500") || error.message.includes("server")) {
    return {
      ar: "خطأ في الخادم، يرجى المحاولة لاحقاً",
      en: "Server error, please try again later",
    };
  }

  // Validation errors
  if (error.message.includes("validation") || error.message.includes("invalid")) {
    return {
      ar: "البيانات المدخلة غير صحيحة",
      en: "Invalid input data",
    };
  }

  // Generic error
  return {
    ar: "حدث خطأ غير متوقع",
    en: error.message || "An unexpected error occurred",
  };
}

/**
 * Wrapper for async operations with automatic error handling
 * 
 * @example
 * const { execute, loading, error } = useAsyncError(async () => {
 *   return await fetchData();
 * });
 */
export function useAsyncError<T>(
  asyncFn: () => Promise<T>,
  options?: ErrorHandlerOptions
) {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err as Error, options);
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, handleError, clearError, options]);

  return { execute, loading, error, clearError };
}
