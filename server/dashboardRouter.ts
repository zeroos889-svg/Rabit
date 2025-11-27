import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { publishNotification } from "./notificationsRouter";
import { getDrizzleDb } from "./db/drizzle";
import { cache, CACHE_KEYS, CACHE_TTL } from "./_core/cache";
import { logger } from "./_core/logger";
import { createHash } from "node:crypto";
import {
  employees,
  jobs,
  jobApplications,
  consultingTickets,
  tasks as tasksTable,
} from "../drizzle/schema";
import { eq, ne, desc, sql } from "drizzle-orm";

type DashboardMetric = {
  timeToFillDays: number;
  timeToFillDelta: number;
  timeToResolveHours: number;
  consultingRevenueSar: number;
  offerAcceptanceRate: number;
  pendingTickets: number;
  pendingConsultations: number;
  completedConsultations: number;
};

type DashboardAnomaly = {
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  action: string;
};

type DashboardSla = {
  hiring: { firstResponseHours: number; decisionDays: number };
  tickets: { firstResponseHours: number; resolutionHours: number };
  consulting: { firstResponseHours: number; deliveryHours: number };
  targetCompliance: number;
};

type ConsultationBooking = Awaited<ReturnType<typeof db.getAllConsultationBookings>>[number];
type ConsultingTicket = Awaited<ReturnType<typeof db.getConsultingTickets>>[number];
type Consultant = Awaited<ReturnType<typeof db.getApprovedConsultants>>[number];

type CompanyOverviewResponse = {
  stats: {
    totalEmployees: number;
    activeJobs: number;
    openTickets: number;
    pendingApplicants: number;
  };
  activities: Array<{ id: number; type: string; message: string; timeAgo: string }>;
  tasks: Array<{ id: number; title: string; due: string; priority: string }>;
};

type EmployeeOverviewResponse = {
  stats: {
    applicationsSubmitted: number;
    interviewsScheduled: number;
    offersReceived: number;
    profileViews: number;
  };
  applications: Array<{
    id: number;
    jobTitle: string;
    jobTitleEn: string;
    company: string;
    companyEn: string;
    status: string;
    statusEn: string;
    statusColor: string;
    appliedDate: string;
    salary: string;
    location: string;
    locationEn: string;
  }>;
  recommendedJobs: Array<{
    id: number;
    title: string;
    titleEn: string;
    company: string;
    companyEn: string;
    location: string;
    locationEn: string;
    salary: string;
    type: string;
    postedDays: number;
    match: number;
  }>;
};

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toIsoString = (value: unknown): string => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }
  return "";
};

let lastAnomalySignature: string | null = null;

const hashSearchPayload = (value: string) => createHash("sha1").update(value).digest("hex");

const computeBookingStats = (bookings: ConsultationBooking[]) => {
  const pendingBookings = bookings.filter(booking => booking.status === "pending");
  const completedBookings = bookings.filter(booking => booking.status === "completed");

  const scheduledDiffs = bookings
    .map(booking => {
      const createdAt = booking.createdAt ?? new Date();
      const scheduledRaw = booking.scheduledDate;
      const scheduledDate =
        scheduledRaw instanceof Date ? scheduledRaw : new Date(scheduledRaw ?? Date.now());
      return (scheduledDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    })
    .filter((diff): diff is number => Number.isFinite(diff));

  const avgTimeToFillDays = scheduledDiffs.length
    ? scheduledDiffs.reduce((acc, diff) => acc + diff, 0) / scheduledDiffs.length
    : 0;
  const targetFillDays = 25;
  const timeToFillDelta = Math.round(avgTimeToFillDays - targetFillDays);

  const consultingRevenueSar = bookings.reduce((sum, booking) => {
    const price = typeof booking.price === "number" ? booking.price : Number(booking.price ?? 0);
    return sum + (Number.isFinite(price) ? price : 0);
  }, 0);

  const offerAcceptanceRate = bookings.length
    ? Math.round((completedBookings.length / bookings.length) * 100)
    : 0;

  return {
    pendingBookings,
    completedBookings,
    avgTimeToFillDays,
    timeToFillDelta,
    consultingRevenueSar,
    offerAcceptanceRate,
  };
};

const computeResolutionHours = async (tickets: ConsultingTicket[]) => {
  const resolutionDurations: number[] = [];

  for (const ticket of tickets) {
    const responses = await db.getTicketResponses(ticket.id);
    if (!responses.length) continue;

    const sorted = [...responses].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const lastResponseAt = sorted.at(-1)?.createdAt;
    if (!lastResponseAt) continue;

    const duration = (lastResponseAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    if (Number.isFinite(duration)) {
      resolutionDurations.push(duration);
    }
  }

  return resolutionDurations.length
    ? resolutionDurations.reduce((acc, hours) => acc + hours, 0) / resolutionDurations.length
    : 0;
};

const buildExecutiveAnomalies = (
  pendingBookingsCount: number,
  pendingTickets: number,
  offerAcceptanceRate: number,
  timeToResolveHours: number
): DashboardAnomaly[] => {
  const anomalies: DashboardAnomaly[] = [];

  if (pendingBookingsCount > 5) {
    anomalies.push({
      title: "تفاصيل حجز متراكمة",
      detail: `${pendingBookingsCount} حجوزات معلقة تحتاج متابعة خلال 48 ساعة.`,
      severity: "high",
      action: "مراجعة فريق الحجز وتسريع التواصل.",
    });
  }

  if (pendingTickets > 4) {
    anomalies.push({
      title: "طلبات دعم مفتوحة",
      detail: `${pendingTickets} تذاكر دعم لم تُغلق بعد.`,
      severity: "medium",
      action: "أعد توزيع التذاكر على المستشارين والمشرفين.",
    });
  }

  if (offerAcceptanceRate < 70) {
    anomalies.push({
      title: "نسبة قبول عرض منخفضة",
      detail: `نسبة القبول ${offerAcceptanceRate}%, أقل من الهدف (70%).`,
      severity: "medium",
      action: "تحديث الحزم والأسعار مع توضيح القيمة.",
    });
  }

  if (timeToResolveHours > 18) {
    anomalies.push({
      title: "حل تذاكر بطيء",
      detail: `متوسط وقت الحل ${Math.round(timeToResolveHours)} ساعة.`,
      severity: "medium",
      action: "فعّل تنبيهات SLA وأعد جدولة المهام.",
    });
  }

  return anomalies;
};

const buildConsultingSlaSnapshot = (consultants: Consultant[]): DashboardSla => {
  const responseValues = consultants
    .map(consultant => parseNumber(consultant.sla?.responseHours))
    .filter((value): value is number => typeof value === "number" && value > 0);

  const deliveryValues = consultants
    .map(consultant => parseNumber(consultant.sla?.deliveryHours))
    .filter((value): value is number => typeof value === "number" && value > 0);

  const avgResponse = responseValues.length
    ? responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length
    : 8;
  const avgDelivery = deliveryValues.length
    ? deliveryValues.reduce((sum, value) => sum + value, 0) / deliveryValues.length
    : 48;

  return {
    hiring: { firstResponseHours: 24, decisionDays: 7 },
    tickets: { firstResponseHours: 4, resolutionHours: 24 },
    consulting: {
      firstResponseHours: Math.round(avgResponse),
      deliveryHours: Math.round(avgDelivery),
    },
    targetCompliance: 92,
  };
};

const dispatchExecutiveNotifications = async (anomalies: DashboardAnomaly[]) => {
  if (!anomalies.length) return;

  const signature = anomalies.map(anomaly => `${anomaly.severity}:${anomaly.title}`).join("|");
  if (signature === lastAnomalySignature) {
    return;
  }

  lastAnomalySignature = signature;

  try {
    const snippet = anomalies
      .slice(0, 3)
      .map(anomaly => `${anomaly.title} (${anomaly.severity})`)
      .join(" | ");

    await publishNotification({
      userId: null,
      title: `تنبيهات تنفيذية (${anomalies.length})`,
      body: snippet || "تحقق من أرقام اللوحة التنفيذية",
      type: "warning",
      metadata: { anomalies: anomalies.map(anomaly => anomaly.title) },
    });
  } catch {
    // best-effort notification
  }
};

const buildCompanyFallback = (): CompanyOverviewResponse => ({
  stats: {
    totalEmployees: 156,
    activeJobs: 12,
    openTickets: 23,
    pendingApplicants: 45,
  },
  activities: [
    { id: 1, type: "employee", message: "تم تعيين موظف جديد: أحمد محمد", timeAgo: "منذ ساعتين" },
    { id: 2, type: "job", message: "تم نشر وظيفة جديدة: مطور برمجيات", timeAgo: "منذ 3 ساعات" },
    { id: 3, type: "ticket", message: "تذكرة جديدة: طلب إجازة - سارة علي", timeAgo: "منذ 5 ساعات" },
    { id: 4, type: "applicant", message: "15 متقدم جديد لوظيفة محاسب", timeAgo: "منذ يوم" },
  ],
  tasks: [
    { id: 1, title: "مقابلة مع مرشح لوظيفة مدير مبيعات", due: "اليوم، 2:00 م", priority: "high" },
    { id: 2, title: "مراجعة طلبات الإجازات المعلقة", due: "غداً، 10:00 ص", priority: "medium" },
    { id: 3, title: "إعداد تقرير الرواتب الشهري", due: "15 نوفمبر", priority: "low" },
  ],
});

const buildEmployeeFallback = (): EmployeeOverviewResponse => ({
  stats: {
    applicationsSubmitted: 12,
    interviewsScheduled: 3,
    offersReceived: 1,
    profileViews: 156,
  },
  applications: [
    {
      id: 1,
      jobTitle: "مطور Full Stack",
      jobTitleEn: "Full Stack Developer",
      company: "شركة التقنية المتقدمة",
      companyEn: "Advanced Tech",
      status: "قيد المراجعة",
      statusEn: "reviewing",
      statusColor: "yellow",
      appliedDate: "2024-11-15",
      salary: "12,000 - 18,000 ﷼",
      location: "الرياض",
      locationEn: "Riyadh",
    },
  ],
  recommendedJobs: [
    {
      id: 1,
      title: "مطور React",
      titleEn: "React Developer",
      company: "شركة البرمجيات الحديثة",
      companyEn: "Modern Software",
      location: "الرياض",
      locationEn: "Riyadh",
      salary: "10,000 - 14,000 ﷼",
      type: "دوام كامل",
      postedDays: 2,
      match: 95,
    },
  ],
});

export const dashboardRouter = router({
  companyOverview: protectedProcedure.query(async () => {
    const cacheKey = CACHE_KEYS.DASHBOARD_COMPANY_OVERVIEW();
    const fallbackResponse = buildCompanyFallback();
    let loaderFailed = false;

    const loadCompanyOverview = async (): Promise<CompanyOverviewResponse> => {
      try {
        const dbc = await getDrizzleDb();

        const [empCount] = await dbc.select({ count: sql<number>`count(*)` }).from(employees);
        const [jobCount] = await dbc
          .select({ count: sql<number>`count(*)` })
          .from(jobs)
          .where(ne(jobs.status, "closed"));
        const [ticketCount] = await dbc
          .select({ count: sql<number>`count(*)` })
          .from(consultingTickets)
          .where(ne(consultingTickets.status, "completed"));
        const [pendingApplicants] = await dbc
          .select({ count: sql<number>`count(*)` })
          .from(jobApplications)
          .where(eq(jobApplications.status, "pending"));

        const stats = {
          totalEmployees: Number(empCount?.count || 0),
          activeJobs: Number(jobCount?.count || 0),
          openTickets: Number(ticketCount?.count || 0),
          pendingApplicants: Number(pendingApplicants?.count || 0),
        };

        const activitiesRows = await dbc
          .select({
            id: jobApplications.id,
            status: jobApplications.status,
            appliedAt: jobApplications.appliedAt,
          })
          .from(jobApplications)
          .orderBy(desc(jobApplications.appliedAt))
          .limit(50);

        const activities = activitiesRows.map((row, idx) => ({
          id: row.id ?? idx,
          type: "applicant",
          message: `طلب توظيف (${row.status ?? "pending"})`,
          timeAgo: toIsoString(row.appliedAt) || "—",
        }));

        const tasksRows = await dbc
          .select({
            id: tasksTable.id,
            title: tasksTable.title,
            dueDate: tasksTable.dueDate,
            priority: tasksTable.priority,
          })
          .from(tasksTable)
          .orderBy(desc(tasksTable.dueDate))
          .limit(50);

        const tasks = tasksRows.map((row, idx) => ({
          id: row.id ?? idx,
          title: row.title ?? "مهمة",
          due: toIsoString(row.dueDate) || "بدون موعد",
          priority: row.priority ?? "medium",
        }));

        return { stats, activities, tasks };
      } catch (error) {
        loaderFailed = true;
        throw error;
      }
    };

    try {
      return await cache.getOrSet(cacheKey, loadCompanyOverview, CACHE_TTL.FREQUENT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (loaderFailed) {
        logger.warn("dashboard.companyOverview loader failed, serving fallback", { error: errorMessage });
        return fallbackResponse;
      }

      logger.warn("dashboard.companyOverview cache unavailable, bypassing Redis", { error: errorMessage });
      try {
        return await loadCompanyOverview();
      } catch (secondaryError) {
        logger.error("dashboard.companyOverview failed after cache bypass", {
          error: secondaryError instanceof Error ? secondaryError.message : String(secondaryError),
        });
        return fallbackResponse;
      }
    }
  }),

  employeeOverview: protectedProcedure.query(async () => {
    const cacheKey = CACHE_KEYS.DASHBOARD_EMPLOYEE_OVERVIEW();
    const recommendedHash = hashSearchPayload("dashboard:recommended:open");
    const fallbackResponse = buildEmployeeFallback();
    let loaderFailed = false;

    const loadEmployeeOverview = async (): Promise<EmployeeOverviewResponse> => {
      try {
        const dbc = await getDrizzleDb();

        const [totalApps] = await dbc.select({ count: sql<number>`count(*)` }).from(jobApplications);
        const [interviews] = await dbc
          .select({ count: sql<number>`count(*)` })
          .from(jobApplications)
          .where(eq(jobApplications.status, "interview"));
        const [offers] = await dbc
          .select({ count: sql<number>`count(*)` })
          .from(jobApplications)
          .where(eq(jobApplications.status, "offer"));

        const stats = {
          applicationsSubmitted: Number(totalApps?.count || 0),
          interviewsScheduled: Number(interviews?.count || 0),
          offersReceived: Number(offers?.count || 0),
          profileViews: 0,
        };

        const applicationRows = await dbc
          .select({
            id: jobApplications.id,
            status: jobApplications.status,
            appliedAt: jobApplications.appliedAt,
            jobId: jobApplications.jobId,
            jobTitle: jobs.title,
            jobTitleEn: jobs.titleEn,
            location: jobs.location,
            salaryMin: jobs.salaryMin,
            salaryMax: jobs.salaryMax,
          })
          .from(jobApplications)
          .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
          .orderBy(desc(jobApplications.appliedAt))
          .limit(50);

        const statusColorMap: Record<string, string> = {
          pending: "yellow",
          reviewing: "blue",
          interview: "blue",
          offer: "green",
          rejected: "red",
          hired: "green",
        };

        const applications = applicationRows.map((row, idx) => ({
          id: row.id ?? idx,
          jobTitle: row.jobTitle ?? "وظيفة",
          jobTitleEn: row.jobTitleEn ?? "Job",
          company: "—",
          companyEn: "—",
          status: row.status ?? "pending",
          statusEn: row.status ?? "pending",
          statusColor: statusColorMap[row.status ?? "pending"] || "yellow",
          appliedDate: toIsoString(row.appliedAt),
          salary:
            row.salaryMin && row.salaryMax ? `${row.salaryMin} - ${row.salaryMax} ﷼` : "",
          location: row.location ?? "",
          locationEn: row.location ?? "",
        }));

        const recommendedJobs = await cache.getOrSet(
          CACHE_KEYS.SEARCH_RESULTS("jobs", recommendedHash),
          async () => {
            const recommendedRows = await dbc
              .select({
                id: jobs.id,
                title: jobs.title,
                titleEn: jobs.titleEn,
                location: jobs.location,
                salaryMin: jobs.salaryMin,
                salaryMax: jobs.salaryMax,
                status: jobs.status,
                publishedAt: jobs.publishedAt,
                createdAt: jobs.createdAt,
              })
              .from(jobs)
              .where(ne(jobs.status, "closed"))
              .orderBy(desc(jobs.publishedAt ?? jobs.createdAt))
              .limit(50);

            return recommendedRows.map((row, idx) => ({
              id: row.id ?? idx,
              title: row.title ?? "وظيفة",
              titleEn: row.titleEn ?? "Job",
              company: "—",
              companyEn: "—",
              location: row.location ?? "",
              locationEn: row.location ?? "",
              salary:
                row.salaryMin && row.salaryMax ? `${row.salaryMin} - ${row.salaryMax} ﷼` : "",
              type: "دوام كامل",
              postedDays: 0,
              match: 80,
            }));
          },
          CACHE_TTL.TEMPORARY
        );

        return { stats, applications, recommendedJobs };
      } catch (error) {
        loaderFailed = true;
        throw error;
      }
    };

    try {
      return await cache.getOrSet(cacheKey, loadEmployeeOverview, CACHE_TTL.FREQUENT);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (loaderFailed) {
        logger.warn("dashboard.employeeOverview loader failed, serving fallback", { error: errorMessage });
        return fallbackResponse;
      }

      logger.warn("dashboard.employeeOverview cache unavailable, bypassing Redis", { error: errorMessage });
      try {
        return await loadEmployeeOverview();
      } catch (secondaryError) {
        logger.error("dashboard.employeeOverview failed after cache bypass", {
          error: secondaryError instanceof Error ? secondaryError.message : String(secondaryError),
        });
        return fallbackResponse;
      }
    }
  }),

  executive: protectedProcedure.query(async () => {
    const cacheKey = CACHE_KEYS.DASHBOARD_EXECUTIVE_OVERVIEW();
    const fallbackMetrics: DashboardMetric = {
      timeToFillDays: 25,
      timeToFillDelta: 0,
      timeToResolveHours: 12,
      consultingRevenueSar: 0,
      offerAcceptanceRate: 80,
      pendingTickets: 0,
      pendingConsultations: 0,
      completedConsultations: 0,
    };
    const fallbackResponse = {
      metrics: fallbackMetrics,
      anomalies: [] as DashboardAnomaly[],
      sla: buildConsultingSlaSnapshot([]),
    };
    let loaderFailed = false;

    const loadExecutiveOverview = async () => {
      try {
        const bookings = await db.getAllConsultationBookings();
        const tickets = await db.getConsultingTickets();

        const bookingStats = computeBookingStats(bookings);
        const timeToResolveHoursRaw = await computeResolutionHours(tickets);
        const pendingTickets = tickets.filter(ticket => ticket.status !== "closed").length;

        const metrics: DashboardMetric = {
          timeToFillDays: Math.round(bookingStats.avgTimeToFillDays),
          timeToFillDelta: bookingStats.timeToFillDelta,
          timeToResolveHours: Math.round(timeToResolveHoursRaw),
          consultingRevenueSar: bookingStats.consultingRevenueSar,
          offerAcceptanceRate: bookingStats.offerAcceptanceRate,
          pendingTickets,
          pendingConsultations: bookingStats.pendingBookings.length,
          completedConsultations: bookingStats.completedBookings.length,
        };

        const anomalies = buildExecutiveAnomalies(
          bookingStats.pendingBookings.length,
          pendingTickets,
          bookingStats.offerAcceptanceRate,
          timeToResolveHoursRaw
        );

        await dispatchExecutiveNotifications(anomalies);

        const consultants = await db.getApprovedConsultants();
        const sla = buildConsultingSlaSnapshot(consultants);

        return { metrics, anomalies, sla };
      } catch (error) {
        loaderFailed = true;
        throw error;
      }
    };

    try {
      return await cache.getOrSet(cacheKey, loadExecutiveOverview, CACHE_TTL.REALTIME);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (loaderFailed) {
        logger.warn("dashboard.executive loader failed, serving fallback", { error: errorMessage });
        return fallbackResponse;
      }

      logger.warn("dashboard.executive cache unavailable, bypassing Redis", { error: errorMessage });
      try {
        return await loadExecutiveOverview();
      } catch (secondaryError) {
        logger.error("dashboard.executive failed after cache bypass", {
          error: secondaryError instanceof Error ? secondaryError.message : String(secondaryError),
        });
        return fallbackResponse;
      }
    }
  }),
});
