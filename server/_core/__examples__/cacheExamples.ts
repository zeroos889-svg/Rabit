/**
 * Cache Usage Examples for tRPC Procedures
 * أمثلة استخدام الذاكرة المؤقتة في إجراءات tRPC
 * 
 * This file demonstrates how to integrate caching into your tRPC procedures
 * to improve performance and reduce database load.
 * 
 * هذا الملف يوضح كيفية دمج الذاكرة المؤقتة في إجراءات tRPC
 * لتحسين الأداء وتقليل الحمل على قاعدة البيانات.
 */

import { z } from "zod";
import { publicProcedure } from "../trpc";
import { cache, CACHE_KEYS, CACHE_TTL } from "../../_core/cache";

// ============================================================================
// Example 1: Basic Get-or-Set Pattern
// مثال 1: نمط الحصول أو التعيين الأساسي
// ============================================================================

/**
 * Get employee profile with caching
 * الحصول على ملف موظف مع الذاكرة المؤقتة
 */
export const exampleGetEmployeeWithCache = publicProcedure
  .input(z.object({ employeeId: z.number() }))
  .query(async ({ input }) => {
    const cacheKey = CACHE_KEYS.USER_PROFILE(input.employeeId);

    // Use getOrSet pattern - automatically caches if not found
    const employee = await cache.getOrSet(
      cacheKey,
      async () => {
        // This function only runs if cache miss
        return await fetchEmployeeFromDatabase(input.employeeId);
      },
      CACHE_TTL.MEDIUM // 30 minutes
    );

    return {
      success: true,
      data: employee,
      source: (await cache.exists(cacheKey)) ? "cache" : "database",
    };
  });

// ============================================================================
// Example 2: Manual Cache Management
// مثال 2: إدارة الذاكرة المؤقتة يدويًا
// ============================================================================

/**
 * Get employee with manual cache check
 * الحصول على موظف مع فحص الذاكرة المؤقتة يدويًا
 */
export const exampleManualCacheManagement = publicProcedure
  .input(z.object({ employeeId: z.number() }))
  .query(async ({ input }) => {
    const cacheKey = CACHE_KEYS.USER_PROFILE(input.employeeId);

    // Try to get from cache first
    let employee = await cache.get<any>(cacheKey);

    if (employee) {
      return {
        success: true,
        data: employee,
        source: "cache",
      };
    }

    // Cache miss - fetch from database
    employee = await fetchEmployeeFromDatabase(input.employeeId);

    // Store in cache
    await cache.set(cacheKey, employee, CACHE_TTL.LONG);

    return {
      success: true,
      data: employee,
      source: "database",
    };
  });

// ============================================================================
// Example 3: Cache Invalidation on Update
// مثال 3: إبطال الذاكرة المؤقتة عند التحديث
// ============================================================================

/**
 * Update employee and invalidate cache
 * تحديث موظف وإبطال الذاكرة المؤقتة
 */
export const exampleUpdateEmployeeWithInvalidation = publicProcedure
  .input(
    z.object({
      employeeId: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Update employee in database
    const updatedEmployee = await updateEmployeeInDatabase(input);

    // Invalidate cache for this employee
    await cache.delete(CACHE_KEYS.USER_PROFILE(input.employeeId));

    // You might also want to invalidate related caches
    await cache.invalidateUserCache(input.employeeId);

    return {
      success: true,
      data: updatedEmployee,
      message: "Employee updated and cache invalidated",
    };
  });

// ============================================================================
// Example 4: Pattern-based Cache Invalidation
// مثال 4: إبطال الذاكرة المؤقتة بناءً على نمط
// ============================================================================

/**
 * Invalidate all employee caches
 * إبطال جميع ذاكرة الموظفين المؤقتة
 */
export const exampleInvalidateAllEmployees = publicProcedure
  .mutation(async () => {
    // Delete all caches matching pattern "user:*:profile"
    await cache.deletePattern("user:*:profile");

    return {
      success: true,
      message: "All employee caches invalidated",
    };
  });

// ============================================================================
// Example 5: Batch Cache Operations
// مثال 5: عمليات الذاكرة المؤقتة الدفعية
// ============================================================================

/**
 * Get multiple employees with batch caching
 * الحصول على عدة موظفين مع الذاكرة المؤقتة الدفعية
 */
export const exampleBatchCacheOperations = publicProcedure
  .input(
    z.object({
      employeeIds: z.array(z.number()),
    })
  )
  .query(async ({ input }) => {
    const cacheKeys = input.employeeIds.map(id => CACHE_KEYS.USER_PROFILE(id));

    // Try to get all from cache
    const cached = await cache.mget<any>(cacheKeys);

    // Find which ones are missing
    const missingIds: number[] = [];
    const results: any[] = [];

    for (let index = 0; index < cached.length; index++) {
      const value = cached[index];
      if (value) {
        results[index] = { ...value, source: "cache" };
      } else {
        missingIds.push(input.employeeIds[index]!);
        results[index] = null;
      }
    }

    // Fetch missing employees from database
    if (missingIds.length > 0) {
      const missingEmployees = await fetchMultipleEmployeesFromDatabase(
        missingIds
      );

      // Update results and cache the missing ones
      for (const employee of missingEmployees) {
        const index = input.employeeIds.indexOf(employee.id);
        if (index !== -1) {
          results[index] = { ...employee, source: "database" };
          cache.set(
            CACHE_KEYS.USER_PROFILE(employee.id),
            employee,
            CACHE_TTL.MEDIUM
          );
        }
      }
    }

    return {
      success: true,
      data: results.filter(Boolean),
      cacheHits: results.filter(r => r?.source === "cache").length,
      cacheMisses: missingIds.length,
    };
  });

// ============================================================================
// Example 6: Cache Warming
// مثال 6: تسخين الذاكرة المؤقتة
// ============================================================================

/**
 * Warm cache with active employees
 * تسخين الذاكرة المؤقتة بالموظفين النشطين
 */
export const exampleCacheWarming = publicProcedure.mutation(async () => {
  const cacheKey = "employees:active";

  // Warm cache with active employees
  const activeEmployees = await cache.warm(
    cacheKey,
    async () => {
      return await fetchActiveEmployeesFromDatabase();
    },
    CACHE_TTL.LONG // 1 hour
  );

  return {
    success: true,
    message: "Cache warmed successfully",
    count: activeEmployees.length,
  };
});

// ============================================================================
// Example 7: Cache Statistics
// مثال 7: إحصائيات الذاكرة المؤقتة
// ============================================================================

/**
 * Get cache statistics
 * الحصول على إحصائيات الذاكرة المؤقتة
 */
export const exampleCacheStatistics = publicProcedure.query(async () => {
  const stats = await cache.getStats();

  return {
    success: true,
    stats: {
      totalKeys: stats.totalKeys,
      memoryUsage: stats.memoryUsage,
      hitRate: stats.hitRate,
    },
  };
});

// ============================================================================
// Example 8: Conditional Caching
// مثال 8: الذاكرة المؤقتة الشرطية
// ============================================================================

/**
 * Cache only for specific conditions
 * تخزين مؤقت فقط لحالات معينة
 */
export const exampleConditionalCaching = publicProcedure
  .input(
    z.object({
      employeeId: z.number(),
      forceRefresh: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const cacheKey = CACHE_KEYS.USER_PROFILE(input.employeeId);

    // If force refresh, skip cache
    if (input.forceRefresh) {
      await cache.delete(cacheKey);
    }

    // Use getOrSet with conditional logic
    const employee = await cache.getOrSet(
      cacheKey,
      async () => {
        const emp = await fetchEmployeeFromDatabase(input.employeeId);

        // Only cache if employee is active
        if (!emp.active) {
          // Don't cache inactive employees
          // (getOrSet will still cache, so we delete immediately)
          await cache.delete(cacheKey);
        }

        return emp;
      },
      CACHE_TTL.LONG // Use long TTL (handle inactive deletion above)
    );

    return {
      success: true,
      data: employee,
      cached: !input.forceRefresh && employee.active,
    };
  });

// ============================================================================
// Example 9: Cache with Refresh
// مثال 9: الذاكرة المؤقتة مع التحديث
// ============================================================================

/**
 * Get data and refresh cache in background
 * الحصول على البيانات وتحديث الذاكرة المؤقتة في الخلفية
 */
export const exampleCacheWithRefresh = publicProcedure
  .input(z.object({ employeeId: z.number() }))
  .query(async ({ input }) => {
    const cacheKey = CACHE_KEYS.USER_PROFILE(input.employeeId);

    // Get cached value
    let employee = await cache.get<any>(cacheKey);

    if (employee) {
      // Refresh in background if cache is old
      refreshCacheInBackground(cacheKey, input.employeeId);

      return {
        success: true,
        data: employee,
        source: "cache",
      };
    }

    // Cache miss - fetch and cache
    employee = await fetchEmployeeFromDatabase(input.employeeId);
    await cache.set(cacheKey, employee, CACHE_TTL.MEDIUM);

    return {
      success: true,
      data: employee,
      source: "database",
    };
  });

// ============================================================================
// Example 10: Clear All Cache
// مثال 10: مسح كل الذاكرة المؤقتة
// ============================================================================

/**
 * Clear entire cache (admin only)
 * مسح كل الذاكرة المؤقتة (المسؤول فقط)
 */
export const exampleClearAllCache = publicProcedure.mutation(async () => {
  await cache.clear();

  return {
    success: true,
    message: "All cache cleared successfully",
  };
});

// ============================================================================
// Helper Functions (Mock implementations)
// دوال مساعدة (تطبيقات وهمية)
// ============================================================================

async function fetchEmployeeFromDatabase(employeeId: number) {
  // Mock implementation
  return {
    id: employeeId,
    name: "Test Employee",
    email: "test@example.com",
    active: true,
  };
}

async function updateEmployeeInDatabase(input: any) {
  // Mock implementation
  return {
    id: input.employeeId,
    ...input,
  };
}

async function fetchMultipleEmployeesFromDatabase(employeeIds: number[]) {
  // Mock implementation
  return employeeIds.map(id => ({
    id,
    name: `Employee ${id}`,
    email: `employee${id}@example.com`,
    active: true,
  }));
}

async function fetchActiveEmployeesFromDatabase() {
  // Mock implementation
  return [
    { id: 1, name: "Employee 1", active: true },
    { id: 2, name: "Employee 2", active: true },
  ];
}

function refreshCacheInBackground(cacheKey: string, employeeId: number) {
  // Refresh cache asynchronously without blocking
  setTimeout(async () => {
    try {
      const freshData = await fetchEmployeeFromDatabase(employeeId);
      await cache.set(cacheKey, freshData, CACHE_TTL.MEDIUM);
    } catch (error) {
      // Silent failure for background refresh
      console.error("Cache refresh failed:", error);
    }
  }, 0);
}
