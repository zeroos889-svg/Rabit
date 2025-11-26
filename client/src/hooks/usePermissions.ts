import { useAuth } from "@/_core/hooks/useAuth";

export type Permission =
  // System Admin Permissions
  | "system.manage"
  | "users.manage"
  | "roles.manage"
  | "audit.read"
  
  // Company Permissions
  | "employees.create"
  | "employees.read"
  | "employees.update"
  | "employees.delete"
  | "departments.manage"
  
  // ATS (Applicant Tracking) Permissions
  | "jobs.create"
  | "jobs.read"
  | "jobs.update"
  | "jobs.delete"
  | "applicants.read"
  | "applicants.manage"
  | "interviews.schedule"
  
  // HR Operations
  | "leaves.approve"
  | "leaves.request"
  | "attendance.manage"
  | "attendance.view"
  | "payroll.manage"
  | "payroll.view"
  
  // Documents & Files
  | "documents.create"
  | "documents.read"
  | "documents.update"
  | "documents.delete"
  | "pdf.generate"
  | "templates.manage"
  
  // Reports & Analytics
  | "reports.view"
  | "reports.export"
  | "analytics.view"
  
  // Tickets & Support
  | "tickets.create"
  | "tickets.read"
  | "tickets.update"
  | "tickets.resolve"
  
  // Communication
  | "chat.reply"
  | "chat.read"
  | "notifications.read"
  | "notifications.send"
  
  // Tasks
  | "tasks.create"
  | "tasks.read"
  | "tasks.update"
  | "tasks.delete"
  | "tasks.assign"
  
  // Settings
  | "settings.company"
  | "settings.personal";

type Role = "admin" | "company" | "consultant" | "employee" | "user";

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    // All permissions
    "system.manage",
    "users.manage",
    "roles.manage",
    "audit.read",
    "employees.create",
    "employees.read",
    "employees.update",
    "employees.delete",
    "departments.manage",
    "jobs.create",
    "jobs.read",
    "jobs.update",
    "jobs.delete",
    "applicants.read",
    "applicants.manage",
    "interviews.schedule",
    "leaves.approve",
    "leaves.request",
    "attendance.manage",
    "attendance.view",
    "payroll.manage",
    "payroll.view",
    "documents.create",
    "documents.read",
    "documents.update",
    "documents.delete",
    "pdf.generate",
    "templates.manage",
    "reports.view",
    "reports.export",
    "analytics.view",
    "tickets.create",
    "tickets.read",
    "tickets.update",
    "tickets.resolve",
    "chat.reply",
    "chat.read",
    "notifications.read",
    "notifications.send",
    "tasks.create",
    "tasks.read",
    "tasks.update",
    "tasks.delete",
    "tasks.assign",
    "settings.company",
    "settings.personal",
  ],
  
  company: [
    "employees.create",
    "employees.read",
    "employees.update",
    "employees.delete",
    "departments.manage",
    "jobs.create",
    "jobs.read",
    "jobs.update",
    "jobs.delete",
    "applicants.read",
    "applicants.manage",
    "interviews.schedule",
    "leaves.approve",
    "attendance.manage",
    "attendance.view",
    "payroll.manage",
    "payroll.view",
    "documents.create",
    "documents.read",
    "documents.update",
    "documents.delete",
    "pdf.generate",
    "templates.manage",
    "reports.view",
    "reports.export",
    "analytics.view",
    "tickets.create",
    "tickets.read",
    "tickets.update",
    "tickets.resolve",
    "chat.reply",
    "chat.read",
    "notifications.read",
    "notifications.send",
    "tasks.create",
    "tasks.read",
    "tasks.update",
    "tasks.delete",
    "tasks.assign",
    "settings.company",
    "settings.personal",
  ],
  
  consultant: [
    "employees.read",
    "jobs.read",
    "applicants.read",
    "documents.create",
    "documents.read",
    "pdf.generate",
    "templates.manage",
    "chat.reply",
    "chat.read",
    "notifications.read",
    "tasks.read",
    "tasks.update",
    "settings.personal",
  ],
  
  employee: [
    "leaves.request",
    "attendance.view",
    "payroll.view",
    "documents.read",
    "documents.create",
    "tickets.create",
    "tickets.read",
    "chat.read",
    "notifications.read",
    "tasks.read",
    "tasks.update",
    "settings.personal",
  ],
  
  user: [
    "chat.read",
    "notifications.read",
    "settings.personal",
  ],
};

export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const role = user.role as Role;
    const permissions = rolePermissions[role] || [];
    
    return permissions.includes(permission);
  };
  
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };
  
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };
  
  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    
    const role = user.role as Role;
    return rolePermissions[role] || [];
  };
  
  const canManageEmployees = hasAnyPermission([
    "employees.create",
    "employees.update",
    "employees.delete",
  ]);
  
  const canManageJobs = hasAnyPermission([
    "jobs.create",
    "jobs.update",
    "jobs.delete",
  ]);
  
  const canManagePayroll = hasPermission("payroll.manage");
  
  const canApproveLeaves = hasPermission("leaves.approve");
  
  const canAccessReports = hasPermission("reports.view");
  
  const canManageSystem = hasPermission("system.manage");
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    // Convenience properties
    canManageEmployees,
    canManageJobs,
    canManagePayroll,
    canApproveLeaves,
    canAccessReports,
    canManageSystem,
  };
}
