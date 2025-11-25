import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./_core/db";
import { users, passwords } from "../drizzle/schema";
import { hashPassword, verifyPassword } from "./utils/password";
import { generateToken } from "./utils/jwt";
import { eq } from "drizzle-orm";

/**
 * Auth router - handles authentication
 */
const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    return ctx.user;
  }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        phoneNumber: z.string().optional(),
        userType: z.enum(["employee", "individual", "company", "consultant"]).default("individual"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("البريد الإلكتروني مستخدم بالفعل");
      }

      // Create user
      const result: any = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          phoneNumber: input.phoneNumber,
          loginMethod: "email",
          role: "user",
          userType: input.userType,
          emailVerified: false,
          profileCompleted: false,
        });

      const newUserId = Number(result.insertId || result[0]?.insertId);

      // Hash password and store
      const passwordHash = await hashPassword(input.password);
      await db.insert(passwords).values({
        userId: newUserId,
        passwordHash,
      });

      // Generate token
      const token = generateToken({
        userId: newUserId,
        email: input.email,
        role: "user",
      });

      return {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        token,
        user: {
          id: newUserId,
          email: input.email,
          name: input.name,
          role: "user",
        },
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      // Get password hash
      const [userPassword] = await db
        .select()
        .from(passwords)
        .where(eq(passwords.userId, user.id))
        .limit(1);

      if (!userPassword) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      // Verify password
      const isValid = await verifyPassword(input.password, userPassword.passwordHash);
      if (!isValid) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email!,
        role: user.role,
      });

      return {
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.userType,
        },
      };
    }),

  logout: publicProcedure.mutation(async () => {
    // Client-side will remove token
    return { 
      success: true,
      message: "تم تسجيل الخروج بنجاح"
    };
  }),
});

/**
 * Account router - user profile and stats
 */
const accountRouter = router({
  history: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async () => {
      return { entries: [] };
    }),

  stats: publicProcedure.query(async () => {
    return {
      stats: {
        lastActivity: null,
        byAction: {},
      },
    };
  }),
});

/**
 * EOSB (End of Service Benefits) router
 */
const eosbRouter = router({
  calculate: publicProcedure
    .input(z.object({
      basicSalary: z.number(),
      housingAllowance: z.number(),
      yearsOfService: z.number(),
      monthsOfService: z.number(),
    }))
    .mutation(async () => {
      // Placeholder implementation
      return {
        totalBenefit: 0,
        breakdown: {},
      };
    }),

  getCalculationHistory: publicProcedure
    .query(async () => {
      return { 
        history: [] as Array<{
          id: number;
          salary: number;
          contractType: string;
          terminationReason: string;
          startDate: string;
          endDate: string;
          duration: { years: number; months: number; days: number };
          result: {
            totalAmount: number;
            firstFiveYears: number;
            afterFiveYears: number;
            percentage: number;
            yearsCount: number;
            monthsCount: number;
            daysCount: number;
            breakdown: {
              years: number;
              months: number;
              days: number;
            };
            aiInsights?: string;
          };
        }>
      };
    }),
});

/**
 * Letters router - HR letters generation
 */
const lettersRouter = router({
  getTemplates: publicProcedure.query(async () => {
    return { templates: [] };
  }),

  generate: publicProcedure
    .input(z.object({
      templateId: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(async () => {
      return {
        success: true,
        letterId: "placeholder",
      };
    }),

  getHistory: publicProcedure.query(async () => {
    return { 
      letters: [] as Array<{
        id: number;
        content: string;
        language: string;
        style: string;
        metadata: Record<string, unknown>;
        category: string;
        letterType: string;
      }>
    };
  }),
});

/**
 * Document Generator router
 */
const documentGeneratorRouter = router({
  getTemplates: publicProcedure.query(async () => {
    return { 
      templates: [] as Array<{
        code: string;
        titleAr: string;
        titleEn: string;
        nameAr: string;
        nameEn: string;
        description: string;
        content: string;
        placeholdersSchema: string;
      }>
    };
  }),

  generate: publicProcedure
    .input(z.object({
      templateCode: z.string(),
      data: z.record(z.any()),
    }))
    .mutation(async () => {
      return {
        success: true,
        documentId: "placeholder",
      };
    }),

  getMyDocuments: publicProcedure.query(async () => {
    return { 
      documents: [] as Array<{
        id: number;
        title: string;
        companyName: string;
        templateCode: string;
        outputText: string;
        outputHtml: string;
        content: string;
        isSaved: boolean;
        saved: boolean;
      }>
    };
  }),
});

/**
 * Main application router
 */
export const appRouter = router({
  auth: authRouter,
  account: accountRouter,
  eosb: eosbRouter,
  letters: lettersRouter,
  documentGenerator: documentGeneratorRouter,
});

export type AppRouter = typeof appRouter;

