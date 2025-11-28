import { createClient } from "redis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL;

let redisInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Redis connection
 */
export async function getRedis() {
  if (!REDIS_URL) {
    logger.warn("Redis not configured (REDIS_URL not set)", { context: "Redis" });
    return null;
  }
  
  if (redisInstance?.isOpen) return redisInstance;

  try {
    redisInstance = createClient({ url: REDIS_URL });
    redisInstance.on("error", (err) => 
      logger.error("Redis Client Error", {
        context: "Redis",
        error: err.message,
      })
    );
    await redisInstance.connect();
    logger.info("Redis connected successfully", { context: "Redis" });
    return redisInstance;
  } catch (error) {
    logger.warn("Redis connection failed, continuing without cache", {
      context: "Redis",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Get Redis instance (read-only accessor)
 */
export function getRedisInstance() {
  return redisInstance;
}
