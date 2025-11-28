/**
 * Notification Bell Component
 * مكون جرس الإشعارات
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Skeleton } from "./skeleton";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// Types
interface Notification {
  id: number;
  title: string;
  body: string;
  type?: "info" | "success" | "warning" | "error" | "system";
  read: boolean;
  createdAt: Date | string;
  link?: string | null;
  icon?: string | null;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  connected?: boolean;
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: number) => void;
  onDeleteAll?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

// Icon mapping
const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  system: Bell,
};

const typeColors = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  system: "text-muted-foreground",
};

// Single Notification Item
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (notification: Notification) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: Readonly<NotificationItemProps>) {
  const Icon = typeIcons[notification.type || "info"];
  const colorClass = typeColors[notification.type || "info"];

  const timeAgo = React.useMemo(() => {
    const date = typeof notification.createdAt === "string" 
      ? new Date(notification.createdAt) 
      : notification.createdAt;
    return formatDistanceToNow(date, { addSuffix: true, locale: ar });
  }, [notification.createdAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-colors",
        notification.read 
          ? "bg-transparent hover:bg-muted/50" 
          : "bg-primary/5 hover:bg-primary/10"
      )}
      onClick={() => onClick?.(notification)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 start-1 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className="flex gap-3 ps-3">
        {/* Icon */}
        <div className={cn("mt-0.5 shrink-0", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium line-clamp-1",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo}
          </p>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.read && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notification.id);
                  }}
                >
                  <Check className="h-4 w-4 me-2" />
                  تحديد كمقروء
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notification.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 me-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

const NOTIFICATION_SKELETON_KEYS = ['notif-skeleton-a', 'notif-skeleton-b', 'notif-skeleton-c'] as const;

// Loading skeleton
function NotificationSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {NOTIFICATION_SKELETON_KEYS.map((key) => (
        <div key={key} className="flex gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">لا توجد إشعارات</p>
      <p className="text-xs text-muted-foreground mt-1">
        ستظهر إشعاراتك هنا
      </p>
    </div>
  );
}

// Main Component
export function NotificationBell({
  notifications,
  unreadCount,
  loading = false,
  connected = true,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onSettingsClick,
  onNotificationClick,
  className,
}: Readonly<NotificationBellProps>) {
  const [open, setOpen] = React.useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    if (notification.link) {
      globalThis.location.href = notification.link;
    }
    onNotificationClick?.(notification);
    setOpen(false);
  };

  const renderContent = () => {
    if (loading) {
      return <NotificationSkeleton />;
    }
    if (notifications.length === 0) {
      return <EmptyNotifications />;
    }
    return (
      <div className="p-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              onClick={handleNotificationClick}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          
          {/* Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "absolute -top-1 -end-1 flex items-center justify-center",
                  "min-w-[18px] h-[18px] px-1 rounded-full",
                  "bg-destructive text-destructive-foreground",
                  "text-[10px] font-medium"
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Connection indicator */}
          {!connected && (
            <span className="absolute bottom-0 end-0 w-2 h-2 rounded-full bg-yellow-500" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        className="w-80 sm:w-96 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-4 w-4 me-1" />
                تحديد الكل كمقروء
              </Button>
            )}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[400px]">
          {renderContent()}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteAll}
              className="w-full text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 me-2" />
              حذف جميع الإشعارات
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Notification Badge only (for use in other places)
interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: Readonly<NotificationBadgeProps>) {
  if (count <= 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={cn(
        "inline-flex items-center justify-center",
        "min-w-[20px] h-5 px-1.5 rounded-full",
        "bg-destructive text-destructive-foreground",
        "text-xs font-medium",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

export type { Notification, NotificationBellProps };
