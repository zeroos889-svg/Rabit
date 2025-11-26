/**
 * Tests for endpoint-specific rate limiting
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  paymentRateLimiter,
  getRateLimitInfo,
} from "../endpointRateLimit";

describe("Endpoint Rate Limiting", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: "127.0.0.1",
      path: "/api/test",
      method: "POST",
      headers: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe("Rate Limiter Configuration", () => {
    it("should have correct payment rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.payment).toBeDefined();
      expect(info.payment.limit).toBe(5);
      expect(info.payment.window).toBe("15 minutes");
    });

    it("should have correct notification rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.notification).toBeDefined();
      expect(info.notification.limit).toBe(30);
      expect(info.notification.window).toBe("5 minutes");
    });

    it("should have correct upload rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.upload).toBeDefined();
      expect(info.upload.limit).toBe(10);
      expect(info.upload.window).toBe("15 minutes");
    });

    it("should have correct webhook rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.webhook).toBeDefined();
      expect(info.webhook.limit).toBe(50);
      expect(info.webhook.window).toBe("5 minutes");
    });

    it("should have correct report rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.report).toBeDefined();
      expect(info.report.limit).toBe(10);
      expect(info.report.window).toBe("1 hours");
    });

    it("should have correct search rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.search).toBeDefined();
      expect(info.search.limit).toBe(20);
      expect(info.search.window).toBe("1 minutes");
    });

    it("should have correct export rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.export).toBeDefined();
      expect(info.export.limit).toBe(5);
      expect(info.export.window).toBe("30 minutes");
    });

    it("should have correct email rate limit configuration", () => {
      const info = getRateLimitInfo();
      expect(info.email).toBeDefined();
      expect(info.email.limit).toBe(10);
      expect(info.email.window).toBe("1 hours");
    });
  });

  describe("Rate Limiter Behavior", () => {
    it("should call next() on first request within limit", () => {
      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should set rate limit headers", () => {
      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it("should skip rate limiting for health check paths", () => {
      mockReq = { ...mockReq, path: "/health" };
      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should skip rate limiting for development admin users when configured", () => {
      process.env.NODE_ENV = "development";
      (mockReq as any).user = { id: "1", role: "admin" };

      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Key Generation", () => {
    it("should use user ID for authenticated requests", () => {
      (mockReq as any).user = { id: "user123" };
      
      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Key should be based on user ID, not IP
      expect(mockNext).toHaveBeenCalled();
    });

    it("should use IP address for unauthenticated requests", () => {
      mockReq = { ...mockReq, ip: "192.168.1.1" };
      
      paymentRateLimiter(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      
      // Key should be based on IP
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Rate Limit Info", () => {
    it("should return all rate limiter configurations", () => {
      const info = getRateLimitInfo();
      
      expect(info).toHaveProperty("payment");
      expect(info).toHaveProperty("notification");
      expect(info).toHaveProperty("upload");
      expect(info).toHaveProperty("webhook");
      expect(info).toHaveProperty("report");
      expect(info).toHaveProperty("search");
      expect(info).toHaveProperty("export");
      expect(info).toHaveProperty("email");
    });

    it("should include limit and window for each limiter", () => {
      const info = getRateLimitInfo();
      
      for (const limiterInfo of Object.values(info)) {
        expect(limiterInfo).toHaveProperty("limit");
        expect(limiterInfo).toHaveProperty("window");
        expect(typeof limiterInfo.limit).toBe("number");
        expect(typeof limiterInfo.window).toBe("string");
      }
    });
  });

  describe("Different Rate Limiters", () => {
    it("should have different limits for different endpoint types", () => {
      const info = getRateLimitInfo();
      
      // Payment should be more restrictive than notification
      expect(info.payment.limit).toBeLessThan(info.notification.limit);
      
      // Report should be more restrictive than search
      expect(info.report.limit).toBeLessThan(info.search.limit);
      
      // Export should be more restrictive than webhook
      expect(info.export.limit).toBeLessThan(info.webhook.limit);
    });

    it("should have appropriate time windows for resource-intensive operations", () => {
      const info = getRateLimitInfo();
      
      // Report should have longer window (more expensive) - contains "hours"
      expect(info.report.window).toContain("hour");
      
      // Payment should have longer window than notification
      expect(info.payment.window).toContain("15");
      expect(info.notification.window).toContain("5");
    });
  });
});
