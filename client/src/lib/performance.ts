/**
 * Performance Utilities
 *
 * Collection of utilities for monitoring and optimizing performance
 */

// Performance monitoring
export const performanceMonitor = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (duration > 16) {
      // More than 1 frame (60fps = 16.67ms per frame)
      console.warn(
        `⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`
      );
    }

    return duration;
  },

  /**
   * Mark performance milestone
   */
  mark: (name: string) => {
    if (typeof performance !== "undefined" && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure performance between two marks
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== "undefined" && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure?.duration || 0;
      } catch (e) {
        console.warn("Performance measurement failed:", e);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Get Web Vitals
   */
  getWebVitals: () => {
    if (typeof performance === "undefined") return null;

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (!navigation) return null;

    return {
      // Largest Contentful Paint (target: < 2.5s)
      lcp: navigation.domContentLoadedEventEnd - navigation.fetchStart,

      // First Input Delay (target: < 100ms)
      fid: 0, // Requires interaction measurement

      // Cumulative Layout Shift (target: < 0.1)
      cls: 0, // Requires layout shift observer

      // Time to First Byte (target: < 600ms)
      ttfb: navigation.responseStart - navigation.requestStart,

      // DOM Content Loaded (target: < 1.5s)
      dcl: navigation.domContentLoadedEventEnd - navigation.fetchStart,

      // Load Complete (target: < 3s)
      load: navigation.loadEventEnd - navigation.fetchStart,
    };
  },
};

// Bundle size optimization
export const bundleOptimizer = {
  /**
   * Check if module is loaded
   */
  isModuleLoaded: (_moduleName: string): boolean => {
    // This would need build-time analysis
    return false;
  },

  /**
   * Get bundle statistics (placeholder for build-time analysis)
   */
  getBundleStats: () => {
    return {
      total: 0,
      chunks: [],
      largestChunks: [],
    };
  },
};

// Cache utilities
export const cacheManager = {
  /**
   * Cache API response
   */
  cacheResponse: async (key: string, data: any, ttl: number = 3600000) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.warn("Cache storage failed:", e);
    }
  },

  /**
   * Get cached response
   */
  getCachedResponse: (key: string) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);

      // Check if expired
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (e) {
      console.warn("Cache retrieval failed:", e);
      return null;
    }
  },

  /**
   * Clear expired cache entries
   */
  clearExpired: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith("cache_")) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp, ttl } = JSON.parse(cached);
            if (Date.now() - timestamp > ttl) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (e) {
      console.warn("Cache cleanup failed:", e);
    }
  },
};

// Debounce and Throttle
export function debounce<T extends (..._args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(..._args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(..._args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (..._args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(..._args: Parameters<T>) {
    if (!inThrottle) {
      func(..._args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (_entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") {
    console.warn("IntersectionObserver not supported");
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "50px", // Start loading 50px before viewport
    threshold: 0.01,
    ...options,
  });
}

// Resource hints
export const resourceHints = {
  /**
   * Preload critical resource
   */
  preload: (href: string, as: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  /**
   * Prefetch resource for future navigation
   */
  prefetch: (href: string) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  },

  /**
   * Preconnect to origin
   */
  preconnect: (href: string) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    document.head.appendChild(link);
  },
};

// Report performance metrics (to analytics)
export function reportWebVitals(metric: {
  name: string;
  value: number;
  rating?: string;
}) {
  // Send to analytics
  if (process.env.NODE_ENV === "production") {
    console.log(`[Performance] ${metric.name}:`, metric.value, metric.rating);
    // Example: send to Google Analytics
    // gtag('event', metric.name, { value: metric.value });
  }
}

/**
 * Enhanced Web Vitals tracking with Core Web Vitals
 */
import { useEffect } from "react";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
}

interface WebVitalsConfig {
  reportCallback?: (metric: PerformanceMetric) => void;
  enableLogging?: boolean;
}

/**
 * Report Core Web Vitals metric
 */
function reportCoreMetric(metric: PerformanceMetric, config: WebVitalsConfig) {
  if (config.enableLogging) {
    console.log(`[Core Web Vitals] ${metric.name}:`, {
      value: metric.name === "CLS" ? metric.value.toFixed(3) : `${metric.value.toFixed(0)}ms`,
      rating: metric.rating,
    });
  }

  if (config.reportCallback) {
    config.reportCallback(metric);
  }

  // TODO: Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // Example: gtag('event', 'web_vitals', { metric_name: metric.name, value: metric.value, rating: metric.rating });
  }
}

/**
 * Get rating for Core Web Vitals
 */
function getCoreVitalsRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * React hook for tracking Core Web Vitals
 */
export function useWebVitals(config: WebVitalsConfig = {}) {
  useEffect(() => {
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS((metric) => {
        reportCoreMetric(
          {
            name: "CLS",
            value: metric.value,
            rating: getCoreVitalsRating("CLS", metric.value),
            timestamp: Date.now(),
          },
          config
        );
      });

      onFCP((metric) => {
        reportCoreMetric(
          {
            name: "FCP",
            value: metric.value,
            rating: getCoreVitalsRating("FCP", metric.value),
            timestamp: Date.now(),
          },
          config
        );
      });

      onLCP((metric) => {
        reportCoreMetric(
          {
            name: "LCP",
            value: metric.value,
            rating: getCoreVitalsRating("LCP", metric.value),
            timestamp: Date.now(),
          },
          config
        );
      });

      onTTFB((metric) => {
        reportCoreMetric(
          {
            name: "TTFB",
            value: metric.value,
            rating: getCoreVitalsRating("TTFB", metric.value),
            timestamp: Date.now(),
          },
          config
        );
      });

      onINP((metric) => {
        reportCoreMetric(
          {
            name: "INP",
            value: metric.value,
            rating: getCoreVitalsRating("INP", metric.value),
            timestamp: Date.now(),
          },
          config
        );
      });
    }).catch((error) => {
      console.error("Failed to load web-vitals:", error);
    });
  }, [config]);
}

/**
 * Calculate performance score (0-100) based on Core Web Vitals
 */
export function calculatePerformanceScore(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
}): number {
  let score = 100;

  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 40;
    else if (metrics.lcp > 2500) score -= 20;
  }

  if (metrics.fid) {
    if (metrics.fid > 300) score -= 30;
    else if (metrics.fid > 100) score -= 15;
  }

  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 30;
    else if (metrics.cls > 0.1) score -= 15;
  }

  return Math.max(0, score);
}

/**
 * Track API request performance
 */
export function trackApiPerformance(endpoint: string, duration: number) {
  let rating: "good" | "needs-improvement" | "poor";
  if (duration < 500) {
    rating = "good";
  } else if (duration < 1000) {
    rating = "needs-improvement";
  } else {
    rating = "poor";
  }

  const metric: PerformanceMetric = {
    name: `API: ${endpoint}`,
    value: duration,
    rating,
    timestamp: Date.now(),
  };

  if (metric.rating === "poor") {
    console.warn(`[Performance] Slow API request:`, {
      endpoint,
      duration: `${duration}ms`,
    });
  }

  return metric;
}
