/**
 * Structured Errors Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import {
  ErrorSeverity,
  ErrorCategory,
  createErrorResponse,
  sendErrorResponse,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendRateLimitError,
  sendServerError,
  errorToStructuredResponse,
} from "../structuredErrors";

// Mock logger
vi.mock("../logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock requestTracking
vi.mock("../requestTracking", () => ({
  getRequestId: vi.fn(() => "test-request-id"),
}));

describe("Structured Errors", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      originalUrl: "/api/test",
      path: "/api/test",
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("createErrorResponse", () => {
    it("should create error response with all fields", () => {
      const response = createErrorResponse(
        mockReq as Request,
        "VALIDATION_ERROR",
        "Invalid input",
        { field: "email" }
      );

      expect(response).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.LOW,
          details: { field: "email" },
          requestId: "test-request-id",
          path: "/api/test",
          method: "GET",
        },
      });
      expect(response.error.timestamp).toBeDefined();
    });

    it("should handle unknown error code", () => {
      const response = createErrorResponse(
        mockReq as Request,
        "UNKNOWN_ERROR" as any,
        "Unknown error"
      );

      expect(response.error.code).toBe("UNKNOWN_ERROR");
      expect(response.error.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(response.error.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe("sendErrorResponse", () => {
    it("should send error with correct status code", () => {
      sendErrorResponse(
        mockReq as Request,
        mockRes as Response,
        "VALIDATION_ERROR",
        "Invalid input"
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "VALIDATION_ERROR",
            message: "Invalid input",
          }),
        })
      );
    });

    it("should include details in response", () => {
      const details = { field: "email", reason: "invalid format" };
      sendErrorResponse(
        mockReq as Request,
        mockRes as Response,
        "VALIDATION_ERROR",
        "Invalid input",
        details
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details,
          }),
        })
      );
    });
  });

  describe("sendValidationError", () => {
    it("should send validation error with validation details", () => {
      const validationErrors = {
        email: ["Invalid email format"],
        password: ["Password too short"],
      };

      sendValidationError(
        mockReq as Request,
        mockRes as Response,
        "Validation failed",
        validationErrors
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: { validation: validationErrors },
          }),
        })
      );
    });
  });

  describe("sendNotFoundError", () => {
    it("should send not found error with resource type", () => {
      sendNotFoundError(mockReq as Request, mockRes as Response, "User");

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "NOT_FOUND",
            message: "User not found",
          }),
        })
      );
    });

    it("should use default message if no resource type", () => {
      sendNotFoundError(
        mockReq as Request,
        mockRes as Response,
        "Resource"
      );

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: "Resource not found",
          }),
        })
      );
    });
  });

  describe("sendUnauthorizedError", () => {
    it("should send unauthorized error", () => {
      sendUnauthorizedError(
        mockReq as Request,
        mockRes as Response,
        "Invalid token"
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "UNAUTHORIZED",
            message: "Invalid token",
          }),
        })
      );
    });

    it("should use default message", () => {
      sendUnauthorizedError(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: "Authentication required",
          }),
        })
      );
    });
  });

  describe("sendForbiddenError", () => {
    it("should send forbidden error", () => {
      sendForbiddenError(
        mockReq as Request,
        mockRes as Response,
        "Admin access required"
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Admin access required",
          }),
        })
      );
    });
  });

  describe("sendRateLimitError", () => {
    it("should send rate limit error with retry after", () => {
      sendRateLimitError(mockReq as Request, mockRes as Response, 60);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "RATE_LIMIT_EXCEEDED",
            details: { retryAfter: 60 },
          }),
        })
      );
    });
  });

  describe("sendServerError", () => {
    it("should send server error", () => {
      sendServerError(
        mockReq as Request,
        mockRes as Response,
        "Database connection failed"
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed",
          }),
        })
      );
    });
  });

  describe("errorToStructuredResponse", () => {
    it("should convert standard Error to structured response", () => {
      const error = new Error("Something went wrong");
      const response = errorToStructuredResponse(mockReq as Request, error);

      expect(response).toMatchObject({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          category: ErrorCategory.SERVER_ERROR,
          severity: ErrorSeverity.HIGH,
        },
      });
    });

    it("should handle error without message", () => {
      const error = new Error("Empty error");
      error.message = "";
      const response = errorToStructuredResponse(mockReq as Request, error);

      expect(response.error.message).toBe("An unexpected error occurred");
    });

    it("should include stack trace in details", () => {
      const error = new Error("Test error");
      const response = errorToStructuredResponse(mockReq as Request, error);

      expect(response.error.details).toHaveProperty("stack");
      expect(response.error.details?.stack).toContain("Test error");
    });
  });

  describe("ErrorSeverity enum", () => {
    it("should have correct severity levels", () => {
      expect(ErrorSeverity.LOW).toBe("low");
      expect(ErrorSeverity.MEDIUM).toBe("medium");
      expect(ErrorSeverity.HIGH).toBe("high");
      expect(ErrorSeverity.CRITICAL).toBe("critical");
    });
  });

  describe("ErrorCategory enum", () => {
    it("should have correct categories", () => {
      expect(ErrorCategory.VALIDATION).toBe("validation");
      expect(ErrorCategory.AUTHENTICATION).toBe("authentication");
      expect(ErrorCategory.AUTHORIZATION).toBe("authorization");
      expect(ErrorCategory.NOT_FOUND).toBe("not_found");
      expect(ErrorCategory.CONFLICT).toBe("conflict");
      expect(ErrorCategory.RATE_LIMIT).toBe("rate_limit");
      expect(ErrorCategory.SERVER_ERROR).toBe("server_error");
      expect(ErrorCategory.EXTERNAL_SERVICE).toBe("external_service");
      expect(ErrorCategory.DATABASE).toBe("database");
      expect(ErrorCategory.TIMEOUT).toBe("timeout");
    });
  });
});
