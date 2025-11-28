import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check browser support
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission as PermissionState);
    } else {
      setPermission('unsupported');
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('غير مدعوم', {
        description: 'المتصفح لا يدعم الإشعارات الفورية',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      
      if (result === 'granted') {
        toast.success('تم تفعيل الإشعارات', {
          description: 'ستتلقى الإشعارات الفورية الآن',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('تم رفض الإشعارات', {
          description: 'يمكنك تفعيلها من إعدادات المتصفح',
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscriptionData | null> => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get the server's public VAPID key
      // In production, this would come from your server
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      const subscriptionJSON = sub.toJSON();
      const pushSubscription: PushSubscriptionData = {
        endpoint: subscriptionJSON.endpoint || '',
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
        },
      };

      setSubscription(pushSubscription);

      // Send subscription to server
      // await fetch('/api/push/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pushSubscription),
      // });

      toast.success('تم الاشتراك', {
        description: 'أنت الآن مشترك في الإشعارات الفورية',
      });

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('خطأ', {
        description: 'فشل الاشتراك في الإشعارات الفورية',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        await sub.unsubscribe();
        setSubscription(null);

        // Notify server
        // await fetch('/api/push/unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ endpoint: sub.endpoint }),
        // });

        toast.success('تم إلغاء الاشتراك', {
          description: 'لن تتلقى إشعارات فورية بعد الآن',
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, []);

  // Show local notification
  const showNotification = useCallback(async (
    options: PushNotificationOptions
  ): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      });

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Show notification with fallback to toast
  const notify = useCallback(async (
    title: string,
    body: string,
    options?: Partial<PushNotificationOptions>
  ): Promise<void> => {
    if (permission === 'granted') {
      await showNotification({ title, body, ...options });
    } else {
      // Fallback to toast notification
      toast.info(title, {
        description: body,
      });
    }
  }, [permission, showNotification]);

  // Check current subscription status
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        const subscriptionJSON = sub.toJSON();
        setSubscription({
          endpoint: subscriptionJSON.endpoint || '',
          keys: {
            p256dh: subscriptionJSON.keys?.p256dh || '',
            auth: subscriptionJSON.keys?.auth || '',
          },
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }, [isSupported]);

  // Initialize on mount
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      checkSubscription();
    }
  }, [isSupported, permission, checkSubscription]);

  return {
    // State
    permission,
    isSupported,
    isSubscribed: !!subscription,
    subscription,
    isLoading,
    
    // Actions
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    notify,
    checkSubscription,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

export default usePushNotifications;
