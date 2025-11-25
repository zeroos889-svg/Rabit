type AuditAction =
  | "chat:send"
  | "chat:ai_reply"
  | "pdf:generate"
  | "auth:login"
  | "auth:register"
  | "auth:password_reset_request"
  | "auth:password_reset"
  | "auth:otp_sent"
  | "auth:login_alert"
  | "notification:dispatch"
  | "document:create"
  | "document:delete"
  | "document:download"
  | "letter:save"
  | "letter:delete"
  | "consulting:ticket"
  | "chat:sensitive_blocked"
  | "account:update";

export type AuditLog = {
  id: number;
  action: AuditAction;
  actorId?: number | null;
  actorEmail?: string | null;
  resource?: string | null;
  metadata?: Record<string, unknown>;
  summary?: string | null;
  severity?: "info" | "warning" | "critical";
  createdAt: Date;
};

let auditSeq = 1;
const logs: AuditLog[] = [];

export function recordAudit(entry: Omit<AuditLog, "id" | "createdAt">) {
  logs.push({
    id: auditSeq++,
    createdAt: new Date(),
    ...entry,
  });
}

export function listAudit(limit = 200) {
  return logs.slice(-limit).reverse();
}

export function listAuditForUser(userId: number, limit = 100) {
  return logs
    .filter(log => (log.actorId ?? null) === userId)
    .slice(-limit)
    .reverse();
}

export function getAuditStatsForUser(userId: number) {
  const userLogs = logs.filter(log => (log.actorId ?? null) === userId);
  const totals = userLogs.length;
  const byAction = userLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1;
    return acc;
  }, {});
  const lastActivity = userLogs[userLogs.length - 1]?.createdAt ?? null;
  return { totals, byAction, lastActivity };
}
