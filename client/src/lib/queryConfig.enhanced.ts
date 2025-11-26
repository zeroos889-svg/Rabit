/**
 * Enhanced React Query Configuration
 * Features:
 * - Intelligent caching strategies
 * - Automatic retry logic
 * - Background refetch optimization
 * - Error handling
 * - Performance monitoring
 */

import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";

/**
 * Enhanced query configuration with smart defaults
 */
export const queryConfig = {
  // Static data that rarely changes (consultation types, packages, etc.)
  staticData: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Semi-static data (user profile, consultant lists, etc.)
  semiStaticData: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },

  // Dynamic data (bookings, notifications, etc.)
  dynamicData: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 1000,
  },

  // Real-time data (chat, active sessions, etc.)
  realTimeData: {
    staleTime: 0, // Always fresh
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: false,
    retry: 1,
    retryDelay: 500,
  },

  // Data that should be prefetched
  prefetchData: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  },

  // Mutations configuration
  mutations: {
    retry: 1,
    retryDelay: 1000,
    networkMode: "online" as const,
  },
};

/**
 * Helper function to get query config based on data type
 */
export function getQueryConfig(type: keyof typeof queryConfig) {
  return queryConfig[type];
}

/**
 * Common query categories with type safety
 */
export const QueryCategories = {
  // Static/Rarely changing
  CONSULTATION_TYPES: "staticData",
  CONSULTATION_PACKAGES: "staticData",
  TEMPLATES: "staticData",
  KNOWLEDGE_BASE: "staticData",

  // Semi-static
  USER_PROFILE: "semiStaticData",
  CONSULTANT_LIST: "semiStaticData",
  COMPANIES: "semiStaticData",
  COURSES: "semiStaticData",

  // Dynamic
  BOOKINGS: "dynamicData",
  NOTIFICATIONS: "dynamicData",
  DASHBOARD_STATS: "dynamicData",
  REPORTS: "dynamicData",

  // Real-time
  CHAT_MESSAGES: "realTimeData",
  ACTIVE_SESSIONS: "realTimeData",
  LIVE_NOTIFICATIONS: "realTimeData",
} as const;

/**
 * Create optimized query client
 */
export function createQueryClient(): QueryClient {
  const config: QueryClientConfig = {
    defaultOptions: {
      queries: {
        // Default configuration for all queries
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 2,
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 10000),
        networkMode: "online",

        // Error handling
        throwOnError: false,
        useErrorBoundary: false,

        // Performance optimization
        structuralSharing: true,
        keepPreviousData: true,
      },
      mutations: {
        ...queryConfig.mutations,
        // Error handling for mutations
        throwOnError: false,
        useErrorBoundary: false,
      },
    },
  };

  return new QueryClient(config);
}

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
  },

  // Consultations
  consultations: {
    all: ["consultations"] as const,
    lists: () => [...queryKeys.consultations.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.consultations.lists(), filters] as const,
    details: () => [...queryKeys.consultations.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.consultations.details(), id] as const,
    types: () => [...queryKeys.consultations.all, "types"] as const,
    packages: () => [...queryKeys.consultations.all, "packages"] as const,
  },

  // Bookings
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.bookings.lists(), filters] as const,
    details: () => [...queryKeys.bookings.all, "detail"] as const,
    detail: (id: string | number) =>
      [...queryKeys.bookings.details(), id] as const,
    upcoming: () => [...queryKeys.bookings.all, "upcoming"] as const,
    history: () => [...queryKeys.bookings.all, "history"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
    count: () => [...queryKeys.notifications.all, "count"] as const,
  },

  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    charts: (period: string) =>
      [...queryKeys.dashboard.all, "charts", period] as const,
  },
};

/**
 * Performance monitoring hook
 */
export function useQueryPerformance(queryKey: readonly unknown[]) {
  const startTime = Date.now();

  const onSuccess = () => {
    const duration = Date.now() - startTime;
    if (duration > 3000) {
      console.warn(`Slow query detected: ${JSON.stringify(queryKey)}`, {
        duration: `${duration}ms`,
      });
    }
  };

  const onError = (error: Error) => {
    const duration = Date.now() - startTime;
    console.error(`Query failed: ${JSON.stringify(queryKey)}`, {
      duration: `${duration}ms`,
      error: error.message,
    });
  };

  return { onSuccess, onError };
}

/**
 * Smart prefetch helper
 */
export function prefetchQueries(
  queryClient: QueryClient,
  queries: Array<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<any>;
    config?: keyof typeof queryConfig;
  }>
): Promise<void[]> {
  return Promise.all(
    queries.map((query) =>
      queryClient.prefetchQuery({
        queryKey: query.queryKey,
        queryFn: query.queryFn,
        ...(query.config ? queryConfig[query.config] : queryConfig.prefetchData),
      })
    )
  );
}

/**
 * Invalidate related queries helper
 */
export function invalidateRelatedQueries(
  queryClient: QueryClient,
  baseKey: readonly unknown[]
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: baseKey,
    refetchType: "active",
  });
}

/**
 * Optimistic update helper
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (old: T | undefined) => T
): Promise<{ previousData: T | undefined }> {
  // Cancel any outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot the previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update to the new value
  queryClient.setQueryData<T>(queryKey, updater);

  // Return context for rollback
  return { previousData };
}

/**
 * Rollback helper for failed mutations
 */
export function rollbackOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  previousData: T | undefined
): void {
  queryClient.setQueryData<T>(queryKey, previousData);
}

export default queryConfig;
