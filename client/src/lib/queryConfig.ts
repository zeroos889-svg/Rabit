/**
 * Enhanced React Query Configuration
 * Features:
 * - Intelligent caching strategies with retry logic
 * - Query key factory for consistency
 * - Optimistic updates support
 * - Performance monitoring
 * - Smart prefetching
 */

/**
 * Enhanced query configuration with smart defaults
 */
export const queryConfig = {
  // Static data that rarely changes (consultation types, packages, etc.)
  staticData: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
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
  CONSULTATION_TYPES: 'staticData',
  CONSULTATION_PACKAGES: 'staticData',
  TEMPLATES: 'staticData',
  KNOWLEDGE_BASE: 'staticData',
  
  // Semi-static
  USER_PROFILE: 'semiStaticData',
  CONSULTANT_LIST: 'semiStaticData',
  COMPANIES: 'semiStaticData',
  COURSES: 'semiStaticData',
  
  // Dynamic
  BOOKINGS: 'dynamicData',
  NOTIFICATIONS: 'dynamicData',
  DASHBOARD_STATS: 'dynamicData',
  REPORTS: 'dynamicData',
  
  // Real-time
  CHAT_MESSAGES: 'realTimeData',
  ACTIVE_SESSIONS: 'realTimeData',
  LIVE_NOTIFICATIONS: 'realTimeData',
} as const;

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

export default queryConfig;
