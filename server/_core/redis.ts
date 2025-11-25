import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Redis connection
 */
export async function getRedis() {
  if (redis?.isOpen) return redis;

  try {
    redis = createClient({ url: REDIS_URL });
    redis.on("error", (err) => console.error("Redis Client Error:", err));
    await redis.connect();
    console.log("✅ Redis connected successfully");
    return redis;
  } catch (error) {
    console.warn("⚠️  Redis connection failed, continuing without cache:", error);
    return null;
  }
}

export { redis };
