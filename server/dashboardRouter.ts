import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { publishNotification } from "./notificationsRouter";
import { getDrizzleDb } from "./db/drizzle";
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

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

let lastAnomalySignature: string | null = null;

export const dashboardRouter = router({
  companyOverview: protectedProcedure.query(async () => {
    const fallbackStats = {
      totalEmployees: 156,
      activeJobs: 12,
      openTickets: 23,
      pendingApplicants: 45,
    };

    const fallbackActivities = [
      { id: 1, type: "employee", message: "تم تعيين موظف جديد: أحمد محمد", timeAgo: "منذ ساعتين" },
      { id: 2, type: "job", message: "تم نشر وظيفة جديدة: مطور برمجيات", timeAgo: "منذ 3 ساعات" },
      { id: 3, type: "ticket", message: "تذكرة جديدة: طلب إجازة - سارة علي", timeAgo: "منذ 5 ساعات" },
      { id: 4, type: "applicant", message: "15 متقدم جديد لوظيفة محاسب", timeAgo: "منذ يوم" },
    ];

    const fallbackTasks = [
      { id: 1, title: "مقابلة مع مرشح لوظيفة مدير مبيعات", due: "اليوم، 2:00 م", priority: "high" },
      { id: 2, title: "مراجعة طلبات الإجازات المعلقة", due: "غداً، 10:00 ص", priority: "medium" },
      { id: 3, title: "إعداد تقرير الرواتب الشهري", due: "15 نوفمبر", priority: "low" },
    ];

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
        timeAgo: row.appliedAt
          ? new Date(row.appliedAt as any).toISOString()
          : "—",
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
        due: row.dueDate ? new Date(row.dueDate as any).toISOString() : "بدون موعد",
        priority: row.priority ?? "medium",
      }));

      return { stats, activities, tasks };
    } catch {
      return { stats: fallbackStats, activities: fallbackActivities, tasks: fallbackTasks };
    }
  }),

  employeeOverview: protectedProcedure.query(async () => {
    const fallbackStats = {
      applicationsSubmitted: 12,
      interviewsScheduled: 3,
      offersReceived: 1,
      profileViews: 156,
    };

    const fallbackApplications = [
      {
        id: 1,
        jobTitle: "مطور Full Stack",
        company: "شركة التقنية المتقدمة",
        status: "قيد المراجعة",
        statusColor: "yellow",
        appliedDate: "2024-11-15",
        salary: "12,000 - 18,000 ﷼",
        location: "الرياض",
      },
    ];

    const fallbackRecommendedJobs = [
      {
        id: 1,
        title: "مطور React",
        company: "شركة البرمجيات الحديثة",
        location: "الرياض",
        salary: "10,000 - 14,000 ﷼",
        type: "دوام كامل",
        postedDays: 2,
        match: 95,
      },
    ];

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
        appliedDate: row.appliedAt ? row.appliedAt.toISOString() : "",
        salary:
          row.salaryMin && row.salaryMax
            ? `${row.salaryMin} - ${row.salaryMax} ﷼`
            : "",
        location: row.location ?? "",
        locationEn: row.location ?? "",
      }));

      const recommendedRows = await dbc
        .select({
          id: jobs.id,
          title: jobs.title,
          titleEn: jobs.titleEn,
          location: jobs.location,
          salaryMin: jobs.salaryMin,
          salaryMax: jobs.salaryMax,
          status: jobs.status,
        })
        .from(jobs)
        .where(ne(jobs.status, "closed"))
        .orderBy(desc(jobs.publishedAt ?? jobs.createdAt))
        .limit(50);

      const recommendedJobs = recommendedRows.map((row, idx) => ({
        id: row.id ?? idx,
        title: row.title ?? "وظيفة",
        titleEn: row.titleEn ?? "Job",
        company: "—",
        companyEn: "—",
        location: row.location ?? "",
        locationEn: row.location ?? "",
        salary:
          row.salaryMin && row.salaryMax
            ? `${row.salaryMin} - ${row.salaryMax} ﷼`
            : "",
        type: "دوام كامل",
        postedDays: 0,
        match: 80,
      }));

      return { stats, applications, recommendedJobs };
    } catch {
      return {
        stats: fallbackStats,
        applications: fallbackApplications,
        recommendedJobs: fallbackRecommendedJobs,
      };
    }
  }),

  executive: protectedProcedure.query(async () => {
    const bookings = await db.getAllConsultationBookings();
    const pendingBookings = bookings.filter(b => b.status === "pending");
    const completedBookings = bookings.filter(b => b.status === "completed");

    const scheduledDiffs = bookings
      .map(booking => {
        const createdAt = booking.createdAt ?? new Date();
        const scheduledRaw = booking.scheduledDate;
        const scheduledDate =
          scheduledRaw instanceof Date ? scheduledRaw : new Date(scheduledRaw ?? Date.now());
        return (scheduledDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      })
      .filter(diff => Number.isFinite(diff));
    const avgTimeToFillDays = scheduledDiffs.length
      ? scheduledDiffs.reduce((acc, diff) => acc + diff, 0) / scheduledDiffs.length
      : 0;
    const targetFillDays = 25;
    const timeToFillDelta = Math.round(avgTimeToFillDays - targetFillDays);

    const tickets = await db.getConsultingTickets();
    const resolutionDurations: number[] = [];
    for (const ticket of tickets) {
      const responses = await db.getTicketResponses(ticket.id);
      if (!responses.length) continue;
      const sorted = [...responses].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const lastResponseAt = sorted[sorted.length - 1].createdAt;
      const duration =
        (lastResponseAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      if (Number.isFinite(duration)) {
        resolutionDurations.push(duration);
      }
    }
    const timeToResolveHours = resolutionDurations.length
      ? resolutionDurations.reduce((acc, hours) => acc + hours, 0) / resolutionDurations.length
      : 0;

    const consultingRevenueSar = bookings.reduce((sum, booking) => {
      const price = typeof booking.price === "number" ? booking.price : Number(booking.price ?? 0);
      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);

    const offerAcceptanceRate = bookings.length
      ? Math.round((completedBookings.length / bookings.length) * 100)
      : 0;

    const pendingTickets = tickets.filter(t => t.status !== "closed").length;

    const metrics: DashboardMetric = {
      timeToFillDays: Math.round(avgTimeToFillDays),
      timeToFillDelta,
      timeToResolveHours: Math.round(timeToResolveHours),
      consultingRevenueSar,
      offerAcceptanceRate,
      pendingTickets,
      pendingConsultations: pendingBookings.length,
      completedConsultations: completedBookings.length,
    };

    const anomalies: DashboardAnomaly[] = [];
    if (pendingBookings.length > 5) {
      anomalies.push({
        title: "تفاصيل حجز متراكمة",
        detail: `${pendingBookings} حجوزات معلقة تحتاج متابعة خلال 48 ساعة.`,
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
        detail: `نسبة القبول ${offerAcceptanceRate}%، أقل من الهدف (70%).`,
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

    if (anomalies.length) {
      const signature = anomalies
        .map(anomaly => `${anomaly.severity}:${anomaly.title}`)
        .join("|");
      if (signature !== lastAnomalySignature) {
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
      }
    }

    const consultants = await db.getApprovedConsultants();
    const responseValues = consultants
      .map(c => parseNumber(c.sla?.responseHours))
      .filter((v): v is number => typeof v === "number" && v > 0);
    const deliveryValues = consultants
      .map(c => parseNumber(c.sla?.deliveryHours))
      .filter((v): v is number => typeof v === "number" && v > 0);
    const avgResponse = responseValues.length
      ? responseValues.reduce((sum, value) => sum + value, 0) / responseValues.length
      : 8;
    const avgDelivery = deliveryValues.length
      ? deliveryValues.reduce((sum, value) => sum + value, 0) / deliveryValues.length
      : 48;

    const sla: DashboardSla = {
      hiring: { firstResponseHours: 24, decisionDays: 7 },
      tickets: { firstResponseHours: 4, resolutionHours: 24 },
      consulting: {
        firstResponseHours: Math.round(avgResponse),
        deliveryHours: Math.round(avgDelivery),
      },
      targetCompliance: 92,
    };

    return { metrics, anomalies, sla };
  }),
});
