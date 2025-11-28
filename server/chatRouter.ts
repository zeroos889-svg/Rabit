import { z } from "zod";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  router,
} from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import type { Message } from "./_core/llm";
import { ENV } from "./_core/env";
import { assertPermission } from "./security/rbac";
import { recordAudit } from "./audit";
import * as db from "./db";
import crypto from "crypto";

type ChatMessage = {
  id: number;
  conversationId: number;
  senderType: "admin" | "visitor" | "assistant";
  senderName?: string;
  message: string;
  createdAt: Date;
  read?: boolean;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 15;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_MESSAGES = 30;
const MAX_HISTORY_CHARS = 12_000;
const MAX_SENSITIVE_SNIPPET = 24;
const rateLimits = new Map<string, { windowStart: number; count: number }>();

const LEGAL_KNOWLEDGE_BASE = [
  {
    id: "end_of_service",
    keywords: ["نهاية الخدمة", "مكافأة", "مكافاه", "الاستقالة", "المادة 84", "end of service"],
    citation: "نظام العمل السعودي - المادة 84",
    link: "https://hrsd.gov.sa",
    summary:
      "حساب مكافأة نهاية الخدمة بنصف راتب عن كل سنة من أول خمس سنوات، وراتب كامل لكل سنة بعدها، بناءً على الأجر الأخير.",
  },
  {
    id: "vacations",
    keywords: ["اجازة", "إجازة", "vacation", "سنوية", "مرضية", "مادة 109", "مادة 110", "مادة 111"],
    citation: "نظام العمل السعودي - المواد 109-111",
    link: "https://hrsd.gov.sa",
    summary:
      "الحد الأدنى 21 يوماً ترتفع إلى 30 بعد خمس سنوات خدمة، مع أجر كامل، ولا تُعوض الإجازة السنوية نقداً إلا عند نهاية الخدمة.",
  },
  {
    id: "pdpl",
    keywords: ["pdpl", "خصوصية", "بيانات", "data subject", "dsr", "سرية", "موافقة"],
    citation: "نظام حماية البيانات الشخصية السعودي (PDPL)",
    link: "https://ncpd.gov.sa",
    summary:
      "يتطلب PDPL موافقة صريحة لغرض محدد، وتمكين صاحب البيانات من الحق في الوصول، التصحيح، والمسح، والرد خلال 30 يوماً.",
  },
  {
    id: "discipline",
    keywords: ["جزاء", "إنذار", "خصم", "لائحة تنظيم", "تحقيق", "discipline"],
    citation: "نظام العمل السعودي - العقوبات التأديبية",
    link: "https://hrsd.gov.sa",
    summary:
      "يجب وجود لائحة تنظيم معتمدة، تحقيق مكتوب، تناسب الجزاء مع المخالفة، والالتزام بالتدرج (إنذار ثم خصم/إيقاف).",
  },
];

type SensitivePattern = { name: string; regex: RegExp };
const SENSITIVE_PATTERNS: SensitivePattern[] = [
  { name: "national_id", regex: /\b1\d{9}\b/ },
  { name: "iban", regex: /\bSA\d{2}[A-Z0-9]{20}\b/i },
  {
    name: "card",
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
  },
];

const ensureVisitorToken = (conversation: { visitorToken?: string | null }) => {
  if (!conversation.visitorToken) {
    conversation.visitorToken = crypto.randomBytes(32).toString("hex");
  }
  return conversation.visitorToken;
};

const getRateLimitKey = (params: {
  ctxUserId?: number | null;
  visitorEmail?: string | null;
  conversationId?: number;
  ip?: string | undefined;
}) => {
  if (params.ctxUserId) return `user:${params.ctxUserId}`;
  if (params.visitorEmail) return `email:${params.visitorEmail}`;
  if (params.conversationId) return `conv:${params.conversationId}`;
  return `ip:${params.ip || "unknown"}`;
};

const checkRateLimit = (key: string) => {
  const now = Date.now();
  const existing = rateLimits.get(key);
  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(key, { windowStart: now, count: 1 });
    return;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "تم تجاوز الحد المسموح للرسائل، حاول بعد قليل",
    });
  }
  existing.count += 1;
};

const extractContent = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === "string") return part;
        if (part.type === "text" && part.text) return part.text;
        if (part.type === "image_url" && part.image_url?.url) {
          return `[صورة: ${part.image_url.url}]`;
        }
        if (part.type === "file_url" && part.file_url?.url) {
          return `[ملف: ${part.file_url.url}]`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

const prepareHistory = (messages: ChatMessage[]) => {
  const sorted = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const limited = sorted.slice(-MAX_HISTORY_MESSAGES);

  let total = 0;
  const trimmed: ChatMessage[] = [];
  for (let i = limited.length - 1; i >= 0; i--) {
    const current = limited[i];
    const length = current.message?.length || 0;
    if (trimmed.length && total + length > MAX_HISTORY_CHARS) {
      continue;
    }
    trimmed.unshift(current);
    total += length;
  }
  return trimmed;
};

const detectSensitiveContent = (text: string) => {
  for (const pattern of SENSITIVE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      return { type: pattern.name, sample: match[0] };
    }
  }
  return null;
};

const buildLegalContext = (question: string) => {
  const normalized = question.toLowerCase();
  const scored = LEGAL_KNOWLEDGE_BASE.map(item => {
    const hits = item.keywords.reduce((acc, keyword) => {
      const needle = keyword.toLowerCase();
      return acc + (normalized.includes(needle) ? 1 : 0);
    }, 0);
    return { item, score: hits };
  });
  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(entry => entry.item);
};

const appendSources = (response: string, sources: typeof LEGAL_KNOWLEDGE_BASE) => {
  if (!sources.length) return response;
  const hasSourcesSection = response.includes("المصادر:");
  const sourcesText = sources
    .map(src => `- ${src.citation}${src.link ? ` (${src.link})` : ""}`)
    .join("\n");
  if (hasSourcesSection) {
    return response;
  }
  return `${response}\n\nالمصادر:\n${sourcesText}`;
};

export const chatRouter = router({
  createConversation: publicProcedure
    .input(
      z.object({
        visitorName: z.string().optional(),
        visitorEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conversation = await db.createChatConversation({
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        userId: ctx.user?.id ?? null,
      });
      return {
        conversationId: conversation.id,
        visitorToken: conversation.visitorToken,
      };
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().trim().min(1),
        senderName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sanitizedMessage = input.message.trim();
      assertPermission(ctx.user?.role, "chat.reply");
      if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "الرسالة طويلة جداً، الرجاء الاختصار",
        });
      }

      const conversation = await db.getChatConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المحادثة غير موجودة",
        });
      }

      const rateKey = getRateLimitKey({
        ctxUserId: ctx.user?.id,
        visitorEmail: conversation.visitorEmail,
        conversationId: input.conversationId,
        ip: ctx.req?.ip,
      });
      checkRateLimit(rateKey);

      const msg = await db.addChatMessage({
        conversationId: input.conversationId,
        senderType: ctx.user?.role === "admin" ? "admin" : "visitor",
        senderName: input.senderName || ctx.user?.name || "زائر",
        message: sanitizedMessage,
      });
      recordAudit({
        action: "chat:send",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: `conversation:${conversation.id}`,
        metadata: { senderType: msg.senderType },
      });
      return { success: true };
    }),

  askAssistant: publicProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
        message: z.string().trim().min(1),
        visitorName: z.string().optional(),
        visitorEmail: z.string().email().optional(),
        visitorToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sanitizedMessage = input.message.trim();
      const sensitive = detectSensitiveContent(sanitizedMessage);
      if (sensitive && ctx.user?.role !== "admin") {
        recordAudit({
          action: "chat:sensitive_blocked",
          actorId: ctx.user?.id ?? null,
          actorEmail: ctx.user?.email ?? null,
          resource: `chat`,
          metadata: {
            type: sensitive.type,
            sample: sensitive.sample.slice(0, MAX_SENSITIVE_SNIPPET),
          },
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "يبدو أنك أدخلت بيانات حساسة (هوية/حساب). لحمايتك، يرجى حذفها أو استبدالها بوصف عام.",
        });
      }

      const conversation = await db.upsertChatConversation({
        id: input.conversationId,
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        userId: ctx.user?.id ?? null,
      });
      const visitorToken = ensureVisitorToken(conversation);
      const providedToken = input.visitorToken;
      if (!ctx.user && providedToken) {
        const tokenMatches =
          providedToken.length === visitorToken.length &&
          crypto.timingSafeEqual(
            Buffer.from(providedToken),
            Buffer.from(visitorToken)
          );
        if (!tokenMatches) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "جلسة الزائر غير صالحة",
          });
        }
      }

      if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "الرسالة طويلة جداً، الرجاء الاختصار",
        });
      }

      const rateKey = getRateLimitKey({
        ctxUserId: ctx.user?.id,
        visitorEmail: input.visitorEmail ?? conversation.visitorEmail,
        conversationId: conversation.id,
        ip: ctx.req?.ip,
      });
      checkRateLimit(rateKey);

      const userMessage = await db.addChatMessage({
        conversationId: conversation.id,
        senderType: ctx.user?.role === "admin" ? "admin" : "visitor",
        senderName:
          input.visitorName ||
          ctx.user?.name ||
          conversation.visitorName ||
          "زائر",
        message: sanitizedMessage,
      });
      recordAudit({
        action: "chat:send",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: `conversation:${conversation.id}`,
        metadata: { senderType: userMessage.senderType },
      });

      const history = prepareHistory(await db.getChatMessages(conversation.id));
      const legalContext = buildLegalContext(sanitizedMessage);

      const systemPrompt =
        "أنت مساعد موارد بشرية ذكي لمنصة رابِط. اجعل إجاباتك موجزة وعملية، واستشهد بنظام العمل السعودي و PDPL بمصادر واضحة عند ذكر أحكام. إذا لم تتوفر مصادر أو كان السؤال قانونياً حساساً بلا سياق كاف، اطلب توضيحاً بدلاً من التخمين. لا تطلب أو تحتفظ بأي أرقام هويات أو حسابات.";

      const llmMessages: Message[] = [
        { role: "system", content: systemPrompt },
        ...(
          legalContext.length
            ? [
                {
                  role: "system" as const,
                  content: `مقاطع معرفة سياقية:\n${legalContext
                    .map(
                      ctx =>
                        `- ${ctx.citation}: ${ctx.summary}${ctx.link ? ` (${ctx.link})` : ""}`
                    )
                    .join("\n")}\nاختم بفقرة قصيرة "المصادر:" تتضمن أسمائها فقط.`,
                } satisfies Message,
              ]
            : []
        ),
        ...history.map(
          m =>
            ({
              role: m.senderType === "visitor" ? ("user" as const) : ("assistant" as const),
              content: m.message,
              name: m.senderName || undefined,
            } satisfies Message)
        ),
      ];

      const hasLLMKey = Boolean(
        ENV.forgeApiKey || ENV.deepseekApiKey || ENV.openaiApiKey
      );

      let aiResponse = "";
      if (!hasLLMKey) {
        aiResponse =
          legalContext[0]?.summary
            ? `إجابة مختصرة اعتماداً على المصادر المتاحة: ${legalContext[0].summary}`
            : "ميزة المساعد الذكي غير مفعلة في هذه البيئة. أضف مفتاح LLM لتفعيل الردود الذكية.";
      } else {
        try {
          const result = await invokeLLM({
            messages: llmMessages,
          });
          const choice = result.choices?.[0]?.message;
          aiResponse =
            extractContent(choice?.content) ||
            "حسناً، كيف يمكنني المساعدة أكثر؟";
        } catch (error: any) {
          aiResponse =
            error?.message ||
            "تعذر الحصول على رد الذكاء الاصطناعي حالياً. حاول مجدداً.";
        }
      }

      aiResponse = appendSources(aiResponse, legalContext);

      await db.addChatMessage({
        conversationId: conversation.id,
        senderType: "assistant",
        senderName: "Rabit AI",
        message: aiResponse,
      });
      recordAudit({
        action: "chat:ai_reply",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: `conversation:${conversation.id}`,
        metadata: { tokens: aiResponse.length },
      });

      return {
        conversationId: conversation.id,
        response: aiResponse,
        visitorToken: conversation.visitorToken,
      };
    }),

  getMyConversation: protectedProcedure.query(async ({ ctx }) => {
    const userConversations = await db.getChatConversationsByUser(ctx.user.id);
    return userConversations[0] || null;
  }),

  getMessages: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        visitorToken: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const conversation = await db.getChatConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المحادثة غير موجودة",
        });
      }

      const visitorToken = ensureVisitorToken(conversation);
      const tokenMatches =
        input.visitorToken &&
        input.visitorToken.length === visitorToken.length &&
        crypto.timingSafeEqual(
          Buffer.from(input.visitorToken),
          Buffer.from(visitorToken)
        );

      const isOwner =
        ctx.user?.role === "admin" ||
        (conversation.userId !== null && conversation.userId === ctx.user?.id) ||
        Boolean(tokenMatches);

      if (!isOwner) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.getChatMessages(input.conversationId);
    }),

  markAsRead: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        visitorToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conversation = await db.getChatConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المحادثة غير موجودة",
        });
      }

      const visitorToken = ensureVisitorToken(conversation);
      const tokenMatches =
        input.visitorToken &&
        input.visitorToken.length === visitorToken.length &&
        crypto.timingSafeEqual(
          Buffer.from(input.visitorToken),
          Buffer.from(visitorToken)
        );

      const isOwner =
        ctx.user?.role === "admin" ||
        (conversation.userId !== null && conversation.userId === ctx.user?.id) ||
        Boolean(tokenMatches);

      if (!isOwner) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.markChatMessagesAsRead(input.conversationId);
      return { success: true };
    }),

  getAllConversations: adminProcedure.query(async () => {
    return db.getAllChatConversations();
  }),

  getConversation: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getChatConversation(input.id);
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateChatConversationStatus(input.id, input.status);
      return { success: true };
    }),

  getUnreadCount: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        visitorToken: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const conversation = await db.getChatConversation(input.conversationId);
      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المحادثة غير موجودة",
        });
      }

      const visitorToken = ensureVisitorToken(conversation);
      const tokenMatches =
        input.visitorToken &&
        input.visitorToken.length === visitorToken.length &&
        crypto.timingSafeEqual(
          Buffer.from(input.visitorToken),
          Buffer.from(visitorToken)
        );

      const isOwner =
        ctx.user?.role === "admin" ||
        (conversation.userId !== null && conversation.userId === ctx.user?.id) ||
        Boolean(tokenMatches);

      if (!isOwner) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const count = await db.getUnreadChatMessagesCount(input.conversationId);
      return { count };
    }),

  getUnreadMessagesCount: adminProcedure.query(async () => {
    const count = await db.getTotalUnreadChatMessagesCount();
    return { count };
  }),

  getUserConversation: protectedProcedure.query(async ({ ctx }) => {
    const convos = await db.getChatConversationsByUser(ctx.user.id);
    return convos[0] || null;
  }),
});

// Test helper to reset in-memory state
export function __resetChatData() {
  db.resetChatStore();
}
