/**
 * Error Logger Service
 * Centralized error logging with structured data
 * Production-ready with support for error monitoring services
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string | number;
  [key: string]: any;
}

interface ErrorLog {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  environment: string;
}

class ErrorLogger {
  private readonly isDevelopment = import.meta.env.DEV;
  private readonly isProduction = import.meta.env.PROD;

  /**
   * Log error with structured context
   */
  error(error: Error | string, context?: ErrorContext): void {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? "development" : "production",
    };

    // Development: Full console logging
    if (this.isDevelopment) {
      console.error("❌ Error:", errorLog.message);
      if (errorLog.stack) console.error("Stack:", errorLog.stack);
      if (context) console.error("Context:", context);
    }

    // Production: Send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring(errorLog);
    }
  }

  /**
   * Log warning
   */
  warn(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.warn("⚠️ Warning:", message);
      if (context) console.warn("Context:", context);
    }

    if (this.isProduction) {
      this.sendToMonitoring({
        message,
        context,
        timestamp: new Date().toISOString(),
        environment: "production",
      });
    }
  }

  /**
   * Log info (development only)
   */
  info(message: string, context?: ErrorContext): void {
    if (this.isDevelopment) {
      console.info("ℹ️ Info:", message);
      if (context) console.info("Context:", context);
    }
  }

  /**
   * Send error to monitoring service (Sentry, LogRocket, etc.)
   */
  private sendToMonitoring(errorLog: ErrorLog): void {
    // TODO: Integrate with error monitoring service
    // Example for Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(errorLog.message), {
    //     contexts: { error: errorLog.context },
    //     tags: { environment: errorLog.environment },
    //   });
    // }

    // Example for LogRocket:
    // if (window.LogRocket) {
    //   window.LogRocket.captureException(new Error(errorLog.message), {
    //     tags: errorLog.context,
    //   });
    // }

    // Fallback: Store in localStorage for later analysis
    try {
      const storedErrors = localStorage.getItem("error_logs");
      const errors = storedErrors ? JSON.parse(storedErrors) : [];
      errors.push(errorLog);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      
      localStorage.setItem("error_logs", JSON.stringify(errors));
    } catch {
      // Silent fail - don't crash if localStorage is full
    }
  }

  /**
   * Track React component error
   */
  componentError(
    error: Error,
    errorInfo: { componentStack?: string },
    component: string
  ): void {
    this.error(error, {
      component,
      componentStack: errorInfo.componentStack,
      type: "react-component-error",
    });
  }

  /**
   * Track network error
   */
  networkError(error: Error, endpoint: string, method: string): void {
    this.error(error, {
      endpoint,
      method,
      type: "network-error",
    });
  }

  /**
   * Track validation error
   */
  validationError(message: string, field: string, value?: any): void {
    this.warn(message, {
      field,
      value,
      type: "validation-error",
    });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export types
export type { ErrorContext, ErrorLog };
