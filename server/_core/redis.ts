import { createClient } from "redis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Redis connection
 */
export async function getRedis() {
  if (redis?.isOpen) return redis;

  try {
    redis = createClient({ url: REDIS_URL });
    redis.on("error", (err) => 
      logger.error("Redis Client Error", {
        context: "Redis",
        error: err.message,
      })
    );
    await redis.connect();
    logger.info("Redis connected successfully", { context: "Redis" });
    return redis;
  } catch (error) {
    logger.warn("Redis connection failed, continuing without cache", {
      context: "Redis",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export { redis };
