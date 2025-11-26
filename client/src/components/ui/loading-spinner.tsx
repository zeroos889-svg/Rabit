import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={cn(sizes[size], "text-primary")} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "جاري التحميل..." }: PageLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <LoadingSpinner size="xl" text={message} />
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-lg">
      <div className="space-y-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  const items = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="space-y-3">
      {items.map((index) => (
        <div key={`skeleton-row-${index}`} className="flex gap-4">
          <div className="h-12 w-full animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
