/**
 * Analytics Module
 * Google Analytics 4 integration with custom event tracking
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

interface AnalyticsConfig {
  measurementId: string;
  enableDebug?: boolean;
  enableUserTracking?: boolean;
}

interface EventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

interface PageViewParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  [key: string]: unknown;
}

interface UserProperties {
  user_type?: "employee" | "consultant" | "company";
  subscription_plan?: string;
  [key: string]: unknown;
}

class Analytics {
  private static instance: Analytics;
  private config: AnalyticsConfig | null = null;
  private isInitialized = false;
  private eventQueue: Array<{ name: string; params: EventParams }> = [];

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize Google Analytics
   */
  init(config: AnalyticsConfig) {
    if (this.isInitialized) {
      console.warn("Analytics already initialized");
      return;
    }

    this.config = config;

    // Load gtag script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    globalThis.dataLayer = globalThis.dataLayer || [];
    
    // Define gtag function
    globalThis.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      globalThis.dataLayer?.push(arguments);
    };

    globalThis.gtag("js", new Date());
    globalThis.gtag("config", config.measurementId, {
      send_page_view: false, // Manual page view tracking
      debug_mode: config.enableDebug,
      anonymize_ip: !config.enableUserTracking,
    });

    this.isInitialized = true;

    // Process queued events
    this.processQueue();

    if (config.enableDebug) {
      console.log("[Analytics] Initialized with config:", config);
    }
  }

  /**
   * Process queued events
   */
  private processQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.trackEvent(event.name, event.params);
      }
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, params: EventParams = {}) {
    if (!this.isInitialized) {
      this.eventQueue.push({ name: eventName, params });
      return;
    }

    if (!globalThis.gtag) {
      console.warn("[Analytics] gtag not available");
      return;
    }

    globalThis.gtag("event", eventName, {
      event_category: params.category,
      event_label: params.label,
      value: params.value,
      ...params,
    });

    if (this.config?.enableDebug) {
      console.log("[Analytics] Event tracked:", eventName, params);
    }
  }

  /**
   * Track page view
   */
  trackPageView(params: PageViewParams = {}) {
    if (!this.isInitialized || !globalThis.gtag) return;

    const pageParams = {
      page_title: document.title,
      page_location: globalThis.location.href,
      page_path: globalThis.location.pathname,
      ...params,
    };

    globalThis.gtag("event", "page_view", pageParams);

    if (this.config?.enableDebug) {
      console.log("[Analytics] Page view tracked:", pageParams);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    if (!this.isInitialized || !globalThis.gtag) return;

    globalThis.gtag("set", "user_properties", properties);

    if (this.config?.enableDebug) {
      console.log("[Analytics] User properties set:", properties);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId: string) {
    if (!this.isInitialized || !globalThis.gtag) return;

    globalThis.gtag("config", this.config?.measurementId || "", {
      user_id: userId,
    });

    if (this.config?.enableDebug) {
      console.log("[Analytics] User ID set:", userId);
    }
  }

  /**
   * Track consultation events
   */
  consultations = {
    started: (consultationType: string, consultantId: string) => {
      this.trackEvent("consultation_started", {
        category: "Consultations",
        consultation_type: consultationType,
        consultant_id: consultantId,
      });
    },

    completed: (consultationId: string, duration: number, rating?: number) => {
      this.trackEvent("consultation_completed", {
        category: "Consultations",
        consultation_id: consultationId,
        duration_minutes: duration,
        rating,
      });
    },

    booked: (consultationType: string, price: number) => {
      this.trackEvent("consultation_booked", {
        category: "Consultations",
        consultation_type: consultationType,
        value: price,
        currency: "SAR",
      });
    },

    cancelled: (consultationId: string, reason?: string) => {
      this.trackEvent("consultation_cancelled", {
        category: "Consultations",
        consultation_id: consultationId,
        cancellation_reason: reason,
      });
    },
  };

  /**
   * Track calculator usage
   */
  calculators = {
    used: (calculatorType: string) => {
      this.trackEvent("calculator_used", {
        category: "Calculators",
        calculator_type: calculatorType,
      });
    },

    resultViewed: (calculatorType: string, result: Record<string, unknown>) => {
      this.trackEvent("calculator_result_viewed", {
        category: "Calculators",
        calculator_type: calculatorType,
        ...result,
      });
    },
  };

  /**
   * Track authentication events
   */
  auth = {
    signUp: (method: string, userType: string) => {
      this.trackEvent("sign_up", {
        category: "Authentication",
        method,
        user_type: userType,
      });
    },

    login: (method: string) => {
      this.trackEvent("login", {
        category: "Authentication",
        method,
      });
    },

    logout: () => {
      this.trackEvent("logout", {
        category: "Authentication",
      });
    },
  };

  /**
   * Track search
   */
  search(searchTerm: string, resultCount: number) {
    this.trackEvent("search", {
      category: "Search",
      search_term: searchTerm,
      result_count: resultCount,
    });
  }

  /**
   * Track errors
   */
  trackError(errorMessage: string, errorType: string, fatal: boolean = false) {
    this.trackEvent("exception", {
      category: "Errors",
      description: errorMessage,
      error_type: errorType,
      fatal,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName: string, value: number, unit: string = "ms") {
    this.trackEvent("performance_metric", {
      category: "Performance",
      metric_name: metricName,
      value,
      unit,
    });
  }

  /**
   * Track conversions
   */
  trackConversion(conversionType: string, value?: number) {
    this.trackEvent("conversion", {
      category: "Conversions",
      conversion_type: conversionType,
      value,
      currency: "SAR",
    });
  }
}

export const analytics = Analytics.getInstance();
export default analytics;
