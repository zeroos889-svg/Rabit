import { protectedProcedure, router, adminProcedure } from "./_core/trpc";
import { createHash } from "crypto";
import { z } from "zod";
import { cache, CACHE_KEYS, CACHE_TTL } from "./_core/cache";
import { logger } from "./_core/logger";
import { getDrizzleDb } from "./db/drizzle";
import { jobs, jobApplications, hrCases, chatConversations, chatMessages } from "../drizzle/schema";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { ENV } from "./_core/env";

type DateRange = { from?: Date; to?: Date };

type DateCompatibleKey<T> = {
  [K in keyof T]: T[K] extends Date | string | number ? K : never;
}[keyof T];

const dateRangeInput = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .optional();

const parseDateRange = (input?: { from?: string; to?: string }): DateRange => {
  if (!input) return {};
  const { from, to } = input;

  const parsedFrom = from ? new Date(from) : undefined;
  const parsedTo = to ? new Date(to) : undefined;

  return {
    from: parsedFrom && !Number.isNaN(parsedFrom.getTime()) ? parsedFrom : undefined,
    to: parsedTo && !Number.isNaN(parsedTo.getTime()) ? parsedTo : undefined,
  };
};

const isWithinRange = (date: Date, range: DateRange) => {
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
};

const buildRangeIdentifier = (range: DateRange) => {
  if (!range.from && !range.to) return "all";
  const from = range.from ? range.from.toISOString().slice(0, 10) : "min";
  const to = range.to ? range.to.toISOString().slice(0, 10) : "max";
  return `${from}:${to}`;
};

const hashRange = (range: DateRange) =>
  createHash("sha1").update(buildRangeIdentifier(range)).digest("hex");

const withReportCache = async <T>(
  key: string,
  builder: () => Promise<T>,
  ttl: number,
  context: string
): Promise<T> => {
  try {
    return await cache.getOrSet(key, builder, ttl);
  } catch (error) {
    logger.warn(`reports.${context} cache unavailable, bypassing Redis`, {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return builder();
  }
};

// Hand-curated sample data to power dashboards until real DB wiring lands
type HiringEvent = {
  id: number;
  date: string;
  status:
    | "applied"
    | "pending"
    | "reviewing"
    | "shortlisted"
    | "interview"
    | "offer"
    | "offer_accepted"
    | "offer_declined"
    | "hired"
    | "rejected";
  stage: "applied" | "screen" | "interview" | "offer" | "hired";
  source: "LinkedIn" | "Referral" | "Careers" | "Agency";
  department: string;
  seniority: "junior" | "mid" | "senior";
  timeToHireDays?: number;
};

type SupportTicket = {
  id: number;
  createdAt: string;
  status: "open" | "in_progress" | "closed";
  category: string;
  slaMet: boolean;
  resolutionHours?: number;
};

type ChatSession = {
  id: number;
  createdAt: string;
  responseMinutes: number;
  intent: "leave" | "contracts" | "eosb" | "policies" | "general";
  csat: number;
};

const FALLBACK_HIRING_EVENTS: HiringEvent[] = [
  {
    id: 1,
    date: "2024-01-05",
    status: "applied",
    stage: "applied",
    source: "LinkedIn",
    department: "Engineering",
    seniority: "mid",
  },
  {
    id: 2,
    date: "2024-01-06",
    status: "interview",
    stage: "interview",
    source: "Referral",
    department: "Engineering",
    seniority: "senior",
    timeToHireDays: 16,
  },
  {
    id: 3,
    date: "2024-01-10",
    status: "offer_accepted",
    stage: "offer",
    source: "Careers",
    department: "HR",
    seniority: "mid",
    timeToHireDays: 18,
  },
  {
    id: 4,
    date: "2024-01-12",
    status: "rejected",
    stage: "screen",
    source: "LinkedIn",
    department: "Finance",
    seniority: "junior",
  },
  {
    id: 5,
    date: "2024-02-02",
    status: "hired",
    stage: "hired",
    source: "Referral",
    department: "Engineering",
    seniority: "mid",
    timeToHireDays: 21,
  },
  {
    id: 6,
    date: "2024-02-15",
    status: "hired",
    stage: "hired",
    source: "Careers",
    department: "Operations",
    seniority: "senior",
    timeToHireDays: 14,
  },
  {
    id: 7,
    date: "2024-02-20",
    status: "offer_declined",
    stage: "offer",
    source: "LinkedIn",
    department: "HR",
    seniority: "mid",
    timeToHireDays: 10,
  },
  {
    id: 8,
    date: "2024-03-05",
    status: "applied",
    stage: "applied",
    source: "Agency",
    department: "Finance",
    seniority: "junior",
  },
  {
    id: 9,
    date: "2024-03-11",
    status: "hired",
    stage: "hired",
    source: "LinkedIn",
    department: "Engineering",
    seniority: "mid",
    timeToHireDays: 24,
  },
  {
    id: 10,
    date: "2024-03-12",
    status: "interview",
    stage: "interview",
    source: "Referral",
    department: "Operations",
    seniority: "senior",
    timeToHireDays: 15,
  },
];

const FALLBACK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 1,
    createdAt: "2024-01-04",
    status: "closed",
    category: "payroll",
    slaMet: true,
    resolutionHours: 8,
  },
  {
    id: 2,
    createdAt: "2024-01-07",
    status: "open",
    category: "contracts",
    slaMet: false,
  },
  {
    id: 3,
    createdAt: "2024-01-14",
    status: "closed",
    category: "attendance",
    slaMet: true,
    resolutionHours: 6,
  },
  {
    id: 4,
    createdAt: "2024-02-03",
    status: "closed",
    category: "benefits",
    slaMet: true,
    resolutionHours: 5,
  },
  {
    id: 5,
    createdAt: "2024-02-18",
    status: "in_progress",
    category: "payroll",
    slaMet: false,
  },
  {
    id: 6,
    createdAt: "2024-02-26",
    status: "closed",
    category: "contracts",
    slaMet: false,
    resolutionHours: 12,
  },
  {
    id: 7,
    createdAt: "2024-03-02",
    status: "open",
    category: "attendance",
    slaMet: true,
  },
  {
    id: 8,
    createdAt: "2024-03-09",
    status: "closed",
    category: "benefits",
    slaMet: true,
    resolutionHours: 4,
  },
];

const FALLBACK_CHAT_SESSIONS: ChatSession[] = [
  { id: 1, createdAt: "2024-01-04", responseMinutes: 4, intent: "leave", csat: 4.6 },
  { id: 2, createdAt: "2024-01-05", responseMinutes: 6, intent: "contracts", csat: 4.8 },
  { id: 3, createdAt: "2024-02-01", responseMinutes: 5, intent: "eosb", csat: 4.2 },
  { id: 4, createdAt: "2024-02-12", responseMinutes: 7, intent: "policies", csat: 4 },
  { id: 5, createdAt: "2024-02-22", responseMinutes: 9, intent: "leave", csat: 3.9 },
  { id: 6, createdAt: "2024-03-02", responseMinutes: 4, intent: "contracts", csat: 4.7 },
  { id: 7, createdAt: "2024-03-08", responseMinutes: 5, intent: "eosb", csat: 4.3 },
  { id: 8, createdAt: "2024-03-18", responseMinutes: 3, intent: "leave", csat: 4.9 },
];

type AnalyticsDataset = {
  hiring: HiringEvent[];
  support: SupportTicket[];
  chats: ChatSession[];
};

const ANALYTICS_FETCH_LIMIT = 2000;
const CHAT_FETCH_LIMIT = 500;
const SUPPORT_SLA_TARGET_HOURS = 24;
const DATABASE_ENABLED = Boolean(ENV.databaseUrl);

const toIso = (value: Date | string | null | undefined) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const diffInHours = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) return undefined;
  const delta = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Number.isFinite(delta) ? Math.round(delta * 10) / 10 : undefined;
};

const diffInMinutes = (start?: Date | null, end?: Date | null) => {
  if (!start || !end) return 0;
  const delta = (end.getTime() - start.getTime()) / (1000 * 60);
  return Number.isFinite(delta) && delta > 0 ? Math.round(delta * 10) / 10 : 0;
};

const stageFromStatus = (status?: string | null): HiringEvent["stage"] => {
  switch (status) {
    case "applied":
      return "applied";
    case "interview":
      return "interview";
    case "offer":
    case "offer_accepted":
    case "offer_declined":
      return "offer";
    case "hired":
      return "hired";
    case "reviewing":
    case "shortlisted":
    case "pending":
    case "rejected":
    default:
      return "screen";
  }
};

const sourceFromEmploymentType = (employmentType?: string | null): HiringEvent["source"] => {
  switch (employmentType) {
    case "part-time":
      return "Referral";
    case "contract":
      return "Agency";
    case "temporary":
      return "Careers";
    case "full-time":
    default:
      return "LinkedIn";
  }
};

const seniorityFromExperience = (experience?: string | null): HiringEvent["seniority"] => {
  switch (experience) {
    case "entry":
      return "junior";
    case "senior":
    case "executive":
      return "senior";
    case "mid":
    default:
      return "mid";
  }
};

const normalizeCaseStatus = (status?: string | null): SupportTicket["status"] => {
  switch (status) {
    case "resolved":
    case "closed":
      return "closed";
    case "in-progress":
      return "in_progress";
    default:
      return "open";
  }
};

const detectChatIntent = (message?: string | null): ChatSession["intent"] => {
  if (!message) return "general";
  const normalized = message.toLowerCase();
  if (normalized.includes("leave") || normalized.includes("اجاز")) return "leave";
  if (normalized.includes("contract") || normalized.includes("عقد")) return "contracts";
  if (normalized.includes("eosb") || normalized.includes("end of service") || normalized.includes("نهاية")) {
    return "eosb";
  }
  if (normalized.includes("policy") || normalized.includes("سياسة")) return "policies";
  return "general";
};

const estimateCsat = (responseMinutes: number, status?: string | null) => {
  const baseline = status === "closed" ? 4.6 : 4.2;
  const penalty = Math.min(responseMinutes / 20, 1.5);
  const score = Math.max(3, Math.min(5, baseline - penalty));
  return Math.round(score * 10) / 10;
};

const safeLoader = async <T>(context: string, loader: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await loader();
  } catch (error) {
    logger.warn(`reports.${context}.db_fallback`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
};

const loadAnalyticsData = async (range: DateRange): Promise<AnalyticsDataset> => {
  if (!DATABASE_ENABLED) {
    return {
      hiring: FALLBACK_HIRING_EVENTS,
      support: FALLBACK_SUPPORT_TICKETS,
      chats: FALLBACK_CHAT_SESSIONS,
    };
  }

  const [hiring, support, chats] = await Promise.all([
    safeLoader("hiring", () => fetchHiringEvents(range), FALLBACK_HIRING_EVENTS),
    safeLoader("support", () => fetchSupportTickets(range), FALLBACK_SUPPORT_TICKETS),
    safeLoader("engagement", () => fetchChatSessions(range), FALLBACK_CHAT_SESSIONS),
  ]);

  return { hiring, support, chats };
};

const applyRangeSlices = (data: AnalyticsDataset, range: DateRange) => ({
  hiring: filterByRange(data.hiring, "date", range),
  support: filterByRange(data.support, "createdAt", range),
  chats: filterByRange(data.chats, "createdAt", range),
});

type AnalyticsSlices = ReturnType<typeof applyRangeSlices>;

const computeOverviewFromSlices = ({ hiring, support, chats }: AnalyticsSlices) => {
  const hires = hiring.filter(h => h.status === "hired").length;
  const offersAccepted = hiring.filter(h => ["offer", "offer_accepted", "hired"].includes(h.status)).length;
  const pipelineConversion = hiring.length ? Math.round((hires / hiring.length) * 1000) / 1000 : 0;
  const avgTimeToHireDays = average(
    hiring.filter(h => typeof h.timeToHireDays === "number").map(h => h.timeToHireDays || 0)
  );

  const ticketsOpen = support.filter(t => t.status !== "closed").length;
  const ticketsClosed = support.filter(t => t.status === "closed").length;
  const slaMetRatio = ticketsClosed
    ? support.filter(t => t.status === "closed" && t.slaMet).length / ticketsClosed
    : 0;

  const chatConversations = chats.length;
  const avgResponseMinutes = average(chats.map(c => c.responseMinutes));
  const avgCsat = average(chats.map(c => c.csat));

  return {
    applications: hiring.length,
    hires,
    offersAccepted,
    pipelineConversion,
    avgTimeToHireDays,
    ticketsOpen,
    ticketsClosed,
    ticketsSlaMet: Math.round(slaMetRatio * 100) / 100,
    chatConversations,
    avgResponseMinutes,
    avgCsat,
  };
};

const fetchHiringEvents = async (range: DateRange): Promise<HiringEvent[]> => {
  const dbc = await getDrizzleDb();
  const filters = buildDateFilters(range.from, range.to, jobApplications.appliedAt);

  const baseQuery = dbc
    .select({
      id: jobApplications.id,
      appliedAt: jobApplications.appliedAt,
      status: jobApplications.status,
      updatedAt: jobApplications.updatedAt,
      employmentType: jobs.employmentType,
      experienceLevel: jobs.experienceLevel,
      location: jobs.location,
    })
    .from(jobApplications)
    .leftJoin(jobs, eq(jobApplications.jobId, jobs.id));

  const filteredQuery = filters.length
    ? baseQuery.where(filters.length === 1 ? filters[0] : and(...filters))
    : baseQuery;

  const rows = await filteredQuery.orderBy(desc(jobApplications.appliedAt)).limit(ANALYTICS_FETCH_LIMIT);

  return rows
    .map(row => {
      const appliedAt = row.appliedAt ?? row.updatedAt ?? new Date();
      const status = row.status ?? "pending";
      const stage = stageFromStatus(status);
      const source = sourceFromEmploymentType(row.employmentType);
      const seniority = seniorityFromExperience(row.experienceLevel);
      const dept = row.location ?? "General";
      const shouldTrackHireTime = ["hired", "offer", "offer_accepted", "offer_declined"].includes(status);
      const timeToHire = shouldTrackHireTime
        ? diffInHours(row.appliedAt ?? null, row.updatedAt ?? null)
        : undefined;

      return {
        id: row.id ?? 0,
        date: toIso(appliedAt),
        status: status as HiringEvent["status"],
        stage,
        source,
        department: dept,
        seniority,
        timeToHireDays: typeof timeToHire === "number" ? Math.round((timeToHire / 24) * 10) / 10 : undefined,
      } satisfies HiringEvent;
    })
    .filter(event => Boolean(event.date));
};

const fetchSupportTickets = async (range: DateRange): Promise<SupportTicket[]> => {
  const dbc = await getDrizzleDb();
  const filters = buildDateFilters(range.from, range.to, hrCases.createdAt);

  const baseQuery = dbc
    .select({
      id: hrCases.id,
      createdAt: hrCases.createdAt,
      status: hrCases.status,
      caseType: hrCases.caseType,
      resolvedAt: hrCases.resolvedAt,
      updatedAt: hrCases.updatedAt,
    })
    .from(hrCases);

  const filteredQuery = filters.length
    ? baseQuery.where(filters.length === 1 ? filters[0] : and(...filters))
    : baseQuery;

  const rows = await filteredQuery.orderBy(desc(hrCases.createdAt)).limit(ANALYTICS_FETCH_LIMIT);

  return rows.map(row => {
    const createdAt = row.createdAt ?? new Date();
    const resolvedAt = row.resolvedAt ?? row.updatedAt ?? null;
    const status = normalizeCaseStatus(row.status);
    const resolutionHours = status === "closed" ? diffInHours(createdAt, resolvedAt) : undefined;
    return {
      id: row.id ?? 0,
      createdAt: toIso(createdAt),
      status,
      category: row.caseType ?? "other",
      slaMet: typeof resolutionHours === "number" ? resolutionHours <= SUPPORT_SLA_TARGET_HOURS : false,
      resolutionHours,
    } satisfies SupportTicket;
  });
};

const fetchChatSessions = async (range: DateRange): Promise<ChatSession[]> => {
  const dbc = await getDrizzleDb();
  const filters = buildDateFilters(range.from, range.to, chatConversations.createdAt);

  const baseQuery = dbc
    .select({
      id: chatConversations.id,
      createdAt: chatConversations.createdAt,
      status: chatConversations.status,
      lastMessageAt: chatConversations.lastMessageAt,
    })
    .from(chatConversations);

  const filteredQuery = filters.length
    ? baseQuery.where(filters.length === 1 ? filters[0] : and(...filters))
    : baseQuery;

  const conversations = await filteredQuery.orderBy(desc(chatConversations.createdAt)).limit(CHAT_FETCH_LIMIT);
  const convoIds = conversations.map(conv => conv.id).filter((id): id is number => typeof id === "number");

  if (!convoIds.length) {
    return [];
  }

  const messages = await dbc
    .select({
      conversationId: chatMessages.conversationId,
      senderType: chatMessages.senderType,
      createdAt: chatMessages.createdAt,
      message: chatMessages.message,
    })
    .from(chatMessages)
    .where(inArray(chatMessages.conversationId, convoIds));

  const messagesByConversation = new Map<number, typeof messages>();
  for (const message of messages) {
    if (!message.conversationId) continue;
    const bucket = messagesByConversation.get(message.conversationId);
    if (bucket) {
      bucket.push(message);
    } else {
      messagesByConversation.set(message.conversationId, [message]);
    }
  }

  for (const bucket of messagesByConversation.values()) {
    bucket.sort((a, b) => {
      const aTime = (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt ?? new Date())).getTime();
      const bTime = (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt ?? new Date())).getTime();
      return aTime - bTime;
    });
  }

  return conversations.map(conv => {
    const bucket = messagesByConversation.get(conv.id ?? -1) ?? [];
    const firstVisitor = bucket.find(msg => msg.senderType === "visitor");
    const firstAdmin = bucket.find(msg => msg.senderType !== "visitor");
    const responseMinutes = diffInMinutes(
      firstVisitor?.createdAt ?? conv.createdAt ?? null,
      firstAdmin?.createdAt ?? conv.lastMessageAt ?? null
    );
    return {
      id: conv.id ?? 0,
      createdAt: toIso(firstVisitor?.createdAt ?? conv.createdAt ?? conv.lastMessageAt ?? new Date()),
      responseMinutes,
      intent: detectChatIntent(firstVisitor?.message),
      csat: estimateCsat(responseMinutes, conv.status),
    } satisfies ChatSession;
  });
};

function buildDateFilters(from?: Date, to?: Date, column?: any) {
  const filters: any[] = [];
  if (!column) return filters;
  if (from) filters.push(gte(column, from));
  if (to) filters.push(lte(column, to));
  return filters;
}

const filterByRange = <T>(items: T[], key: DateCompatibleKey<T>, range: DateRange) =>
  items.filter(entry => {
    const rawValue = entry[key];
    let dateValue: Date;

    if (rawValue instanceof Date) {
      dateValue = rawValue;
    } else if (typeof rawValue === "number") {
      dateValue = new Date(rawValue);
    } else {
      dateValue = new Date(String(rawValue));
    }

    return isWithinRange(dateValue, range);
  });

const average = (values: number[]) => {
  if (!values.length) return 0;
  return Math.round((values.reduce((acc, v) => acc + v, 0) / values.length) * 10) / 10;
};

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildOverview = async (range: DateRange) => {
  const dataset = await loadAnalyticsData(range);
  const slices = applyRangeSlices(dataset, range);
  return computeOverviewFromSlices(slices);
};

const buildKpis = async (range: DateRange) => {
  const overview = await buildOverview(range);
  return {
    hiring: {
      total: overview.hires,
      pipelineConversion: overview.pipelineConversion,
      offersAccepted: overview.offersAccepted,
      avgTimeToHireDays: overview.avgTimeToHireDays,
    },
    support: {
      ticketsOpen: overview.ticketsOpen,
      ticketsClosed: overview.ticketsClosed,
      ticketsSlaMet: overview.ticketsSlaMet,
    },
    engagement: {
      chatConversations: overview.chatConversations,
      avgResponseMinutes: overview.avgResponseMinutes,
      avgCsat: overview.avgCsat,
    },
  };
};

const buildTimeseries = async (range: DateRange) => {
  const dataset = await loadAnalyticsData(range);
  const { hiring, support: tickets, chats } = applyRangeSlices(dataset, range);

  const monthMap: Record<
    string,
    { month: string; applications: number; hires: number; ticketsClosed: number; chats: number }
  > = {};

  const touchMonth = (date: Date) => {
    const key = monthKey(date);
    if (!monthMap[key]) {
      monthMap[key] = { month: key, applications: 0, hires: 0, ticketsClosed: 0, chats: 0 };
    }
    return key;
  };

  for (const h of hiring) {
    const key = touchMonth(new Date(h.date));
    monthMap[key].applications += 1;
    if (h.status === "hired") monthMap[key].hires += 1;
  }

  for (const t of tickets) {
    const key = touchMonth(new Date(t.createdAt));
    if (t.status === "closed") monthMap[key].ticketsClosed += 1;
  }

  for (const c of chats) {
    const key = touchMonth(new Date(c.createdAt));
    monthMap[key].chats += 1;
  }

  return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
};

const buildDistribution = async (range: DateRange) => {
  const dataset = await loadAnalyticsData(range);
  const { hiring, support: tickets, chats } = applyRangeSlices(dataset, range);

  const countBy = <T, K extends keyof T>(items: T[], key: K): Record<string, number> => {
    const result: Record<string, number> = {};
    for (const current of items) {
      const bucket = String(current[key] ?? "unknown");
      result[bucket] = (result[bucket] || 0) + 1;
    }
    return result;
  };

  return {
    hiringStages: {
      total: hiring.length,
      counts: countBy(hiring, "stage"),
      sources: countBy(hiring, "source"),
      departments: countBy(hiring, "department"),
      seniority: countBy(hiring, "seniority"),
    },
    supportCategories: {
      total: tickets.length,
      counts: countBy(tickets, "category"),
      open: tickets.filter(t => t.status !== "closed").length,
      closed: tickets.filter(t => t.status === "closed").length,
    },
    chatIntents: {
      total: chats.length,
      counts: countBy(chats, "intent"),
      avgCsat: average(chats.map(c => c.csat)),
    },
  };
};

const toCsv = (rows: Array<Record<string, string | number>>) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map(row =>
      headers
        .map(key => {
          const value = row[key];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replaceAll('"', '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
};

export const reportsRouter = router({
  overview: protectedProcedure.input(dateRangeInput).query(async ({ input }) => {
    const range = parseDateRange(input);
    const rangeKey = hashRange(range);
    return withReportCache(
      CACHE_KEYS.REPORT_OVERVIEW(rangeKey),
      () => buildOverview(range),
      CACHE_TTL.FREQUENT,
      "overview"
    );
  }),

  kpis: protectedProcedure.input(dateRangeInput).query(async ({ input }) => {
    const range = parseDateRange(input);
    const rangeKey = hashRange(range);
    return withReportCache(
      CACHE_KEYS.REPORT_KPIS(rangeKey),
      () => buildKpis(range),
      CACHE_TTL.FREQUENT,
      "kpis"
    );
  }),

  timeseries: protectedProcedure.input(dateRangeInput).query(async ({ input }) => {
    const range = parseDateRange(input);
    const rangeKey = hashRange(range);
    return withReportCache(
      CACHE_KEYS.REPORT_TIMESERIES(rangeKey),
      () => buildTimeseries(range),
      CACHE_TTL.LONG,
      "timeseries"
    );
  }),

  distribution: protectedProcedure.input(dateRangeInput).query(async ({ input }) => {
    const range = parseDateRange(input);
    const rangeKey = hashRange(range);
    return withReportCache(
      CACHE_KEYS.REPORT_DISTRIBUTION(rangeKey),
      () => buildDistribution(range),
      CACHE_TTL.LONG,
      "distribution"
    );
  }),

  exportCSV: adminProcedure
    .input(
      z.object({
        report: z.enum(["hiring", "support", "engagement"]),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const range = parseDateRange({ from: input.from, to: input.to });
      const filename = `${input.report}-report.csv`;
      const cacheKey = CACHE_KEYS.REPORT_EXPORT(input.report, hashRange(range));

      return withReportCache(
        cacheKey,
        async () => {
          if (input.report === "hiring") {
            const dist = await buildDistribution(range);
            const rows = Object.entries(dist.hiringStages.counts).map(([stage, count]) => ({
              stage,
              count,
              sourceTop: Object.keys(dist.hiringStages.sources)[0] || "n/a",
              seniorityTop: Object.keys(dist.hiringStages.seniority)[0] || "n/a",
            }));
            const csv = toCsv(rows);
            return {
              filename,
              data: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`,
            };
          }

          if (input.report === "support") {
            const dist = await buildDistribution(range);
            const rows = Object.entries(dist.supportCategories.counts).map(([category, count]) => ({
              category,
              count,
              open: dist.supportCategories.open,
              closed: dist.supportCategories.closed,
            }));
            const csv = toCsv(rows);
            return {
              filename,
              data: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`,
            };
          }

          const dataset = await loadAnalyticsData(range);
          const chats = applyRangeSlices(dataset, range).chats;
          const rows = Object.entries(
            chats.reduce((acc, chat) => {
              const key = monthKey(new Date(chat.createdAt));
              if (!acc[key]) acc[key] = { conversations: 0, responseTotal: 0, csatTotal: 0 };
              acc[key].conversations += 1;
              acc[key].responseTotal += chat.responseMinutes;
              acc[key].csatTotal += chat.csat;
              return acc;
            }, {} as Record<string, { conversations: number; responseTotal: number; csatTotal: number }>)
          ).map(([month, stats]) => ({
            month,
            conversations: stats.conversations,
            avgResponse: Math.round((stats.responseTotal / stats.conversations) * 10) / 10,
            avgCsat: Math.round((stats.csatTotal / stats.conversations) * 10) / 10,
          }));
          const csv = toCsv(rows);
          return {
            filename,
            data: `data:text/csv;base64,${Buffer.from(csv).toString("base64")}`,
          };
        },
        CACHE_TTL.LONG,
        `export.${input.report}`
      );
    }),
});
