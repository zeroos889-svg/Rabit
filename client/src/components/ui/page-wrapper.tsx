/**
 * Page Wrapper Components
 * مكونات غلاف الصفحات مع تحسينات UX وMobile
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Skeleton } from "./skeleton";
import { LoadingSpinner } from "./loading-spinner";
import { EmptyState, ErrorState } from "./empty-state";
import { 
  ArrowRight, 
  RefreshCw,
  WifiOff
} from "lucide-react";

// Page Container with animation
interface PageContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  readonly padding?: boolean;
  readonly animate?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full"
};

export function PageContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = true,
  animate = true
}: PageContainerProps) {
  const Wrapper = animate ? motion.div : "div";
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Wrapper
      {...animationProps}
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padding && "px-4 sm:px-6 lg:px-8 py-6",
        className
      )}
    >
      {children}
    </Wrapper>
  );
}

// Page Header
interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly backButton?: boolean;
  readonly onBack?: () => void;
  readonly actions?: React.ReactNode;
  readonly breadcrumbs?: ReadonlyArray<{ label: string; href?: string }>;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  backButton,
  onBack,
  actions,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.label}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {backButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
              aria-label="رجوع"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Page Loading State
interface PageLoadingStateProps {
  readonly message?: string;
  readonly className?: string;
}

export function PageLoadingState({
  message = "جاري التحميل...",
  className
}: PageLoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px]",
        className
      )}
    >
      <LoadingSpinner size="lg" text={message} />
    </motion.div>
  );
}

// Page Error State
interface PageErrorStateProps {
  readonly title?: string;
  readonly message?: string;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export function PageErrorState({
  title = "حدث خطأ",
  message = "عذراً، حدث خطأ أثناء تحميل الصفحة",
  onRetry,
  className: _className
}: PageErrorStateProps) {
  return (
    <ErrorState
      title={title}
      description={message}
      action={onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 me-2" />
          إعادة المحاولة
        </Button>
      )}
    />
  );
}

// Page Empty State
interface PageEmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function PageEmptyState({
  icon,
  title,
  description,
  action,
  className
}: PageEmptyStateProps) {
  return (
    <EmptyState
      icon={icon ? () => icon : undefined}
      title={title}
      description={description || ""}
      action={action}
      className={className}
    />
  );
}

// Offline Indicator
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 start-0 end-0 z-50 bg-destructive text-destructive-foreground py-2 px-4 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">لا يوجد اتصال بالإنترنت</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Stats Grid
interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "danger";
}

interface StatsGridProps {
  readonly stats: StatItem[];
  readonly loading?: boolean;
  readonly columns?: 2 | 3 | 4;
  readonly className?: string;
}

const colorClasses = {
  default: "bg-card border",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-green-500/10 border-green-500/20",
  warning: "bg-yellow-500/10 border-yellow-500/20",
  danger: "bg-red-500/10 border-red-500/20"
};

const iconColorClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-green-500",
  warning: "text-yellow-500",
  danger: "text-red-500"
};

const STAT_SKELETON_KEYS = ['stat-a', 'stat-b', 'stat-c', 'stat-d'] as const;

export function StatsGrid({
  stats,
  loading = false,
  columns = 4,
  className
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  };

  if (loading) {
    return (
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {STAT_SKELETON_KEYS.slice(0, columns).map((key) => (
          <div key={key} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "rounded-lg border p-4 transition-shadow hover:shadow-md",
            colorClasses[stat.color || "default"]
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
            {stat.icon && (
              <div className={cn(
                "p-2 rounded-full bg-background/50",
                iconColorClasses[stat.color || "default"]
              )}>
                {stat.icon}
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">{stat.value}</span>
            {stat.change && (
              <span className={cn(
                "text-sm font-medium",
                stat.change.type === "increase" && "text-green-500",
                stat.change.type === "decrease" && "text-red-500",
                stat.change.type === "neutral" && "text-muted-foreground"
              )}>
                {stat.change.type === "increase" && "+"}
                {stat.change.value}%
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Section Container
interface SectionProps {
  readonly title?: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly collapsible?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly className?: string;
}

export function Section({
  title,
  description,
  children,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  className
}: SectionProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Helper function to render title
  const renderTitle = () => {
    if (!title) return null;
    if (collapsible) {
      return (
        <button
          type="button"
          className={cn(
            "text-lg font-semibold cursor-pointer select-none text-start",
            "hover:text-primary transition-colors"
          )}
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={collapsed ? "false" : "true"}
        >
          {title}
        </button>
      );
    }
    return <h2 className="text-lg font-semibold">{title}</h2>;
  };

  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {renderTitle()}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Content Card
interface ContentCardProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly actions?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly className?: string;
  readonly padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8"
};

export function ContentCard({
  children,
  title,
  description,
  actions,
  footer,
  className,
  padding = "md"
}: ContentCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card shadow-sm", className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>

      {footer && (
        <div className="p-4 sm:p-6 border-t bg-muted/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export type { 
  PageContainerProps, 
  PageHeaderProps, 
  PageLoadingStateProps,
  PageErrorStateProps,
  PageEmptyStateProps,
  StatItem,
  StatsGridProps,
  SectionProps,
  ContentCardProps
};
