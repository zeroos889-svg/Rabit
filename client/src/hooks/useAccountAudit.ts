import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../server/routers";
import type { inferRouterOutputs } from "@trpc/server";

const dayFormatter = new Intl.DateTimeFormat("ar-SA", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ar-SA", {
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("ar", {
  numeric: "auto",
});

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type AccountHistoryEntry =
  RouterOutputs["account"]["history"]["entries"][number];

export type AccountStats = RouterOutputs["account"]["stats"]["stats"];

export type AuditAction = AccountHistoryEntry["action"];

export type AuditTone = "info" | "success" | "warning" | "critical";

export type DecoratedAuditEntry = AccountHistoryEntry & {
  createdAt: Date;
  dayLabel: string;
  timeLabel: string;
  relativeLabel: string;
};

export type GroupedAuditEntries = Array<{
  key: string;
  dayLabel: string;
  date: Date;
  items: DecoratedAuditEntry[];
}>;

export const AUDIT_ACTION_META: Record<
  AuditAction,
  { label: string; tone: AuditTone; description?: string }
> = {
  "chat:send": {
    label: "إرسال رسالة محادثة",
    tone: "info",
  },
  "chat:ai_reply": {
    label: "رد النظام الذكي",
    tone: "info",
  },
  "pdf:generate": {
    label: "توليد ملف PDF",
    tone: "info",
  },
  "auth:login": {
    label: "تسجيل دخول",
    tone: "success",
  },
  "auth:register": {
    label: "تسجيل حساب جديد",
    tone: "success",
  },
  "auth:password_reset_request": {
    label: "طلب إعادة تعيين كلمة المرور",
    tone: "info",
  },
  "auth:password_reset": {
    label: "إعادة تعيين كلمة المرور",
    tone: "success",
  },
  "notification:dispatch": {
    label: "إرسال إشعار",
    tone: "info",
  },
  "auth:otp_sent": {
    label: "إرسال رمز تحقق",
    tone: "info",
    description: "تم إرسال رمز دخول آمن (OTP) إلى بريدك",
  },
  "auth:login_alert": {
    label: "تنبيه تسجيل دخول جديد",
    tone: "warning",
    description: "تم رصد جهاز أو موقع جديد للدخول",
  },
  "document:create": {
    label: "إنشاء مستند",
    tone: "success",
  },
  "document:delete": {
    label: "حذف مستند",
    tone: "warning",
  },
  "document:download": {
    label: "تنزيل مستند",
    tone: "info",
  },
  "letter:save": {
    label: "حفظ خطاب",
    tone: "success",
  },
  "letter:delete": {
    label: "حذف خطاب",
    tone: "warning",
  },
  "consulting:ticket": {
    label: "طلب استشارة",
    tone: "info",
  },
  "chat:sensitive_blocked": {
    label: "حجب بيانات حساسة",
    tone: "warning",
    description: "تم منع رسالة تحتوي على بيانات حساسة",
  },
  "account:update": {
    label: "تحديث بيانات الحساب",
    tone: "info",
  },
};

function formatRelative(date: Date) {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) {
    return relativeFormatter.format(seconds, "second");
  }
  if (Math.abs(minutes) < 60) {
    return relativeFormatter.format(minutes, "minute");
  }
  if (Math.abs(hours) < 24) {
    return relativeFormatter.format(hours, "hour");
  }
  return relativeFormatter.format(days, "day");
}

function decorateEntries(entries: AccountHistoryEntry[]): DecoratedAuditEntry[] {
  return entries.map(entry => {
    const createdAt = new Date(entry.createdAt);
    return {
      ...entry,
      createdAt,
      dayLabel: dayFormatter.format(createdAt),
      timeLabel: timeFormatter.format(createdAt),
      relativeLabel: formatRelative(createdAt),
    };
  });
}

function groupEntries(entries: DecoratedAuditEntry[]): GroupedAuditEntries {
  const groups = new Map<string, GroupedAuditEntries[number]>();

  entries.forEach(entry => {
    const key = entry.createdAt.toDateString();
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        dayLabel: entry.dayLabel,
        date: entry.createdAt,
        items: [],
      });
    }
    groups.get(key)!.items.push(entry);
  });

  return Array.from(groups.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}

export function useAccountAudit(options?: { limit?: number; enabled?: boolean }) {
  const limit = options?.limit ?? 25;
  const enabled = options?.enabled ?? true;

  const historyQuery = trpc.account.history.useQuery(
    { limit },
    {
      enabled,
      staleTime: 1000 * 30,
    }
  );

  const statsQuery = trpc.account.stats.useQuery(undefined, {
    enabled,
    staleTime: 1000 * 60,
  });

  const decoratedEntries = useMemo(() => {
    return decorateEntries(historyQuery.data?.entries ?? []);
  }, [historyQuery.data?.entries]);

  const groupedEntries = useMemo(() => {
    return groupEntries(decoratedEntries);
  }, [decoratedEntries]);

  const lastActivityRelative = useMemo(() => {
    const lastActivity = statsQuery.data?.stats.lastActivity;
    if (!lastActivity) return null;
    return formatRelative(new Date(lastActivity));
  }, [statsQuery.data?.stats.lastActivity]);

  const topActions = useMemo(() => {
    const byAction = statsQuery.data?.stats.byAction;
    if (!byAction) return [];
    return Object.entries(byAction)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([action, count]) => ({
        action: action as AuditAction,
        count,
        label: AUDIT_ACTION_META[action as AuditAction]?.label ?? action,
      }));
  }, [statsQuery.data?.stats.byAction]);

  const refetch = () => {
    historyQuery.refetch();
    statsQuery.refetch();
  };

  return {
    entries: decoratedEntries,
    groupedEntries,
    stats: statsQuery.data?.stats ?? null,
    lastActivityRelative,
    topActions,
    isLoading: historyQuery.isLoading || statsQuery.isLoading,
    isRefetching: historyQuery.isRefetching || statsQuery.isRefetching,
    error: historyQuery.error ?? statsQuery.error,
    refetch,
  };
}
