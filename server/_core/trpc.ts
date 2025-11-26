import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error, ctx }) {
    // Get request ID from context if available
    const requestId = ctx?.req ? getRequestId(ctx.req) : "unknown";

    // Log the error with context
    logger.error("tRPC Error", {
      context: "tRPC",
      requestId,
      code: error.code,
      message: error.message,
      path: shape.data?.path,
      stack: error.cause instanceof Error ? error.cause.stack : undefined,
    });

    // Return enhanced error shape
    return {
      ...shape,
      data: {
        ...shape.data,
        requestId, // Include request ID in error response
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = ctx.user;

  if (user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }

  return next({ ctx });
});
