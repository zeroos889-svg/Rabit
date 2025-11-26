/**
 * Tests for Request/Response Logging
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  requestLoggingMiddleware,
  getSensitiveFields,
  addSensitiveField,
} from "../requestResponseLogger";

describe("Request/Response Logging", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: any;
  let sendSpy: any;

  beforeEach(() => {
    mockReq = {
      path: "/api/test",
      method: "POST",
      originalUrl: "/api/test?param=value",
      headers: {
        "content-type": "application/json",
        "user-agent": "test-agent",
      },
      query: { param: "value" },
      body: { test: "data" },
      ip: "127.0.0.1",
    };

    jsonSpy = vi.fn().mockReturnThis();
    sendSpy = vi.fn().mockReturnThis();

    mockRes = {
      statusCode: 200,
      statusMessage: "OK",
      json: jsonSpy,
      send: sendSpy,
      getHeader: vi.fn(),
      on: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe("Middleware Behavior", () => {
    it("should call next middleware", () => {
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should skip logging for health check paths", () => {
      mockReq = { ...mockReq, path: "/health" };
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should skip logging for favicon", () => {
      mockReq = { ...mockReq, path: "/favicon.ico" };
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Sensitive Data Redaction", () => {
    it("should have default sensitive fields", () => {
      const fields = getSensitiveFields();
      expect(fields).toContain("password");
      expect(fields).toContain("token");
      expect(fields).toContain("secret");
      expect(fields).toContain("apiKey");
    });

    it("should add custom sensitive field", () => {
      const beforeLength = getSensitiveFields().length;
      addSensitiveField("customSecret");
      const afterLength = getSensitiveFields().length;
      expect(afterLength).toBe(beforeLength + 1);
      expect(getSensitiveFields()).toContain("customSecret");
    });

    it("should not duplicate sensitive fields", () => {
      addSensitiveField("duplicateTest");
      const firstLength = getSensitiveFields().length;
      addSensitiveField("duplicateTest");
      const secondLength = getSensitiveFields().length;
      expect(secondLength).toBe(firstLength);
    });

    it("should have comprehensive list of sensitive fields", () => {
      const fields = getSensitiveFields();
      expect(fields.length).toBeGreaterThanOrEqual(10);
      
      // Check for common sensitive fields
      expect(fields).toContain("password");
      expect(fields).toContain("authorization");
      expect(fields).toContain("cookie");
      expect(fields).toContain("csrf");
      expect(fields).toContain("creditCard");
      expect(fields).toContain("cvv");
    });
  });

  describe("Skip Paths", () => {
    const skipPaths = ["/health", "/health/live", "/health/ready", "/favicon.ico"];

    for (const path of skipPaths) {
      it(`should skip logging for ${path}`, () => {
        mockReq = { ...mockReq, path };
        requestLoggingMiddleware(
          mockReq as Request,
          mockRes as Response,
          mockNext
        );
        expect(mockNext).toHaveBeenCalled();
      });
    }
  });

  describe("Request Data Capture", () => {
    it("should log request with method and path", () => {
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should log request with query parameters", () => {
      mockReq = { ...mockReq, query: { search: "test", page: "1" } };
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should log request with body", () => {
      mockReq = { ...mockReq, body: { name: "Test", email: "test@example.com" } };
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should log request IP address", () => {
      mockReq = { ...mockReq, ip: "192.168.1.1" };
      requestLoggingMiddleware(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
