/**
 * Mobile Navigation Components
 * مكونات التنقل المحسنة للموبايل
 */
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { 
  Menu, 
  ChevronLeft
} from "lucide-react";

// Types
interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
}

interface MobileNavProps {
  readonly items: NavItem[];
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly currentPath?: string;
  readonly onNavigate?: (item: NavItem) => void;
  readonly className?: string;
}

// Navigation Item Component Props
interface NavItemComponentProps {
  readonly item: NavItem;
  readonly level?: number;
  readonly currentPath?: string;
  readonly onNavigate?: (item: NavItem) => void;
  readonly onExpand?: () => void;
}

function NavItemComponent({ 
  item, 
  level = 0,
  currentPath,
  onNavigate,
  onExpand 
}: NavItemComponentProps) {
  const [expanded, setExpanded] = React.useState(false);
  const isActive = currentPath === item.href;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.disabled) return;
    
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.onClick) {
      item.onClick();
      onExpand?.();
    } else if (item.href) {
      onNavigate?.(item);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
          "text-start",
          level > 0 && "ps-8",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-muted text-foreground",
          item.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {item.icon && (
          <span className={cn("flex-shrink-0", isActive && "text-primary-foreground")}>
            {item.icon}
          </span>
        )}
        <span className="flex-1 font-medium">{item.label}</span>
        {item.badge && (
          <span className={cn(
            "px-2 py-0.5 text-xs rounded-full",
            isActive 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-primary/10 text-primary"
          )}>
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.span>
        )}
      </button>

      {/* Child Items */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-1">
              {item.children!.map((child) => (
                <NavItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  onExpand={onExpand}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile Navigation Sheet
export function MobileNav({
  items,
  header,
  footer,
  currentPath,
  onNavigate,
  className
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const handleNavigate = (item: NavItem) => {
    onNavigate?.(item);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className={cn("w-80 p-0 flex flex-col", className)}
      >
        {/* Header */}
        {header && (
          <div className="p-4 border-b">
            {header}
          </div>
        )}

        {/* Navigation Items */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {items.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                currentPath={currentPath}
                onNavigate={handleNavigate}
                onExpand={() => setOpen(false)}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t mt-auto">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Bottom Navigation Bar
interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface BottomNavProps {
  readonly items: BottomNavItem[];
  readonly activeId?: string;
  readonly onNavigate?: (item: BottomNavItem) => void;
  readonly className?: string;
}

export function BottomNav({ 
  items, 
  activeId, 
  onNavigate,
  className 
}: BottomNavProps) {
  return (
    <nav className={cn(
      "fixed bottom-0 start-0 end-0 z-50 md:hidden",
      "bg-background border-t shadow-lg",
      "pb-safe", // Safe area for notched phones
      className
    )}>
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onNavigate?.(item);
              }}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                "min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Action Button
interface FABProps {
  readonly icon: React.ReactNode;
  readonly onClick?: () => void;
  readonly label?: string;
  readonly className?: string;
  readonly position?: "bottom-right" | "bottom-left" | "bottom-center";
  readonly extended?: boolean;
}

export function FloatingActionButton({
  icon,
  onClick,
  label,
  className,
  position = "bottom-right",
  extended = false
}: FABProps) {
  const positionClasses = {
    "bottom-right": "bottom-20 md:bottom-6 end-4",
    "bottom-left": "bottom-20 md:bottom-6 start-4",
    "bottom-center": "bottom-20 md:bottom-6 start-1/2 -translate-x-1/2"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed z-40",
        positionClasses[position],
        "flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg",
        "hover:bg-primary/90 transition-colors",
        extended ? "px-5 py-3" : "p-4",
        className
      )}
    >
      {icon}
      {extended && label && (
        <span className="font-medium">{label}</span>
      )}
    </motion.button>
  );
}

// Pull to Refresh
interface PullToRefreshProps {
  readonly onRefresh: () => Promise<void>;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);
  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshing) return;
    if (containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn("overflow-auto", className)}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: pullDistance }}
            exit={{ height: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : (pullDistance / threshold) * 180 }}
              transition={refreshing ? { repeat: Infinity, duration: 1 } : {}}
              className="text-primary"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

// Swipeable Card
interface SwipeableCardProps {
  readonly children: React.ReactNode;
  readonly onSwipeLeft?: () => void;
  readonly onSwipeRight?: () => void;
  readonly leftAction?: React.ReactNode;
  readonly rightAction?: React.ReactNode;
  readonly className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}: SwipeableCardProps) {
  const threshold = 100;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Action backgrounds */}
      <div className="absolute inset-0 flex">
        {leftAction && (
          <div className="flex-1 bg-green-500 flex items-center justify-start px-4">
            {leftAction}
          </div>
        )}
        {rightAction && (
          <div className="flex-1 bg-red-500 flex items-center justify-end px-4">
            {rightAction}
          </div>
        )}
      </div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: rightAction ? -150 : 0, right: leftAction ? 150 : 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x > threshold && onSwipeRight) {
            onSwipeRight();
          } else if (info.offset.x < -threshold && onSwipeLeft) {
            onSwipeLeft();
          }
        }}
        animate={{ x: 0 }}
        className="bg-card relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

export type { NavItem, MobileNavProps, BottomNavItem, BottomNavProps, FABProps };
