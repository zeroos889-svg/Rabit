import { ReactNode } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getDashboardPath } from "@/lib/navigation";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="loading" />
      </div>
    );
  }

  if (user) {
    return <Redirect to={getDashboardPath(user)} />;
  }

  return <>{children}</>;
}

export default PublicOnlyRoute;
