import "dotenv/config";
import mysql from "mysql2/promise";
import type { Pool, PoolOptions } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";
import { env } from "../utils/env";
import { logger } from "../_core/logger";

let pool: Pool | null = null;
let db: MySql2Database<typeof schema> | null = null;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Connection Pool Configuration
 * Optimized for production workloads with proper connection management
 */
function buildPoolOptions(): PoolOptions {
  const url = env.getDatabaseUrl();
  
  const parsed = new URL(url);
  const shouldUseSslParam = parsed.searchParams.get("ssl") ?? parsed.searchParams.get("sslmode");
  const shouldUseSsl =
    (shouldUseSslParam &&
      ["true", "1", "require", "required", "verify-full", "verify-ca"].includes(
        (shouldUseSslParam || "").toLowerCase()
      )) || parsed.hostname.includes("tidb") || parsed.hostname.includes("planetscale");

  const database = parsed.pathname.replace(/^\//, "");
  const isProduction = process.env.NODE_ENV === "production";

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username || ""),
    password: decodeURIComponent(parsed.password || ""),
    database,
    // Connection Pool Settings - Optimized for concurrent requests
    waitForConnections: true,
    connectionLimit: isProduction ? 20 : 10,        // More connections for production
    queueLimit: isProduction ? 100 : 50,            // Queue limit for waiting requests
    maxIdle: isProduction ? 10 : 5,                 // Max idle connections
    idleTimeout: 60000,                              // Close idle connections after 60s
    // Connection Health Settings
    enableKeepAlive: true,                           // Keep connections alive
    keepAliveInitialDelay: 10000,                    // Keep-alive probe delay (10s)
    // SSL Configuration
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    // Timeout Settings
    connectTimeout: 10000,                           // 10s connection timeout
  } satisfies PoolOptions;
}

/**
 * Initialize database connection with retry logic
 */
async function initializePool(): Promise<Pool> {
  const options = buildPoolOptions();
  
  while (connectionAttempts < MAX_RETRY_ATTEMPTS) {
    try {
      connectionAttempts++;
      const newPool = mysql.createPool(options);
      
      // Test the connection
      const connection = await newPool.getConnection();
      await connection.ping();
      connection.release();
      
      logger.info("✅ Database pool initialized successfully", {
        context: "Database",
        connectionLimit: options.connectionLimit,
        host: options.host,
      });
      
      connectionAttempts = 0; // Reset on success
      return newPool;
    } catch (error) {
      logger.warn(`⚠️ Database connection attempt ${connectionAttempts} failed`, {
        context: "Database",
        error: (error as Error).message,
        remainingAttempts: MAX_RETRY_ATTEMPTS - connectionAttempts,
      });
      
      if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
        throw new Error(`Failed to connect to database after ${MAX_RETRY_ATTEMPTS} attempts: ${(error as Error).message}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * connectionAttempts));
    }
  }
  
  throw new Error("Database connection failed - max retries exceeded");
}

/**
 * Get Drizzle database instance
 * Uses singleton pattern with lazy initialization
 */
export async function getDrizzleDb(): Promise<MySql2Database<typeof schema>> {
  if (db) {
    return db;
  }

  pool = await initializePool();
  db = drizzle(pool, { schema, mode: "default" });
  
  // Set up pool event handlers for monitoring
  pool.on("connection", () => {
    logger.debug("New database connection established", { context: "Database" });
  });
  
  pool.on("release", () => {
    logger.debug("Database connection released", { context: "Database" });
  });
  
  return db;
}

/**
 * Get current pool statistics for monitoring
 */
export function getPoolStats() {
  if (!pool) {
    return null;
  }
  
  return {
    // MySQL2 pool doesn't expose all stats directly, but we can track basic info
    isConnected: pool !== null,
    connectionAttempts,
  };
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!pool) {
      return false;
    }
    
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Close database connection pool gracefully
 */
export async function closeDrizzleDb(): Promise<void> {
  if (pool) {
    logger.info("🔄 Closing database connection pool...", { context: "Database" });
    await pool.end();
    pool = null;
    db = null;
    logger.info("✅ Database connection pool closed", { context: "Database" });
  }
}

/**
 * Reconnect to database (useful after connection loss)
 */
export async function reconnectDb(): Promise<void> {
  await closeDrizzleDb();
  connectionAttempts = 0;
  await getDrizzleDb();
}
