/**
 * Structured Error Response System
 * Provides consistent error formatting across all API endpoints
 */

import type { Request, Response } from "express";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  SERVER_ERROR = "server_error",
  EXTERNAL_SERVICE = "external_service",
  DATABASE = "database",
  TIMEOUT = "timeout",
}

/**
 * Structured error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId: string;
    path: string;
    method: string;
  };
}

/**
 * Error configuration
 */
interface ErrorConfig {
  statusCode: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  logLevel?: "error" | "warn" | "info";
}

/**
 * Predefined error configurations
 */
const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  // Validation errors (400)
  VALIDATION_ERROR: {
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    logLevel: "warn",
  },
  INVALID_INPUT: {
    statusCode: 400,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    logLevel: "warn",
  },

  // Authentication errors (401)
  UNAUTHORIZED: {
    statusCode: 401,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    logLevel: "info",
  },

  // Authorization errors (403)
  FORBIDDEN: {
    statusCode: 403,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },
  INSUFFICIENT_PERMISSIONS: {
    statusCode: 403,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },

  // Not found errors (404)
  NOT_FOUND: {
    statusCode: 404,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    logLevel: "info",
  },
  RESOURCE_NOT_FOUND: {
    statusCode: 404,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    logLevel: "info",
  },

  // Conflict errors (409)
  CONFLICT: {
    statusCode: 409,
    category: ErrorCategory.CONFLICT,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },
  DUPLICATE_RESOURCE: {
    statusCode: 409,
    category: ErrorCategory.CONFLICT,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },

  // Timeout errors (408)
  REQUEST_TIMEOUT: {
    statusCode: 408,
    category: ErrorCategory.TIMEOUT,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },

  // Rate limit errors (429)
  RATE_LIMIT_EXCEEDED: {
    statusCode: 429,
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    logLevel: "warn",
  },

  // Server errors (500)
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    category: ErrorCategory.SERVER_ERROR,
    severity: ErrorSeverity.HIGH,
    logLevel: "error",
  },
  DATABASE_ERROR: {
    statusCode: 500,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    logLevel: "error",
  },
  EXTERNAL_SERVICE_ERROR: {
    statusCode: 502,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    logLevel: "error",
  },
};

/**
 * Create structured error response
 */
export function createErrorResponse(
  req: Request,
  errorCode: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponse {
  const config = ERROR_CONFIGS[errorCode] || ERROR_CONFIGS.INTERNAL_SERVER_ERROR;
  const requestId = getRequestId(req);

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      category: config.category,
      severity: config.severity,
      details,
      timestamp: new Date().toISOString(),
      requestId,
      path: req.originalUrl,
      method: req.method,
    },
  };

  // Log the error
  const logLevel = config.logLevel || "error";
  logger[logLevel]("Structured error response", {
    context: "ErrorResponse",
    ...errorResponse.error,
  });

  return errorResponse;
}

/**
 * Send structured error response
 */
export function sendErrorResponse(
  req: Request,
  res: Response,
  errorCode: string,
  message: string,
  details?: Record<string, unknown>
): void {
  const config = ERROR_CONFIGS[errorCode] || ERROR_CONFIGS.INTERNAL_SERVER_ERROR;
  const errorResponse = createErrorResponse(req, errorCode, message, details);

  res.status(config.statusCode).json(errorResponse);
}

/**
 * Validation error helper
 */
export function sendValidationError(
  req: Request,
  res: Response,
  message: string,
  validationErrors?: Record<string, string[]>
): void {
  sendErrorResponse(req, res, "VALIDATION_ERROR", message, {
    validation: validationErrors,
  });
}

/**
 * Not found error helper
 */
export function sendNotFoundError(
  req: Request,
  res: Response,
  resourceType: string
): void {
  sendErrorResponse(
    req,
    res,
    "RESOURCE_NOT_FOUND",
    `${resourceType} not found`,
    { resourceType }
  );
}

/**
 * Unauthorized error helper
 */
export function sendUnauthorizedError(
  req: Request,
  res: Response,
  message: string = "Authentication required"
): void {
  sendErrorResponse(req, res, "UNAUTHORIZED", message);
}

/**
 * Forbidden error helper
 */
export function sendForbiddenError(
  req: Request,
  res: Response,
  message: string = "Insufficient permissions"
): void {
  sendErrorResponse(req, res, "FORBIDDEN", message);
}

/**
 * Rate limit error helper
 */
export function sendRateLimitError(
  req: Request,
  res: Response,
  retryAfter?: number
): void {
  sendErrorResponse(
    req,
    res,
    "RATE_LIMIT_EXCEEDED",
    "Too many requests, please try again later",
    { retryAfter }
  );
}

/**
 * Server error helper
 */
export function sendServerError(
  req: Request,
  res: Response,
  message: string = "Internal server error"
): void {
  sendErrorResponse(req, res, "INTERNAL_SERVER_ERROR", message);
}

/**
 * Convert Error object to structured response
 */
export function errorToStructuredResponse(
  req: Request,
  error: Error | unknown
): ErrorResponse {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.name === "ValidationError") {
      return createErrorResponse(req, "VALIDATION_ERROR", error.message);
    }

    if (error.name === "UnauthorizedError") {
      return createErrorResponse(req, "UNAUTHORIZED", error.message);
    }

    if (error.name === "ForbiddenError") {
      return createErrorResponse(req, "FORBIDDEN", error.message);
    }

    if (error.name === "NotFoundError") {
      return createErrorResponse(req, "NOT_FOUND", error.message);
    }

    // Default to internal server error
    return createErrorResponse(
      req,
      "INTERNAL_SERVER_ERROR",
      error.message || "An unexpected error occurred",
      {
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      }
    );
  }

  // Unknown error type
  return createErrorResponse(
    req,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred"
  );
}

/**
 * Get error configuration
 */
export function getErrorConfig(errorCode: string): ErrorConfig {
  return ERROR_CONFIGS[errorCode] || ERROR_CONFIGS.INTERNAL_SERVER_ERROR;
}

export default {
  ErrorSeverity,
  ErrorCategory,
  ERROR_CONFIGS,
  createErrorResponse,
  sendErrorResponse,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendRateLimitError,
  sendServerError,
  errorToStructuredResponse,
  getErrorConfig,
};
