import { cn } from "@/lib/utils";
import type React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Enhanced Skeleton component with shimmer effect
 */
function Skeleton({ className, ...props }: Readonly<SkeletonProps>) {
  return (
    <div
      data-slot="skeleton"
      data-testid="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card Skeleton for dashboard cards
 */
function SkeletonCard({ className, ...props }: Readonly<SkeletonProps>) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

/**
 * Table Row Skeleton
 */
function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

/**
 * Consultation Card Skeleton
 */
function ConsultationCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

const CardSkeleton = SkeletonCard;

export { Skeleton, SkeletonCard, CardSkeleton, TableRowSkeleton, ConsultationCardSkeleton };

