/**
 * Redis Client Configuration
 * عميل Redis الرسمي للاتصال بـ Vercel Storage
 */

import { createClient, type RedisClientType } from "redis";
import { logger } from "./logger";

// Only create Redis client if REDIS_URL is configured
let redis: RedisClientType | null = null;

/**
 * Get or create Redis client
 * Returns null if REDIS_URL is not configured
 */
export const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL,
    }) as RedisClientType;

    redis.on("error", err =>
      logger.error("Redis Client Error", { context: "Redis", error: err })
    );
  }
  
  return redis;
};

// Export redis for backward compatibility (lazy initialization)
export { redis };

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client) {
    logger.warn("Redis not configured (REDIS_URL not set)", { context: "Redis" });
    return;
  }
  
  if (!client.isOpen) {
    await client.connect();
    logger.info("Redis connected successfully", { context: "Redis" });
  }
};

/**
 * اختبار اتصال Redis
 * Test Redis connectivity
 */
export const testRedisConnection = async () => {
  const client = getRedisClient();
  if (!client || !client.isOpen) {
    logger.warn("Redis not available for testing", { context: "Redis" });
    return false;
  }
  
  try {
    await client.set("test_key", "alive");
    const value = await client.get("test_key");
    logger.debug("Redis test completed", {
      context: "Redis",
      testValue: value,
    });
    return value === "alive";
  } catch (error) {
    logger.error("Redis test failed", { context: "Redis", error });
    return false;
  }
};

/**
 * إغلاق اتصال Redis
 * Disconnect Redis client
 */
export const disconnectRedis = async () => {
  const client = getRedisClient();
  if (client?.isOpen) {
    await client.quit();
    logger.info("Redis disconnected", { context: "Redis" });
  }
};
