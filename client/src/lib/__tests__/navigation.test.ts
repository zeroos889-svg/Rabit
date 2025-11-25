import { describe, expect, it } from "vitest";
import { getDashboardPath } from "../navigation";

describe("getDashboardPath", () => {
  it("routes admin to admin dashboard", () => {
    expect(getDashboardPath({ role: "admin" })).toBe("/admin");
  });

  it("routes by userType with user role", () => {
    expect(getDashboardPath({ role: "user", userType: "company" })).toBe("/company/dashboard");
    expect(getDashboardPath({ role: "user", userType: "consultant" })).toBe("/consultant-dashboard");
    expect(getDashboardPath({ role: "user", userType: "employee" })).toBe("/employee/dashboard");
  });

  it("falls back to home when nothing matches", () => {
    expect(getDashboardPath({})).toBe("/");
    expect(getDashboardPath(null as unknown as any)).toBe("/");
  });
});
