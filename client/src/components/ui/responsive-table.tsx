/**
 * Responsive Table Component
 * جدول متجاوب مع الأجهزة المختلفة
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

// Helper function to safely convert values to string
function safeToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    // Handle Date objects
    if (value instanceof Date) return value.toLocaleDateString("ar-SA");
    // For other objects, return empty or a meaningful representation
    return "";
  }
  return "";
}

// Types
interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
  // Mobile configuration
  hideOnMobile?: boolean;
  priority?: number; // Lower = more important, shown first on mobile
}

interface ResponsiveTableProps<T> {
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly keyExtractor: (item: T, index: number) => string | number;
  readonly loading?: boolean;
  readonly emptyMessage?: string;
  readonly emptyIcon?: React.ReactNode;
  readonly onRowClick?: (item: T, index: number) => void;
  readonly className?: string;
  readonly stickyHeader?: boolean;
  readonly striped?: boolean;
  readonly hoverable?: boolean;
  readonly compact?: boolean;
  // Sorting
  readonly sortColumn?: string;
  readonly sortDirection?: "asc" | "desc";
  readonly onSort?: (column: string) => void;
  // Mobile card view
  readonly mobileCardRender?: (item: T, index: number) => React.ReactNode;
  readonly expandedMobileView?: boolean;
}

// Loading skeleton for table
interface TableSkeletonProps {
  readonly columns: number;
  readonly rows?: number;
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`skeleton-row-${String(rowIndex)}`} className="flex gap-4 py-3 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`skeleton-${String(rowIndex)}-${String(colIndex)}`} 
              className={cn(
                "h-5",
                colIndex === 0 ? "w-12" : "flex-1"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Mobile Card Props
interface MobileCardProps<T> {
  readonly item: T;
  readonly index: number;
  readonly columns: Column<T>[];
  readonly onRowClick?: (item: T, index: number) => void;
  readonly render?: (item: T, index: number) => React.ReactNode;
}

// Mobile Card Component
function MobileCard<T>({ 
  item, 
  index,
  columns, 
  onRowClick,
  render 
}: MobileCardProps<T>) {
  const [expanded, setExpanded] = React.useState(false);
  
  // Sort columns by priority for mobile
  const sortedColumns = [...columns].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  const primaryColumns = sortedColumns.slice(0, 3);
  const secondaryColumns = sortedColumns.slice(3);

  if (render) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => onRowClick?.(item, index)}
        className={cn(
          "rounded-lg border bg-card p-4 shadow-sm",
          onRowClick && "cursor-pointer hover:shadow-md transition-shadow"
        )}
      >
        {render(item, index)}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        onRowClick && "cursor-pointer"
      )}
      onClick={() => onRowClick?.(item, index)}
    >
      {/* Primary info */}
      <div className="space-y-2">
        {primaryColumns.map((col) => {
          const value = col.render 
            ? col.render(item, index) 
            : safeToString((item as Record<string, unknown>)[col.key as string]);
          
          return (
            <div key={String(col.key)} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{col.header}</span>
              <span className="font-medium">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Expandable secondary info */}
      {secondaryColumns.length > 0 && (
        <>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t space-y-2">
                  {secondaryColumns.map((col) => {
                    const value = col.render 
                      ? col.render(item, index) 
                      : safeToString((item as Record<string, unknown>)[col.key as string]);
                    
                    return (
                      <div key={String(col.key)} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{col.header}</span>
                        <span className="text-sm">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-full mt-2 text-muted-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 me-1" />
                عرض أقل
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 me-1" />
                عرض المزيد
              </>
            )}
          </Button>
        </>
      )}
    </motion.div>
  );
}

// Sort Icon Props
interface SortIconProps {
  readonly column: string;
  readonly sortColumn?: string;
  readonly sortDirection?: "asc" | "desc";
}

// Sort Icon Component
function SortIcon({ column, sortColumn, sortDirection }: SortIconProps) {
  if (sortColumn !== column) {
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />;
  }
  return sortDirection === "asc" 
    ? <ChevronUp className="h-4 w-4" /> 
    : <ChevronDown className="h-4 w-4" />;
}

// Main Component
export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  emptyIcon,
  onRowClick,
  className,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  compact = false,
  sortColumn,
  sortDirection,
  onSort,
  mobileCardRender,
  expandedMobileView: _expandedMobileView = true,
}: ResponsiveTableProps<T>) {
  // Filter columns for desktop (non-hidden)
  const desktopColumns = columns.filter(col => !col.hideOnMobile);
  
  if (loading) {
    return (
      <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
        <div className="p-4">
          <TableSkeleton columns={columns.length} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {emptyIcon && <div className="mb-4 text-muted-foreground">{emptyIcon}</div>}
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className={cn(
            "bg-muted/50",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {desktopColumns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "text-start px-4 py-3 font-medium text-muted-foreground",
                    compact ? "text-xs" : "text-sm",
                    col.sortable && "cursor-pointer select-none hover:bg-muted/80",
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <SortIcon 
                        column={String(col.key)} 
                        sortColumn={sortColumn} 
                        sortDirection={sortDirection} 
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {data.map((item, index) => (
                <motion.tr
                  key={keyExtractor(item, index)}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onRowClick?.(item, index)}
                  className={cn(
                    "border-b transition-colors",
                    hoverable && "hover:bg-muted/50",
                    striped && index % 2 === 1 && "bg-muted/20",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {desktopColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-4",
                        compact ? "py-2 text-sm" : "py-3",
                        col.className
                      )}
                    >
                      {col.render 
                        ? col.render(item, index) 
                        : safeToString((item as Record<string, unknown>)[col.key as string])}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {data.map((item, index) => (
            <MobileCard
              key={keyExtractor(item, index)}
              item={item}
              index={index}
              columns={columns}
              onRowClick={onRowClick}
              render={mobileCardRender}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Re-export types for external use
export type { Column, ResponsiveTableProps };
