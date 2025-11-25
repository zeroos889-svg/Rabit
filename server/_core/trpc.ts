import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

/**
 * Initialization of tRPC backend
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authenticated user
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "يجب تسجيل الدخول أولاً" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Non-null user
    },
  });
});

/**
 * Admin-only procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Type assertion since protectedProcedure ensures user exists
  const user = ctx.user as { role: string };
  
  if (user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "صلاحيات المدير مطلوبة" });
  }
  return next({ ctx });
});
