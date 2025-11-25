import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { assertPermission } from "./security/rbac";
import { recordAudit } from "./audit";

const pdfResponse = (title: string) => {
  const content = `${title} - placeholder pdf. Replace with real generator.`;
  const base64 = Buffer.from(content, "utf-8").toString("base64");
  return {
    pdfUrl: `data:application/pdf;base64,${base64}`,
    title,
    generatedAt: new Date().toISOString(),
  };
};

export const pdfRouter = router({
  generateLetter: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(2),
        body: z.string().min(10),
        recipient: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      assertPermission(ctx.user?.role, "pdf.generate");
      recordAudit({
        action: "pdf:generate",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: "letter",
        metadata: { subject: input.subject },
      });
      return pdfResponse(`Letter - ${input.subject}`);
    }),

  generateLeaveSummary: protectedProcedure
    .input(
      z.object({
        employeeName: z.string().min(2),
        totalDays: z.number(),
        approvedDays: z.number(),
        remainingDays: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      assertPermission(ctx.user?.role, "pdf.generate");
      recordAudit({
        action: "pdf:generate",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: "leave-summary",
        metadata: { employeeName: input.employeeName },
      });
      return pdfResponse(`Leave Summary - ${input.employeeName}`);
    }),

  generateReport: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        sections: z.array(z.string()).min(1),
      })
    )
    .mutation(({ input, ctx }) => {
      assertPermission(ctx.user?.role, "pdf.generate");
      recordAudit({
        action: "pdf:generate",
        actorId: ctx.user?.id ?? null,
        actorEmail: ctx.user?.email ?? null,
        resource: "report",
        metadata: { title: input.title, sections: input.sections.length },
      });
      return pdfResponse(`Report - ${input.title}`);
    }),
});
