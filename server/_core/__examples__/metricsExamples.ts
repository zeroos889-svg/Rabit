/**
 * Metrics Usage Examples for tRPC Procedures
 * أمثلة استخدام المقاييس في إجراءات tRPC
 * 
 * This file demonstrates how to integrate Prometheus metrics
 * into your tRPC procedures to track business operations.
 * 
 * هذا الملف يوضح كيفية دمج مقاييس Prometheus
 * في إجراءات tRPC لتتبع العمليات التجارية.
 */

import { z } from "zod";
import { publicProcedure } from "../trpc";
import {
  trackBusinessOperation,
  trackPayment,
  trackNotification,
  trackAuthentication,
  trackCacheHit,
  trackCacheMiss,
  trackDatabaseQuery,
  trackError,
  trackValidationError,
} from "../../_core/metrics";

// ============================================================================
// Example 1: Track Business Operation
// مثال 1: تتبع عملية تجارية
// ============================================================================

/**
 * Example: Process employee attendance
 * مثال: معالجة حضور موظف
 */
export const exampleAttendanceTracking = publicProcedure
  .input(
    z.object({
      employeeId: z.string(),
      checkIn: z.string().datetime(),
      checkOut: z.string().datetime().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Process attendance
      const attendance = await processAttendance(input);

      // Track successful operation
      trackBusinessOperation("attendance_record", "success");

      return {
        success: true,
        data: attendance,
      };
    } catch (error) {
      // Track failed operation
      trackBusinessOperation("attendance_record", "failure");

      // Track specific error
      trackError(
        error instanceof Error ? error.name : "UnknownError",
        "attendance.create",
        "POST"
      );

      throw error;
    }
  });

// ============================================================================
// Example 2: Track Payment Processing
// مثال 2: تتبع معالجة الدفع
// ============================================================================

/**
 * Example: Process payroll payment
 * مثال: معالجة دفعة الرواتب
 */
export const examplePaymentTracking = publicProcedure
  .input(
    z.object({
      payrollId: z.string(),
      amount: z.number().positive(),
      paymentMethod: z.enum(["bank_transfer", "cash", "check"]),
    })
  )
  .mutation(async ({ input }) => {
    const startTime = Date.now();

    try {
      // Validate payment
      const validation = await validatePayment(input);
      if (!validation.valid) {
        trackValidationError("payment.process", validation.field || "unknown");
        throw new Error(`Invalid payment: ${validation.message}`);
      }

      // Process payment
      const payment = await processPayment(input);

      // Track successful payment
      trackPayment("success", input.paymentMethod);
      trackBusinessOperation("payment_processed", "success");

      // Track database operation
      const dbDuration = Date.now() - startTime;
      trackDatabaseQuery("INSERT", "payments", dbDuration);

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      // Track failed payment
      trackPayment("failure", input.paymentMethod);
      trackBusinessOperation("payment_processed", "failure");
      trackError(
        error instanceof Error ? error.name : "PaymentError",
        "payment.process",
        "POST"
      );

      throw error;
    }
  });

// ============================================================================
// Example 3: Track Notification Delivery
// مثال 3: تتبع تسليم الإشعارات
// ============================================================================

/**
 * Example: Send notification to employee
 * مثال: إرسال إشعار لموظف
 */
export const exampleNotificationTracking = publicProcedure
  .input(
    z.object({
      employeeId: z.string(),
      type: z.enum(["email", "sms", "push"]),
      message: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Send notification
      const result = await sendNotification(
        input.employeeId,
        input.type,
        input.message
      );

      // Track successful notification
      trackNotification(
        "employee_notification",
        input.type,
        result.sent ? "sent" : "failed"
      );

      if (result.sent) {
        trackBusinessOperation("notification_sent", "success");
      } else {
        trackBusinessOperation("notification_sent", "failure");
      }

      return {
        success: result.sent,
        messageId: result.messageId,
      };
    } catch (error) {
      // Track failed notification
      trackNotification("employee_notification", input.type, "failed");
      trackBusinessOperation("notification_sent", "failure");
      trackError(
        error instanceof Error ? error.name : "NotificationError",
        "notification.send",
        "POST"
      );

      throw error;
    }
  });

// ============================================================================
// Example 4: Track Authentication
// مثال 4: تتبع المصادقة
// ============================================================================

/**
 * Example: User login
 * مثال: تسجيل دخول المستخدم
 */
export const exampleAuthenticationTracking = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      method: z.enum(["password", "otp", "oauth"]),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Attempt authentication
      const user = await authenticateUser(input.email, input.password);

      if (user) {
        // Track successful authentication
        trackAuthentication("success", input.method);
        trackBusinessOperation("user_login", "success");

        return {
          success: true,
          user,
        };
      } else {
        // Track failed authentication
        trackAuthentication("failure", input.method);
        trackBusinessOperation("user_login", "failure");

        return {
          success: false,
          error: "Invalid credentials",
        };
      }
    } catch (error) {
      // Track authentication error
      trackAuthentication("failure", input.method);
      trackBusinessOperation("user_login", "failure");
      trackError(
        error instanceof Error ? error.name : "AuthError",
        "auth.login",
        "POST"
      );

      throw error;
    }
  });

// ============================================================================
// Example 5: Track Cache Usage
// مثال 5: تتبع استخدام الذاكرة المؤقتة
// ============================================================================

/**
 * Example: Get employee profile with caching
 * مثال: الحصول على ملف موظف مع الذاكرة المؤقتة
 */
export const exampleCacheTracking = publicProcedure
  .input(
    z.object({
      employeeId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const cacheKey = `employee:${input.employeeId}`;

    try {
      // Try to get from cache
      const cached = await getFromCache(cacheKey);

      if (cached) {
        // Track cache hit
        trackCacheHit("employee");
        trackBusinessOperation("profile_retrieved", "success");

        return {
          success: true,
          data: cached,
          source: "cache",
        };
      }

      // Track cache miss
      trackCacheMiss("employee");

      // Get from database
      const startTime = Date.now();
      const employee = await getEmployeeFromDatabase(input.employeeId);
      const dbDuration = Date.now() - startTime;

      // Track database query
      trackDatabaseQuery("SELECT", "employees", dbDuration);

      if (employee) {
        // Store in cache for next time
        await storeInCache(cacheKey, employee, 300); // 5 minutes TTL

        trackBusinessOperation("profile_retrieved", "success");

        return {
          success: true,
          data: employee,
          source: "database",
        };
      } else {
        trackBusinessOperation("profile_retrieved", "failure");
        trackError("NotFoundError", "employee.get", "GET");

        return {
          success: false,
          error: "Employee not found",
        };
      }
    } catch (error) {
      trackBusinessOperation("profile_retrieved", "failure");
      trackError(
        error instanceof Error ? error.name : "DatabaseError",
        "employee.get",
        "GET"
      );

      throw error;
    }
  });

// ============================================================================
// Example 6: Track Complex Operation with Multiple Metrics
// مثال 6: تتبع عملية معقدة مع مقاييس متعددة
// ============================================================================

/**
 * Example: Process monthly payroll
 * مثال: معالجة الرواتب الشهرية
 */
export const exampleComplexOperationTracking = publicProcedure
  .input(
    z.object({
      month: z.string(),
      year: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    const operationStartTime = Date.now();

    try {
      // Step 1: Get employees
      const employeesStartTime = Date.now();
      const employees = await getActiveEmployees();
      trackDatabaseQuery("SELECT", "employees", Date.now() - employeesStartTime);
      trackBusinessOperation("employees_fetched", "success");

      // Step 2: Calculate salaries
      let successCount = 0;
      let failureCount = 0;

      for (const employee of employees) {
        try {
          // Calculate salary
          const salary = await calculateSalary(employee.id, input.month, input.year);

          // Process payment
          const paymentStartTime = Date.now();
          await processPayment({
            employeeId: employee.id,
            amount: salary.total,
            month: input.month,
            year: input.year,
          });
          trackDatabaseQuery("INSERT", "payments", Date.now() - paymentStartTime);
          trackPayment("success", "bank_transfer");

          // Send notification
          await sendNotification(
            employee.id,
            "email",
            `Your salary for ${input.month} ${input.year} has been processed`
          );
          trackNotification("salary_notification", "email", "sent");

          successCount++;
        } catch (error) {
          // Track individual failure
          trackPayment("failure", "bank_transfer");
          trackNotification("salary_notification", "email", "failed");
          trackError(
            error instanceof Error ? error.name : "PayrollError",
            "payroll.process",
            "POST"
          );
          failureCount++;
        }
      }

      // Track overall operation
      const totalDuration = Date.now() - operationStartTime;
      trackBusinessOperation("payroll_processed", successCount > 0 ? "success" : "failure");

      return {
        success: true,
        processed: successCount,
        failed: failureCount,
        totalEmployees: employees.length,
        durationMs: totalDuration,
      };
    } catch (error) {
      trackBusinessOperation("payroll_processed", "failure");
      trackError(
        error instanceof Error ? error.name : "PayrollError",
        "payroll.process",
        "POST"
      );

      throw error;
    }
  });

// ============================================================================
// Helper Functions (Mock implementations)
// دوال مساعدة (تطبيقات وهمية)
// ============================================================================

async function processAttendance(input: any) {
  // Mock implementation
  return { id: "att_123", ...input };
}

async function validatePayment(input: any): Promise<{ valid: boolean; field?: string; message?: string }> {
  // Mock validation
  return { valid: true };
}

async function processPayment(input: any) {
  // Mock implementation
  return { id: "pay_123", ...input };
}

async function sendNotification(employeeId: string, type: string, message: string) {
  // Mock implementation
  return { sent: true, messageId: "msg_123" };
}

async function authenticateUser(email: string, password: string) {
  // Mock implementation
  return { id: "user_123", email };
}

async function getFromCache(key: string) {
  // Mock implementation
  return null;
}

async function getEmployeeFromDatabase(id: string) {
  // Mock implementation
  return { id, name: "Test Employee" };
}

async function storeInCache(key: string, value: any, ttl: number) {
  // Mock implementation
}

async function getActiveEmployees() {
  // Mock implementation
  return [
    { id: "emp_1", name: "Employee 1" },
    { id: "emp_2", name: "Employee 2" },
  ];
}

async function calculateSalary(employeeId: string, month: string, year: number) {
  // Mock implementation
  return { total: 5000, employeeId, month, year };
}
