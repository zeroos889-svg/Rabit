import { ReactNode } from "react";
import { usePermissions, Permission } from "@/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showAlert?: boolean;
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showAlert = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // No permissions specified, allow access
    return <>{children}</>;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAlert) {
    return (
      <Alert variant="destructive" className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>
          {isArabic ? "غير مصرح" : "Unauthorized"}
        </AlertTitle>
        <AlertDescription>
          {isArabic
            ? "ليس لديك الصلاحيات اللازمة للوصول إلى هذا المحتوى"
            : "You don't have the necessary permissions to access this content"}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
