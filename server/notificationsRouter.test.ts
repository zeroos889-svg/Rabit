import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { __resetNotifications } from "./notificationsRouter";

const adminCtx = {
  req: {} as any,
  res: {} as any,
  user: { id: 999, role: "admin", email: "admin@test.com" } as any,
};

const userCtx = {
  req: {} as any,
  res: {} as any,
  user: { id: 1, role: "company", email: "user@test.com" } as any,
};

describe("notificationsRouter", () => {
  beforeEach(async () => {
    await __resetNotifications();
  });

  it("allows admin to dispatch and user to fetch/unread count", async () => {
    const adminCaller = appRouter.createCaller(adminCtx as any);
    await adminCaller.notifications.dispatch({
      userId: 1,
      title: "تنبيه جديد",
      body: "رسالة تنبيه",
      type: "system",
    });

    const userCaller = appRouter.createCaller(userCtx as any);
    const result = await userCaller.notifications.getAll({ limit: 10 });

    expect(result.notifications.length).toBe(1);
    expect(result.unreadCount).toBe(1);
    expect(result.notifications[0].title).toContain("تنبيه");
  });

  it("marks a notification as read", async () => {
    const adminCaller = appRouter.createCaller(adminCtx as any);
    await adminCaller.notifications.dispatch({
      userId: 1,
      title: "اختبار",
      body: "تفاصيل",
      type: "system",
    });

    const userCaller = appRouter.createCaller(userCtx as any);
    const { notifications } = await userCaller.notifications.getAll({});
    const id = notifications[0].id;

    await userCaller.notifications.markRead({ id });
    const after = await userCaller.notifications.getAll({});

    expect(after.unreadCount).toBe(0);
    expect(after.notifications[0].read).toBe(true);
  });
});
