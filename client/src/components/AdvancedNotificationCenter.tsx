import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export type NotificationType = "info" | "success" | "warning" | "error" | "message" | "reminder" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: Date;
  read: boolean;
  href?: string;
  actionLabel?: string;
  actionLabelAr?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  message: MessageSquare,
  reminder: Calendar,
  system: Settings,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  message: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  reminder: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  system: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// Mock notifications - Replace with real data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Leave Request Approved",
    titleAr: "تمت الموافقة على طلب الإجازة",
    message: "Your leave request for Dec 1-5 has been approved.",
    messageAr: "تمت الموافقة على طلب إجازتك من 1-5 ديسمبر.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Meeting in 30 minutes",
    titleAr: "اجتماع بعد 30 دقيقة",
    message: "Team standup meeting starts at 10:00 AM",
    messageAr: "اجتماع الفريق اليومي يبدأ الساعة 10:00 صباحاً",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New message from HR",
    titleAr: "رسالة جديدة من الموارد البشرية",
    message: "Please update your emergency contact information.",
    messageAr: "يرجى تحديث معلومات الاتصال في حالات الطوارئ.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: "4",
    type: "warning",
    title: "Document Expiring Soon",
    titleAr: "وثيقة ستنتهي صلاحيتها قريباً",
    message: "Your ID card will expire in 30 days.",
    messageAr: "ستنتهي صلاحية بطاقة هويتك خلال 30 يوماً.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "New Policy Update",
    titleAr: "تحديث سياسة جديد",
    message: "Company remote work policy has been updated.",
    messageAr: "تم تحديث سياسة العمل عن بعد للشركة.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
];

interface NotificationItemProps {
  notification: Notification;
  isArabic: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({
  notification,
  isArabic,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const colorClass = NOTIFICATION_COLORS[notification.type];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border-b transition-colors",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
            {isArabic ? notification.titleAr : notification.title}
          </h4>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDistanceToNow(notification.timestamp, {
              addSuffix: true,
              locale: isArabic ? ar : enUS,
            })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {isArabic ? notification.messageAr : notification.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              {isArabic ? "تحديد كمقروء" : "Mark as read"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {isArabic ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AdvancedNotificationCenterProps {
  trigger?: React.ReactNode;
}

export function AdvancedNotificationCenter({ trigger }: AdvancedNotificationCenterProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={isArabic ? "left" : "right"} className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {isArabic ? "الإشعارات" : "Notifications"}
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount}</Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {isArabic ? "قراءة الكل" : "Read all"}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full">
              <TabsTrigger
                value="all"
                className="flex-1"
                onClick={() => setFilter("all")}
              >
                {isArabic ? "الكل" : "All"}
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1"
                onClick={() => setFilter("unread")}
              >
                {isArabic ? "غير مقروء" : "Unread"}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-4 opacity-20" />
                  <p>{isArabic ? "لا توجد إشعارات" : "No notifications"}</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isArabic={isArabic}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                  <p>{isArabic ? "لا توجد إشعارات غير مقروءة" : "No unread notifications"}</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isArabic={isArabic}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isArabic ? "مسح جميع الإشعارات" : "Clear all notifications"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default AdvancedNotificationCenter;
