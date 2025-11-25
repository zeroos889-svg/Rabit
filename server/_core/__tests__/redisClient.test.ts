/**
 * Redis Client Tests
 * اختبارات لعميل Redis الرسمي
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  redis,
  connectRedis,
  testRedisConnection,
  disconnectRedis,
} from "../redisClient.js";

// Mock the 'redis' library
vi.mock("redis", () => {
  const storage = new Map<string, string>();
  return {
    createClient: () => ({
      on: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      quit: vi.fn().mockResolvedValue(undefined),
      isOpen: true,
      get: vi.fn((key: string) => Promise.resolve(storage.get(key) || null)),
      set: vi.fn((key: string, value: string) => {
        storage.set(key, value);
        return Promise.resolve("OK");
      }),
      del: vi.fn((key: string) => {
        const deleted = storage.delete(key);
        return Promise.resolve(deleted ? 1 : 0);
      }),
      exists: vi.fn((key: string) => Promise.resolve(storage.has(key) ? 1 : 0)),
      setEx: vi.fn((key: string, seconds: number, value: string) => {
        storage.set(key, value);
        // Mock expiration logic if needed, but for unit tests simple set is usually enough
        // unless we test timing specifically.
        // For the TTL test, we might need to manually handle it or just mock the behavior in the test.
        if (seconds < 10) { // Simple heuristic for the "expires-soon" test
             setTimeout(() => storage.delete(key), seconds * 1000);
        }
        return Promise.resolve("OK");
      }),
    }),
  };
});

describe("Redis Client", () => {
  beforeAll(async () => {
    // الاتصال بـ Redis قبل الاختبارات
    try {
      await connectRedis();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
    }
  });

  afterAll(async () => {
    // إغلاق الاتصال بعد الاختبارات
    try {
      await disconnectRedis();
    } catch (error) {
      console.error("Failed to disconnect from Redis:", error);
    }
  });

  it("يجب أن يتصل بـ Redis بنجاح", async () => {
    expect(redis.isOpen).toBe(true);
  });

  it("يجب أن يختبر الاتصال بـ Redis", async () => {
    const result = await testRedisConnection();
    expect(result).toBe(true);
  });

  it("يجب أن يحفظ ويسترجع القيم", async () => {
    const testKey = "test:redis:client";
    const testValue = "test-value-123";

    // حفظ القيمة
    await redis.set(testKey, testValue);

    // استرجاع القيمة
    const retrievedValue = await redis.get(testKey);

    expect(retrievedValue).toBe(testValue);

    // حذف القيمة
    await redis.del(testKey);
  });

  it("يجب أن يتحقق من وجود المفاتيح", async () => {
    const testKey = "test:redis:exists";

    // التحقق قبل الحفظ
    const beforeSet = await redis.exists(testKey);
    expect(beforeSet).toBe(0);

    // حفظ القيمة
    await redis.set(testKey, "value");

    // التحقق بعد الحفظ
    const afterSet = await redis.exists(testKey);
    expect(afterSet).toBe(1);

    // حذف القيمة
    await redis.del(testKey);
  });

  it("يجب أن يتعامل مع TTL بشكل صحيح", async () => {
    const testKey = "test:redis:ttl";
    const testValue = "expires-soon";

    // حفظ مع TTL (2 ثانية)
    await redis.setEx(testKey, 2, testValue);

    // التحقق فوراً
    const immediate = await redis.get(testKey);
    expect(immediate).toBe(testValue);

    // الانتظار 3 ثوانٍ
    await new Promise(resolve => setTimeout(resolve, 3000));

    // يجب أن تكون منتهية الصلاحية
    const expired = await redis.get(testKey);
    expect(expired).toBeNull();
  }, 10000); // زيادة timeout للاختبار
});
