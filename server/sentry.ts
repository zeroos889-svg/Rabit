/**
 * Sentry Integration for Backend Error Tracking
 * Provides comprehensive error monitoring and performance tracking
 */

import * as Sentry from "@sentry/node";

let sentryInitialized = false;

/**
 * Initialize Sentry for backend error tracking
 * Should be called at the start of the application
 */
export function initializeSentry() {
  // Skip if already initialized
  if (sentryInitialized) {
    return;
  }

  // Only initialize if DSN is provided
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("⚠️  Sentry DSN not configured, error tracking disabled");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
      
      integrations: [
        // Enable HTTP calls tracing
        Sentry.httpIntegration(),
        // Enable Express.js middleware tracing
        Sentry.expressIntegration(),
      ],
      
      // Release tracking
      release: process.env.npm_package_version,
      
      // Filter out health check requests
      beforeSend(event) {
        // Don't send errors from health checks
        if (event.request?.url?.includes("/health")) {
          return null;
        }
        
        // Don't send errors in development unless explicitly enabled
        if (
          process.env.NODE_ENV === "development" &&
          !process.env.SENTRY_DEBUG
        ) {
          return null;
        }
        
        return event;
      },
      
      // Additional context
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === "console" && breadcrumb.level === "log") {
          return null;
        }
        return breadcrumb;
      },
    });

    sentryInitialized = true;
    console.log("✅ Sentry error tracking initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Sentry:", error);
  }
}

/**
 * Capture an exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!sentryInitialized) {
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  if (!sentryInitialized) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  if (!sentryInitialized) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

/**
 * Get Sentry request handler middleware (should be first)
 * @deprecated Use setupExpressErrorHandler instead
 */
export function getRequestHandler() {
  // In Sentry v8+, this is handled automatically by setupExpressErrorHandler
  // Return a no-op middleware for backward compatibility
  return (req: any, res: any, next: any) => next();
}

/**
 * Get Sentry tracing middleware (after request handler)
 * @deprecated Use setupExpressErrorHandler instead
 */
export function getTracingHandler() {
  // In Sentry v8+, this is handled automatically by setupExpressErrorHandler
  // Return a no-op middleware for backward compatibility
  return (req: any, res: any, next: any) => next();
}

/**
 * Setup Express error handler (should be called after all routes)
 * This is the new way in Sentry v8+
 */
export function setupExpressErrorHandler(app: any) {
  Sentry.setupExpressErrorHandler(app);
}

/**
 * Get Sentry error handler middleware (should be last)
 * @deprecated Use setupExpressErrorHandler instead
 */
export function getErrorHandler() {
  // Return a custom error handler for backward compatibility
  return (error: any, req: any, res: any, next: any) => {
    // Capture all errors with status >= 500
    const statusCode = error.statusCode || error.status;
    if (!statusCode || statusCode >= 500) {
      Sentry.captureException(error);
    }
    next(error);
  };
}

// Re-export Sentry for convenience
export * as Sentry from "@sentry/node";


