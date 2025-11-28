/**
 * Redis Cache Manager
 * يوفر طبقة caching متقدمة باستخدام Redis لتحسين الأداء
 */

/* eslint-disable no-undef */
import Redis from "ioredis";
import { ENV } from "./env";
import { logger } from "./logger";
import {
  trackCacheHit,
  trackCacheLookup,
  trackCacheMiss,
  updateCacheHitRate,
} from "./metrics";

// Type for Redis client - can be real Redis or mock
type RedisClient = InstanceType<typeof Redis> | InMemoryRedis;

// Redis client instance (singleton pattern)
let redisClient: RedisClient | null = null;

type CacheTtlTierLabel =
  | "temporary"
  | "realtime"
  | "short"
  | "frequent"
  | "medium"
  | "long"
  | "very_long"
  | "custom";

const TTL_TIER_BY_SECONDS: Record<number, CacheTtlTierLabel> = {
  30: "temporary",
  60: "realtime",
  300: "short",
  900: "frequent",
  1800: "medium",
  3600: "long",
  86400: "very_long",
};

const resolveCacheTtlTier = (seconds: number): CacheTtlTierLabel => {
  return TTL_TIER_BY_SECONDS[seconds] ?? "custom";
};

class InMemoryRedis {
  private readonly store = new Map<string, { value: string; timeout?: NodeJS.Timeout }>();

  async setex(key: string, ttl: number, value: string) {
    const existing = this.store.get(key);
    if (existing?.timeout) clearTimeout(existing.timeout);

    const timeout = setTimeout(() => this.store.delete(key), ttl * 1000);
    this.store.set(key, { value, timeout });
    return "OK";
  }

  async get(key: string) {
    return this.store.get(key)?.value ?? null;
  }

  async del(...keys: string[]) {
    let deleted = 0;
    for (const key of keys) {
      if (this.store.delete(key)) deleted += 1;
    }
    return deleted;
  }

  async keys(pattern: string) {
    const isWildcard = pattern.endsWith("*");
    const prefix = isWildcard ? pattern.slice(0, -1) : pattern;
    return Array.from(this.store.keys()).filter(k =>
      isWildcard ? k.startsWith(prefix) : k === pattern
    );
  }

  async exists(key: string) {
    return this.store.has(key) ? 1 : 0;
  }

  async mget(...keys: string[]) {
    return keys.map(key => this.store.get(key)?.value ?? null);
  }

  async flushdb() {
    for (const { timeout } of this.store.values()) {
      if (timeout) clearTimeout(timeout);
    }
    this.store.clear();
    return "OK";
  }

  async info(section?: string) {
    if (section) {
      // Section argument is ignored in the in-memory mock implementation
    }
    // Mock info response for memory section
    return "used_memory_human:1.00M";
  }

  async ping() {
    // Mock ping response
    return "PONG";
  }

  async quit() {
    for (const entry of this.store.values()) {
      if (entry.timeout) clearTimeout(entry.timeout);
    }
    this.store.clear();
    return "OK";
  }

  on(...args: Parameters<InstanceType<typeof Redis>['on']>) {
    if (args.length > 0) {
      // Listener registration is intentionally ignored in the mock implementation
    }
    return this;
  }
}

/**
 * إنشاء اتصال Redis
 * @returns Redis client instance
 */
export function getRedisClient(): RedisClient {
  if (!redisClient) {
    const hasRedisUrl = !!ENV.redisUrl && ENV.redisUrl.length > 0;
    const useMock =
      (process.env.NODE_ENV === "test" && !process.env.REDIS_URL) ||
      !hasRedisUrl;

    if (useMock) {
      redisClient = new InMemoryRedis();
      logger.info("Using in-memory cache (Redis not configured)", {
        context: "Cache",
      });
    } else {
      // استخدام environment variable
      const redisUrl = ENV.redisUrl as string;

      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        // تفعيل reconnect تلقائي
        enableReadyCheck: true,
        enableOfflineQueue: true,
      });

      // تسجيل الأحداث المهمة
      redisClient.on("connect", () => {
        logger.info("Redis connected successfully", {
          context: "Cache",
        });
      });

      redisClient.on("error", (err: Error) => {
        logger.error("Redis error", {
          context: "Cache",
          error: err.message,
        });
      });

      redisClient.on("close", () => {
        logger.warn("Redis connection closed", {
          context: "Cache",
        });
      });
    }
  }

  return redisClient;
}

/**
 * Cache Manager مع دوال مساعدة
 */
export class CacheManager {
  private readonly redis: RedisClient;
  private readonly defaultTTL: number;

  constructor(ttl?: number) {
    this.redis = getRedisClient();
    this.defaultTTL = typeof ttl === "number" && ttl > 0 ? ttl : 3600;
  }

  /**
   * حفظ قيمة في الـ cache
   * @param key - Cache key
   * @param value - Value to cache (سيتم تحويله لـ JSON)
   * @param ttl - Time to live بالثواني (اختياري)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expiry = ttl || this.defaultTTL;

    await this.redis.setex(key, expiry, serialized);
  }

  /**
   * استرجاع قيمة من الـ cache
   * @param key - Cache key
   * @returns القيمة المحفوظة أو null إذا لم توجد
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);

    if (!cached) {
      // Track cache miss
      const namespace = key.split(':')[0] || 'default';
      trackCacheMiss(namespace);
      return null;
    }

    // Track cache hit
    const namespace = key.split(':')[0] || 'default';
    trackCacheHit(namespace);

    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  /**
   * حذف قيمة من الـ cache
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * حذف عدة قيم بـ pattern معين
   * @param pattern - Pattern للبحث (مثل: "user:*")
   */
  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * التحقق من وجود key
   * @param key - Cache key
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * دالة مساعدة: حفظ أو استرجاع مع callback
   * إذا كانت القيمة موجودة، يتم إرجاعها من الـ cache
   * إذا لم توجد، يتم استدعاء الـ callback وحفظ النتيجة
   *
   * @param key - Cache key
   * @param callback - دالة لاسترجاع البيانات إذا لم توجد في الـ cache
   * @param ttl - Time to live بالثواني
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const namespace = key.split(":")[0] || "default";
    const explicitTtl = typeof ttl === "number" ? ttl : undefined;
    const resolvedTtl = explicitTtl ?? this.defaultTTL;
    const ttlTier = resolveCacheTtlTier(resolvedTtl);

    // محاولة استرجاع من الـ cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      trackCacheLookup(namespace, ttlTier, "hit");
      return cached;
    }

    trackCacheLookup(namespace, ttlTier, "miss");

    // إذا لم توجد، استدعاء الـ callback
    const value = await callback();

    // حفظ النتيجة في الـ cache مع تحمّل أخطاء Redis
    try {
      await this.set(key, value, explicitTtl);
    } catch (error) {
      logger.warn('📦 Cache: Failed to store value after computation', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return value;
  }

  /**
   * Invalidate cache لمستخدم معين
   * يحذف جميع الـ cache المرتبط بالمستخدم
   */
  async invalidateUserCache(userId: number): Promise<void> {
    await this.deletePattern(`user:${userId}:*`);
  }

  /**
   * Invalidate cache للاستشارات
   */
  async invalidateConsultationsCache(consultantId?: number): Promise<void> {
    if (consultantId) {
      await this.deletePattern(`consultations:consultant:${consultantId}:*`);
    } else {
      await this.deletePattern("consultations:*");
    }
  }

  /**
   * إغلاق اتصال Redis (للاستخدام عند إيقاف التطبيق)
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  // ============================================================================
  // Advanced Features: Statistics and Monitoring
  // ميزات متقدمة: الإحصائيات والمراقبة
  // ============================================================================

  /**
   * Get cache statistics
   * الحصول على إحصائيات الذاكرة المؤقتة
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    try {
      const keys = await this.redis.keys('*');
      const totalKeys = keys.length;
      
      let memoryUsage = 'N/A';
      
      // Get memory usage from Redis INFO command (only available in real Redis)
      if ('info' in this.redis && typeof this.redis.info === 'function') {
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory_human:([^\r\n]+)/);
        if (match) {
          memoryUsage = match[1];
        }
      }

      return {
        totalKeys,
        memoryUsage,
      };
    } catch (error) {
      logger.error('📦 Cache: Failed to get stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalKeys: 0,
        memoryUsage: 'Error',
      };
    }
  }

  // ============================================================================
  // Cache Warming Support
  // دعم تسخين الذاكرة المؤقتة
  // ============================================================================

  /**
   * Warm cache with data
   * تسخين الذاكرة المؤقتة بالبيانات
   * 
   * @example
   * ```typescript
   * await cache.warm('active_employees', async () => {
   *   return await db.employee.findMany({ where: { active: true } });
   * }, 600);
   * ```
   */
  async warm<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      logger.info('📦 Cache: Warming cache', { key });
      const data = await fetchFn();
      await this.set(key, data, ttl);
      logger.info('📦 Cache: Cache warmed successfully', { key });
      return data;
    } catch (error) {
      logger.error('📦 Cache: Failed to warm cache', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get cache keys by pattern
   * الحصول على مفاتيح الذاكرة المؤقتة بنمط
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('📦 Cache: Failed to get keys', {
        pattern,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Batch get multiple keys
   * الحصول على قيم متعددة دفعة واحدة
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    try {
      const values = await this.redis.mget(...keys);
      return values.map((value: string | null) => {
        if (!value) {
          const namespace = keys[0]?.split(':')[0] || 'default';
          trackCacheMiss(namespace);
          return null;
        }

        const namespace = keys[0]?.split(':')[0] || 'default';
        trackCacheHit(namespace);

        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error('📦 Cache: Batch get failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return keys.map(() => null);
    }
  }

  /**
   * Check if key exists
   * التحقق من وجود مفتاح
   */
  async has(key: string): Promise<boolean> {
    return await this.exists(key);
  }

  /**
   * Clear all cache
   * مسح كل الذاكرة المؤقتة
   */
  async clear(): Promise<void> {
    try {
      if ('flushdb' in this.redis && typeof this.redis.flushdb === 'function') {
        await this.redis.flushdb();
        logger.warn('📦 Cache: All cache cleared');
      } else {
        // For in-memory cache, delete all keys
        const keys = await this.redis.keys('*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        logger.warn('📦 Cache: All cache cleared (in-memory)');
      }
    } catch (error) {
      logger.error('📦 Cache: Failed to clear cache', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

/**
 * Cache keys constants لضمان consistency
 */
export const CACHE_KEYS = {
  USER_PROFILE: (userId: number) => `user:${userId}:profile`,
  USER_PERMISSIONS: (userId: number) => `user:${userId}:permissions`,
  CONSULTANT_PROFILE: (consultantId: number) =>
    `consultant:${consultantId}:profile`,
  CONSULTANT_REVIEWS: (consultantId: number) =>
    `consultant:${consultantId}:reviews`,
  CONSULTATIONS_BY_CLIENT: (clientId: number) =>
    `consultations:client:${clientId}`,
  CONSULTATIONS_BY_CONSULTANT: (consultantId: number) =>
    `consultations:consultant:${consultantId}`,
  CONSULTATION_TYPES: "consultation:types",
  COMPANY_INFO: (companyId: number) => `company:${companyId}:info`,
  DASHBOARD_COMPANY_OVERVIEW: () => "dashboard:company:overview",
  DASHBOARD_EMPLOYEE_OVERVIEW: () => "dashboard:employee:overview",
  DASHBOARD_EXECUTIVE_METRICS: () => "dashboard:executive:metrics",
  DASHBOARD_EXECUTIVE_OVERVIEW: () => "dashboard:executive:overview",
  REPORT_OVERVIEW: (rangeKey: string) => `report:overview:${rangeKey}`,
  REPORT_KPIS: (rangeKey: string) => `report:kpis:${rangeKey}`,
  REPORT_TIMESERIES: (rangeKey: string) => `report:timeseries:${rangeKey}`,
  REPORT_DISTRIBUTION: (rangeKey: string) => `report:distribution:${rangeKey}`,
  REPORT_EXPORT: (reportType: string, rangeKey: string) =>
    `report:export:${reportType}:${rangeKey}`,
  ATTENDANCE_TIMELINE: (rangeKey: string) => `attendance:timeline:${rangeKey}`,
  SEARCH_RESULTS: (namespace: string, hash: string) =>
    `search:${namespace}:${hash}`,
};

/**
 * TTL constants (بالثواني)
 */
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  STATIC: 3600, // مستوى 1: بيانات ثابتة
  FREQUENT: 900, // مستوى 2: وصول متكرر (15 دقيقة)
  REALTIME: 60, // مستوى 3: إحصائيات فورية (1 دقيقة)
  TEMPORARY: 30, // مستوى 4: نتائج مؤقتة/بحث (30 ثانية)
};

/**
 * Get Redis client for direct operations
 * @returns Redis client instance
 */
export function getCache(): RedisClient {
  return getRedisClient();
}

// تصدير instance جاهز للاستخدام
export const cache = new CacheManager();

// ============================================================================
// Monitoring and Configuration Logging
// المراقبة وتسجيل الإعدادات
// ============================================================================

/**
 * Log cache configuration
 * تسجيل إعدادات الذاكرة المؤقتة
 */
export function logCacheConfig(): void {
  const enabled = !!ENV.redisUrl;
  logger.info('📦 ============================================');
  logger.info('📦 Cache Configuration');
  logger.info('📦 ============================================');
  logger.info(`📦 Enabled: ${enabled ? 'Redis' : 'In-Memory (Fallback)'}`);
  logger.info(`📦 Default TTL: ${cache['defaultTTL']}s (1 hour)`);
  logger.info(`📦 Redis URL: ${enabled ? 'Connected' : 'Not configured'}`);
  logger.info('📦 ============================================');
}

/**
 * Get cache status for health checks
 * الحصول على حالة الذاكرة المؤقتة لفحوصات الصحة
 */
export async function getCacheStatus() {
  const stats = await cache.getStats();
  const enabled = !!ENV.redisUrl;

  return {
    enabled,
    type: enabled ? 'redis' : 'in-memory',
    stats,
  };
}

/**
 * Update cache metrics for monitoring
 * تحديث مقاييس الذاكرة المؤقتة للمراقبة
 */
export async function updateCacheMetrics(): Promise<void> {
  try {
    const stats = await cache.getStats();
    if (stats.hitRate !== undefined) {
      updateCacheHitRate('default', stats.hitRate);
    }
  } catch (error) {
    logger.error('📦 Cache: Failed to update metrics', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Shutdown cache gracefully
 * إغلاق الذاكرة المؤقتة بشكل كريم
 */
export async function shutdownCache(): Promise<void> {
  try {
    logger.info('📦 Cache: Shutting down...');
    await cache.disconnect();
    logger.info('📦 Cache: Shutdown complete');
  } catch (error) {
    logger.error('📦 Cache: Shutdown error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

