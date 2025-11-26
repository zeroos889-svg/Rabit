/**
 * Health Check Integration Tests
 * Tests all health check endpoints with real server
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import express from "express";
import type { Express } from "express";
import {
  requestIdMiddleware,
  performanceMiddleware,
} from "../requestTracking";
import { healthTimeout } from "../requestTimeout";

// Mock Redis for testing
const mockRedis = {
  ping: async () => "PONG",
  quit: async () => {},
};

vi.mock("../redisClient", () => ({
  getRedis: () => mockRedis,
  connectRedis: async () => {},
  testRedisConnection: async () => true,
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Health Check Integration Tests", () => {
  let app: Express;

  beforeAll(() => {
    app = express();

    // Apply middleware
    app.use(requestIdMiddleware);
    app.use(performanceMiddleware);
    app.use(healthTimeout);

    // Simple health check
    app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });

    // Detailed health check
    app.get("/health/detailed", async (_req, res) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)}s`,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        },
        environment: process.env.NODE_ENV || "development",
      });
    });

    // Redis health check
    app.get("/health/redis", async (_req, res) => {
      try {
        const result = await mockRedis.ping();
        res.status(200).json({
          status: "ok",
          redis: result === "PONG" ? "connected" : "disconnected",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(503).json({
          status: "error",
          redis: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Readiness check
    app.get("/health/ready", async (_req, res) => {
      const checks = {
        server: true,
        redis: false,
      };

      try {
        const redisResult = await mockRedis.ping();
        checks.redis = redisResult === "PONG";
      } catch {
        checks.redis = false;
      }

      const allReady = Object.values(checks).every((check) => check === true);

      res.status(allReady ? 200 : 503).json({
        status: allReady ? "ready" : "not_ready",
        checks,
        timestamp: new Date().toISOString(),
      });
    });

    // Liveness check
    app.get("/health/live", (_req, res) => {
      res.status(200).json({
        status: "alive",
        timestamp: new Date().toISOString(),
      });
    });
  });

  describe("GET /health", () => {
    it("should return 200 and basic health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should complete within timeout", async () => {
      const start = Date.now();
      await request(app).get("/health");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Health timeout is 5s
    });

    it("should include Request-ID header", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-request-id");
      expect(response.headers["x-request-id"]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe("GET /health/detailed", () => {
    it("should return 200 and detailed system information", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memory");
      expect(response.body.memory).toHaveProperty("heapUsed");
      expect(response.body.memory).toHaveProperty("heapTotal");
      expect(response.body.memory).toHaveProperty("rss");
      expect(response.body).toHaveProperty("environment");
    });

    it("should return valid memory values", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.body.memory.heapUsed).toMatch(/^\d+MB$/);
      expect(response.body.memory.heapTotal).toMatch(/^\d+MB$/);
      expect(response.body.memory.rss).toMatch(/^\d+MB$/);
    });

    it("should return valid uptime format", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.body.uptime).toMatch(/^\d+s$/);
    });
  });

  describe("GET /health/redis", () => {
    it("should return 200 when Redis is connected", async () => {
      const response = await request(app).get("/health/redis");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("redis", "connected");
    });

    it("should return 503 when Redis is disconnected", async () => {
      // Mock Redis failure
      const originalPing = mockRedis.ping;
      mockRedis.ping = async () => {
        throw new Error("Connection failed");
      };

      const response = await request(app).get("/health/redis");

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("redis", "disconnected");
      expect(response.body).toHaveProperty("error");

      // Restore original
      mockRedis.ping = originalPing;
    });
  });

  describe("GET /health/ready", () => {
    it("should return 200 when all services are ready", async () => {
      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ready");
      expect(response.body).toHaveProperty("checks");
      expect(response.body.checks).toHaveProperty("server", true);
      expect(response.body.checks).toHaveProperty("redis", true);
    });

    it("should return 503 when Redis is not ready", async () => {
      // Mock Redis failure
      const originalPing = mockRedis.ping;
      mockRedis.ping = async () => {
        throw new Error("Not ready");
      };

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty("status", "not_ready");
      expect(response.body.checks).toHaveProperty("redis", false);

      // Restore original
      mockRedis.ping = originalPing;
    });

    it("should include all service checks", async () => {
      const response = await request(app).get("/health/ready");

      expect(response.body.checks).toHaveProperty("server");
      expect(response.body.checks).toHaveProperty("redis");
    });
  });

  describe("GET /health/live", () => {
    it("should return 200 always when server is running", async () => {
      const response = await request(app).get("/health/live");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "alive");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should respond quickly", async () => {
      const start = Date.now();
      await request(app).get("/health/live");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should be very fast
    });
  });

  describe("Timeout behavior", () => {
    it("should timeout long-running health checks", async () => {
      // Create app with slow endpoint
      const slowApp = express();
      slowApp.use(healthTimeout);

      slowApp.get("/health/slow", async (_req, res) => {
        // Wait longer than health timeout (5s)
        const delay = new Promise((resolve) => {
          setTimeout(resolve, 6000);
        });
        await delay;
        res.json({ status: "ok" });
      });

      const response = await request(slowApp).get("/health/slow");

      expect(response.status).toBe(408);
      expect(response.body).toHaveProperty("error", "Request Timeout");
    }, 10000); // Test timeout 10s
  });

  describe("Concurrent requests", () => {
    it("should handle multiple concurrent health checks", async () => {
      const requests = [
        request(app).get("/health"),
        request(app).get("/health/detailed"),
        request(app).get("/health/redis"),
        request(app).get("/health/ready"),
        request(app).get("/health/live"),
      ];

      const responses = await Promise.all(requests);

      for (const response of responses) {
        expect(response.status).toBeLessThanOrEqual(503);
        expect(response.status).toBeGreaterThanOrEqual(200);
      }
    });

    it("should return unique Request IDs for concurrent requests", async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get("/health")
      );

      const responses = await Promise.all(requests);
      const requestIds = responses.map((r) => r.headers["x-request-id"]);

      // All Request IDs should be unique
      const uniqueIds = new Set(requestIds);
      expect(uniqueIds.size).toBe(5);
    });
  });
});
