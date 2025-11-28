/**
 * Real-time Notifications Hook and Provider
 * نظام الإشعارات في الوقت الحقيقي
 */
import * as React from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Types
export interface Notification {
  id: number;
  userId?: number | null;
  title: string;
  body: string;
  type?: "info" | "success" | "warning" | "error" | "system";
  read: boolean;
  createdAt: Date | string;
  metadata?: Record<string, unknown>;
  link?: string | null;
  icon?: string | null;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  connected: boolean;
  // Actions
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refetch: () => void;
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

// Socket instance (singleton)
let socket: Socket | null = null;

function getSocket(): Socket | null {
  if (globalThis.window === undefined) return null;
  
  if (!socket) {
    const wsUrl = import.meta.env.VITE_WS_URL || globalThis.location.origin;
    socket = io(wsUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });
  }
  
  return socket;
}

// Provider Component
interface NotificationProviderProps {
  children: React.ReactNode;
  userId?: number | null;
  enableRealtime?: boolean;
  enableToasts?: boolean;
}

export function NotificationProvider({
  children,
  userId,
  enableRealtime = true,
  enableToasts = true,
}: Readonly<NotificationProviderProps>) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  // tRPC queries
  const notificationsQuery = trpc.notifications?.list?.useQuery(
    { limit: 50 },
    { 
      enabled: !!userId,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    }
  );

  const unreadCountQuery = trpc.notifications?.unreadCount?.useQuery(
    undefined,
    { 
      enabled: !!userId,
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Mutations
  const markAsReadMutation = trpc.notifications?.markAsRead?.useMutation();
  const markAllAsReadMutation = trpc.notifications?.markAllAsRead?.useMutation();
  const deleteMutation = trpc.notifications?.delete?.useMutation();
  const deleteAllMutation = trpc.notifications?.deleteAll?.useMutation();

  // Update state from queries
  React.useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data as Notification[]);
    }
  }, [notificationsQuery.data]);

  React.useEffect(() => {
    if (typeof unreadCountQuery.data === "number") {
      setUnreadCount(unreadCountQuery.data);
    }
  }, [unreadCountQuery.data]);

  // WebSocket connection
  React.useEffect(() => {
    if (!enableRealtime || !userId) return;

    const ws = getSocket();
    if (!ws) return;

    // Connect
    ws.connect();

    // Event handlers
    const handleConnect = () => {
      setConnected(true);
      ws.emit("join", { userId });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleNotification = (notification: Notification) => {
      // Add to list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      if (enableToasts) {
        const toastType = notification.type || "info";
        const getToastFn = () => {
          if (toastType === "success") return toast.success;
          if (toastType === "error") return toast.error;
          if (toastType === "warning") return toast.warning;
          return toast.info;
        };
        const toastFn = getToastFn();

        toastFn(notification.title, {
          description: notification.body,
          action: notification.link ? {
            label: "عرض",
            onClick: () => {
              if (notification.link) {
                globalThis.location.href = notification.link;
              }
            },
          } : undefined,
        });
      }
    };

    const handleError = (err: Error) => {
      setError(err);
      console.error("WebSocket error:", err);
    };

    // Attach listeners
    ws.on("connect", handleConnect);
    ws.on("disconnect", handleDisconnect);
    ws.on("notification", handleNotification);
    ws.on("error", handleError);

    // Cleanup
    return () => {
      ws.off("connect", handleConnect);
      ws.off("disconnect", handleDisconnect);
      ws.off("notification", handleNotification);
      ws.off("error", handleError);
      ws.disconnect();
    };
  }, [userId, enableRealtime, enableToasts]);

  // Actions
  const markAsRead = React.useCallback(async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ id });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      throw err;
    }
  }, [markAsReadMutation]);

  const markAllAsRead = React.useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      throw err;
    }
  }, [markAllAsReadMutation]);

  const deleteNotification = React.useCallback(async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id);
      await deleteMutation.mutateAsync({ id });
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      throw err;
    }
  }, [deleteMutation, notifications]);

  const deleteAllNotifications = React.useCallback(async () => {
    try {
      await deleteAllMutation.mutateAsync();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
      throw err;
    }
  }, [deleteAllMutation]);

  const refetch = React.useCallback(() => {
    notificationsQuery.refetch();
    unreadCountQuery.refetch();
  }, [notificationsQuery, unreadCountQuery]);

  const value = React.useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount,
    loading: notificationsQuery.isLoading,
    error,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  }), [
    notifications,
    unreadCount,
    notificationsQuery.isLoading,
    error,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotifications() {
  const context = React.useContext(NotificationContext);
  
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  
  return context;
}

// Hook for notification preferences
export function useNotificationPreferences() {
  const prefsQuery = trpc.notifications?.getPreferences?.useQuery();
  const updatePrefsMutation = trpc.notifications?.updatePreferences?.useMutation();

  const updatePreferences = React.useCallback(async (prefs: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
  }) => {
    return updatePrefsMutation.mutateAsync(prefs);
  }, [updatePrefsMutation]);

  return {
    preferences: prefsQuery.data,
    loading: prefsQuery.isLoading,
    error: prefsQuery.error,
    updatePreferences,
    isUpdating: updatePrefsMutation.isPending,
  };
}

// Utility hook for showing notifications
export function useNotify() {
  return React.useCallback((
    type: "info" | "success" | "warning" | "error",
    title: string,
    description?: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ) => {
    const getToastFn = () => {
      if (type === "success") return toast.success;
      if (type === "error") return toast.error;
      if (type === "warning") return toast.warning;
      return toast.info;
    };
    const toastFn = getToastFn();

    toastFn(title, {
      description,
      duration: options?.duration,
      action: options?.action,
    });
  }, []);
}
