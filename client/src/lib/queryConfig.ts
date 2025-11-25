/**
 * React Query Configuration with Optimized Caching Strategy
 * 
 * This configuration provides:
 * - Aggressive caching for static data
 * - Moderate caching for semi-static data
 * - Fresh data for real-time content
 * - Reduced network requests
 * - Better performance
 */

export const queryConfig = {
  // Static data that rarely changes (consultation types, packages, etc.)
  staticData: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },

  // Semi-static data (user profile, consultant lists, etc.)
  semiStaticData: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Dynamic data (bookings, notifications, etc.)
  dynamicData: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },

  // Real-time data (chat, active sessions, etc.)
  realTimeData: {
    staleTime: 0, // Always fresh
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  },

  // Data that should be prefetched
  prefetchData: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
};

/**
 * Helper function to get query config based on data type
 */
export function getQueryConfig(type: keyof typeof queryConfig) {
  return queryConfig[type];
}

/**
 * Common query categories
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

export default queryConfig;
