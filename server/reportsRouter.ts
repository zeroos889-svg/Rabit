import { protectedProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";

type DateRange = { from?: Date; to?: Date };

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

// Hand-curated sample data to power dashboards until real DB wiring lands
type HiringEvent = {
  id: number;
  date: string;
  status: "applied" | "interview" | "offer_accepted" | "offer_declined" | "hired" | "rejected";
  stage: "applied" | "screen" | "interview" | "offer" | "hired";
  source: "LinkedIn" | "Referral" | "Careers" | "Agency";
  department: "HR" | "Finance" | "Engineering" | "Operations";
  seniority: "junior" | "mid" | "senior";
  timeToHireDays?: number;
};

type SupportTicket = {
  id: number;
  createdAt: string;
  status: "open" | "in_progress" | "closed";
  category: "payroll" | "contracts" | "attendance" | "benefits";
  slaMet: boolean;
  resolutionHours?: number;
};

type ChatSession = {
  id: number;
  createdAt: string;
  responseMinutes: number;
  intent: "leave" | "contracts" | "eosb" | "policies";
  csat: number;
};

const hiringEvents: HiringEvent[] = [
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

const supportTickets: SupportTicket[] = [
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

const chatSessions: ChatSession[] = [
  { id: 1, createdAt: "2024-01-04", responseMinutes: 4, intent: "leave", csat: 4.6 },
  { id: 2, createdAt: "2024-01-05", responseMinutes: 6, intent: "contracts", csat: 4.8 },
  { id: 3, createdAt: "2024-02-01", responseMinutes: 5, intent: "eosb", csat: 4.2 },
  { id: 4, createdAt: "2024-02-12", responseMinutes: 7, intent: "policies", csat: 4.0 },
  { id: 5, createdAt: "2024-02-22", responseMinutes: 9, intent: "leave", csat: 3.9 },
  { id: 6, createdAt: "2024-03-02", responseMinutes: 4, intent: "contracts", csat: 4.7 },
  { id: 7, createdAt: "2024-03-08", responseMinutes: 5, intent: "eosb", csat: 4.3 },
  { id: 8, createdAt: "2024-03-18", responseMinutes: 3, intent: "leave", csat: 4.9 },
];

const filterByRange = <T extends Record<string, any>>(items: T[], key: keyof T, range: DateRange) =>
  items.filter(item => {
    const date = new Date(item[key]);
    return isWithinRange(date, range);
  });

const average = (values: number[]) => {
  if (!values.length) return 0;
  return Math.round((values.reduce((acc, v) => acc + v, 0) / values.length) * 10) / 10;
};

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const buildOverview = (range: DateRange) => {
  const filteredHiring = filterByRange(hiringEvents, "date", range);
  const filteredTickets = filterByRange(supportTickets, "createdAt", range);
  const filteredChats = filterByRange(chatSessions, "createdAt", range);

  const hires = filteredHiring.filter(h => h.status === "hired").length;
  const offersAccepted =
    filteredHiring.filter(h => h.status === "offer_accepted" || h.status === "hired").length;
  const pipelineConversion = filteredHiring.length
    ? Math.round((hires / filteredHiring.length) * 1000) / 1000
    : 0;
  const avgTimeToHireDays = average(
    filteredHiring.filter(h => h.timeToHireDays).map(h => h.timeToHireDays || 0)
  );

  const ticketsOpen = filteredTickets.filter(t => t.status !== "closed").length;
  const ticketsClosed = filteredTickets.filter(t => t.status === "closed").length;
  const slaMet =
    filteredTickets.filter(t => t.status === "closed" && t.slaMet).length /
    (ticketsClosed || 1);

  const chatConversations = filteredChats.length;
  const avgResponseMinutes = average(filteredChats.map(c => c.responseMinutes));
  const avgCsat = average(filteredChats.map(c => c.csat));

  return {
    applications: filteredHiring.length,
    hires,
    offersAccepted,
    pipelineConversion,
    avgTimeToHireDays,
    ticketsOpen,
    ticketsClosed,
    ticketsSlaMet: Math.round(slaMet * 100) / 100,
    chatConversations,
    avgResponseMinutes,
    avgCsat,
  };
};

const buildKpis = (range: DateRange) => {
  const overview = buildOverview(range);
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

const buildTimeseries = (range: DateRange) => {
  const hiring = filterByRange(hiringEvents, "date", range);
  const tickets = filterByRange(supportTickets, "createdAt", range);
  const chats = filterByRange(chatSessions, "createdAt", range);

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

  hiring.forEach(h => {
    const key = touchMonth(new Date(h.date));
    monthMap[key].applications += 1;
    if (h.status === "hired") monthMap[key].hires += 1;
  });

  tickets.forEach(t => {
    const key = touchMonth(new Date(t.createdAt));
    if (t.status === "closed") monthMap[key].ticketsClosed += 1;
  });

  chats.forEach(c => {
    const key = touchMonth(new Date(c.createdAt));
    monthMap[key].chats += 1;
  });

  return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
};

const buildDistribution = (range: DateRange) => {
  const hiring = filterByRange(hiringEvents, "date", range);
  const tickets = filterByRange(supportTickets, "createdAt", range);
  const chats = filterByRange(chatSessions, "createdAt", range);

  const countBy = <T, K extends string | number>(
    items: T[],
    picker: (item: T) => K
  ): Record<K, number> => {
    return items.reduce((acc, item) => {
      const key = picker(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<K, number>);
  };

  return {
    hiringStages: {
      total: hiring.length,
      counts: countBy(hiring, h => h.stage),
      sources: countBy(hiring, h => h.source),
      departments: countBy(hiring, h => h.department),
      seniority: countBy(hiring, h => h.seniority),
    },
    supportCategories: {
      total: tickets.length,
      counts: countBy(tickets, t => t.category),
      open: tickets.filter(t => t.status !== "closed").length,
      closed: tickets.filter(t => t.status === "closed").length,
    },
    chatIntents: {
      total: chats.length,
      counts: countBy(chats, c => c.intent),
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
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
};

export const reportsRouter = router({
  overview: protectedProcedure.input(dateRangeInput).query(({ input }) => buildOverview(parseDateRange(input))),

  kpis: protectedProcedure.input(dateRangeInput).query(({ input }) => buildKpis(parseDateRange(input))),

  timeseries: protectedProcedure.input(dateRangeInput).query(({ input }) => buildTimeseries(parseDateRange(input))),

  distribution: protectedProcedure
    .input(dateRangeInput)
    .query(({ input }) => buildDistribution(parseDateRange(input))),

  exportCSV: adminProcedure
    .input(
      z.object({
        report: z.enum(["hiring", "support", "engagement"]),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const range = parseDateRange({ from: input.from, to: input.to });
      const filename = `${input.report}-report.csv`;

      if (input.report === "hiring") {
        const dist = buildDistribution(range);
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
        const dist = buildDistribution(range);
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

      const chats = filterByRange(chatSessions, "createdAt", range);
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
    }),
});
