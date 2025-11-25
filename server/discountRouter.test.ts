import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import {
  createDiscountCode,
  updateDiscountCode,
  __resetDiscountData,
} from "./db";
import type { TrpcContext } from "./_core/context";

const createTestContext = (): TrpcContext => ({
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
  user: null,
});

const createCaller = () => appRouter.createCaller(createTestContext());

describe("discountCodes router", () => {
  beforeEach(() => {
    __resetDiscountData();
  });

  it("validates active percentage code and calculates discount", async () => {
    const code = "SAVE10";
    await createDiscountCode({
      code,
      discountType: "percentage",
      discountValue: 10,
      maxUses: 25,
      isActive: true,
      createdBy: 1,
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

  const caller = createCaller();
    const validation = await caller.discountCodes.validate({ code });

    expect(validation.valid).toBe(true);
    expect(validation.code?.discountType).toBe("percentage");

    const calculation = await caller.discountCodes.calculateDiscount({
      code,
      originalAmount: 1200,
    });

    expect(calculation.discountAmount).toBe(120);
    expect(calculation.finalAmount).toBe(1080);
    expect(calculation.discountType).toBe("percentage");
  });

  it("rejects codes outside the active window", async () => {
    await createDiscountCode({
      code: "FUTURE",
      discountType: "fixed",
      discountValue: 100,
      isActive: true,
      createdBy: 1,
      validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    await createDiscountCode({
      code: "EXPIRED",
      discountType: "fixed",
      discountValue: 100,
      isActive: true,
      createdBy: 1,
      validFrom: new Date(Date.now() - 72 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

  const caller = createCaller();

    const future = await caller.discountCodes.validate({ code: "FUTURE" });
    expect(future.valid).toBe(false);
    expect(future.message).toContain("لم يبدأ");

    const expired = await caller.discountCodes.validate({ code: "EXPIRED" });
    expect(expired.valid).toBe(false);
    expect(expired.message).toContain("منتهي");
  });

  it("stops honoring codes when max uses is reached", async () => {
    const id = await createDiscountCode({
      code: "LIMITED",
      discountType: "fixed",
      discountValue: 150,
      maxUses: 1,
      isActive: true,
      createdBy: 1,
      validFrom: new Date(Date.now() - 60_000),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

  const caller = createCaller();
    const calculation = await caller.discountCodes.calculateDiscount({
      code: "LIMITED",
      originalAmount: 1000,
    });

    expect(calculation.discountAmount).toBe(150);
    expect(calculation.finalAmount).toBe(850);
    expect(calculation.discountType).toBe("fixed");

    await updateDiscountCode(id, { usedCount: 1 });
    const invalid = await caller.discountCodes.validate({ code: "LIMITED" });

  expect(invalid.valid).toBe(false);
  expect(invalid.message).toContain("الحد الأقصى");

    await expect(
      caller.discountCodes.calculateDiscount({
        code: "LIMITED",
        originalAmount: 1000,
      })
    ).rejects.toThrow(/Invalid code/);
  });
});
