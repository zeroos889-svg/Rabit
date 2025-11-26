/**
 * Request Timeout Middleware Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  createTimeoutMiddleware,
  apiTimeout,
  uploadTimeout,
  webhookTimeout,
  healthTimeout,
  smartTimeoutMiddleware,
  getTimeoutForPath,
  DEFAULT_TIMEOUTS,
} from "../requestTimeout";

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

describe("Request Timeout Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let finishListeners: Array<() => void>;
  let closeListeners: Array<() => void>;

  beforeEach(() => {
    finishListeners = [];
    closeListeners = [];

    mockReq = {
      method: "GET",
      originalUrl: "/api/test",
      headers: {},
    };

    mockRes = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      on: vi.fn((event: string, listener: () => void) => {
        if (event === "finish") {
          finishListeners.push(listener);
        } else if (event === "close") {
          closeListeners.push(listener);
        }
        return mockRes as Response;
      }),
    };

    mockNext = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe("createTimeoutMiddleware", () => {
    it("should call next immediately", () => {
      const middleware = createTimeoutMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should send timeout response after timeout expires", () => {
      const middleware = createTimeoutMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(5000);

      expect(mockRes.status).toHaveBeenCalledWith(408);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Request Timeout",
        message: "Request exceeded 5000ms timeout",
        requestId: "test-request-id",
      });
    });

    it("should not send timeout if response already sent", () => {
      mockRes.headersSent = true;
      const middleware = createTimeoutMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(5000);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should clear timeout when response finishes", () => {
      const middleware = createTimeoutMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger finish event
      for (const listener of finishListeners) {
        listener();
      }

      vi.advanceTimersByTime(5000);

      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should clear timeout when response closes", () => {
      const middleware = createTimeoutMiddleware(5000);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Trigger close event
      for (const listener of closeListeners) {
        listener();
      }

      vi.advanceTimersByTime(5000);

      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe("smartTimeoutMiddleware", () => {
    it("should use health timeout for /health paths", () => {
      mockReq.originalUrl = "/health";
      smartTimeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.health);

      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("should use webhook timeout for webhook paths", () => {
      mockReq.originalUrl = "/api/webhook/payment";
      smartTimeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.webhook);

      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("should use upload timeout for upload paths", () => {
      mockReq.originalUrl = "/api/upload";
      smartTimeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.upload);

      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("should use long-running timeout for report paths", () => {
      mockReq.originalUrl = "/api/report/generate";
      smartTimeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.longRunning);

      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("should use default timeout for other paths", () => {
      mockReq.originalUrl = "/api/users";
      smartTimeoutMiddleware(mockReq as Request, mockRes as Response, mockNext);

      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.api);

      expect(mockRes.status).toHaveBeenCalledWith(408);
    });
  });

  describe("getTimeoutForPath", () => {
    it("should return correct timeout for health path", () => {
      expect(getTimeoutForPath("/health")).toBe(DEFAULT_TIMEOUTS.health);
    });

    it("should return correct timeout for webhook path", () => {
      expect(getTimeoutForPath("/api/webhook/test")).toBe(DEFAULT_TIMEOUTS.webhook);
    });

    it("should return correct timeout for upload path", () => {
      expect(getTimeoutForPath("/api/upload/file")).toBe(DEFAULT_TIMEOUTS.upload);
    });

    it("should return correct timeout for report path", () => {
      expect(getTimeoutForPath("/api/report/sales")).toBe(DEFAULT_TIMEOUTS.longRunning);
    });

    it("should return default timeout for unknown path", () => {
      expect(getTimeoutForPath("/api/unknown")).toBe(DEFAULT_TIMEOUTS.api);
    });
  });

  describe("predefined middlewares", () => {
    it("apiTimeout should timeout after 30 seconds", () => {
      apiTimeout(mockReq as Request, mockRes as Response, mockNext);
      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.api);
      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("uploadTimeout should timeout after 2 minutes", () => {
      uploadTimeout(mockReq as Request, mockRes as Response, mockNext);
      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.upload);
      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("webhookTimeout should timeout after 15 seconds", () => {
      webhookTimeout(mockReq as Request, mockRes as Response, mockNext);
      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.webhook);
      expect(mockRes.status).toHaveBeenCalledWith(408);
    });

    it("healthTimeout should timeout after 5 seconds", () => {
      healthTimeout(mockReq as Request, mockRes as Response, mockNext);
      vi.advanceTimersByTime(DEFAULT_TIMEOUTS.health);
      expect(mockRes.status).toHaveBeenCalledWith(408);
    });
  });
});
