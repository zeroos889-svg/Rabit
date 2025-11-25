import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { __resetChatData } from "./chatRouter";

const userCtx = {
  req: {} as any,
  res: {} as any,
  user: {
    id: 1,
    role: "company",
    email: "user@test.com",
  } as any,
};

describe("chatRouter", () => {
  beforeEach(() => {
    __resetChatData();
  });

  it("falls back with assistant reply when no LLM key is configured", async () => {
    const caller = appRouter.createCaller(userCtx as any);

    const result = await caller.chat.askAssistant({
      message: "مرحبا",
      visitorName: "مستخدم تجريبي",
    });

    expect(result.conversationId).toBeTruthy();
    expect(result.response).toContain("ميزة المساعد الذكي غير مفعلة");
  });

  it("allows sending a message in an existing conversation", async () => {
    const caller = appRouter.createCaller(userCtx as any);
    const conv = await caller.chat.createConversation({
      visitorName: "Demo",
      visitorEmail: "demo@test.com",
    });

    const res = await caller.chat.sendMessage({
      conversationId: conv.conversationId,
      message: "اختبار رد",
    });

    expect(res.success).toBe(true);
  });
});
