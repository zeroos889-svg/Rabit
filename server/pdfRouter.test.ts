import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

const userCtx = {
  req: {} as any,
  res: {} as any,
  user: {
    id: 2,
    role: "company",
    email: "user@test.com",
  } as any,
};

describe("pdfRouter", () => {
  it("generates letter pdf placeholder for authorized user", async () => {
    const caller = appRouter.createCaller(userCtx as any);
    const res = await caller.pdf.generateLetter({
      subject: "خطاب تجربة",
      body: "هذه محتويات الخطاب",
      recipient: "مدير الموارد البشرية",
    });
    expect(res.pdfUrl).toContain("data:application/pdf");
    expect(res.title).toContain("Letter");
  });

  it("generates leave summary placeholder", async () => {
    const caller = appRouter.createCaller(userCtx as any);
    const res = await caller.pdf.generateLeaveSummary({
      employeeName: "سارة",
      totalDays: 30,
      approvedDays: 10,
      remainingDays: 20,
    });
    expect(res.title).toContain("Leave Summary");
  });
});
