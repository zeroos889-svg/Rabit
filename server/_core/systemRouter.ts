import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { captureException } from "../sentry";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  // Test Sentry error tracking (only in non-production or with debug flag)
  testSentryError: publicProcedure
    .input(
      z.object({
        message: z.string().optional().default("Test error from RabitHR"),
      })
    )
    .mutation(({ input }) => {
      const testError = new Error(input.message);
      captureException(testError, { source: "test-endpoint", timestamp: Date.now() });
      throw testError;
    }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
