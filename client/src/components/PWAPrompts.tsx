import { useEffect, useState } from "react";
import { X, Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { usePWAInstall, useServiceWorker } from "@/hooks/usePWA";
import { toast } from "@/lib/toast";

/**
 * PWA Install Prompt Component
 * Shows install prompt when app can be installed
 */
export function PWAInstallPrompt() {
  const { canInstall, isInstalled, promptInstall, dismissPrompt } = usePWAInstall();

  if (!canInstall || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    await promptInstall();
    toast.success("تم تثبيت التطبيق بنجاح! 🎉");
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              ثبّت تطبيق رابِط
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              احصل على تجربة أفضل مع التطبيق المثبت على جهازك
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                تثبيت
              </Button>
              <Button
                onClick={dismissPrompt}
                variant="outline"
                size="sm"
                className="px-3"
              >
                لاحقاً
              </Button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Service Worker Update Prompt
 * Shows when new version is available
 */
export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isUpdateAvailable) {
      toast.info("تحديث جديد متاح!", {
        description: "اضغط هنا لتحديث التطبيق",
        duration: 10000,
        action: {
          label: "تحديث",
          onClick: updateServiceWorker,
        },
      });
    }
  }, [isUpdateAvailable, updateServiceWorker]);

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-top-5">
      <Card className="p-4 shadow-lg border-2 border-blue-500/20 bg-blue-50 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">تحديث جديد متاح</h3>
            <p className="text-sm text-muted-foreground mb-3">
              يتوفر إصدار جديد من التطبيق مع تحسينات وميزات جديدة
            </p>
            <Button
              onClick={updateServiceWorker}
              size="sm"
              className="w-full"
              variant="default"
            >
              <RefreshCw className="me-2 h-4 w-4" />
              تحديث الآن
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Offline Indicator
 * Shows when user is offline
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("عُدت متصلاً بالإنترنت");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("أنت الآن غير متصل بالإنترنت", {
        description: "بعض الميزات قد لا تعمل",
        duration: 0, // Keep showing until online
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
      ⚠️ أنت الآن غير متصل بالإنترنت - بعض الميزات قد لا تعمل
    </div>
  );
}
