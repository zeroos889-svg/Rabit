import { describe, it, expect } from "vitest";
import { validatePasswordStrength, hashPassword } from "../password";
import * as db from "../../db";

describe("password reset flow (in-memory)", () => {
  it("enforces password strength", () => {
    const weak = validatePasswordStrength("short");
    expect(weak.valid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    const strong = validatePasswordStrength("StrongPass123");
    expect(strong.valid).toBe(true);
  });

  it("creates, finds, and invalidates reset token", async () => {
    const originalDbUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    const user = await db.createUserWithPassword({
      email: "reset.test@example.com",
      password: "ResetPass123!",
      name: "Reset User",
    });
    expect(user?.id).toBeTruthy();

    const token = "test-token-123";
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.setPasswordResetToken(user!.id, token, expiresAt);

    const found = await db.findUserByResetToken(token);
    expect(found?.id).toBe(user?.id);

    const newHash = await hashPassword("NewPass123!");
    await db.updateUserPassword(user!.id, newHash);

    const after = await db.findUserByResetToken(token);
    expect(after).toBeNull();

    if (originalDbUrl) {
      process.env.DATABASE_URL = originalDbUrl;
    }
  });
});
