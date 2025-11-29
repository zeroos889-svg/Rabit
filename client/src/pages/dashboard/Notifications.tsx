import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  Check,
  Filter,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type NotificationType = "success" | "warning" | "error" | "info" | "system";

interface NotificationItem {
  id: number;
  read: boolean;
  type?: NotificationType;
  title?: string;
  message?: string;
  body?: string;
  createdAt?: string | Date;
}

export default function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, refetch } = trpc.notifications.getAll.useQuery(
    { limit: 100 },
    { refetchInterval: 30000 }
  );
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n: NotificationItem) => !n.read) : notifications;

  const markAsReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllAsReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("تم تحديد كل الإشعارات كمقروءة");
      refetch();
    },
  });
  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الإشعار");
      refetch();
    },
  });

  const markAsRead = (id: number) => markAsReadMutation.mutate({ id });
  const markAllAsRead = () => markAllAsReadMutation.mutate();
  const deleteNotification = (id: number) => deleteMutation.mutate({ id });

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "info":
      case "system":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getNotificationBgColor = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getNotificationActionUrl = (
    notification: (typeof notifications)[number]
  ) => {
    const metadata = notification.metadata as
      | { link?: unknown; actionUrl?: unknown }
      | undefined;

    if (metadata?.actionUrl && typeof metadata.actionUrl === "string") {
      return metadata.actionUrl;
    }

    if (metadata?.link && typeof metadata.link === "string") {
      return metadata.link;
    }

    return undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            الإشعارات
          </h1>
          <p className="text-muted-foreground mt-2">
            جميع التحديثات والإشعارات المهمة
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="me-2 h-4 w-4" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الكل</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">غير مقروءة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {unreadCount}
                </p>
              </div>
              <Badge
                variant="default"
                className="h-8 w-8 rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مقروءة</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">اليوم</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    notifications.filter((n: NotificationItem) => {
                      const diff =
                        Date.now() - new Date(n.createdAt ?? Date.now()).getTime();
                      return diff < 24 * 60 * 60 * 1000;
                    }).length
                  }
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CardTitle>تصفية الإشعارات</CardTitle>
            </div>
            <Tabs
              value={filter}
              onValueChange={v => setFilter(v as "all" | "unread")}
            >
              <TabsList>
                <TabsTrigger value="all">
                  الكل ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  غير مقروءة ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "جميع الإشعارات مقروءة! 🎉"
                  : "لا توجد إشعارات حالياً"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification: NotificationItem) => {
            const actionUrl = getNotificationActionUrl(notification);

            return (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-r-4 border-r-primary" : ""
                } ${getNotificationBgColor(notification.type)}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">
                                جديد
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ar,
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title="تحديد كمقروء"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Action Button */}
                      {actionUrl && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(actionUrl, "_blank")}
                          >
                            عرض التفاصيل
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
