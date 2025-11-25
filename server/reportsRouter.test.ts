import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

const userCtx = {
  req: {} as any,
  res: {} as any,
  user: { id: 1, role: "company", email: "user@test.com" } as any,
};

const adminCtx = {
  req: {} as any,
  res: {} as any,
  user: { id: 2, role: "admin", email: "admin@test.com" } as any,
};

describe("reportsRouter", () => {
  it("returns overview and KPIs for a filtered window", async () => {
    const caller = appRouter.createCaller(userCtx as any);

    const overview = await caller.reports.overview({
      from: "2024-02-01",
      to: "2024-02-29",
    });

    expect(overview.applications).toBe(3);
    expect(overview.hires).toBe(2);
    expect(overview.pipelineConversion).toBeGreaterThan(0);
    expect(overview.avgTimeToHireDays).toBeGreaterThan(0);

    const kpis = await caller.reports.kpis({});
    expect(kpis.hiring.total).toBeGreaterThan(0);
    expect(kpis.support.ticketsOpen).toBeGreaterThanOrEqual(0);
    expect(kpis.engagement.chatConversations).toBeGreaterThanOrEqual(0);
  });

  it("returns timeseries and distribution details", async () => {
    const caller = appRouter.createCaller(userCtx as any);

    const timeseries = await caller.reports.timeseries({});
    expect(timeseries.length).toBeGreaterThan(0);
    expect(timeseries[0]).toHaveProperty("applications");
    expect(timeseries[0]).toHaveProperty("hires");

    const distribution = await caller.reports.distribution({});
    expect(distribution.hiringStages.total).toBeGreaterThan(0);
    expect(Object.keys(distribution.hiringStages.counts).length).toBeGreaterThan(0);
    expect(distribution.supportCategories.closed).toBeGreaterThanOrEqual(0);
    expect(Object.keys(distribution.chatIntents.counts).length).toBeGreaterThan(0);
  });

  it("allows admins to export CSV reports", async () => {
    const caller = appRouter.createCaller(adminCtx as any);
    const csv = await caller.reports.exportCSV({
      report: "hiring",
      from: "2024-02-01",
      to: "2024-03-01",
    });

    expect(csv.filename).toContain("hiring");
    expect(csv.data.startsWith("data:text/csv;base64,")).toBe(true);
  });
});
