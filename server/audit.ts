type AuditAction =
  | "chat:send"
  | "chat:ai_reply"
  | "pdf:generate"
  | "auth:login"
  | "auth:register"
  | "auth:password_reset_request"
  | "auth:password_reset"
  | "auth:password_changed"
  | "auth:otp_sent"
  | "auth:login_alert"
  | "auth:account_locked"
  | "auth:email_verified"
  | "auth:oauth_register"
  | "auth:oauth_login"
  | "notification:dispatch"
  | "document:create"
  | "document:delete"
  | "document:download"
  | "letter:save"
  | "letter:delete"
  | "consulting:ticket"
  | "chat:sensitive_blocked"
  | "account:update"
  // Admin actions
  | "admin:user:create"
  | "admin:user:update"
  | "admin:user:delete"
  | "admin:user:active"
  | "admin:user:pending"
  | "admin:user:suspended"
  | "admin:users:export"
  | "admin:booking:update"
  | "admin:booking:assign"
  | "admin:booking:pending"
  | "admin:booking:confirmed"
  | "admin:booking:completed"
  | "admin:booking:cancelled"
  | "admin:bookings:export"
  | "admin:subscription:create"
  | "admin:subscription:update"
  | "admin:subscription:renew"
  | "admin:subscription:cancel"
  | "admin:subscriptions:export"
  | "admin:consultant:approve"
  | "admin:consultant:approved"
  | "admin:consultant:reject"
  | "admin:consultant:rejected"
  | "admin:consultant:suspend"
  | "admin:data_request:review"
  | "admin:data_request:complete"
  | "admin:data_request:completed"
  | "admin:data_request:reject"
  | "admin:data_request:rejected"
  | "admin:data_request:new"
  | "admin:data_request:in_review"
  | "admin:data_request:delete"
  | "admin:data_requests:export";

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
  const lastActivity = userLogs.at(-1)?.createdAt ?? null;
  return { totals, byAction, lastActivity };
}
