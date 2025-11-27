/**
 * Advanced Health Check System
 * Monitors all system components and dependencies
 */

import { sql } from "drizzle-orm";
import { getDb } from "../db";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    disk: ComponentHealth;
    memory: ComponentHealth;
    cpu: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  message?: string;
  details?: Record<string, unknown>;
}

const startTime = Date.now();

type ExecutableDb = {
  execute: (query: unknown) => Promise<unknown>;
};

type QueryableDb = {
  query: (query: string) => Promise<unknown>;
};

const hasExecute = (db: unknown): db is ExecutableDb =>
  Boolean(db) && typeof (db as ExecutableDb).execute === "function";

const hasQuery = (db: unknown): db is QueryableDb =>
  Boolean(db) && typeof (db as QueryableDb).query === "function";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

/**
 * Check database health
 */
async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();

  try {
    // Get database instance
    const db = await getDb();

    if (!db) {
      return {
        status: "down",
        responseTime: Date.now() - start,
        message: "Database connection not available",
      };
    }

    // Simple query to test connection
    if (hasExecute(db)) {
      await db.execute(sql`SELECT 1`);
    } else if (hasQuery(db)) {
      await db.query("SELECT 1");
    } else {
      throw new TypeError("Database client does not support health check queries");
    }

    const responseTime = Date.now() - start;

    // Check if response time is acceptable
    if (responseTime > 1000) {
      return {
        status: "degraded",
        responseTime,
        message: "Database is slow",
      };
    }

    return {
      status: "up",
      responseTime,
      message: "Database is healthy",
    };
  } catch (error: unknown) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: toErrorMessage(error),
    };
  }
}

/**
 * Check Redis health
 */
async function checkRedis(): Promise<ComponentHealth> {
  const start = Date.now();

  try {
    // Try to get cache instance
    const { getCache } = await import("./cache");
    const cache = getCache();

    // Test ping
    await cache.ping();

    const responseTime = Date.now() - start;

    return {
      status: "up",
      responseTime,
      message: "Redis is healthy",
    };
  } catch (error: unknown) {
    return {
      status: "down",
      responseTime: Date.now() - start,
      message: toErrorMessage(error) || "Redis not available",
    };
  }
}

/**
 * Check disk space
 */
async function checkDisk(): Promise<ComponentHealth> {
  try {
    const os = await import("node:os");

    // Get disk usage (simplified)
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

    if (usedPercent > 90) {
      return {
        status: "degraded",
        message: "Disk usage is high",
        details: { usedPercent: usedPercent.toFixed(2) },
      };
    }

    return {
      status: "up",
      message: "Disk space is healthy",
      details: { usedPercent: usedPercent.toFixed(2) },
    };
  } catch (error: unknown) {
    return {
      status: "down",
      message: toErrorMessage(error),
    };
  }
}

/**
 * Check memory usage
 */
async function checkMemory(): Promise<ComponentHealth> {
  try {
    const used = process.memoryUsage();
    const heapPercent = (used.heapUsed / used.heapTotal) * 100;

    if (heapPercent > 90) {
      return {
        status: "degraded",
        message: "Memory usage is high",
        details: {
          heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapPercent: `${heapPercent.toFixed(2)}%`,
        },
      };
    }

    return {
      status: "up",
      message: "Memory usage is healthy",
      details: {
        heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`,
      },
    };
  } catch (error: unknown) {
    return {
      status: "down",
      message: toErrorMessage(error),
    };
  }
}

/**
 * Check CPU usage
 */
async function checkCPU(): Promise<ComponentHealth> {
  try {
    const os = await import("node:os");
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    // Calculate average CPU usage
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const avgIdle = totalIdle / cpus.length;
    const avgTotal = totalTick / cpus.length;
    const cpuPercent = 100 - Math.trunc((100 * avgIdle) / avgTotal);

    if (cpuPercent > 80) {
      return {
        status: "degraded",
        message: "CPU usage is high",
        details: {
          usage: `${cpuPercent}%`,
          cores: cpus.length,
          loadAvg: loadAvg.map(l => l.toFixed(2)),
        },
      };
    }

    return {
      status: "up",
      message: "CPU usage is healthy",
      details: {
        usage: `${cpuPercent}%`,
        cores: cpus.length,
        loadAvg: loadAvg.map(l => l.toFixed(2)),
      },
    };
  } catch (error: unknown) {
    return {
      status: "down",
      message: toErrorMessage(error),
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    disk: await checkDisk(),
    memory: await checkMemory(),
    cpu: await checkCPU(),
  };

  // Determine overall status
  const statuses = new Set(Object.values(checks).map(c => c.status));
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  if (statuses.has("down")) {
    overallStatus = "unhealthy";
  } else if (statuses.has("degraded")) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || "1.0.0",
    checks,
  };
}

/**
 * Simple health check for load balancers
 */
export async function simpleHealthCheck(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    if (typeof db.execute === "function") {
      await db.execute(sql`SELECT 1`);
    } else if (typeof (db as any).query === "function") {
      await (db as any).query("SELECT 1");
    } else {
      throw new TypeError("Database client does not support health check queries");
    }
    return true;
  } catch {
    return false;
  }
}
