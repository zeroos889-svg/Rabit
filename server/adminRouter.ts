import { adminProcedure, router } from "./_core/trpc";

// Placeholder admin router to satisfy type checking; extend as needed.
export const adminRouter = router({
  getStats: adminProcedure.query(() => ({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    tickets: 0,
    consultations: 0,
  })),
});
