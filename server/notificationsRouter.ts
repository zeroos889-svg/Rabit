import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { recordAudit } from "./audit";
import { getDrizzleDb } from "./db/drizzle";
import * as legacyDb from "./db";
import { notifications } from "../drizzle/schema";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import type { Notification as DbNotification } from "../drizzle/schema";
import { NotificationSchemas } from "./_core/validation";
import { logger } from "./_core/logger";

const notificationTypes = [
  "system",
  "success",
  "info",
  "warning",
  "error",
  "chat",
  "ticket",
  "ats",
  "billing",
] as const;

type NotificationType = (typeof notificationTypes)[number];

type ApiNotification = {
  id: number;
  userId: number | null;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
};

const metadataSchema = z
  .record(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.object({}).passthrough(),
      z.array(z.any()),
    ])
  )
  .optional();

export const notificationInputSchema = z.object({
  userId: z.number().nullable().optional(),
  title: z.string().min(2),
  body: z.string().min(2),
  type: z.enum(notificationTypes),
  metadata: metadataSchema,
});

function parseMetadata(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === "object" && !Buffer.isBuffer(value)) {
    return value as Record<string, unknown>;
  }
  if (Buffer.isBuffer(value)) {
    const asString = value.toString("utf-8");
    try {
      return JSON.parse(asString);
    } catch {
      return null;
    }
  }
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
}

function toApiNotification(row: DbNotification | any): ApiNotification {
  if ("isRead" in row) {
    return {
      id: row.id,
      userId: row.userId ?? null,
      title: row.title,
      body: row.body,
      type: (row.type as NotificationType) ?? "system",
      read: Boolean(row.isRead),
      createdAt: row.createdAt ?? new Date(),
      metadata: parseMetadata(row.metadata ?? null),
    };
  }

  return {
    id: row.id,
    userId: row.userId ?? null,
    title: row.title,
    body: row.body,
    type: (row.type as NotificationType) ?? "system",
    read: Boolean(row.read),
    createdAt: row.createdAt ?? new Date(),
    metadata: row.metadata ?? null,
  };
}

const hasDatabaseUrl =
  Boolean(process.env.DATABASE_URL) && process.env.NODE_ENV !== "test";

function parseResultHeader(result: unknown): { affectedRows?: number } | null {
  if (result && typeof result === "object" && "rowsAffected" in (result as any)) {
    return { affectedRows: Number((result as any).rowsAffected) };
  }
  if (Array.isArray(result) && result.length && "affectedRows" in (result as any)[0]) {
    return { affectedRows: Number((result as any)[0].affectedRows) };
  }
  return null;
}

function extractInsertId(result: unknown): number | undefined {
  if (!result) return undefined;
  if (typeof result === "object" && result !== null && "insertId" in result) {
    return Number((result as any).insertId);
  }
  if (Array.isArray(result) && result.length > 0) {
    const maybeHeader = result[0];
    if (maybeHeader && typeof maybeHeader === "object" && "insertId" in maybeHeader) {
      return Number((maybeHeader as any).insertId);
    }
  }
  return undefined;
}

export async function createNotificationRecord(input: z.infer<typeof notificationInputSchema>) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      const insertResult = await db
        .insert(notifications)
        .values({
          userId: input.userId ?? null,
          title: input.title,
          body: input.body,
          type: input.type,
          metadata: input.metadata ?? null,
          isRead: false,
          createdAt: new Date(),
        });
      const insertedId = extractInsertId(insertResult);
      if (insertedId) {
        const [row] = await db
          .select()
          .from(notifications)
          .where(eq(notifications.id, insertedId))
          .limit(1);
        if (row) {
          return toApiNotification(row);
        }
      }
      const [latest] = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(1);
      if (latest) {
        return toApiNotification(latest);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }

  const fallback = await legacyDb.createNotification({
    userId: input.userId ?? null,
    title: input.title,
    body: input.body,
    type: input.type,
    metadata: input.metadata ?? undefined,
  } as any);
  return toApiNotification(fallback);
}

export const publishNotification = createNotificationRecord;

async function fetchUserNotifications(userId: number, limit: number) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      const rows = await db
        .select()
        .from(notifications)
        .where(
          or(eq(notifications.userId, userId), isNull(notifications.userId))
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
      return rows.map(toApiNotification);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }

  const fallback = await legacyDb.getUserNotifications(userId, limit);
  return fallback.map(toApiNotification);
}

async function unreadCount(userId: number) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      const result = await db
        .select({ count: sql<number>`count(*) as count` })
        .from(notifications)
        .where(
          and(
            or(eq(notifications.userId, userId), isNull(notifications.userId)),
            eq(notifications.isRead, false)
          )
        );
      const count = result[0]?.count ?? 0;
      return Number(count);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
  return legacyDb.getUnreadNotificationsCount(userId);
}

async function markNotificationAsRead(userId: number, id: number) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      const result = await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.id, id),
            or(eq(notifications.userId, userId), isNull(notifications.userId))
          )
        );
      const header = parseResultHeader(result);
      return Boolean(header && header.affectedRows && header.affectedRows > 0);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
  await legacyDb.markNotificationAsRead(id);
  return true;
}

async function markAllAsRead(userId: number) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          or(eq(notifications.userId, userId), isNull(notifications.userId))
        );
      return;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
  await legacyDb.markAllNotificationsAsRead(userId);
}

async function deleteNotificationRecord(userId: number, id: number) {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      const result = await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, id),
            or(eq(notifications.userId, userId), isNull(notifications.userId))
          )
        );
      const header = parseResultHeader(result);
      return Boolean(header && header.affectedRows && header.affectedRows > 0);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
  const before = await legacyDb.getUserNotifications(userId, 200);
  await legacyDb.deleteNotification(id);
  const after = await legacyDb.getUserNotifications(userId, 200);
  return after.length !== before.length;
}

export const notificationsRouter = router({
  // Admin/system can dispatch notifications to a user (or broadcast with null)
  dispatch: adminProcedure
    .input(notificationInputSchema)
    .mutation(async ({ input }) => {
      // Validate with NotificationSchemas
      const validated = NotificationSchemas.create.parse({
        userId: input.userId,
        title: input.title,
        body: input.body,
        type: input.type,
      });

      logger.info("[Notifications] Dispatching notification", {
        context: "Notifications",
        userId: validated.userId,
        type: validated.type,
      });

      const notif = await createNotificationRecord(input);
      recordAudit({
        action: "notification:dispatch",
        actorId: input.userId ?? null,
        actorEmail: null,
        resource: `notification:${notif.id}`,
        metadata: { type: input.type },
      });
      return notif;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await fetchUserNotifications(ctx.user.id, input.limit ?? 50);
      const unreadCountValue = await unreadCount(ctx.user.id);
      return { notifications: items, unreadCount: unreadCountValue };
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await unreadCount(ctx.user.id);
    return { count };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number().positive("Invalid notification ID") }))
    .mutation(async ({ ctx, input }) => {
      logger.info("[Notifications] Marking notification as read", {
        context: "Notifications",
        userId: ctx.user.id,
        notificationId: input.id,
      });

      const success = await markNotificationAsRead(ctx.user.id, input.id);
      return { success };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    logger.info("[Notifications] Marking all notifications as read", {
      context: "Notifications",
      userId: ctx.user.id,
    });

    await markAllAsRead(ctx.user.id);
    return { success: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().positive("Invalid notification ID") }))
    .mutation(async ({ ctx, input }) => {
      logger.info("[Notifications] Deleting notification", {
        context: "Notifications",
        userId: ctx.user.id,
        notificationId: input.id,
      });

      const success = await deleteNotificationRecord(ctx.user.id, input.id);
      return { success };
    }),
});

// Test helpers
export async function __resetNotifications() {
  if (hasDatabaseUrl) {
    try {
      const db = await getDrizzleDb();
      await db.delete(notifications);
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }
  }
  legacyDb.resetNotificationStore();
}
