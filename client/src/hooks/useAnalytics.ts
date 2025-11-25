import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import analytics from "@/lib/analytics";

/**
 * Hook to track page views automatically
 */
export function usePageTracking() {
  const [location] = useLocation();
  const previousLocation = useRef(location);

  useEffect(() => {
    if (previousLocation.current !== location) {
      analytics.trackPageView({
        page_path: location,
        page_title: document.title,
      });
      previousLocation.current = location;
    }
  }, [location]);
}

/**
 * Hook to initialize analytics on mount
 */
export function useAnalytics(measurementId?: string) {
  useEffect(() => {
    if (!measurementId) return;

    analytics.init({
      measurementId,
      enableDebug: process.env.NODE_ENV === "development",
      enableUserTracking: process.env.NODE_ENV === "production",
    });
  }, [measurementId]);
}

/**
 * Hook to track user properties
 */
export function useUserTracking(userId?: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    if (userId) {
      analytics.setUserId(userId);
    }
    if (properties) {
      analytics.setUserProperties(properties);
    }
  }, [userId, properties]);
}

/**
 * Hook to track consultation events
 */
export function useConsultationTracking() {
  return {
    trackStart: (type: string, consultantId: string) => {
      analytics.consultations.started(type, consultantId);
    },
    trackComplete: (id: string, duration: number, rating?: number) => {
      analytics.consultations.completed(id, duration, rating);
    },
    trackBooking: (type: string, price: number) => {
      analytics.consultations.booked(type, price);
    },
    trackCancel: (id: string, reason?: string) => {
      analytics.consultations.cancelled(id, reason);
    },
  };
}

/**
 * Hook to track calculator usage
 */
export function useCalculatorTracking() {
  return {
    trackUsage: (type: string) => {
      analytics.calculators.used(type);
    },
    trackResult: (type: string, result: Record<string, unknown>) => {
      analytics.calculators.resultViewed(type, result);
    },
  };
}

/**
 * Hook to track authentication events
 */
export function useAuthTracking() {
  return {
    trackSignup: (method: string, userType: string) => {
      analytics.auth.signUp(method, userType);
    },
    trackLogin: (method: string) => {
      analytics.auth.login(method);
    },
    trackLogout: () => {
      analytics.auth.logout();
    },
  };
}

/**
 * Hook to track search events
 */
export function useSearchTracking() {
  const searchCache = useRef(new Set<string>());

  return (searchTerm: string, resultCount: number) => {
    // Avoid tracking duplicate searches
    const cacheKey = `${searchTerm}-${resultCount}`;
    if (searchCache.current.has(cacheKey)) return;

    analytics.search(searchTerm, resultCount);
    searchCache.current.add(cacheKey);

    // Clear cache after 5 minutes
    setTimeout(() => {
      searchCache.current.delete(cacheKey);
    }, 300000);
  };
}

/**
 * Hook to track errors
 */
export function useErrorTracking() {
  return (errorMessage: string, errorType: string, fatal: boolean = false) => {
    analytics.trackError(errorMessage, errorType, fatal);
  };
}

/**
 * Hook to track performance metrics
 */
export function usePerformanceTracking() {
  return (metricName: string, value: number, unit: string = "ms") => {
    analytics.trackPerformance(metricName, value, unit);
  };
}

/**
 * Hook to track custom events
 */
export function useEventTracking() {
  return (eventName: string, params?: Record<string, unknown>) => {
    analytics.trackEvent(eventName, params);
  };
}

/**
 * Hook to track button clicks
 */
export function useClickTracking(
  elementName: string,
  category: string = "User Interaction"
) {
  return () => {
    analytics.trackEvent("click", {
      category,
      element_name: elementName,
    });
  };
}

/**
 * Hook to track form submissions
 */
export function useFormTracking(formName: string) {
  return {
    trackStart: () => {
      analytics.trackEvent("form_start", {
        category: "Forms",
        form_name: formName,
      });
    },
    trackComplete: (duration: number) => {
      analytics.trackEvent("form_complete", {
        category: "Forms",
        form_name: formName,
        duration_seconds: duration,
      });
    },
    trackError: (fieldName: string, errorMessage: string) => {
      analytics.trackEvent("form_error", {
        category: "Forms",
        form_name: formName,
        field_name: fieldName,
        error_message: errorMessage,
      });
    },
    trackAbandon: (lastField: string) => {
      analytics.trackEvent("form_abandon", {
        category: "Forms",
        form_name: formName,
        last_field: lastField,
      });
    },
  };
}

/**
 * Hook to track video interactions
 */
export function useVideoTracking(videoName: string) {
  return {
    trackPlay: () => {
      analytics.trackEvent("video_play", {
        category: "Video",
        video_name: videoName,
      });
    },
    trackPause: (currentTime: number) => {
      analytics.trackEvent("video_pause", {
        category: "Video",
        video_name: videoName,
        current_time: currentTime,
      });
    },
    trackComplete: (duration: number) => {
      analytics.trackEvent("video_complete", {
        category: "Video",
        video_name: videoName,
        duration,
      });
    },
    trackProgress: (percentage: number) => {
      analytics.trackEvent("video_progress", {
        category: "Video",
        video_name: videoName,
        progress_percentage: percentage,
      });
    },
  };
}

/**
 * Hook to track file downloads
 */
export function useDownloadTracking() {
  return (fileName: string, fileType: string, fileSize?: number) => {
    analytics.trackEvent("file_download", {
      category: "Downloads",
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    });
  };
}

/**
 * Hook to track social sharing
 */
export function useSocialTracking() {
  return (platform: string, contentType: string, contentId?: string) => {
    analytics.trackEvent("share", {
      category: "Social",
      platform,
      content_type: contentType,
      content_id: contentId,
    });
  };
}
