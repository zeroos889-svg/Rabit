import { useEffect, useState } from "react";

/**
 * PWA Install Prompt Hook
 * Manages PWA installation prompt and provides install functionality
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePWAInstallReturn {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const isInStandaloneMode = 
        standalone ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      
      setIsStandalone(isInStandaloneMode);
      setIsInstalled(isInStandaloneMode);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log("Install prompt not available");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
  };

  const dismissPrompt = () => {
    setDeferredPrompt(null);
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    isStandalone,
    promptInstall,
    dismissPrompt,
  };
}

/**
 * Hook for monitoring online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[PWA] Back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[PWA] Gone offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Service Worker Registration Hook
 */
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.log("[PWA] Service Worker not supported");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setIsRegistered(true);
        console.log("[PWA] Service Worker registered:", reg.scope);

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA] Update available");
              setIsUpdateAvailable(true);
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, []);

  const updateServiceWorker = () => {
    if (!registration || !registration.waiting) return;

    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload page when new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  };

  const unregisterServiceWorker = async () => {
    if (!registration) return;

    try {
      const success = await registration.unregister();
      if (success) {
        console.log("[PWA] Service Worker unregistered");
        setIsRegistered(false);
        setRegistration(null);
      }
    } catch (error) {
      console.error("[PWA] Service Worker unregistration failed:", error);
    }
  };

  return {
    registration,
    isRegistered,
    isUpdateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}
