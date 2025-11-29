import { trpc } from "@/lib/trpc";
import { installCsrfFetchInterceptor, withCsrfHeader } from "@/lib/csrf";
import { errorLogger } from "@/lib/errorLogger";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./lib/i18n";

const LOCALE_STORAGE_KEY = "rabithr:locale";
type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
const TRPC_URL = API_BASE ? `${API_BASE}/api/trpc` : "/api/trpc";

installCsrfFetchInterceptor();

// Register Service Worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
          .register("/sw.js")
          .catch(err =>
            errorLogger.warn("Service worker registration failed", {
              error: err instanceof Error ? err.message : String(err),
            })
          );
  });
}

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    // Additional options
    beforeSend(event) {
      // Don't send errors in development unless explicitly enabled
      if (
        import.meta.env.MODE === "development" &&
        !import.meta.env.VITE_SENTRY_DEBUG
      ) {
        return null;
      }
      return event;
    },
  });
}

// تعيين الاتجاه الافتراضي
const defaultLang =
  localStorage.getItem(LOCALE_STORAGE_KEY) ||
  localStorage.getItem("i18nextLng") ||
  "ar";
document.documentElement.dir = defaultLang === "ar" ? "rtl" : "ltr";
document.documentElement.lang = defaultLang;

// Initialize analytics if configured
if (
  import.meta.env.VITE_ANALYTICS_ENDPOINT &&
  import.meta.env.VITE_ANALYTICS_WEBSITE_ID
) {
  try {
    const script = document.createElement("script");
    script.defer = true;
    script.src = import.meta.env.VITE_ANALYTICS_ENDPOINT + "/umami";
    script.dataset.websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
    document.head.appendChild(script);
  } catch (error) {
    errorLogger.warn("Failed to initialize analytics", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep unused data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in production
      refetchOnWindowFocus: import.meta.env.MODE === 'development',
      // Don't refetch on reconnect automatically
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

const formatErrorDetail = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (globalThis.window === undefined) return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  try {
    globalThis.location.href = getLoginUrl();
  } catch (err) {
    errorLogger.error("Failed to redirect to login", {
      detail: formatErrorDetail(err),
    });
    // Fallback to login page
    globalThis.location.href = "/login";
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    errorLogger.error("API query error", {
      detail: formatErrorDetail(error),
    });
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    errorLogger.error("API mutation error", {
      detail: formatErrorDetail(error),
    });
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      transformer: superjson,
      headers() {
        const token = localStorage.getItem("authToken");
        const baseHeaders: Record<string, string> = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};
        return withCsrfHeader(baseHeaders);
      },
        fetch(input, init) {
          const finalInit: FetchInit =
            init === undefined
              ? { credentials: "include" }
              : { ...init, credentials: "include" };
        return globalThis.fetch(input, finalInit);
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
