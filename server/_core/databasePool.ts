/**
 * Database Connection Pool Management & Monitoring
 * Provides connection pool monitoring, health checks, and optimization
 */

/* eslint-disable no-undef */
import { execute } from "../db/index";
import { logger } from "./logger";

interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  activeConnections: number;
  waitingRequests: number;
  maxConnections: number;
  timestamp: string;
}

interface ConnectionHealth {
  healthy: boolean;
  responseTime: number;
  error?: string;
  poolStats?: PoolStats;
}

/**
 * Get current pool statistics
 * Note: Actual implementation depends on the database driver used
 */
export function getPoolStats(): PoolStats {
  // This is a placeholder - actual implementation depends on database driver
  // For Drizzle with PostgreSQL, you'd access the underlying pg.Pool
  return {
    totalConnections: 0,
    idleConnections: 0,
    activeConnections: 0,
    waitingRequests: 0,
    maxConnections: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<ConnectionHealth> {
  const start = Date.now();
  
  try {
    // Simple health check query
    await execute();
    
    const responseTime = Date.now() - start;
    const poolStats = getPoolStats();

    // Consider unhealthy if response time > 1000ms
    const healthy = responseTime < 1000;

    if (!healthy) {
      logger.warn("Database health check slow", {
        context: "DatabasePool",
        responseTime,
        threshold: 1000,
      });
    }

    return {
      healthy,
      responseTime,
      poolStats,
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    
    logger.error("Database health check failed", {
      context: "DatabasePool",
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
    });

    return {
      healthy: false,
      responseTime,
      error: error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

/**
 * Log pool statistics periodically
 */
export function startPoolMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  logger.info("Starting database pool monitoring", {
    context: "DatabasePool",
    interval: `${intervalMs}ms`,
  });

  const interval = setInterval(() => {
    const stats = getPoolStats();
    
    logger.info("Database pool statistics", {
      context: "DatabasePool",
      stats,
    });

    // Alert if pool is getting full
    const utilizationPercent = (stats.activeConnections / stats.maxConnections) * 100;
    if (utilizationPercent > 80) {
      logger.warn("Database pool utilization high", {
        context: "DatabasePool",
        utilization: `${utilizationPercent.toFixed(2)}%`,
        active: stats.activeConnections,
        max: stats.maxConnections,
      });
    }

    // Alert if there are waiting requests
    if (stats.waitingRequests > 0) {
      logger.warn("Database pool has waiting requests", {
        context: "DatabasePool",
        waiting: stats.waitingRequests,
        active: stats.activeConnections,
        max: stats.maxConnections,
      });
    }
  }, intervalMs);

  return interval;
}

/**
 * Stop pool monitoring
 */
export function stopPoolMonitoring(interval: NodeJS.Timeout): void {
  clearInterval(interval);
  logger.info("Stopped database pool monitoring", {
    context: "DatabasePool",
  });
}

/**
 * Test database connection with retry logic
 */
export async function testDatabaseConnection(
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await execute();
      
      logger.info("Database connection test successful", {
        context: "DatabasePool",
        attempt,
      });
      
      return true;
    } catch (error) {
      logger.error("Database connection test failed", {
        context: "DatabasePool",
        attempt,
        maxRetries,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (attempt < maxRetries) {
        logger.info("Retrying database connection", {
          context: "DatabasePool",
          attempt,
          nextAttemptIn: `${retryDelay}ms`,
        });
        
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  return false;
}

/**
 * Execute query with connection tracking
 */
export async function executeWithTracking<T>(
  queryFn: () => Promise<T>,
  queryName: string
): Promise<T> {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  logger.debug("Database query started", {
    context: "DatabasePool",
    requestId,
    query: queryName,
  });

  try {
    const result = await queryFn();
    const duration = Date.now() - start;

    logger.debug("Database query completed", {
      context: "DatabasePool",
      requestId,
      query: queryName,
      duration,
    });

    // Log slow queries
    if (duration > 1000) {
      logger.warn("Slow database query detected", {
        context: "DatabasePool",
        requestId,
        query: queryName,
        duration,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    logger.error("Database query failed", {
      context: "DatabasePool",
      requestId,
      query: queryName,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

/**
 * Get database pool recommendations based on current usage
 */
export function getPoolRecommendations(): string[] {
  const stats = getPoolStats();
  const recommendations: string[] = [];

  const utilization = (stats.activeConnections / stats.maxConnections) * 100;

  if (utilization > 90) {
    recommendations.push(
      `Pool utilization is very high (${utilization.toFixed(1)}%). Consider increasing DB_POOL_MAX.`
    );
  }

  if (stats.waitingRequests > 5) {
    recommendations.push(
      `High number of waiting requests (${stats.waitingRequests}). Consider increasing pool size or optimizing queries.`
    );
  }

  if (stats.maxConnections < 10) {
    recommendations.push(
      `Pool size is small (${stats.maxConnections}). Consider increasing for production workloads.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Database pool configuration looks healthy.");
  }

  return recommendations;
}

export default {
  getPoolStats,
  checkDatabaseHealth,
  startPoolMonitoring,
  stopPoolMonitoring,
  testDatabaseConnection,
  executeWithTracking,
  getPoolRecommendations,
};
