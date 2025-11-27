import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { chatRouter } from "./chatRouter";
import { paymentRouter } from "./paymentRouter";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSessionToken } from "./_core/jwt";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { pdfRouter } from "./pdfRouter";
import { getAuditStatsForUser, listAudit, listAuditForUser, recordAudit } from "./audit";
import { notificationsRouter, publishNotification } from "./notificationsRouter";
import { reportsRouter } from "./reportsRouter";
import { dashboardRouter } from "./dashboardRouter";
import { cache, CACHE_KEYS, CACHE_TTL } from "./_core/cache";
import { sendEmail, sendPasswordResetEmail, sendEmailDetailed } from "./_core/email";
import { validatePasswordStrength, hashPassword } from "./_core/password";
import crypto from "node:crypto";
import { ENV } from "./_core/env";
import { aiRouter } from "./routes/ai";
import { aiAdvancedRouter } from "./routes/ai-advanced";
import {
  sendSMS,
  getBookingConfirmationSMS,
  getConsultantBookingSMS,
} from "./_core/sms";
import {
  sendOtpCode,
  verifyOtpCode,
  checkAndSendLoginAlerts,
  extractRequestMetadata,
} from "./auth-helpers";
import {
  parseTimeToMinutes,
  checkDayAvailability,
  checkBookingConflict,
  extractSlaInfo,
  determinePreferredChannel,
  parseRequiredInfo,
  buildPackageNote,
  getConsultationDuration,
} from "./booking-helpers";

const MAX_HISTORY_LIMIT = 500;
const CONTACT_EMAIL_FALLBACK = "support@rabit.sa";
const CONTACT_TOPICS = ["sales", "support", "partnership", "media", "demo", "other"] as const;
const CONTACT_METHODS = ["email", "phone", "whatsapp"] as const;

const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(3).max(255),
        email: z.string().email().max(320),
        phoneNumber: z.string().min(6).max(20).optional(),
        companyName: z.string().max(255).optional(),
        teamSize: z.string().max(50).optional(),
        topic: z.enum(CONTACT_TOPICS).default("sales"),
        message: z.string().min(20).max(2000),
        preferredContactMethod: z.enum(CONTACT_METHODS).default("email"),
        hearAboutUs: z.string().max(120).optional(),
        source: z.string().max(120).optional(),
        locale: z.string().max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip =
        (ctx.req?.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
        ctx.req?.ip ||
        undefined;
      const userAgent = ctx.req?.headers["user-agent"];
      const locale =
        input.locale ||
        ctx.req?.headers["accept-language"]?.split(",")[0]?.trim() ||
        "ar";

      const saved = await db.createContactRequest({
        ...input,
        locale,
        ipAddress: ip,
        userAgent,
        metadata: {
          referer: ctx.req?.headers.referer,
        },
      });

      const adminEmail = ENV.adminEmail || CONTACT_EMAIL_FALLBACK;
      if (adminEmail) {
        const summaryHtml = `
          <p>📩 تم استلام طلب تواصل جديد من موقع رابِط.</p>
          <ul>
            <li><strong>الاسم:</strong> ${input.fullName}</li>
            <li><strong>البريد:</strong> ${input.email}</li>
            ${input.phoneNumber ? `<li><strong>الهاتف:</strong> ${input.phoneNumber}</li>` : ""}
            ${input.companyName ? `<li><strong>الشركة:</strong> ${input.companyName}</li>` : ""}
            ${input.teamSize ? `<li><strong>حجم الفريق:</strong> ${input.teamSize}</li>` : ""}
            <li><strong>القناة المفضلة:</strong> ${input.preferredContactMethod}</li>
            <li><strong>الموضوع:</strong> ${input.topic}</li>
          </ul>
          <p><strong>الرسالة:</strong></p>
          <p style="white-space: pre-line;">${input.message}</p>
        `;

        await sendEmailDetailed({
          to: adminEmail,
          subject: `طلب تواصل جديد - ${input.topic}`,
          html: summaryHtml,
          template: "contact-request",
        }).catch(() => undefined);
      }

      return {
        success: true,
        requestId: saved.id,
        message: "تم استلام طلبك وسيتم التواصل معك قريباً",
      } as const;
    }),
});

export const appRouter = router({
  system: systemRouter,
  contact: contactRouter,
  ai: aiRouter,
  aiAdvanced: aiAdvancedRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    // Register new user with email/password
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
          email: z.string().email("البريد الإلكتروني غير صحيح"),
          password: z
            .string()
            .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
          phoneNumber: z.string().optional(),
          userType: z
            .enum(["employee", "individual", "company", "consultant"])
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const passwordCheck = validatePasswordStrength(input.password);
          if (!passwordCheck.valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: passwordCheck.errors.join(" | "),
            });
          }

          const user = await db.createUserWithPassword(input);
          if (!user) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "تعذر إنشاء المستخدم",
            });
          }

          recordAudit({
            action: "auth:register",
            actorId: user.id,
            actorEmail: user.email ?? input.email,
            resource: "auth",
            metadata: { userType: input.userType ?? "employee" },
            summary: `${user.name ?? input.name ?? "مستخدم"} سجل حساباً جديداً`,
          });

          // إصدار جلسة
          const sessionToken = await createSessionToken({
            userId: user.id,
            email: user.email || input.email,
            role: user.role || "user",
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              userType: user.userType,
            },
            message: "تم إنشاء الحساب وتسجيل الدخول",
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "فشل في إنشاء الحساب";
          throw new TRPCError({
            code: "BAD_REQUEST",
            message,
          });
        }
      }),

    // Login with email/password
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("البريد الإلكتروني غير صحيح"),
          password: z.string().min(1, "كلمة المرور مطلوبة"),
          rememberMe: z.boolean().optional(),
          otp: z.string().length(6).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // التحقق من صحة بيانات الدخول
          const user = await db.verifyUserLogin(input.email, input.password);
          if (!user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "بيانات الدخول غير صحيحة",
            });
          }

          // استخراج معلومات الطلب (IP و User Agent)
          const { ip, userAgent } = extractRequestMetadata(ctx.req);
          const is2faEnabled = ENV.enable2fa;

          // معالجة المصادقة الثنائية (2FA) إذا كانت مفعلة
          if (is2faEnabled) {
            if (!input.otp) {
              // إرسال رمز OTP
              return await sendOtpCode({
                userId: user.id,
                email: user.email || input.email,
                phoneNumber: user.phoneNumber ?? null,
                ip,
                userAgent,
              });
            }

            // التحقق من رمز OTP
            await verifyOtpCode({ userId: user.id, otpInput: input.otp });
          }

          // تسجيل حدث تسجيل الدخول
          recordAudit({
            action: "auth:login",
            actorId: user.id,
            actorEmail: user.email ?? input.email,
            resource: "auth",
            metadata: { rememberMe: input.rememberMe ?? false },
            summary: `${user.name ?? user.email ?? "مستخدم"} سجل الدخول`,
          });

          // إنشاء Session Token
          const sessionToken = await createSessionToken({
            userId: user.id,
            email: user.email || input.email,
            role: user.role,
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

          // فحص وإرسال تنبيهات الدخول من جهاز جديد
          await checkAndSendLoginAlerts({
            userId: user.id,
            email: user.email || input.email,
            phoneNumber: user.phoneNumber ?? null,
            ip,
            userAgent,
          });

          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              userType: user.userType,
            },
            message: "تم تسجيل الدخول بنجاح",
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "فشل في تسجيل الدخول";
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message,
          });
        }
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email("البريد الإلكتروني غير صحيح") }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (user?.id) {
          const token = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
          await db.setPasswordResetToken(user.id, token, expiresAt);
          recordAudit({
            action: "auth:password_reset_request",
            actorId: user.id,
            actorEmail: user.email,
            resource: "auth",
          });
          await sendPasswordResetEmail({
            to: user.email || input.email,
            name: user.name,
            token,
            userId: user.id,
          }).catch(() => undefined);
        }
        return { success: true };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string().min(10),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ input }) => {
        const user = await db.findUserByResetToken(input.token);
        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية",
          });
        }

        const strength = validatePasswordStrength(input.newPassword);
        if (!strength.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: strength.errors.join(" | "),
          });
        }

        const hashed = await hashPassword(input.newPassword);
        await db.updateUserPassword(user.id, hashed);
        recordAudit({
          action: "auth:password_reset",
          actorId: user.id,
          actorEmail: user.email,
          resource: "auth",
        });

        return { success: true };
      }),
  }),

  audit: router({
    list: adminProcedure.query(() => listAudit()),
  }),

  account: router({
    history: protectedProcedure
      .input(z.object({ limit: z.number().min(10).max(200).optional() }).optional())
      .query(({ ctx, input }) => {
        const limit = input?.limit;
        const entries = listAuditForUser(ctx.user.id, limit);
        return { entries };
      }),

    stats: protectedProcedure.query(({ ctx }) => {
      const stats = getAuditStatsForUser(ctx.user.id);
      return { stats };
    }),
  }),

  pdf: pdfRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  dashboard: dashboardRouter,

  // End of Service Benefit Calculator
  eosb: router({
    generatePDF: publicProcedure
      .input(
        z.object({
          salary: z.number(),
          startDate: z.string(),
          endDate: z.string(),
          contractType: z.string(),
          terminationReason: z.string(),
          result: z.object({
            totalAmount: z.number(),
            firstFiveYears: z.number(),
            afterFiveYears: z.number(),
            percentage: z.number(),
            yearsCount: z.number(),
            monthsCount: z.number(),
            daysCount: z.number(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const {
          salary,
          startDate,
          endDate,
          contractType,
          terminationReason,
          result,
        } = input;

        const contractTypeLabels: Record<string, string> = {
          fixed: "محدد المدة",
          unlimited: "غير محدد المدة",
        };

        const terminationReasonLabels: Record<string, string> = {
          resignation: "استقالة العامل",
          dismissal: "فصل من صاحب العمل",
          contract_end: "انتهاء العقد",
          mutual: "اتفاق الطرفين",
          retirement: "التقاعد",
        };

        const pdfContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير حساب مكافأة نهاية الخدمة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      padding: 40px;
      background: #f8f9fa;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3B82F6;
    }
    
    .logo {
      width: 120px;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #1e293b;
      font-size: 28px;
      margin: 0;
    }
    
    .section {
      margin: 30px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #3B82F6;
      margin-bottom: 15px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .info-label {
      font-weight: 600;
      color: #64748b;
    }
    
    .info-value {
      font-weight: 700;
      color: #1e293b;
    }
    
    .result-box {
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    
    .result-amount {
      font-size: 48px;
      font-weight: 700;
      margin: 10px 0;
    }
    
    .legal-note {
      background: #eff6ff;
      border-right: 4px solid #3B82F6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>تقرير حساب مكافأة نهاية الخدمة</h1>
      <p style="color: #64748b; margin-top: 10px;">وفقاً للمادة 84 من نظام العمل السعودي</p>
    </div>

    <div class="section">
      <div class="section-title">البيانات المدخلة</div>
      <div class="info-row">
        <span class="info-label">الراتب الأساسي:</span>
        <span class="info-value">${salary.toLocaleString("ar-SA")} ﷼</span>
      </div>
      <div class="info-row">
        <span class="info-label">تاريخ المباشرة:</span>
        <span class="info-value">${new Date(startDate).toLocaleDateString("ar-SA")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">آخر يوم عمل:</span>
        <span class="info-value">${new Date(endDate).toLocaleDateString("ar-SA")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">نوع العقد:</span>
        <span class="info-value">${contractTypeLabels[contractType] || contractType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">سبب انتهاء الخدمة:</span>
        <span class="info-value">${terminationReasonLabels[terminationReason] || terminationReason}</span>
      </div>
      <div class="info-row">
        <span class="info-label">مدة الخدمة:</span>
        <span class="info-value">${result.yearsCount} سنة، ${result.monthsCount} شهر، ${result.daysCount} يوم</span>
      </div>
    </div>

    <div class="result-box">
      <div style="font-size: 20px; opacity: 0.9;">إجمالي مكافأة نهاية الخدمة</div>
      <div class="result-amount">${result.totalAmount.toLocaleString("ar-SA")} ﷼</div>
      <div style="font-size: 16px; opacity: 0.9; margin-top: 10px;">
        (${result.percentage}% من الراتب × مدة الخدمة)
      </div>
    </div>

    <div class="section">
      <div class="section-title">تفاصيل الحساب</div>
      <div class="info-row">
        <span class="info-label">الخمس سنوات الأولى:</span>
        <span class="info-value">${result.firstFiveYears.toLocaleString("ar-SA")} ﷼</span>
      </div>
      <div class="info-row">
        <span class="info-label">ما بعد الخمس سنوات:</span>
        <span class="info-value">${result.afterFiveYears.toLocaleString("ar-SA")} ﷼</span>
      </div>
      <div class="info-row">
        <span class="info-label">النسبة المستحقة:</span>
        <span class="info-value">${result.percentage}%</span>
      </div>
    </div>

    <div class="legal-note">
      <strong>المادة 84 من نظام العمل السعودي:</strong><br/>
      إذا انتهت علاقة العمل وجب على صاحب العمل أن يدفع إلى العامل مكافأة عن مدة خدمته، تحسب على أساس أجر نصف شهر عن كل سنة من السنوات الخمس الأولى، وأجر شهر عن كل سنة من السنوات التالية، ويتخذ الأجر الأخير أساساً لحساب المكافأة.
    </div>

    <div class="footer">
      <p><strong>منصة رابِط</strong> - مساعد الموارد البشرية السعودي</p>
      <p>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-SA")}</p>
      <p style="margin-top: 10px; font-size: 12px;">
        هذا التقرير للإشارة فقط ولا يعتبر مستنداً قانونياً ملزماً
      </p>
    </div>
  </div>
</body>
</html>
        `;

        return { pdfContent };
      }),

    saveCalculation: protectedProcedure
      .input(
        z.object({
          calculationType: z
            .enum(["end-of-service", "vacation", "overtime", "deduction"])
            .default("end-of-service"),
          salary: z.number().nullable().optional(),
          contractType: z.string().nullable().optional(),
          terminationReason: z.string().nullable().optional(),
          startDate: z.string().nullable().optional(),
          endDate: z.string().nullable().optional(),
          duration: z
            .object({
              years: z.number(),
              months: z.number(),
              days: z.number(),
            })
            .nullable()
            .optional(),
          inputData: z.record(z.string(), z.any()).nullable().optional(),
          result: z.record(z.string(), z.any()).nullable().optional(),
          notes: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const record = await db.saveCalculationHistory({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, record };
      }),

    getCalculationHistory: protectedProcedure
      .input(
        z.object({
          calculationType: z
            .enum(["end-of-service", "vacation", "overtime", "deduction"])
            .default("end-of-service"),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        const history = await db.getCalculationHistory(
          ctx.user.id,
          input.calculationType,
          input.limit
        );
        return { history };
      }),

    deleteCalculationRecord: protectedProcedure
      .input(z.object({ recordId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteCalculationHistory(input.recordId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Smart Document Generator
  documentGenerator: router({
    // Get all templates
    getTemplates: publicProcedure.query(async () => {
      const templates = await db.getAllTemplates();
      return { templates };
    }),

    // Get template by code
    getTemplate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const template = await db.getTemplateByCode(input.code);
        return { template };
      }),

    // Generate document with AI
    generateDocument: protectedProcedure
      .input(
        z.object({
          templateCode: z.string(),
          inputData: z.record(z.string(), z.any()),
          lang: z.enum(["ar", "en", "both"]).default("ar"),
          style: z
            .enum(["formal", "semi-formal", "friendly"])
            .default("formal"),
          companyLogo: z.string().optional(),
          companyName: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const {
          templateCode,
          inputData,
          lang,
          style,
          companyLogo,
          companyName,
        } = input;

        // Get template
        const template = await db.getTemplateByCode(templateCode);
        if (!template) {
          throw new Error("Template not found");
        }

        // Build AI prompt
        const styleDescriptions = {
          formal: "رسمي جداً ومهني، يستخدم في المراسلات الحكومية والقانونية",
          "semi-formal": "شبه رسمي، يستخدم في المراسلات الداخلية للشركات",
          friendly: "ودي ومباشر، مع الحفاظ على الاحترافية",
        };

        const langDescriptions = {
          ar: "العربية الفصحى فقط",
          en: "English only",
          both: "نسخة عربية ونسخة إنجليزية منفصلتين",
        };

        const systemPrompt = `أنت مساعد ذكاء اصطناعي متخصص في كتابة المستندات والخطابات الرسمية للموارد البشرية.

مهمتك: إنشاء ${template.titleAr} بناءً على البيانات المقدمة.

الأسلوب المطلوب: ${styleDescriptions[style]}
اللغة المطلوبة: ${langDescriptions[lang]}

متطلبات الكتابة:
1. استخدم صيغة احترافية ومناسبة للسياق
2. تأكد من ذكر جميع التفاصيل المهمة
3. اتبع التنسيق القياسي للمستندات الرسمية
4. أضف التاريخ الهجري والميلادي
5. اجعل المستند جاهزاً للطباعة
6. إذا كانت اللغة "both"، اكتب النسخة العربية أولاً ثم الإنجليزية مع فاصل واضح

ملاحظة مهمة: هذا المستند يُولَّد بالذكاء الاصطناعي ويخضع للمراجعة البشرية قبل الاستخدام الرسمي.

${template.aiPrompt || ""}`;

        const userPrompt = `البيانات المطلوبة:
${JSON.stringify(inputData, null, 2)}

${companyName ? `اسم الشركة: ${companyName}\n` : ""}

الرجاء إنشاء المستند كاملاً بصيغة HTML جاهزة للطباعة.`;

        try {
          // Generate with AI
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          let outputHtml = "";
          const content = response.choices[0]?.message?.content;
          if (typeof content === "string") {
            outputHtml = content;
          } else if (Array.isArray(content)) {
            // Extract text from array content
            outputHtml = content
              .filter(item => "text" in item)
              .map(item => ("text" in item ? item.text : ""))
              .join("");
          }

          const outputText = outputHtml.replaceAll(/<[^>]*>/g, ""); // Strip HTML for text version

          // Save to database
          const documentId = await db.createGeneratedDocument({
            userId: ctx.user.id,
            templateCode,
            outputHtml,
            outputText,
            lang,
            inputData: inputData ?? {},
            companyLogo,
            companyName,
            isSaved: false,
          });

          recordAudit({
            action: "document:create",
            actorId: ctx.user.id,
            actorEmail: ctx.user.email,
            resource: `document:${templateCode}`,
            metadata: {
              templateCode,
              lang,
              style,
              documentId,
              hasLogo: Boolean(companyLogo),
            },
            summary: `${ctx.user.name ?? ctx.user.email ?? "مستخدم"} أنشأ مستند ${template.titleAr}`,
          });

          return {
            success: true,
            outputHtml,
            outputText,
            documentId,
          };
        } catch {
          throw new Error("فشل في توليد المستند. يرجى المحاولة مرة أخرى.");
        }
      }),

    // Get user's documents
    getMyDocuments: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(MAX_HISTORY_LIMIT) }).optional())
      .query(async ({ input, ctx }) => {
        const documents = await db.getUserDocuments(ctx.user.id, input?.limit);
        return { documents };
      }),

    // Get saved documents only
    getMySavedDocuments: protectedProcedure.query(async ({ ctx }) => {
      const documents = await db.getUserSavedDocuments(ctx.user.id);
      return { documents };
    }),

    // Save/unsave document
    toggleSaveDocument: protectedProcedure
      .input(
        z.object({
          documentId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const doc = await db.getDocumentById(input.documentId);
        if (!doc)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });

        const newSavedStatus = !doc.isSaved;
        await db.updateDocumentSavedStatus(input.documentId, newSavedStatus);
        return { success: true, isSaved: newSavedStatus };
      }),

    // Delete document
    deleteDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteGeneratedDocument(input.documentId, ctx.user.id);
        return { success: true };
      }),
  }),

  letters: router({
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(MAX_HISTORY_LIMIT) }).optional())
      .query(async ({ ctx, input }) => {
        const letters = await db.getGeneratedLetters(ctx.user.id, input?.limit);
        return { letters };
      }),

    saveLetter: protectedProcedure
      .input(
        z.object({
          letterType: z.string(),
          title: z.string().optional(),
          category: z.string().optional(),
          language: z.string().optional(),
          style: z.string().optional(),
          content: z.string(),
          metadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const record = await db.saveGeneratedLetter({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, record };
      }),

    deleteLetter: protectedProcedure
      .input(z.object({ letterId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteGeneratedLetter(input.letterId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Consulting System
  consulting: router({
    // Get all active packages
    getPackages: publicProcedure.query(async () => {
      const packages = await db.getActiveConsultingPackages();
      return { packages };
    }),

    // Get package by ID
    getPackage: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const package_ = await db.getConsultingPackageById(input.id);
        return { package: package_ };
      }),

    // Create consulting ticket (booking)
    createTicket: protectedProcedure
      .input(
        z.object({
          packageId: z.number(),
          subject: z.string(),
          description: z.string(),
          submittedFormJson: z.string().optional(),
          attachments: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await db.createConsultingTicket({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true, ...result };
      }),

    // Get my tickets
    getMyTickets: protectedProcedure.query(async ({ ctx }) => {
      const tickets = await db.getUserConsultingTickets(ctx.user.id);
      return { tickets };
    }),

    // Get ticket by ID
    getTicket: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "التذكرة غير موجودة",
          });
        }

        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isOwner = ticket.userId === ctx.user.id;
        const isAssignedConsultant =
          consultant && ticket.consultantId === consultant.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isOwner && !isAssignedConsultant && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return { ticket };
      }),

    // Get ticket by number
    getTicketByNumber: protectedProcedure
      .input(z.object({ ticketNumber: z.string() }))
      .query(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketByNumber(input.ticketNumber);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "التذكرة غير موجودة",
          });
        }

        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isOwner = ticket.userId === ctx.user.id;
        const isAssignedConsultant =
          consultant && ticket.consultantId === consultant.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isOwner && !isAssignedConsultant && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return { ticket };
      }),

    // Get ticket responses
    getTicketResponses: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "التذكرة غير موجودة",
          });
        }

        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isOwner = ticket.userId === ctx.user.id;
        const isAssignedConsultant =
          consultant && ticket.consultantId === consultant.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isOwner && !isAssignedConsultant && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const responses = await db.getConsultingTicketResponses(input.ticketId);
        return { responses };
      }),

    // Upload file to S3
    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileData: z.string(), // base64 encoded
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = input.fileName.split(".").pop();
        const fileKey = `consulting/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

        // Convert base64 to buffer
        const base64Data = input.fileData.split(",")[1] || input.fileData;
        const fileBuffer = Buffer.from(base64Data, "base64");

        // Upload to S3
        const { url } = await storagePut(fileKey, fileBuffer, input.fileType, {
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
        });

        return {
          success: true,
          url,
          fileKey,
          fileName: input.fileName,
        };
      }),

    // Add response to ticket
    addResponse: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          message: z.string(),
          attachments: z.any().optional(),
          isInternal: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({ code: "NOT_FOUND", message: "التذكرة غير موجودة" });
        }
        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isOwner = ticket.userId === ctx.user.id;
        const isAssignedConsultant =
          consultant && ticket.consultantId === consultant.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isOwner && !isAssignedConsultant && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.addConsultingResponse({
          ticketId: input.ticketId,
          userId: ctx.user.id,
          message: input.message,
          role: ctx.user.role || "user",
          attachments: input.attachments,
          isInternal: input.isInternal || false,
        });
        return { success: true };
      }),

    // Update ticket status
    updateTicketStatus: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          status: z.enum([
            "pending",
            "assigned",
            "in-progress",
            "completed",
            "cancelled",
          ]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({ code: "NOT_FOUND", message: "التذكرة غير موجودة" });
        }
        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isOwner = ticket.userId === ctx.user.id;
        const isAssignedConsultant =
          consultant && ticket.consultantId === consultant.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isOwner && !isAssignedConsultant && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateConsultingTicketStatus(input.ticketId, input.status);
        return { success: true };
      }),

    // Assign ticket to consultant (admin only)
    assignTicket: adminProcedure
      .input(
        z.object({
          ticketId: z.number(),
          consultantId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        await db.assignConsultingTicket(input.ticketId, input.consultantId);
        return { success: true };
      }),

    // Rate ticket
    rateTicket: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          rating: z.number().min(1).max(5),
          feedback: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ticket = await db.getConsultingTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({ code: "NOT_FOUND", message: "التذكرة غير موجودة" });
        }

        if (ticket.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.rateConsultingTicket(
          input.ticketId,
          input.rating,
          input.feedback
        );
        return { success: true };
      }),

    // Get consultant's tickets (for consultant dashboard)
    getConsultantTickets: protectedProcedure.query(async ({ ctx }) => {
      const consultant = await db.getConsultantByUserId(ctx.user.id);
      if (!consultant) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const tickets = await db.getConsultantTickets(consultant.id);
      return { tickets };
    }),

    // Get pending tickets (for admin)
    getPendingTickets: adminProcedure.query(async () => {
      const tickets = await db.getPendingConsultingTickets();
      return { tickets };
    }),
  }),

  // Leave Calculator with AI
  leave: router({
    askAI: publicProcedure
      .input(
        z.object({
          question: z.string(),
          context: z
            .object({
              employeeYears: z.number().optional(),
              leaveType: z.string().optional(),
            })
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { question, context } = input;

        const systemPrompt = `أنت مساعد ذكاء اصطناعي متخصص في نظام العمل السعودي والإجازات. 
مهمتك الإجابة على أسئلة الموظفين وأصحاب العمل حول أنواع الإجازات وحقوقهم.

معلومات مهمة عن الإجازات في نظام العمل السعودي:

1. الإجازة السنوية (المادة 109):
   - 21 يوماً للعامل الذي أمضى سنة واحدة على الأقل
   - 30 يوماً للعامل الذي أمضى 5 سنوات متصلة
   - بأجر كامل

2. الإجازة المرضية (المادة 117):
   - 30 يوماً بأجر كامل
   - 60 يوماً بـ 75% من الأجر
   - 30 يوماً بدون أجر
   - المجموع: 120 يوماً في السنة

3. إجازة الأمومة (المادة 151):
   - 10 أسابيع (70 يوماً) بأجر كامل
   - يمكن توزيعها قبل وبعد الولادة

4. إجازة الحج (المادة 113):
   - 10 أيام على الأقل
   - مرة واحدة طوال مدة الخدمة
   - بدون أجر (ما لم يتفق على غير ذلك)

5. إجازة الوفاة (المادة 114):
   - 5 أيام في حالة وفاة الزوج/الزوجة أو أحد الأصول أو الفروع
   - 3 أيام في حالة وفاة الأخ أو الأخت
   - بأجر كامل

6. إجازة الزواج:
   - 5 أيام بأجر كامل
   - مرة واحدة طوال مدة الخدمة

7. إجازة الامتحانات (المادة 115):
   - بأجر كامل للتعليم العام
   - بدون أجر للتعليم الجامعي

أجب بشكل واضح ومختصر ومفيد. استخدم اللغة العربية الفصحى.`;

        let userPrompt = question;
        if (context?.employeeYears) {
          userPrompt += `\n\nمعلومات إضافية: الموظف لديه ${context.employeeYears} سنوات خدمة.`;
        }

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const answer =
            response.choices[0]?.message?.content ||
            "عذراً، لم أتمكن من الإجابة على سؤالك. يرجى المحاولة مرة أخرى.";

          return { answer };
        } catch {
          return {
            answer:
              "عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى لاحقاً.",
          };
        }
      }),
  }),

  // Discount Codes Router
  discountCodes: router({
    // Validate discount code (public)
    validate: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const code = await db.getDiscountCodeByCode(input.code);

        if (!code) {
          return { valid: false, message: "الكود غير صحيح" };
        }

        if (!code.isActive) {
          return { valid: false, message: "الكود غير نشط" };
        }

        // Check max uses
        if (code.maxUses && code.usedCount >= code.maxUses) {
          return {
            valid: false,
            message: "الكود وصل إلى الحد الأقصى من الاستخدام",
          };
        }

        // Check valid dates
        const now = new Date();
        if (code.validFrom && now < new Date(code.validFrom)) {
          return { valid: false, message: "الكود لم يبدأ بعد" };
        }
        if (code.validUntil && now > new Date(code.validUntil)) {
          return { valid: false, message: "الكود منتهي الصلاحية" };
        }

        return {
          valid: true,
          code: {
            id: code.id,
            code: code.code,
            discountType: code.discountType,
            discountValue: code.discountValue,
          },
        };
      }),

    // Calculate discount
    calculateDiscount: publicProcedure
      .input(
        z.object({
          code: z.string(),
          originalAmount: z.number(),
        })
      )
      .query(async ({ input }) => {
        const code = await db.getDiscountCodeByCode(input.code);
        if (!code?.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid code" });
        }

        if (code.maxUses && code.usedCount >= code.maxUses) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid code" });
        }

        const now = new Date();
        if (code.validFrom && now < new Date(code.validFrom)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid code" });
        }
        if (code.validUntil && now > new Date(code.validUntil)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid code" });
        }

        let discountAmount = 0;
        if (code.discountType === "percentage") {
          discountAmount = Math.floor(
            (input.originalAmount * code.discountValue) / 100
          );
        } else {
          discountAmount = code.discountValue;
        }

        const finalAmount = Math.max(0, input.originalAmount - discountAmount);

        return {
          originalAmount: input.originalAmount,
          discountAmount,
          finalAmount,
          discountType: code.discountType,
          discountValue: code.discountValue,
        };
      }),

    // Admin: Get all codes
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const codes = await db.getAllDiscountCodes();
      return { codes };
    }),

    // Admin: Create code
    create: protectedProcedure
      .input(
        z.object({
          code: z.string().min(3).max(50),
          description: z.string().optional(),
          discountType: z.enum(["percentage", "fixed"]),
          discountValue: z.number().min(1),
          maxUses: z.number().optional(),
          validFrom: z.date().optional(),
          validUntil: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Check if code already exists
        const existing = await db.getDiscountCodeByCode(input.code);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Code already exists",
          });
        }

        await db.createDiscountCode({
          ...input,
          createdBy: ctx.user.id,
          isActive: true,
        });

        return { success: true };
      }),

    // Admin: Update code
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          description: z.string().optional(),
          discountType: z.enum(["percentage", "fixed"]).optional(),
          discountValue: z.number().min(1).optional(),
          maxUses: z.number().nullable().optional(),
          validFrom: z.date().nullable().optional(),
          validUntil: z.date().nullable().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, ...data } = input;
        await db.updateDiscountCode(id, data);

        return { success: true };
      }),

    // Admin: Delete code
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.deleteDiscountCode(input.id);
        return { success: true };
      }),

    // Admin: Get usage history
    getUsageHistory: protectedProcedure
      .input(z.object({ codeId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const history = await db.getDiscountCodeUsageHistory(input.codeId);
        return { history };
      }),
  }),

  // Admin Panel
  admin: adminRouter,

  // Live Chat
  chat: chatRouter,

  // Payment System
  payment: paymentRouter,

  // User Profile
  profile: router({
    // Get current user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.openId || !ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const cacheKey = CACHE_KEYS.USER_PROFILE(ctx.user.id);

      const loadProfile = async () => {
        const record = await db.getUserByOpenId(ctx.user.openId!);
        if (!record) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return record;
      };

      try {
        const user = await cache.getOrSet(cacheKey, loadProfile, CACHE_TTL.FREQUENT);
        return { user };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const fallback = await loadProfile();
        return { user: fallback };
      }
    }),

    // Update profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          bio: z.string().optional(),
          city: z.string().optional(),
          profilePicture: z.string().optional(),
          linkedIn: z.string().optional(),
          twitter: z.string().optional(),
          metadata: z.string().optional(), // JSON string for additional fields
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Support both OAuth users and email/password users
        const userId = ctx.user?.id;
        if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const updated = await db.updateUserProfileById(userId, {
          name: input.name,
          email: input.email,
          bio: input.bio,
          city: input.city,
          profilePicture: input.profilePicture,
          linkedIn: input.linkedIn,
          twitter: input.twitter,
          metadata: input.metadata,
          profileCompleted: true,
        });
        return { success: true, user: updated };
      }),

    // Upload profile picture
    uploadProfilePicture: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.openId) throw new TRPCError({ code: "UNAUTHORIZED" });
        const updated = await db.updateUserProfilePicture(
          ctx.user.openId,
          input.imageUrl
        );
        return { success: true, user: updated };
      }),
  }),

  // Consultant System Router
  consultant: router({
    // Register as consultant
    register: protectedProcedure
      .input(
        z.object({
          fullNameAr: z.string().min(2),
          fullNameEn: z.string().min(2),
          email: z.string().email(),
          phone: z.string().min(10),
          city: z.string().optional(),
          profilePicture: z.string().optional(),
          mainSpecialization: z.string(),
          subSpecializations: z.array(z.string()).optional(),
          yearsOfExperience: z.number().min(0),
          qualifications: z.array(z.string()).optional(),
          certifications: z.array(z.string()).optional(),
          bioAr: z.string().optional(),
          bioEn: z.string().optional(),
          ibanNumber: z.string().optional(),
          bankName: z.string().optional(),
          accountHolderName: z.string().optional(),
          services: z
            .object({
              instantAdvice: z.boolean().optional(),
              session30: z.boolean().optional(),
              policyReview: z.boolean().optional(),
              workshop: z.boolean().optional(),
              hourlyRate: z.string().optional(),
              currency: z.string().optional(),
            })
            .optional(),
          availability: z
            .array(
              z.object({
                day: z.string(),
                slot: z.string(),
                active: z.boolean(),
              })
            )
            .optional(),
          sla: z
            .object({
              responseHours: z.string().optional(),
              deliveryHours: z.string().optional(),
              refundWindowHours: z.string().optional(),
            })
            .optional(),
          channels: z
            .object({
              chat: z.boolean().optional(),
              voice: z.boolean().optional(),
              inPerson: z.boolean().optional(),
            })
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if already registered
        const existing = await db.getConsultantByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "لقد قمت بالتسجيل مسبقاً",
          });
        }

        const consultantId = await db.createConsultant({
          userId: ctx.user.id,
          ...input,
          subSpecializations: input.subSpecializations || [],
          specializations: input.subSpecializations || [],
        });

        return { success: true, consultantId };
      }),

    // Get my consultant profile
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      const consultant = await db.getConsultantByUserId(ctx.user.id);
      return { consultant };
    }),

    // Upload document
    uploadDocument: protectedProcedure
      .input(
        z.object({
          documentType: z.enum(["cv", "certificate", "id", "license", "other"]),
          documentName: z.string(),
          documentUrl: z.string(),
          fileSize: z.number().optional(),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);
        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

        const consultant = await db.getConsultantByUserId(ctx.user.id);
        if (!consultant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultant not found",
          });
        }

        const { storagePut } = await import("./storage");

        const isDataUrl = input.documentUrl.startsWith("data:");
        let fileUrl = input.documentUrl;
        let mimeType = input.mimeType || "application/octet-stream";
        let fileSize = input.fileSize;

        if (isDataUrl) {
          const dataUrlRegex = /^data:([^;]+);base64,(.+)$/;
          const match = dataUrlRegex.exec(input.documentUrl);
          if (!match?.[2]) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "صيغة الملف غير مدعومة",
            });
          }
          mimeType = match[1] || mimeType;
          const buffer = Buffer.from(match[2], "base64");
          fileSize = buffer.length;

          if (!ALLOWED_MIME_TYPES.has(mimeType)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "الملفات المسموحة: PDF, PNG, JPG فقط",
            });
          }

          if (fileSize > MAX_FILE_SIZE_BYTES) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "حجم الملف يتجاوز الحد الأقصى 5MB",
            });
          }

          const timestamp = Date.now();
          const safeName =
            input.documentName
              .toLowerCase()
              .replaceAll(/[^a-z0-9\u0600-\u06FF.-]+/gi, "-") || "document";
          const key = `consultants/${consultant.id}/${timestamp}-${safeName}`;
          const upload = await storagePut(key, buffer, mimeType, {
            actorId: ctx.user.id,
            actorEmail: ctx.user.email,
          });
          fileUrl = upload.url;
        }
        if (!isDataUrl) {
          if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "الملفات المسموحة: PDF, PNG, JPG فقط",
            });
          }
          if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "حجم الملف يتجاوز الحد الأقصى 5MB",
            });
          }
        }

        const docId = await db.createConsultantDocument({
          consultantId: consultant.id,
          ...input,
          documentUrl: fileUrl,
          mimeType,
          fileSize,
        });

        return { success: true, documentId: docId };
      }),

    // Get my documents
    getMyDocuments: protectedProcedure.query(async ({ ctx }) => {
      const consultant = await db.getConsultantByUserId(ctx.user.id);
      if (!consultant) return { documents: [] };

      const documents = await db.getConsultantDocuments(consultant.id);
      return { documents };
    }),

    // Get all specializations
    getSpecializations: publicProcedure.query(async () => {
      const specializations = await db.getAllSpecializations();
      return { specializations };
    }),

    // Get all consultation types
    getConsultationTypes: publicProcedure.query(async () => {
      const types = await db.getAllConsultationTypes();
      return { types };
    }),

    // Get approved consultants (public)
    getApprovedConsultants: publicProcedure.query(async () => {
      const consultants = await db.getApprovedConsultants();
      return { consultants };
    }),

    // Get public consultant profile
    getConsultant: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const consultant = await db.getConsultantById(input.id);
        if (consultant?.status !== "approved") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Consultant not found" });
        }
        return { consultant };
      }),

    // Upload file (for booking attachments)
    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { storagePut } = await import("./storage");

          // Extract base64 data
          const base64Data = input.fileData.split(",")[1] || input.fileData;
          const buffer = Buffer.from(base64Data, "base64");

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          const ext = input.fileName.split(".").pop();
          const fileKey = `consultation-files/${timestamp}-${randomStr}.${ext}`;

          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, input.mimeType, {
            actorId: ctx.user.id,
            actorEmail: ctx.user.email,
          });

          return { success: true, url };
        } catch { // swallow specific error details; return generic message
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل رفع الملف",
          });
        }
      }),

    // Create booking
    createBooking: protectedProcedure
      .input(
        z.object({
          consultationTypeId: z.number(),
          consultantId: z.number(),
          scheduledDate: z.string(),
          scheduledTime: z.string(),
          description: z.string().min(10),
          subject: z.string().optional(),
          requiredInfo: z.string().optional(),
          attachments: z.string().optional(),
          packageName: z.string().optional(),
          packagePrice: z.number().optional(),
          packageSlaHours: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // التحقق من المستشار
        const consultant = await db.getConsultantById(input.consultantId);
        if (consultant?.status !== "approved") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "المستشار غير متاح",
          });
        }

        // الحصول على تفاصيل نوع الاستشارة والمدة
        const consultationTypes = await db.getAllConsultationTypes();
        const consultationType = consultationTypes.find(
          t => t.id === input.consultationTypeId
        );
        const durationMinutes = getConsultationDuration(consultationType);

        // تحويل الوقت والتحقق من صحته
        const bookingDate = new Date(input.scheduledDate);
        const bookingStartMinutes = parseTimeToMinutes(input.scheduledTime);
        if (bookingStartMinutes === null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "وقت الحجز غير صالح",
          });
        }
        const bookingEndMinutes = bookingStartMinutes + durationMinutes;

        // التحقق من توفر المستشار في اليوم المحدد
        const { isAvailable, dayName } = checkDayAvailability({
          consultant,
          bookingDate,
        });
        if (!isAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `المستشار غير متاح يوم ${dayName}`,
          });
        }

        // فحص التعارض مع الحجوزات الموجودة
        const hasConflict = await checkBookingConflict({
          consultantId: input.consultantId,
          bookingDate,
          bookingSlot: {
            startMinutes: bookingStartMinutes,
            endMinutes: bookingEndMinutes,
          },
          durationMinutes,
        });
        if (hasConflict) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "يوجد حجز آخر يتداخل مع هذا الموعد، اختر وقتًا مختلفًا.",
          });
        }

        // استخراج معلومات SLA والقناة المفضلة
        const { slaHours, firstResponseHours } = extractSlaInfo(consultant);
        const preferredChannel = determinePreferredChannel(consultant);
        
        // الحصول على معلومات المستشار
        const consultantUser = consultant?.userId
          ? await db.getUserById(consultant.userId)
          : null;
        const smsBookingEnabled = ENV.enableSmsBookingAlerts;

        // تحليل المعلومات المطلوبة
        const parsedRequiredInfo = parseRequiredInfo(input.requiredInfo);

        // إنشاء الحجز
        const bookingId = await db.createConsultationBooking({
          userId: ctx.user.id,
          consultantId: input.consultantId,
          consultationTypeId: input.consultationTypeId,
          scheduledDate: input.scheduledDate,
          scheduledTime: input.scheduledTime,
          description: input.description,
          subject: input.subject,
          requiredInfo: parsedRequiredInfo,
          attachments: input.attachments ? [{ name: input.attachments }] : undefined,
          status: "pending",
          slaHours,
          firstResponseHours,
          channel: preferredChannel,
          durationMinutes,
          packageName: input.packageName,
          packagePrice: input.packagePrice,
          packageSlaHours: input.packageSlaHours,
        });

        const bookingRecord = await db.getConsultationBookingById(bookingId);

        // إضافة ملاحظة الباقة للمستشار
        const packageNote = buildPackageNote({
          packageName: input.packageName,
          packagePrice: input.packagePrice,
          packageSlaHours: input.packageSlaHours,
        });

        if (packageNote) {
          await db.sendConsultationMessage({
            bookingId,
            senderId: ctx.user.id,
            senderType: "system",
            message: packageNote,
          });
        }

        // إرسال الإشعارات (Fire-and-forget)
        (async () => {
          const { sendBookingConfirmationEmail } = await import("./_core/email");
          try {
            await sendBookingConfirmationEmail({
              to: ctx.user.email || "user@example.com",
              userName: ctx.user.name || "عميل رابِط",
              packageName: consultationType?.nameAr || "استشارة الموارد البشرية",
              price:
                consultationType?.price ||
                consultationType?.basePriceSAR ||
                bookingRecord?.price ||
                0,
              bookingDate: input.scheduledDate,
            });
          } catch {
            // ignore email failure
          }


          if (consultantUser?.email) {
            await sendEmail({
              to: consultantUser.email,
              subject: "حجز استشارة جديد",
              html: `
                <p>لديك حجز جديد.</p>
                <p>النوع: ${consultationType?.nameAr || "استشارة"}</p>
                <p>العميل: ${ctx.user.name || ctx.user.email}</p>
                <p>التاريخ: ${input.scheduledDate} ${input.scheduledTime}</p>
              `,
              template: "booking-consultant",
            }).catch(() => undefined);
          }

          try {
            const summaryParts: string[] = [];
            if (consultationType?.nameAr) {
              summaryParts.push(consultationType.nameAr);
            }
            summaryParts.push(
              `${input.scheduledDate} ${input.scheduledTime}`
            );
            const body = `حجز جديد: ${summaryParts.join(" - ")}`;

            await publishNotification({
              userId: consultantUser?.id ?? null,
              title: "حجز استشارة جديد",
              body,
              type: "ticket",
              metadata: {
                bookingId,
                consultantId: consultant.id,
              },
            });

            await publishNotification({
              userId: ctx.user.id,
              title: "تم تأكيد حجزك",
              body: `تم تأكيد حجز ${
                consultationType?.nameAr ?? "استشارة"
              } بتاريخ ${input.scheduledDate} ${input.scheduledTime}`,
              type: "ticket",
              metadata: { bookingId },
            });

            if (smsBookingEnabled) {
              const smsTasks: Promise<boolean>[] = [];
              if (consultantUser?.phoneNumber) {
                smsTasks.push(
                  sendSMS({
                    to: consultantUser.phoneNumber,
                    message: getConsultantBookingSMS({
                      name: consultantUser.name || "مستشار",
                      consultationType: consultationType?.nameAr || "استشارة",
                      date: input.scheduledDate,
                      time: input.scheduledTime,
                    }),
                    userId: consultantUser.id,
                  }).catch(() => false)
                );
              }
              if (ctx.user.phoneNumber) {
                smsTasks.push(
                  sendSMS({
                    to: ctx.user.phoneNumber,
                    message: getBookingConfirmationSMS({
                      name: ctx.user.name || "عميل",
                      packageName: consultationType?.nameAr || "استشارة",
                    }),
                    userId: ctx.user.id,
                  }).catch(() => false)
                );
              }
              if (smsTasks.length) {
                await Promise.all(smsTasks);
              }
            }
          } catch {
            // ignore notification failures
          }
        })();

        return {
          success: true,
          bookingId,
          ticketNumber: bookingRecord?.ticketNumber,
          status: bookingRecord?.status,
        };
      }),

    // Get single booking with relationships
    getBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input, ctx }) => {
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }

        const consultant = await db.getConsultantById(booking.consultantId);
        const consultationType = await db
          .getAllConsultationTypes()
          .then(types => types.find(t => t.id === booking.consultationTypeId));

        const isOwner =
          booking.clientId === ctx.user.id ||
          booking.userId === ctx.user.id ||
          consultant?.userId === ctx.user.id ||
          ctx.user.role === "admin";

        if (!isOwner) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return {
          booking: {
            ...booking,
            consultant: consultant
              ? {
                  id: consultant.id,
                  userId: consultant.userId,
                  fullNameAr: consultant.fullNameAr || consultant.fullName,
                  mainSpecialization: consultant.mainSpecialization,
                  yearsOfExperience: consultant.yearsOfExperience,
                }
              : null,
            consultationType: consultationType
              ? {
                  id: consultationType.id,
                  nameAr: consultationType.nameAr,
                  duration: consultationType.duration,
                  price: consultationType.price ?? consultationType.basePriceSAR,
                  slaHours: consultationType.slaHours ?? 24,
                }
              : null,
          },
        };
      }),

    // Get my bookings (client side)
    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      const bookings = await db.getConsultationBookingsByClient(ctx.user.id);
      const consultationTypes = await db.getAllConsultationTypes();

      const results = await Promise.all(
        bookings.map(async booking => {
          const consultant = await db.getConsultantById(booking.consultantId);
          const type = consultationTypes.find(
            t => t.id === booking.consultationTypeId
          );
          return {
            ...booking,
            consultant: consultant
              ? {
                  id: consultant.id,
                  userId: consultant.userId,
                  fullNameAr: consultant.fullNameAr || consultant.fullName,
                  mainSpecialization: consultant.mainSpecialization,
                }
              : null,
            consultationType: type
              ? {
                  id: type.id,
                  nameAr: type.nameAr,
                  duration: type.duration,
                  price: type.price ?? type.basePriceSAR,
                  slaHours: type.slaHours ?? 24,
                }
              : null,
          };
        })
      );

      return { bookings: results };
    }),

    // Consultant bookings for their dashboard
    getConsultantBookings: protectedProcedure.query(async ({ ctx }) => {
      const consultant = await db.getConsultantByUserId(ctx.user.id);
      if (!consultant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a consultant" });
      }

      const bookings = await db.getConsultationBookingsByConsultant(consultant.id);
      const consultationTypes = await db.getAllConsultationTypes();

      const results = bookings.map(booking => {
        const type = consultationTypes.find(
          t => t.id === booking.consultationTypeId
        );
        return {
          ...booking,
          consultant: {
            id: consultant.id,
            userId: consultant.userId,
            fullNameAr: consultant.fullNameAr || consultant.fullName,
          },
          consultationType: type
            ? {
                id: type.id,
                nameAr: type.nameAr,
                duration: type.duration,
                price: type.price ?? type.basePriceSAR,
                slaHours: type.slaHours ?? 24,
              }
            : null,
        };
      });

      return { bookings: results };
    }),

    // Send message in consultation
    sendMessage: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          message: z.string().min(1),
          attachments: z.string().optional(),
          isAiAssisted: z.boolean().optional(),
          aiSuggestion: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verify user is part of this consultation
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Booking not found",
          });
        }

        // Determine sender type
        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isAdmin = ctx.user.role === "admin";
        let senderType: "admin" | "consultant" | "client";
        if (isAdmin) {
          senderType = "admin";
        } else if (consultant) {
          senderType = "consultant";
        } else {
          senderType = "client";
        }

        // Verify authorization
        if (senderType === "client" && booking.clientId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (
          senderType === "consultant" &&
          booking.consultantId !== consultant?.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        if (senderType === "admin") {
          // admin is allowed
        }

        const messageId = await db.sendConsultationMessage({
          bookingId: input.bookingId,
          senderId: ctx.user.id,
          senderType,
          message: input.message,
          attachments: input.attachments ? [{ name: input.attachments }] : undefined,
          isAiAssisted: input.isAiAssisted,
          aiSuggestion: input.aiSuggestion,
        });

        // Notify recipient via email if available (fire-and-forget)
        (async () => {
          const recipientUserId =
            senderType === "consultant" ? booking.clientId : consultant?.userId;
          if (!recipientUserId) return;
          const recipientUser = await db.getUserById(recipientUserId);
          if (!recipientUser?.email) return;

          await sendEmail({
            to: recipientUser.email,
            subject: `رسالة جديدة في الاستشارة ${booking.ticketNumber || booking.id}`,
            html: `
              <p>لديك رسالة جديدة في الاستشارة رقم ${booking.ticketNumber || booking.id}.</p>
              <p><strong>المرسل:</strong> ${ctx.user.name || senderType}</p>
              <p style="margin-top:12px;">${input.message}</p>
              <p style="margin-top:16px;">
                <a href="${process.env.VITE_APP_URL || "https://rabit-hr.com"}/consultation/${booking.id}/chat">
                  فتح المحادثة
                </a>
              </p>
            `,
            template: "consultation-message",
          }).catch(() => undefined);
        })();

        return { success: true, messageId };
      }),

    // Get messages for consultation
    getMessages: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verify user is part of this consultation
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const consultant = await db.getConsultantByUserId(ctx.user.id);
        const isConsultant =
          consultant && booking.consultantId === consultant.id;
        const isClient = booking.clientId === ctx.user.id;
        const isAdmin = ctx.user.role === "admin";

        if (!isConsultant && !isClient && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const messages = await db.getConsultationMessages(input.bookingId);
        return { messages };
      }),

    // Get AI suggestion for consultant
    getAiSuggestion: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          clientMessage: z.string(),
          conversationHistory: z
            .array(
              z.object({
                role: z.enum(["client", "consultant"]),
                message: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verify user is consultant
        const consultant = await db.getConsultantByUserId(ctx.user.id);
        if (!consultant) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "هذه الخاصية للمستشارين فقط",
          });
        }

        // Verify booking belongs to consultant
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking || booking.consultantId !== consultant.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        try {
          const { invokeLLM } = await import("./_core/llm");

          // Build conversation context
          let contextMessages: import("./_core/llm").Message[] = [
            {
              role: "system",
              content: `أنت مساعد ذكي للمستشارين في مجال الموارد البشرية.
مهمتك: مساعدة المستشار في صياغة رد احترافي ومفيد على استفسار العميل.

إرشادات:
1. استخدم لغة عربية فصحى واضحة
2. كن محترفاً ومتعاطفاً
3. قدّم حلولاً عملية ومحددة
4. استند إلى أفضل الممارسات في الموارد البشرية
5. اقترح خطوات عملية إذا أمكن
6. لا تقدم نصائح قانونية محددة (اقترح استشارة محامي إذا لزم)

المستشار: ${consultant.fullNameAr}
التخصص: ${consultant.mainSpecialization}
سنوات الخبرة: ${consultant.yearsOfExperience}`,
            },
          ];

          // Add conversation history if provided
          if (
            input.conversationHistory &&
            input.conversationHistory.length > 0
          ) {
            contextMessages.push(
              ...input.conversationHistory.map(msg => ({
                role: (msg.role === "client" ? "user" : "assistant") as import("./_core/llm").Role,
                content: msg.message,
              }))
            );
          }

          // Add current client message
          contextMessages.push({
            role: "user",
            content: `رسالة العميل: "${input.clientMessage}"

اقترح رداً احترافياً ومفيداً يمكن للمستشار استخدامه أو تعديله.`,
          });

          const response = await invokeLLM({
            messages: contextMessages,
          });

          const suggestion =
            response.choices[0]?.message?.content ||
            "عذراً، لم أتمكن من إنشاء اقتراح.";

          return { success: true, suggestion };
        } catch {
          // في التطوير يمكن تسجيل الخطأ باستخدام logger لاحقاً، حالياً نتجاهل الطباعة المباشرة
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "حدث خطأ في إنشاء الاقتراح",
          });
        }
      }),

    // Update consultation status
    updateConsultationStatus: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          status: z.enum([
            "pending",
            "confirmed",
            "in-progress",
            "completed",
            "cancelled",
          ]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Verify user is consultant
        const consultant = await db.getConsultantByUserId(ctx.user.id);
        if (!consultant) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking || booking.consultantId !== consultant.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await db.updateConsultationStatus(input.bookingId, input.status);
        return { success: true };
      }),

    // Rate consultation (client only)
    rateConsultation: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Verify user is the client
        if (booking.clientId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Verify consultation is completed
        if (booking.status !== "completed") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "يجب إكمال الاستشارة قبل التقييم",
          });
        }

        await db.rateConsultation({
          bookingId: input.bookingId,
          consultantId: booking.consultantId,
          clientId: ctx.user.id,
          rating: input.rating,
          review: input.comment,
        });

        return { success: true };
      }),
  }),

  // Admin - Consultant Management
  adminConsultant: router({
    // Get pending consultants
    getPending: adminProcedure.query(async () => {
      const consultants = await db.getPendingConsultants();
      return { consultants };
    }),

    // Approve consultant
    approve: adminProcedure
      .input(
        z.object({
          consultantId: z.number(),
          commissionRate: z.number().min(0).max(100).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const consultant = await db.approveConsultant(input.consultantId);

        return { success: true, consultant };
      }),

    // Reject consultant
    reject: adminProcedure
      .input(
        z.object({
          consultantId: z.number(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const consultant = await db.rejectConsultant(input.consultantId);

        return { success: true, consultant };
      }),
  }),

  // PDPL - Privacy & Data Protection
  privacy: router({
    // Get consent status
    getConsentStatus: protectedProcedure.query(async ({ ctx }) => {
      const status = await db.getConsentStatus(ctx.user.id);
      return status;
    }),

    // Withdraw consent
    withdrawConsent: protectedProcedure.mutation(async ({ ctx }) => {
      await db.withdrawConsent(ctx.user.id);
      return { success: true };
    }),

    // Get all user data (right to access)
    getMyData: protectedProcedure.query(async ({ ctx }) => {
      const data = await db.getUserAllData(ctx.user.id);
      return data;
    }),

    // Create data subject request
    createRequest: protectedProcedure
      .input(
        z.object({
          type: z.enum(["access", "correct", "delete", "withdraw", "object"]),
          payload: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createDataSubjectRequest({
          userId: ctx.user.id,
          type: input.type,
          payloadJson: input.payload,
        });
        return { success: true };
      }),
  }),

  // Admin - PDPL Management
  adminPdpl: router({
    // Get all data subject requests
    getRequests: adminProcedure.query(async () => {
      const requests = await db.getDataSubjectRequests();
      return {
        requests,
        total: requests.length,
      };
    }),

    // Get security incidents
    getIncidents: adminProcedure.query(async () => {
      const incidents = await db.getSecurityIncidents();
      return {
        incidents,
        total: incidents.length,
      };
    }),

    // Create security incident
    createIncident: adminProcedure
      .input(
        z.object({
          description: z.string(),
          cause: z.string().optional(),
          affectedDataCategories: z.string().optional(),
          affectedUsersCount: z.number().optional(),
          riskLevel: z.enum(["low", "medium", "high"]),
        })
      )
      .mutation(async ({ input }) => {
        const incident = await db.createSecurityIncident(input);
        return { success: true, incidentId: incident.id };
      }),

    // Update incident
    updateIncident: adminProcedure
      .input(
        z.object({
          incidentId: z.number(),
          reportedToSdaiaAt: z.date().optional(),
          reportedToUsersAt: z.date().optional(),
          status: z
            .enum(["new", "investigating", "reported", "resolved"])
            .optional(),
          isLate: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { incidentId, ...updates } = input;
        const updated = await db.updateSecurityIncident(incidentId, updates);
        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحادث غير موجود" });
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
