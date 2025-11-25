import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { getDashboardPath } from "@/lib/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[]; // optional role restriction (multiple allowed)
  requiredRole?: string; // single role convenience prop
}

export function ProtectedRoute({ children, roles, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="loading" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const effectiveRoles = roles || (requiredRole ? [requiredRole] : undefined);

  // admin دائماً مسموح
  if (user.role === "admin") {
    return <>{children}</>;
  }

  const userType = (user as any).userType;

  const roleMatchers: Record<string, boolean> = {
    employee:
      (user.role === "employee" || user.role === "user") &&
      (userType === "employee" || userType === "company"),
    company:
      (user.role === "user" || user.role === "company") && userType === "company",
    consultant:
      (user.role === "user" || user.role === "consultant") && userType === "consultant",
  };

  const isAllowed =
    !effectiveRoles ||
    effectiveRoles.some(role => role === user.role || roleMatchers[role]);

  if (!isAllowed) {
    return <Redirect to={getDashboardPath(user)} />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
