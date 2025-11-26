/**
 * React Query Caching Examples
 * 
 * أمثلة على كيفية استخدام React Query caching strategies
 * مع tRPC في مختلف السيناريوهات
 * 
 * @module reactQueryCachingExamples
 */

import { trpc } from "@/lib/trpc";
import { queryConfig } from "@/lib/queryConfig";

/**
 * ==========================================
 * Example 1: Static Data (Consultation Types)
 * ==========================================
 * 
 * بيانات ثابتة نادراً ما تتغير
 * - staleTime: 30 دقيقة
 * - gcTime: 1 ساعة
 * - لا refetch على window focus
 */
export function useConsultationTypes() {
  return trpc.consultant.getConsultationTypes.useQuery(
    undefined,
    queryConfig.staticData
  );
}

/**
 * ==========================================
 * Example 2: Semi-Static Data (User Profile)
 * ==========================================
 * 
 * بيانات شبه ثابتة تتغير أحياناً
 * - staleTime: 5 دقائق
 * - gcTime: 15 دقيقة
 * - refetch على reconnect فقط
 */
export function useUserProfile(userId: string) {
  return trpc.user.getProfile.useQuery(
    { userId },
    {
      ...queryConfig.semiStaticData,
      // إضافة enabled للتحكم في تنفيذ Query
      enabled: !!userId,
    }
  );
}

/**
 * ==========================================
 * Example 3: Dynamic Data (Notifications)
 * ==========================================
 * 
 * بيانات ديناميكية تتغير بشكل متكرر
 * - staleTime: 1 دقيقة
 * - refetch على window focus و mount
 */
export function useNotifications() {
  return trpc.notifications.getAll.useQuery(
    { limit: 20, offset: 0 },
    queryConfig.dynamicData
  );
}

/**
 * ==========================================
 * Example 4: Real-Time Data (Chat Messages)
 * ==========================================
 * 
 * بيانات فورية تحتاج تحديث مستمر
 * - staleTime: 0 (دائماً fresh)
 * - refetchInterval: كل 30 ثانية
 */
export function useChatMessages(conversationId: string) {
  return trpc.chat.getMessages.useQuery(
    { conversationId },
    {
      ...queryConfig.realTimeData,
      enabled: !!conversationId,
    }
  );
}

/**
 * ==========================================
 * Example 5: Conditional Caching
 * ==========================================
 * 
 * استخدام caching مختلف بناءً على الشروط
 */
export function useConditionalData(isImportant: boolean) {
  const config = isImportant 
    ? queryConfig.realTimeData 
    : queryConfig.staticData;
  
  return trpc.someData.get.useQuery(
    undefined,
    config
  );
}

/**
 * ==========================================
 * Example 6: Prefetching Data
 * ==========================================
 * 
 * تحميل البيانات مسبقاً قبل الحاجة إليها
 */
export function usePrefetchConsultants() {
  const utils = trpc.useUtils();
  
  const prefetchConsultants = () => {
    // Prefetch قائمة الاستشاريين
    utils.consultant.list.prefetch(
      undefined,
      queryConfig.prefetchData
    );
  };
  
  return { prefetchConsultants };
}

/**
 * ==========================================
 * Example 7: Optimistic Updates
 * ==========================================
 * 
 * تحديث UI فوراً قبل استجابة الـ server
 */
export function useOptimisticBooking() {
  const utils = trpc.useUtils();
  
  const createBooking = trpc.booking.create.useMutation({
    onMutate: async (newBooking) => {
      // إلغاء أي queries قيد التنفيذ
      await utils.booking.list.cancel();
      
      // احفظ snapshot من البيانات الحالية
      const previousBookings = utils.booking.list.getData();
      
      // Update UI optimistically
      utils.booking.list.setData(undefined, (old) => {
        return old ? [...old, newBooking as any] : [newBooking as any];
      });
      
      // إرجاع context للـ rollback
      return { previousBookings };
    },
    onError: (_err, _newBooking, context) => {
      // Rollback على error
      utils.booking.list.setData(undefined, context?.previousBookings);
    },
    onSettled: () => {
      // Refetch لضمان sync مع server
      utils.booking.list.invalidate();
    },
  });
  
  return createBooking;
}

/**
 * ==========================================
 * Example 8: Parallel Queries
 * ==========================================
 * 
 * تنفيذ عدة queries في نفس الوقت
 */
export function useDashboardData() {
  const stats = trpc.admin.getStats.useQuery(undefined, queryConfig.dynamicData);
  const users = trpc.admin.getUsers.useQuery(undefined, queryConfig.semiStaticData);
  const bookings = trpc.admin.getBookings.useQuery(undefined, queryConfig.dynamicData);
  
  return {
    stats,
    users,
    bookings,
    isLoading: stats.isLoading || users.isLoading || bookings.isLoading,
    isError: stats.isError || users.isError || bookings.isError,
  };
}

/**
 * ==========================================
 * Example 9: Dependent Queries
 * ==========================================
 * 
 * تنفيذ query يعتمد على نتيجة query آخر
 */
export function useDependentQueries(userId?: string) {
  // Query 1: Get user
  const userQuery = trpc.user.getProfile.useQuery(
    { userId: userId! },
    {
      ...queryConfig.semiStaticData,
      enabled: !!userId,
    }
  );
  
  // Query 2: Get user bookings (يعتمد على Query 1)
  const bookingsQuery = trpc.booking.getUserBookings.useQuery(
    { userId: userQuery.data?.id! },
    {
      ...queryConfig.dynamicData,
      enabled: !!userQuery.data?.id, // تنفيذ فقط بعد نجاح Query 1
    }
  );
  
  return {
    user: userQuery,
    bookings: bookingsQuery,
  };
}

/**
 * ==========================================
 * Example 10: Infinite Queries (Pagination)
 * ==========================================
 * 
 * تحميل بيانات مقسّمة (pagination)
 */
export function useInfiniteBookings() {
  return trpc.booking.listInfinite.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...queryConfig.dynamicData,
    }
  );
}

/**
 * ==========================================
 * Example 11: Query Invalidation
 * ==========================================
 * 
 * إبطال وإعادة تحميل queries
 */
export function useInvalidateQueries() {
  const utils = trpc.useUtils();
  
  const invalidateAll = () => {
    // إبطال جميع queries
    utils.invalidate();
  };
  
  const invalidateSpecific = () => {
    // إبطال query محدد
    utils.booking.list.invalidate();
  };
  
  const invalidateByCategory = () => {
    // إبطال كل queries تبدأ بـ "booking"
    utils.booking.invalidate();
  };
  
  return {
    invalidateAll,
    invalidateSpecific,
    invalidateByCategory,
  };
}

/**
 * ==========================================
 * Example 12: Custom Retry Logic
 * ==========================================
 * 
 * منطق retry مخصص للـ queries
 */
export function useCustomRetry() {
  return trpc.someData.get.useQuery(
    undefined,
    {
      retry: (failureCount, error) => {
        // لا retry على 404
        if (error.data?.code === 'NOT_FOUND') {
          return false;
        }
        // Retry حتى 3 مرات للأخطاء الأخرى
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, 8s, ...
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    }
  );
}

/**
 * ==========================================
 * Example 13: Query Placeholders
 * ==========================================
 * 
 * عرض بيانات مؤقتة أثناء التحميل
 */
export function useQueryWithPlaceholder() {
  const utils = trpc.useUtils();
  
  return trpc.consultant.list.useQuery(
    undefined,
    {
      ...queryConfig.semiStaticData,
      placeholderData: () => {
        // استخدام بيانات من cache كـ placeholder
        return utils.consultant.list.getData() || [];
      },
    }
  );
}

/**
 * ==========================================
 * Example 14: Select & Transform Data
 * ==========================================
 * 
 * تحويل البيانات قبل إرجاعها
 */
export function useTransformedData() {
  return trpc.booking.list.useQuery(
    undefined,
    {
      ...queryConfig.dynamicData,
      select: (data) => {
        // Filter و sort البيانات
        return data
          .filter(booking => booking.status === 'confirmed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
    }
  );
}

/**
 * ==========================================
 * Example 15: Mutation with Cache Update
 * ==========================================
 * 
 * تحديث cache بعد mutation ناجح
 */
export function useUpdateBookingStatus() {
  const utils = trpc.useUtils();
  
  return trpc.booking.updateStatus.useMutation({
    onSuccess: (data, variables) => {
      // Update specific booking في cache
      utils.booking.list.setData(undefined, (old) => {
        if (!old) return old;
        return old.map(booking => 
          booking.id === variables.id 
            ? { ...booking, status: variables.status }
            : booking
        );
      });
      
      // أو invalidate للـ refetch
      // utils.booking.list.invalidate();
    },
  });
}

/**
 * ==========================================
 * Performance Tips
 * ==========================================
 * 
 * 1. استخدام staleTime المناسب لنوع البيانات
 * 2. تجنب refetchOnWindowFocus للبيانات الثابتة
 * 3. استخدام select لتقليل re-renders
 * 4. Prefetch البيانات المتوقعة
 * 5. استخدام optimistic updates للـ UX السريع
 * 6. تنظيف cache بـ gcTime مناسب
 * 7. استخدام enabled للتحكم في تنفيذ queries
 * 8. تجنب queries غير ضرورية بـ placeholderData
 */

/**
 * ==========================================
 * Caching Best Practices
 * ==========================================
 * 
 * Static Data (30 min staleTime):
 * - Consultation types
 * - Templates
 * - Knowledge base articles
 * - System configuration
 * 
 * Semi-Static Data (5 min staleTime):
 * - User profiles
 * - Consultant lists
 * - Company information
 * - Courses catalog
 * 
 * Dynamic Data (1 min staleTime):
 * - Bookings
 * - Notifications
 * - Activity feeds
 * - Search results
 * 
 * Real-Time Data (0 staleTime + polling):
 * - Chat messages
 * - Live notifications
 * - Active sessions
 * - Real-time dashboards
 */

export default {
  useConsultationTypes,
  useUserProfile,
  useNotifications,
  useChatMessages,
  useConditionalData,
  usePrefetchConsultants,
  useOptimisticBooking,
  useDashboardData,
  useDependentQueries,
  useInfiniteBookings,
  useInvalidateQueries,
  useCustomRetry,
  useQueryWithPlaceholder,
  useTransformedData,
  useUpdateBookingStatus,
};
