/**
 * Request Tracking Middleware Tests
 * Tests for request ID generation, performance tracking, and error context
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// Mock logger BEFORE importing the module
vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import {
  requestIdMiddleware,
  performanceMiddleware,
  errorContextMiddleware,
  getRequestId,
} from "../requestTracking";

describe("Request Tracking Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let finishListeners: Array<() => void>;

  beforeEach(() => {
    finishListeners = [];
    
    mockReq = {
      headers: {},
      method: "GET",
      originalUrl: "/api/test",
      ip: "127.0.0.1",
    };

    mockRes = {
      setHeader: vi.fn(),
      getHeader: vi.fn(),
      on: vi.fn((event: string, listener: () => void) => {
        if (event === "finish") {
          finishListeners.push(listener);
        }
        return mockRes as Response;
      }),
      statusCode: 200,
      locals: {},
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("requestIdMiddleware", () => {
    it("should generate request ID if not provided", () => {
      requestIdMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.requestId).toBeDefined();
      expect(typeof mockReq.requestId).toBe("string");
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Request-ID",
        mockReq.requestId
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should use existing x-request-id header", () => {
      const existingId = "test-request-id-123";
      mockReq.headers = { "x-request-id": existingId };

      requestIdMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.requestId).toBe(existingId);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Request-ID",
        existingId
      );
    });

    it("should use x-correlation-id header if x-request-id not present", () => {
      const correlationId = "correlation-id-456";
      mockReq.headers = { "x-correlation-id": correlationId };

      requestIdMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.requestId).toBe(correlationId);
    });

    it("should set start time", () => {
      requestIdMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.startTime).toBeDefined();
      expect(typeof mockReq.startTime).toBe("number");
    });

    it("should log request completion on finish", async () => {
      const { logger } = await import("../logger");
      
      requestIdMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Trigger finish event
      for (const listener of finishListeners) {
        listener();
      }

      expect(logger.info).toHaveBeenCalledWith(
        "Request completed",
        expect.objectContaining({
          context: "Request",
          requestId: mockReq.requestId,
          method: "GET",
          path: "/api/test",
          status: 200,
        })
      );
    });
  });

  describe("performanceMiddleware", () => {
    it("should add response time header", () => {
      performanceMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Trigger finish event
      for (const listener of finishListeners) {
        listener();
      }

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "X-Response-Time",
        expect.stringMatching(/^\d+\.\d{2}ms$/)
      );
    });

    it("should log slow requests (>2 seconds)", async () => {
      const { logger } = await import("../logger");
      
      // Mock hrtime to simulate slow request
      const originalHrtime = process.hrtime;
      const startTime = BigInt(0);
      const endTime = BigInt(3_000_000_000); // 3 seconds in nanoseconds
      let callCount = 0;

      process.hrtime = {
        bigint: vi.fn(() => {
          callCount++;
          return callCount === 1 ? startTime : endTime;
        }),
      } as any;

      performanceMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Trigger finish event
      for (const listener of finishListeners) {
        listener();
      }

      expect(logger.warn).toHaveBeenCalledWith(
        "Slow request detected",
        expect.objectContaining({
          context: "Performance",
          duration: expect.stringContaining("ms"),
        })
      );

      // Restore original hrtime
      process.hrtime = originalHrtime;
    });

    it("should log very slow requests (>5 seconds) as error", async () => {
      const { logger } = await import("../logger");
      
      // Mock hrtime to simulate very slow request
      const originalHrtime = process.hrtime;
      const startTime = BigInt(0);
      const endTime = BigInt(6_000_000_000); // 6 seconds in nanoseconds
      let callCount = 0;

      process.hrtime = {
        bigint: vi.fn(() => {
          callCount++;
          return callCount === 1 ? startTime : endTime;
        }),
      } as any;

      performanceMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Trigger finish event
      for (const listener of finishListeners) {
        listener();
      }

      expect(logger.error).toHaveBeenCalledWith(
        "Very slow request detected",
        expect.objectContaining({
          context: "Performance",
          duration: expect.stringContaining("ms"),
        })
      );

      // Restore original hrtime
      process.hrtime = originalHrtime;
    });
  });

  describe("errorContextMiddleware", () => {
    it("should add getErrorContext function to res.locals", () => {
      errorContextMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.locals?.getErrorContext).toBeDefined();
      expect(typeof mockRes.locals?.getErrorContext).toBe("function");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should provide error context with request details", () => {
      mockReq.requestId = "test-id-789";
      mockReq.query = { page: "1", limit: "10" };
      mockReq.body = { name: "Test" };
      mockReq.headers = {
        "user-agent": "Test Agent",
        "content-type": "application/json",
      };

      errorContextMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      const errorContext = mockRes.locals?.getErrorContext();

      expect(errorContext).toEqual({
        requestId: "test-id-789",
        method: "GET",
        path: "/api/test",
        query: { page: "1", limit: "10" },
        body: { name: "Test" },
        headers: {
          "user-agent": "Test Agent",
          "content-type": "application/json",
        },
        ip: "127.0.0.1",
        timestamp: expect.any(String),
      });
    });
  });

  describe("getRequestId", () => {
    it("should return request ID from request object", () => {
      mockReq.requestId = "test-id-abc";

      const requestId = getRequestId(mockReq as Request);

      expect(requestId).toBe("test-id-abc");
    });

    it("should return 'unknown' if request ID not set", () => {
      const requestId = getRequestId(mockReq as Request);

      expect(requestId).toBe("unknown");
    });
  });
});
