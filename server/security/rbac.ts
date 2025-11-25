type Role = "admin" | "company" | "consultant" | "employee" | "user";
type MaybeRole = Role | null | undefined;

type Permission =
  | "pdf.generate"
  | "chat.reply"
  | "chat.read"
  | "audit.read"
  | "notifications.read";

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["pdf.generate", "chat.reply", "chat.read", "audit.read", "notifications.read"],
  company: ["pdf.generate", "chat.reply", "chat.read", "notifications.read"],
  consultant: ["pdf.generate", "chat.reply", "chat.read", "notifications.read"],
  employee: ["chat.read", "notifications.read"],
  user: ["chat.read"],
};

const fallbackPermissions: Permission[] = ["chat.read"];

function getPermissions(role: MaybeRole) {
  if (!role) return fallbackPermissions;
  return rolePermissions[role] ?? fallbackPermissions;
}

export function hasPermission(role: MaybeRole, permission: Permission) {
  const permissions = getPermissions(role);
  return permissions.includes(permission);
}

export function assertPermission(role: MaybeRole, permission: Permission) {
  if (!hasPermission(role, permission)) {
    const error = new Error("INSUFFICIENT_PERMISSIONS");
    (error as any).code = "FORBIDDEN";
    throw error;
  }
}

export type { Permission, Role, MaybeRole };
