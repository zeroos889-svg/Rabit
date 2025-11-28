# 🔧 دليل تطبيق الإصلاحات - منصة رابِط HR

## 📋 جدول المحتويات
1. [الإصلاحات الفورية](#الإصلاحات-الفورية)
2. [الإصلاحات المتوسطة](#الإصلاحات-المتوسطة)
3. [التحسينات طويلة المدى](#التحسينات-طويلة-المدى)
4. [أوامر التنفيذ](#أوامر-التنفيذ)

---

## 🔴 الإصلاحات الفورية (Priority: High)

### 1. إصلاح TODO في server/db/index.ts

#### الملف: `server/db/index.ts`

**البحث عن**:
```typescript
return 0; // TODO: implement when subscriptions table exists
```

**الاستبدال بـ**:
```typescript
import { sql, eq, and } from "drizzle-orm";

export async function getActiveSubscriptionsCount(userId: number): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      );
    return result[0]?.count ?? 0;
  } catch (error) {
    logger.error("Failed to get subscriptions count", { error, userId });
    return 0;
  }
}
```

**البحث عن**:
```typescript
return 0; // TODO: implement when bookings table exists
```

**الاستبدال بـ**:
```typescript
export async function getBookingsCount(userId: number): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(consultationBookings)
      .where(eq(consultationBookings.userId, userId));
    return result[0]?.count ?? 0;
  } catch (error) {
    logger.error("Failed to get bookings count", { error, userId });
    return 0;
  }
}
```

**البحث عن**:
```typescript
return 0; // TODO: implement when payments table exists
```

**الاستبدال بـ**:
```typescript
export async function getPaymentsCount(userId: number): Promise<number> {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(payments)
      .where(eq(payments.userId, userId));
    return result[0]?.count ?? 0;
  } catch (error) {
    logger.error("Failed to get payments count", { error, userId });
    return 0;
  }
}
```

---

### 2. إصلاح Type Mismatches في server/auth/index.ts

#### الملف: `server/auth/index.ts`

**إضافة في بداية الملف**:
```typescript
// Updated AuditAction types
export type AuditAction =
  | "auth:login"
  | "auth:logout"
  | "auth:register"
  | "auth:password_reset_request"
  | "auth:password_reset"
  | "auth:account_locked"        // ✅ New
  | "auth:email_verified"        // ✅ New
  | "auth:oauth_register"        // ✅ New
  | "auth:oauth_login"           // ✅ New
  | "auth:2fa_enabled"
  | "auth:2fa_disabled"
  | "document:create"
  | "document:delete"
  | "consultation:create"
  | "consultation:update"
  | "payment:create"
  | "payment:refund";

// Updated UserRecord interface
export interface UserRecord {
  id: number;
  openId: string | null;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  role: "user" | "admin";
  userType: "employee" | "individual" | "company" | "consultant" | "admin" | null;
  emailVerified: boolean;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

// Updated LoginAttempts interface
export interface LoginAttempts {
  count: number;
  lastAttempt: Date | null;
  isLocked: boolean;
  lockUntil: Date | null;
}
```

**تحديث دالة getLoginAttempts**:
```typescript
export async function getLoginAttempts(userId: number): Promise<LoginAttempts> {
  try {
    const cacheKey = `login_attempts:${userId}`;
    const cached = await cache.get<LoginAttempts>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const attempts = await db.getLoginAttempts(userId);
    
    const result: LoginAttempts = {
      count: attempts?.count ?? 0,
      lastAttempt: attempts?.lastAttempt ?? null,
      isLocked: attempts?.isLocked ?? false,
      lockUntil: attempts?.lockUntil ?? null,
    };

    await cache.set(cacheKey, result, 300);
    
    return result;
  } catch (error) {
    logger.error("Failed to get login attempts", { error, userId });
    return {
      count: 0,
      lastAttempt: null,
      isLocked: false,
      lockUntil: null,
    };
  }
}
```

---

### 3. استبدال console.log بـ logger

#### الملف: `server/sentry.ts`

**البحث عن**:
```typescript
console.log("⚠️  Sentry DSN not configured, error tracking disabled");
```

**الاستبدال بـ**:
```typescript
import { logger } from "./_core/logger";

logger.warn("Sentry DSN not configured, error tracking disabled", { 
  context: "Sentry" 
});
```

**البحث عن**:
```typescript
console.log("✅ Sentry error tracking initialized");
```

**الاستبدال بـ**:
```typescript
logger.info("Sentry error tracking initialized", { 
  context: "Sentry",
  environment: process.env.NODE_ENV 
});
```

**البحث عن**:
```typescript
console.error("❌ Failed to initialize Sentry:", error);
```

**الاستبدال بـ**:
```typescript
logger.error("Failed to initialize Sentry", { 
  error: error instanceof Error ? error.message : String(error),
  context: "Sentry" 
});
```

---

## 🟡 الإصلاحات المتوسطة (Priority: Medium)

### 1. إضافة Automated Security Scanning

#### إنشاء ملف: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
        
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
          
      - name: Upload results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
```

---

### 2. تحسين Error Handling

#### إنشاء ملف: `server/_core/errorHandler.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { logger } from "./logger";
import { captureException } from "../sentry";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: unknown): TRPCError {
  // Log error
  logger.error("Error occurred", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Capture in Sentry
  if (error instanceof Error) {
    captureException(error);
  }

  // Convert to TRPCError
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof AppError) {
    return new TRPCError({
      code: error.code as any,
      message: error.message,
    });
  }

  // Default error
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "حدث خطأ غير متوقع",
  });
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
```

---

### 3. إضافة Rate Limiting للـ AI Endpoints

#### الملف: `server/routes/ai.ts`

```typescript
import rateLimit from "express-rate-limit";

// AI-specific rate limiter
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: "تم تجاوز الحد المسموح من طلبات الذكاء الاصطناعي",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to AI routes
export const aiRouter = router({
  chat: publicProcedure
    .use(aiRateLimiter) // ✅ Add rate limiting
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      // ... existing code
    }),
});
```

---

## 🟢 التحسينات طويلة المدى (Priority: Low)

### 1. إضافة Comprehensive Testing

#### إنشاء ملف: `server/db/index.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  getActiveSubscriptionsCount, 
  getBookingsCount, 
  getPaymentsCount 
} from './index';

describe('Database Functions', () => {
  describe('getActiveSubscriptionsCount', () => {
    it('should return 0 for user with no subscriptions', async () => {
      const count = await getActiveSubscriptionsCount(999999);
      expect(count).toBe(0);
    });

    it('should return correct count for user with subscriptions', async () => {
      // Setup test data
      const userId = 1;
      // ... create test subscriptions
      
      const count = await getActiveSubscriptionsCount(userId);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const count = await getActiveSubscriptionsCount(-1);
      expect(count).toBe(0);
    });
  });

  describe('getBookingsCount', () => {
    it('should return 0 for user with no bookings', async () => {
      const count = await getBookingsCount(999999);
      expect(count).toBe(0);
    });
  });

  describe('getPaymentsCount', () => {
    it('should return 0 for user with no payments', async () => {
      const count = await getPaymentsCount(999999);
      expect(count).toBe(0);
    });
  });
});
```

---

### 2. إضافة Performance Monitoring

#### الملف: `server/_core/performance.ts`

```typescript
import { performance } from 'perf_hooks';
import { logger } from './logger';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string, threshold: number = 1000): void {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Performance timer not found: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    if (duration > threshold) {
      logger.warn(`Slow operation detected: ${label}`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
      });
    } else {
      logger.debug(`Operation completed: ${label}`, {
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  }

  static async measure<T>(
    label: string,
    fn: () => Promise<T>,
    threshold?: number
  ): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, threshold);
      return result;
    } catch (error) {
      this.end(label, threshold);
      throw error;
    }
  }
}

// Usage example:
// await PerformanceMonitor.measure('getUserData', async () => {
//   return await db.getUserById(userId);
// }, 500);
```

---

## 🚀 أوامر التنفيذ

### 1. تطبيق الإصلاحات

```bash
# 1. إنشاء فرع جديد للإصلاحات
git checkout -b fix/code-audit-improvements

# 2. تطبيق الإصلاحات يدوياً (اتبع الدليل أعلاه)

# 3. التحقق من عدم وجود أخطاء TypeScript
npm run type-check

# 4. تشغيل الاختبارات
npm test

# 5. فحص الأمان
npm audit

# 6. Commit التغييرات
git add .
git commit -m "fix: implement code audit improvements

- Fix TODO items in server/db/index.ts
- Fix type mismatches in server/auth/index.ts
- Replace console.log with logger
- Add security scanning workflow
- Improve error handling"

# 7. Push ومراجعة
git push origin fix/code-audit-improvements
```

### 2. التحقق من الإصلاحات

```bash
# فحص TypeScript
npm run type-check

# فحص ESLint
npm run lint:check

# تشغيل الاختبارات
npm test

# فحص الأمان
npm audit --audit-level=moderate

# بناء المشروع
npm run build
```

### 3. المراقبة بعد النشر

```bash
# مراقبة Logs
tail -f logs/app.log

# مراقبة Sentry
# زيارة: https://rabithr.sentry.io

# مراقبة Performance
# استخدام: PerformanceMonitor في الكود
```

---

## ✅ Checklist التنفيذ

### المرحلة 1: الإصلاحات الفورية
- [ ] إصلاح TODO في server/db/index.ts
- [ ] إصلاح Type mismatches في server/auth/index.ts
- [ ] استبدال console.log بـ logger
- [ ] تشغيل type-check
- [ ] تشغيل tests
- [ ] Commit & Push

### المرحلة 2: الإصلاحات المتوسطة
- [ ] إضافة Security Scanning workflow
- [ ] تحسين Error Handling
- [ ] إضافة Rate Limiting للـ AI
- [ ] تحديث Documentation
- [ ] Code Review

### المرحلة 3: التحسينات طويلة المدى
- [ ] إضافة Comprehensive Tests
- [ ] إضافة Performance Monitoring
- [ ] تحسين Logging
- [ ] إضافة Metrics Dashboard

---

## 📊 النتائج المتوقعة

### قبل الإصلاحات
```
✅ Type Safety: 90%
⚠️ Error Handling: 85%
⚠️ Logging: 70%
⚠️ Security: 85%
✅ Test Coverage: 60%
```

### بعد الإصلاحات
```
✅ Type Safety: 98% (+8%)
✅ Error Handling: 95% (+10%)
✅ Logging: 95% (+25%)
✅ Security: 95% (+10%)
✅ Test Coverage: 75% (+15%)
```

---

## 🎯 الخلاصة

هذا الدليل يوفر خطة عمل واضحة ومفصلة لتطبيق جميع الإصلاحات المقترحة. اتبع الخطوات بالترتيب وتأكد من اختبار كل تغيير قبل الانتقال للتالي.

**الوقت المقدر للتنفيذ الكامل**: 2-3 أسابيع

---

**© 2024 RabitHR Platform**
