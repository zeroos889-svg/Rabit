/**
 * اختبارات أدوات الذكاء الاصطناعي
 * AI Tools Unit Tests
 */

import { describe, it, expect } from "vitest";

// Knowledge Base
import {
  loadRegulation,
  loadAllRegulations,
  getAvailableRegulations,
} from "./knowledge-base-loader";

// Saudi Labor Knowledge
import {
  calculateEndOfServiceBenefit,
  calculateGOSIContributions,
  calculateAnnualLeave,
  validateProbationPeriod,
  SAUDI_LABOR_LAW,
} from "./saudi-labor-knowledge";

// Saudi Labor Knowledge Enhanced
import {
  getLaborLaw,
  getGOSIRegulation,
  getNitaqatRegulation,
  checkRegulationCompliance,
  getRegulationsSummary,
} from "./saudi-labor-knowledge-enhanced";

// ============================================
// اختبارات قاعدة المعرفة
// Knowledge Base Tests
// ============================================

describe("Knowledge Base Loader", () => {
  describe("loadRegulation", () => {
    it("should load labor-law regulation", () => {
      const regulation = loadRegulation("labor-law");
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("labor-law");
      expect(regulation.name.ar).toBeDefined();
      expect(regulation.name.en).toBeDefined();
    });

    it("should load gosi regulation", () => {
      const regulation = loadRegulation("gosi");
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("gosi");
    });

    it("should load nitaqat regulation", () => {
      const regulation = loadRegulation("nitaqat");
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("nitaqat");
    });

    it("should throw error for non-existent regulation", () => {
      expect(() => loadRegulation("non-existent")).toThrow();
    });
  });

  describe("loadAllRegulations", () => {
    it("should load all regulations", () => {
      const regulations = loadAllRegulations();
      expect(regulations).toBeInstanceOf(Map);
      expect(regulations.size).toBeGreaterThan(0);
    });
  });

  describe("getAvailableRegulations", () => {
    it("should return list of available regulations", () => {
      const regulations = getAvailableRegulations();
      expect(regulations).toBeInstanceOf(Array);
      expect(regulations).toContain("labor-law");
      expect(regulations).toContain("gosi");
      expect(regulations).toContain("nitaqat");
    });
  });
});

// ============================================
// اختبارات حسابات نظام العمل
// Saudi Labor Knowledge Tests
// ============================================

describe("Saudi Labor Knowledge", () => {
  describe("SAUDI_LABOR_LAW", () => {
    it("should have contracts defined", () => {
      expect(SAUDI_LABOR_LAW.contracts).toBeDefined();
      expect(SAUDI_LABOR_LAW.contracts.article50).toBeDefined();
    });

    it("should have metadata defined", () => {
      expect(SAUDI_LABOR_LAW.metadata).toBeDefined();
      expect(SAUDI_LABOR_LAW.metadata.name).toBe("نظام العمل السعودي");
    });
  });

  describe("calculateEndOfServiceBenefit", () => {
    it("should return 0 for article80 termination", () => {
      const result = calculateEndOfServiceBenefit(10000, 5, "article80");
      expect(result.amount).toBe(0);
    });

    it("should calculate for resignation less than 2 years", () => {
      const result = calculateEndOfServiceBenefit(10000, 1.5, "resignation");
      expect(result.percentage).toBe(0); // No benefit for resignation under 2 years
    });

    it("should calculate for resignation 2-5 years (1/3)", () => {
      const result = calculateEndOfServiceBenefit(10000, 3, "resignation");
      // 1/3 of benefit for resignation between 2-5 years
      expect(result.percentage).toBeCloseTo(33.33, 0);
      expect(result.amount).toBeGreaterThan(0);
    });

    it("should calculate for resignation 5-10 years (2/3)", () => {
      const result = calculateEndOfServiceBenefit(10000, 7, "resignation");
      // 2/3 of benefit for resignation between 5-10 years
      expect(result.percentage).toBeCloseTo(66.67, 0);
      expect(result.amount).toBeGreaterThan(0);
    });

    it("should calculate full benefit for resignation after 10 years", () => {
      const result = calculateEndOfServiceBenefit(10000, 12, "resignation");
      // Full benefit for resignation after 10 years
      expect(result.percentage).toBe(100);
      expect(result.amount).toBeGreaterThan(0);
    });

    it("should calculate full benefit for employer termination", () => {
      const result = calculateEndOfServiceBenefit(10000, 5, "employer");
      expect(result.percentage).toBe(100);
      expect(result.amount).toBeGreaterThan(0);
    });
  });

  describe("calculateGOSIContributions", () => {
    it("should calculate GOSI for Saudi employee", () => {
      const result = calculateGOSIContributions(10000, true);
      expect(result.employeeContribution).toBeGreaterThan(0);
      expect(result.employerContribution).toBeGreaterThan(0);
      expect(result.total).toBe(
        result.employeeContribution + result.employerContribution
      );
    });

    it("should calculate GOSI for non-Saudi employee (employer only)", () => {
      const result = calculateGOSIContributions(10000, false);
      // Non-Saudis only have occupational hazards (employer pays)
      expect(result.employeeContribution).toBe(0);
      expect(result.employerContribution).toBeGreaterThan(0);
    });

    it("should cap salary at maximum", () => {
      const result = calculateGOSIContributions(100000, true);
      // Should be calculated based on capped salary
      expect(result.total).toBeLessThan(100000 * 0.25); // Less than 25% of actual salary
    });
  });

  describe("calculateAnnualLeave", () => {
    it("should calculate 21 days for less than 5 years", () => {
      const result = calculateAnnualLeave(3);
      expect(result.totalDays).toBe(21);
    });

    it("should calculate 30 days for 5+ years", () => {
      const result = calculateAnnualLeave(6);
      expect(result.totalDays).toBe(30);
    });

    it("should calculate accrued days proportionally", () => {
      const result = calculateAnnualLeave(3, 180); // Half year
      expect(result.accruedDays).toBeCloseTo(21 * (180/365), 1);
    });
  });

  describe("validateProbationPeriod", () => {
    it("should validate normal probation period (90 days)", () => {
      const startDate = new Date();
      const result = validateProbationPeriod(startDate, 90, false);
      expect(result.valid).toBe(true);
    });

    it("should validate extended probation period (180 days)", () => {
      const startDate = new Date();
      const result = validateProbationPeriod(startDate, 180, true);
      expect(result.valid).toBe(true);
    });

    it("should reject probation exceeding 90 days without extension", () => {
      const startDate = new Date();
      const result = validateProbationPeriod(startDate, 100, false);
      expect(result.valid).toBe(false);
    });

    it("should reject probation exceeding 180 days even with extension", () => {
      const startDate = new Date();
      const result = validateProbationPeriod(startDate, 200, true);
      expect(result.valid).toBe(false);
    });
  });
});

// ============================================
// اختبارات قاعدة المعرفة المحسنة
// Enhanced Knowledge Base Tests
// ============================================

describe("Saudi Labor Knowledge Enhanced", () => {
  describe("Regulation Loaders", () => {
    it("should load labor law", () => {
      const regulation = getLaborLaw();
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("labor-law");
    });

    it("should load GOSI regulation", () => {
      const regulation = getGOSIRegulation();
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("gosi");
    });

    it("should load Nitaqat regulation", () => {
      const regulation = getNitaqatRegulation();
      expect(regulation).toBeDefined();
      expect(regulation.id).toBe("nitaqat");
    });
  });

  describe("checkRegulationCompliance", () => {
    it("should check labor law compliance - valid", () => {
      const result = checkRegulationCompliance(
        { contractType: "full_time", written: true, probationDays: 90 },
        "labor-law"
      );
      expect(result.compliant).toBe(true);
    });

    it("should check labor law compliance - missing written contract", () => {
      const result = checkRegulationCompliance(
        { contractType: "full_time", written: false },
        "labor-law"
      );
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should check labor law compliance - probation too long", () => {
      const result = checkRegulationCompliance(
        { probationDays: 200 },
        "labor-law"
      );
      expect(result.compliant).toBe(false);
    });

    it("should check WPS compliance - payment delay", () => {
      const result = checkRegulationCompliance(
        { paymentDelayDays: 25 },
        "wps-mudad"
      );
      expect(result.compliant).toBe(false);
    });

    it("should check GOSI compliance - unregistered employee", () => {
      const result = checkRegulationCompliance(
        { salary: 10000, gosiRegistered: false },
        "gosi"
      );
      expect(result.compliant).toBe(false);
    });

    it("should handle non-existent regulation", () => {
      const result = checkRegulationCompliance({}, "non-existent");
      expect(result.compliant).toBe(false);
    });
  });

  describe("getRegulationsSummary", () => {
    it("should return regulations summary in Arabic", () => {
      const summary = getRegulationsSummary("ar");
      expect(summary).toBeInstanceOf(Array);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary[0].id).toBeDefined();
      expect(summary[0].name).toBeDefined();
    });

    it("should return regulations summary in English", () => {
      const summary = getRegulationsSummary("en");
      expect(summary).toBeInstanceOf(Array);
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// اختبارات تكاملية
// Integration Tests
// ============================================

describe("Integration Tests", () => {
  it("should calculate EOSB correctly for 8 years service", () => {
    const result = calculateEndOfServiceBenefit(15000, 8, "employer");
    
    expect(result).toBeDefined();
    expect(result.amount).toBeGreaterThan(0);
    expect(result.breakdown).toBeDefined();
    // First 5 years: 5 * 15000 * 0.5 = 37500
    // Next 3 years: 3 * 15000 * 1 = 45000
    // Total: 82500
    expect(result.amount).toBeCloseTo(82500, 0);
  });

  it("should handle all available regulation types", () => {
    const regulationIds = getAvailableRegulations();
    
    // Should have at least the main regulations
    expect(regulationIds.length).toBeGreaterThan(5);
    expect(regulationIds).toContain("labor-law");
    expect(regulationIds).toContain("gosi");
    expect(regulationIds).toContain("nitaqat");
  });

  it("should load any regulation by its ID", () => {
    const regulationIds = getAvailableRegulations();
    
    for (const id of regulationIds) {
      const regulation = loadRegulation(id);
      expect(regulation).toBeDefined();
      expect(regulation.name).toBeDefined();
      expect(regulation.version).toBeDefined();
    }
  });
});
