/**
 * Rate Limiting Examples
 * 
 * أمثلة على كيفية استخدام Rate Limiters في مختلف السيناريوهات
 * 
 * @module rateLimiterExamples
 */

import { Router, type Request, type Response } from "express";
import rateLimiters from "../rateLimiter";
import { redis } from "../../redisClient";

const router = Router();

/**
 * ==========================================
 * Example 1: Protecting Login Endpoint
 * ==========================================
 * 
 * استخدام loginLimiter لحماية تسجيل الدخول من brute-force
 * - 5 محاولات كل 15 دقيقة
 * - يتتبع email + IP
 */
router.post("/auth/login", rateLimiters.login, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // NOTE: Login logic implementation
    console.log("Login attempt:", email, password);
    
    res.json({ success: true, message: "تم تسجيل الدخول بنجاح" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
  }
});

/**
 * ==========================================
 * Example 2-14: Additional Rate Limiting Patterns
 * ==========================================
 * 
 * يمكنك استخدام Rate Limiters بالطرق التالية:
 * 
 * 1. Registration Protection:
 *    router.post("/auth/register", rateLimiters.register, handler)
 * 
 * 2. Password Reset:
 *    router.post("/auth/forgot-password", rateLimiters.passwordReset, handler)
 * 
 * 3. File Upload:
 *    router.post("/files/upload", rateLimiters.upload, handler)
 * 
 * 4. Admin Actions:
 *    router.delete("/admin/users/:id", rateLimiters.admin, handler)
 * 
 * 5. Strict Protection:
 *    router.post("/admin/reset-database", rateLimiters.strict, handler)
 * 
 * 6. Custom Limiter:
 *    const custom = rateLimiters.create({ windowMs: 60000, max: 20, prefix: "custom" })
 *    router.get("/api/special", custom, handler)
 * 
 * 7. Multiple Limiters:
 *    router.post("/api/critical", rateLimiters.general, rateLimiters.strict, handler)
 * 
 * 8. Rate Limit Info Logging:
 *    router.use("/api/monitored", rateLimiters.info)
 * 
 * 9. General API Protection:
 *    app.use("/api/", rateLimiters.general)
 */

/**
 * ==========================================
 * Example 15: Rate Limiting Dashboard
 * ==========================================
 * 
 * endpoint لعرض معلومات rate limiting
 * مفيد للـ monitoring و debugging
 */
router.get("/admin/rate-limits/status", async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress;
  
  res.json({
    ip,
    limiters: {
      general: {
        window: "15 minutes",
        max: 100,
        description: "General API calls",
      },
      login: {
        window: "15 minutes",
        max: 5,
        description: "Login attempts",
      },
      register: {
        window: "1 hour",
        max: 3,
        description: "Registration attempts",
      },
      passwordReset: {
        window: "1 hour",
        max: 3,
        description: "Password reset requests",
      },
      upload: {
        window: "1 hour",
        max: 10,
        description: "File uploads",
      },
      admin: {
        window: "15 minutes",
        max: 30,
        description: "Admin actions",
      },
      strict: {
        window: "5 minutes",
        max: 3,
        description: "Critical actions",
      },
    },
    redisConnected: !!redis,
    note: "These limits apply per IP address or user",
  });
});

export default router;
