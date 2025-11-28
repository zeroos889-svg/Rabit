import { adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { recordAudit } from "./audit";
import { sendEmail } from "./_core/email";
import { publishNotification } from "./notificationsRouter";

// =====================================================
// Admin Router - Complete API for Admin Panel
// =====================================================

// Schema Definitions
const userFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(["all", "admin", "company", "employee", "freelancer", "consultant"]).default("all"),
  status: z.enum(["all", "active", "pending", "suspended"]).default("all"),
  sortBy: z.enum(["createdAt", "name", "email", "lastLogin"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const bookingFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["all", "pending", "confirmed", "completed", "cancelled"]).default("all"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  consultantId: z.number().optional(),
});

const subscriptionFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["all", "active", "trial", "expired", "cancelled"]).default("all"),
  plan: z.enum(["all", "basic", "professional", "enterprise", "custom"]).default("all"),
});

const dataRequestFilterSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(["all", "access", "deletion", "correction", "portability"]).default("all"),
  status: z.enum(["all", "new", "in_review", "completed", "rejected"]).default("all"),
});

export const adminRouter = router({
  // =====================================================
  // Dashboard Statistics
  // =====================================================
  getStats: adminProcedure.query(async () => {
    const [
      usersCount,
      activeSubscriptions,
      pendingBookings,
      totalRevenue,
      tickets,
      consultations,
    ] = await Promise.all([
      db.getUsersCount(),
      db.getActiveSubscriptionsCount(),
      db.getPendingBookingsCount(),
      db.getTotalRevenue(),
      db.getPendingTicketsCount(),
      db.getTotalConsultationsCount(),
    ]);

    return {
      totalUsers: usersCount,
      activeSubscriptions,
      pendingBookings,
      totalRevenue,
      tickets,
      consultations,
      growth: {
        users: 12,
        subscriptions: 8,
        revenue: 15,
      },
    };
  }),

  // =====================================================
  // Users Management
  // =====================================================
  users: router({
    // Get all users with filtering and pagination
    list: adminProcedure
      .input(userFilterSchema)
      .query(async ({ input }) => {
        const { page, limit, search, role, status, sortBy, sortOrder } = input;
        const offset = (page - 1) * limit;

        const result = await db.getAdminUsersList({
          limit,
          offset,
          search,
          role: role === "all" ? undefined : role,
          status: status === "all" ? undefined : status,
          sortBy,
          sortOrder,
        });

        return {
          users: result.users,
          total: result.total,
          page,
          totalPages: Math.ceil(result.total / limit),
        };
      }),

    // Get single user details
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
        }
        return { user };
      }),

    // Create new user
    create: adminProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        role: z.enum(["admin", "company", "employee", "freelancer"]),
        status: z.enum(["active", "pending"]).default("pending"),
        companyId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if email already exists
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "البريد الإلكتروني مستخدم بالفعل" });
        }

        const userId = await db.createUserByAdmin({
          ...input,
          createdBy: ctx.user.id,
        });

        // Send welcome email
        await sendEmail({
          to: input.email,
          subject: "مرحباً بك في منصة رابِط",
          html: `<p>أهلاً ${input.name}،</p><p>تم إنشاء حساب لك في منصة رابِط. يرجى تفعيل حسابك عبر الرابط التالي.</p>`,
          template: "welcome",
        }).catch(() => undefined);

        recordAudit({
          action: "admin:user:create",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `user:${userId}`,
          metadata: { userName: input.name, userEmail: input.email },
          summary: `${ctx.user.name ?? ctx.user.email} أنشأ مستخدم جديد: ${input.name}`,
        });

        return { success: true, userId };
      }),

    // Update user
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "company", "employee", "freelancer"]).optional(),
        status: z.enum(["active", "pending", "suspended"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        
        const user = await db.getUserById(id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
        }

        await db.updateUserByAdmin(id, data);

        recordAudit({
          action: "admin:user:update",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `user:${id}`,
          metadata: { changes: data },
          summary: `${ctx.user.name ?? ctx.user.email} حدّث بيانات المستخدم: ${user.name}`,
        });

        return { success: true };
      }),

    // Update user status (activate/suspend)
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "pending", "suspended"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
        }

        await db.updateUserStatus(input.id, input.status);

        // Notify user
        await publishNotification({
          userId: input.id,
          title: input.status === "active" ? "تم تفعيل حسابك" : "تم إيقاف حسابك",
          body: input.status === "active" 
            ? "يمكنك الآن استخدام جميع خدمات المنصة"
            : "تم إيقاف حسابك مؤقتاً. تواصل مع الدعم للمزيد من المعلومات",
          type: "system",
        });

        recordAudit({
          action: `admin:user:${input.status}`,
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `user:${input.id}`,
          summary: `${ctx.user.name ?? ctx.user.email} ${input.status === "active" ? "فعّل" : "أوقف"} حساب: ${user.name}`,
        });

        return { success: true };
      }),

    // Delete user
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
        }

        // Prevent self-deletion
        if (input.id === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك حذف حسابك" });
        }

        await db.deleteUser(input.id);

        recordAudit({
          action: "admin:user:delete",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `user:${input.id}`,
          summary: `${ctx.user.name ?? ctx.user.email} حذف المستخدم: ${user.name}`,
        });

        return { success: true };
      }),

    // Get user statistics
    getStatistics: adminProcedure.query(async () => {
      const stats = await db.getUserStatistics();
      return stats;
    }),

    // Export users
    export: adminProcedure
      .input(z.object({ format: z.enum(["csv", "xlsx"]).default("csv") }))
      .mutation(async ({ input, ctx }) => {
        const users = await db.getAllUsersForExport();
        
        recordAudit({
          action: "admin:users:export",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: "users",
          metadata: { format: input.format, count: users.length },
          summary: `${ctx.user.name ?? ctx.user.email} صدّر قائمة المستخدمين`,
        });

        return { users, format: input.format };
      }),
  }),

  // =====================================================
  // Bookings Management
  // =====================================================
  bookings: router({
    // Get all bookings with filtering
    list: adminProcedure
      .input(bookingFilterSchema)
      .query(async ({ input }) => {
        const { page, limit, search, status, dateFrom, dateTo, consultantId } = input;
        const offset = (page - 1) * limit;

        const result = await db.getAdminBookingsList({
          limit,
          offset,
          search,
          status: status === "all" ? undefined : status,
          dateFrom,
          dateTo,
          consultantId,
        });

        return {
          bookings: result.bookings,
          total: result.total,
          page,
          totalPages: Math.ceil(result.total / limit),
        };
      }),

    // Get booking details
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const booking = await db.getConsultationBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود" });
        }
        return { booking };
      }),

    // Update booking status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getConsultationBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود" });
        }

        await db.updateBookingStatus(input.id, input.status, input.reason);

        // Notify customer
        const reasonSuffix = input.reason ? `: ${input.reason}` : "";
        const statusMessages: Record<string, string> = {
          confirmed: "تم تأكيد حجزك بنجاح",
          completed: "تم إكمال الاستشارة",
          cancelled: `تم إلغاء الحجز${reasonSuffix}`,
        };

        await publishNotification({
          userId: booking.userId,
          title: "تحديث حالة الحجز",
          body: statusMessages[input.status] || "تم تحديث حالة حجزك",
          type: "ticket",
          metadata: { bookingId: input.id },
        });

        recordAudit({
          action: `admin:booking:${input.status}`,
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `booking:${input.id}`,
          metadata: { previousStatus: booking.status, newStatus: input.status },
          summary: `${ctx.user.name ?? ctx.user.email} غيّر حالة الحجز #${input.id} إلى ${input.status}`,
        });

        return { success: true };
      }),

    // Assign consultant to booking
    assignConsultant: adminProcedure
      .input(z.object({
        bookingId: z.number(),
        consultantId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getConsultationBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود" });
        }

        await db.assignBookingConsultant(input.bookingId, input.consultantId);

        // Notify consultant
        const consultant = await db.getConsultantById(input.consultantId);
        if (consultant?.userId) {
          await publishNotification({
            userId: consultant.userId,
            title: "حجز جديد مسند إليك",
            body: `تم إسناد حجز جديد لك بتاريخ ${booking.scheduledDate}`,
            type: "ticket",
            metadata: { bookingId: input.bookingId },
          });
        }

        recordAudit({
          action: "admin:booking:assign",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `booking:${input.bookingId}`,
          metadata: { consultantId: input.consultantId },
          summary: `${ctx.user.name ?? ctx.user.email} أسند الحجز #${input.bookingId} للمستشار #${input.consultantId}`,
        });

        return { success: true };
      }),

    // Get booking statistics
    getStatistics: adminProcedure.query(async () => {
      const stats = await db.getBookingStatistics();
      return stats;
    }),

    // Get today's bookings
    getTodayBookings: adminProcedure.query(async () => {
      const bookings = await db.getTodayBookings();
      return { bookings };
    }),

    // Export bookings
    export: adminProcedure
      .input(z.object({
        format: z.enum(["csv", "xlsx"]).default("csv"),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const bookings = await db.getBookingsForExport(input.dateFrom, input.dateTo);
        
        recordAudit({
          action: "admin:bookings:export",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: "bookings",
          metadata: { format: input.format, count: bookings.length },
          summary: `${ctx.user.name ?? ctx.user.email} صدّر قائمة الحجوزات`,
        });

        return { bookings, format: input.format };
      }),
  }),

  // =====================================================
  // Subscriptions Management
  // =====================================================
  subscriptions: router({
    // Get all subscriptions
    list: adminProcedure
      .input(subscriptionFilterSchema)
      .query(async ({ input }) => {
        const { page, limit, search, status, plan } = input;
        const offset = (page - 1) * limit;

        const result = await db.getAdminSubscriptionsList({
          limit,
          offset,
          search,
          status: status === "all" ? undefined : status,
          plan: plan === "all" ? undefined : plan,
        });

        return {
          subscriptions: result.subscriptions,
          total: result.total,
          page,
          totalPages: Math.ceil(result.total / limit),
        };
      }),

    // Get subscription details
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const subscription = await db.getSubscriptionById(input.id);
        if (!subscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الاشتراك غير موجود" });
        }
        return { subscription };
      }),

    // Create subscription
    create: adminProcedure
      .input(z.object({
        userId: z.number(),
        plan: z.enum(["basic", "professional", "enterprise", "custom"]),
        startDate: z.string(),
        endDate: z.string(),
        price: z.number(),
        employeesLimit: z.number().optional(),
        features: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
        }

        const subscriptionId = await db.createSubscription({
          ...input,
          status: "active",
          createdBy: ctx.user.id,
        });

        await publishNotification({
          userId: input.userId,
          title: "تم تفعيل اشتراكك",
          body: `تم تفعيل باقة ${input.plan} لحسابك`,
          type: "system",
        });

        recordAudit({
          action: "admin:subscription:create",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `subscription:${subscriptionId}`,
          metadata: { userId: input.userId, plan: input.plan },
          summary: `${ctx.user.name ?? ctx.user.email} أنشأ اشتراك ${input.plan} للمستخدم ${user.name}`,
        });

        return { success: true, subscriptionId };
      }),

    // Update subscription
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        plan: z.enum(["basic", "professional", "enterprise", "custom"]).optional(),
        status: z.enum(["active", "trial", "expired", "cancelled"]).optional(),
        endDate: z.string().optional(),
        employeesLimit: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        
        const subscription = await db.getSubscriptionById(id);
        if (!subscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الاشتراك غير موجود" });
        }

        await db.updateSubscription(id, data);

        recordAudit({
          action: "admin:subscription:update",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `subscription:${id}`,
          metadata: { changes: data },
          summary: `${ctx.user.name ?? ctx.user.email} حدّث الاشتراك #${id}`,
        });

        return { success: true };
      }),

    // Renew subscription
    renew: adminProcedure
      .input(z.object({
        id: z.number(),
        months: z.number().min(1).max(24),
      }))
      .mutation(async ({ input, ctx }) => {
        const subscription = await db.getSubscriptionById(input.id);
        if (!subscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الاشتراك غير موجود" });
        }

        const currentEnd = new Date(subscription.endDate);
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + input.months);

        await db.updateSubscription(input.id, {
          endDate: newEnd.toISOString(),
          status: "active",
        });

        await publishNotification({
          userId: subscription.userId,
          title: "تم تجديد اشتراكك",
          body: `تم تجديد اشتراكك لمدة ${input.months} شهر`,
          type: "system",
        });

        recordAudit({
          action: "admin:subscription:renew",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `subscription:${input.id}`,
          metadata: { months: input.months, newEndDate: newEnd.toISOString() },
          summary: `${ctx.user.name ?? ctx.user.email} جدّد الاشتراك #${input.id} لمدة ${input.months} شهر`,
        });

        return { success: true };
      }),

    // Cancel subscription
    cancel: adminProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const subscription = await db.getSubscriptionById(input.id);
        if (!subscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الاشتراك غير موجود" });
        }

        await db.updateSubscription(input.id, { status: "cancelled" });

        await publishNotification({
          userId: subscription.userId,
          title: "تم إلغاء اشتراكك",
          body: input.reason || "تم إلغاء اشتراكك. تواصل معنا للمزيد من المعلومات",
          type: "system",
        });

        recordAudit({
          action: "admin:subscription:cancel",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `subscription:${input.id}`,
          metadata: { reason: input.reason },
          summary: `${ctx.user.name ?? ctx.user.email} ألغى الاشتراك #${input.id}`,
        });

        return { success: true };
      }),

    // Get subscription statistics
    getStatistics: adminProcedure.query(async () => {
      const stats = await db.getSubscriptionStatistics();
      return stats;
    }),

    // Get expiring soon subscriptions
    getExpiringSoon: adminProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ input }) => {
        const subscriptions = await db.getExpiringSoonSubscriptions(input.days);
        return { subscriptions };
      }),

    // Export subscriptions
    export: adminProcedure
      .input(z.object({ format: z.enum(["csv", "xlsx"]).default("csv") }))
      .mutation(async ({ input, ctx }) => {
        const subscriptions = await db.getSubscriptionsForExport();
        
        recordAudit({
          action: "admin:subscriptions:export",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: "subscriptions",
          metadata: { format: input.format, count: subscriptions.length },
          summary: `${ctx.user.name ?? ctx.user.email} صدّر قائمة الاشتراكات`,
        });

        return { subscriptions, format: input.format };
      }),
  }),

  // =====================================================
  // Data Requests Management (PDPL Compliance)
  // =====================================================
  dataRequests: router({
    // Get all data requests
    list: adminProcedure
      .input(dataRequestFilterSchema)
      .query(async ({ input }) => {
        const { page, limit, search, type, status } = input;
        const offset = (page - 1) * limit;

        const result = await db.getAdminDataRequestsList({
          limit,
          offset,
          search,
          type: type === "all" ? undefined : type,
          status: status === "all" ? undefined : status,
        });

        return {
          requests: result.requests,
          total: result.total,
          page,
          totalPages: Math.ceil(result.total / limit),
        };
      }),

    // Get data request details
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const request = await db.getDataRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        }
        return { request };
      }),

    // Update data request status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "in_review", "completed", "rejected"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await db.getDataRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        }

        await db.updateDataRequestStatus(input.id, input.status, input.notes);

        // Notify user
        const notesSuffix = input.notes ? `: ${input.notes}` : "";
        const statusMessages: Record<string, string> = {
          in_review: "طلبك قيد المراجعة الآن",
          completed: "تم معالجة طلبك بنجاح",
          rejected: `تم رفض طلبك${notesSuffix}`,
        };

        await publishNotification({
          userId: request.userId,
          title: "تحديث طلب البيانات",
          body: statusMessages[input.status] || "تم تحديث حالة طلبك",
          type: "system",
        });

        recordAudit({
          action: `admin:data_request:${input.status}`,
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `data_request:${input.id}`,
          metadata: { previousStatus: request.status, newStatus: input.status, notes: input.notes },
          summary: `${ctx.user.name ?? ctx.user.email} حدّث طلب البيانات #${input.id} إلى ${input.status}`,
        });

        return { success: true };
      }),

    // Process data access request
    processAccessRequest: adminProcedure
      .input(z.object({
        id: z.number(),
        dataFile: z.string().optional(), // URL to data file
      }))
      .mutation(async ({ input, ctx }) => {
        const request = await db.getDataRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        }

        await db.completeDataRequest(input.id, { dataFile: input.dataFile });

        // Get user email to send notification
        const user = await db.getUserById(request.userId);
        const userEmail = user?.email ?? request.email;
        if (userEmail) {
          await sendEmail({
            to: userEmail,
            subject: "طلب الوصول للبيانات - تم المعالجة",
            html: `<p>تم معالجة طلبك للوصول إلى بياناتك الشخصية. ${input.dataFile ? "يمكنك تحميل الملف من الرابط المرفق." : ""}</p>`,
            template: "data-request-complete",
          }).catch(() => undefined);
        }

        recordAudit({
          action: "admin:data_request:complete",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `data_request:${input.id}`,
          summary: `${ctx.user.name ?? ctx.user.email} أكمل معالجة طلب البيانات #${input.id}`,
        });

        return { success: true };
      }),

    // Process data deletion request
    processDeletionRequest: adminProcedure
      .input(z.object({
        id: z.number(),
        confirm: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.confirm) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "يجب تأكيد عملية الحذف" });
        }

        const request = await db.getDataRequestById(input.id);
        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        }

        // Process data deletion
        await db.processDataDeletion(request.userId);
        await db.completeDataRequest(input.id, { deletedAt: new Date().toISOString() });

        // Get user email to send notification
        const deleteUser = await db.getUserById(request.userId);
        const deleteUserEmail = deleteUser?.email ?? request.email;
        if (deleteUserEmail) {
          await sendEmail({
            to: deleteUserEmail,
            subject: "طلب حذف البيانات - تم التنفيذ",
            html: "<p>تم حذف بياناتك الشخصية بنجاح وفقاً لطلبك.</p>",
            template: "data-deletion-complete",
          }).catch(() => undefined);
        }

        recordAudit({
          action: "admin:data_request:delete",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `data_request:${input.id}`,
          summary: `${ctx.user.name ?? ctx.user.email} نفذ طلب حذف البيانات #${input.id}`,
        });

        return { success: true };
      }),

    // Get data requests statistics
    getStatistics: adminProcedure.query(async () => {
      const stats = await db.getDataRequestStatistics();
      return stats;
    }),

    // Get overdue requests (past 30-day PDPL deadline)
    getOverdue: adminProcedure.query(async () => {
      const requests = await db.getOverdueDataRequests();
      return { requests };
    }),

    // Export data requests
    export: adminProcedure
      .input(z.object({ format: z.enum(["csv", "xlsx"]).default("csv") }))
      .mutation(async ({ input, ctx }) => {
        const requests = await db.getDataRequestsForExport();
        
        recordAudit({
          action: "admin:data_requests:export",
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: "data_requests",
          metadata: { format: input.format, count: requests.length },
          summary: `${ctx.user.name ?? ctx.user.email} صدّر قائمة طلبات البيانات`,
        });

        return { requests, format: input.format };
      }),
  }),

  // =====================================================
  // Consultants Management
  // =====================================================
  consultants: router({
    // Get all consultants
    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["all", "pending", "approved", "rejected"]).default("all"),
      }))
      .query(async ({ input }) => {
        const { page, limit, status } = input;
        const offset = (page - 1) * limit;

        const result = await db.getAdminConsultantsList({
          limit,
          offset,
          status: status === "all" ? undefined : status,
        });

        return {
          consultants: result.consultants,
          total: result.total,
          page,
          totalPages: Math.ceil(result.total / limit),
        };
      }),

    // Approve/reject consultant
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const consultant = await db.getConsultantById(input.id);
        if (!consultant) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المستشار غير موجود" });
        }

        await db.updateConsultantStatus(input.id, input.status);

        if (consultant.userId) {
          await publishNotification({
            userId: consultant.userId,
            title: input.status === "approved" ? "تمت الموافقة على طلبك" : "تم رفض طلبك",
            body: input.status === "approved"
              ? "تهانينا! تمت الموافقة على طلب الانضمام كمستشار."
              : input.reason || "نأسف، لم يتم قبول طلبك. يمكنك التقدم مرة أخرى.",
            type: "system",
          });
        }

        recordAudit({
          action: `admin:consultant:${input.status}`,
          actorId: ctx.user.id,
          actorEmail: ctx.user.email,
          resource: `consultant:${input.id}`,
          summary: `${ctx.user.name ?? ctx.user.email} ${input.status === "approved" ? "وافق على" : "رفض"} المستشار #${input.id}`,
        });

        return { success: true };
      }),
  }),
});
