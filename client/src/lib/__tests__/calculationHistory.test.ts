/**
 * اختبارات سجل الحسابات
 * Tests for Calculation History
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import {
  getAllRecords,
  getRecordsByType,
  getRecordById,
  saveGOSIRecord,
  saveEOSBRecord,
  saveLeaveRecord,
  deleteRecord,
  clearAllRecords,
  searchRecords,
  exportRecordsAsJSON,
  importRecordsFromJSON,
  getHistoryStats,
  formatRecordDate,
  getCalculationTypeName,
  getRecentRecords,
  type GOSIRecord,
  type EOSBRecord,
} from '../calculationHistory';

describe('calculationHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveGOSIRecord', () => {
    it('should save a GOSI record correctly', () => {
      const inputs = {
        basicSalary: 10000,
        housingAllowance: 2500,
        isNonSaudi: false,
        employerContributionRate: 0.1175,
        employeeContributionRate: 0.0975,
      };

      const outputs = {
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        totalContribution: 2687.50,
        totalInsurableSalary: 12500,
      };

      const record = saveGOSIRecord(inputs, outputs);

      expect(record).toBeDefined();
      expect(record.id).toMatch(/^calc_/);
      expect(record.type).toBe('gosi');
      expect(record.inputs).toEqual(inputs);
      expect(record.outputs).toEqual(outputs);
      expect(record.timestamp).toBeDefined();
    });

    it('should save metadata if provided', () => {
      const inputs = {
        basicSalary: 10000,
        housingAllowance: 2500,
        isNonSaudi: false,
        employerContributionRate: 0.1175,
        employeeContributionRate: 0.0975,
      };

      const outputs = {
        employeeContribution: 1218.75,
        employerContribution: 1468.75,
        totalContribution: 2687.50,
        totalInsurableSalary: 12500,
      };

      const metadata = {
        employeeName: 'أحمد محمد',
        employeeId: 'EMP001',
      };

      const record = saveGOSIRecord(inputs, outputs, metadata);

      expect(record.metadata).toEqual(metadata);
    });
  });

  describe('saveEOSBRecord', () => {
    it('should save an EOSB record correctly', () => {
      const inputs = {
        basicSalary: 15000,
        allowances: 5000,
        yearsOfService: 8.5,
        terminationReason: 'resignation',
        contractType: 'unlimited',
      };

      const outputs = {
        totalAmount: 93333.33,
        yearsCalculation: '8 سنوات و 6 أشهر',
        eligibilityPercentage: 66.67,
        breakdown: {
          firstFiveYears: 50000,
          afterFiveYears: 70000,
        },
      };

      const record = saveEOSBRecord(inputs, outputs);

      expect(record).toBeDefined();
      expect(record.type).toBe('eosb');
      expect(record.inputs.basicSalary).toBe(15000);
      expect(record.outputs.totalAmount).toBe(93333.33);
    });
  });

  describe('saveLeaveRecord', () => {
    it('should save a leave record correctly', () => {
      const inputs = {
        yearsOfService: 6,
        usedDays: 10,
        carryOverDays: 5,
        dailySalary: 500,
      };

      const outputs = {
        annualEntitlement: 30,
        remainingDays: 25,
        totalAccrued: 35,
        cashValue: 17500,
      };

      const record = saveLeaveRecord(inputs, outputs);

      expect(record).toBeDefined();
      expect(record.type).toBe('leave');
      expect(record.inputs.yearsOfService).toBe(6);
      expect(record.outputs.annualEntitlement).toBe(30);
    });
  });

  describe('getAllRecords', () => {
    it('should return empty array when no records exist', () => {
      const records = getAllRecords();
      expect(records).toEqual([]);
    });

    it('should return all saved records', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      saveEOSBRecord(
        { basicSalary: 15000, allowances: 5000, yearsOfService: 8.5, terminationReason: 'resignation', contractType: 'unlimited' },
        { totalAmount: 93333.33, yearsCalculation: '8 سنوات', eligibilityPercentage: 66.67, breakdown: { firstFiveYears: 50000, afterFiveYears: 70000 } }
      );

      const records = getAllRecords();
      expect(records).toHaveLength(2);
    });

    it('should return records sorted by timestamp (newest first)', () => {
      const record1 = saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      // Wait a bit to ensure different timestamps
      const record2 = saveEOSBRecord(
        { basicSalary: 15000, allowances: 5000, yearsOfService: 8.5, terminationReason: 'resignation', contractType: 'unlimited' },
        { totalAmount: 93333.33, yearsCalculation: '8 سنوات', eligibilityPercentage: 66.67, breakdown: { firstFiveYears: 50000, afterFiveYears: 70000 } }
      );

      const records = getAllRecords();
      expect(records[0].id).toBe(record2.id);
    });
  });

  describe('getRecordsByType', () => {
    it('should filter records by type', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      saveGOSIRecord(
        { basicSalary: 15000, housingAllowance: 3750, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1828.125, employerContribution: 2203.125, totalContribution: 4031.25, totalInsurableSalary: 18750 }
      );

      saveEOSBRecord(
        { basicSalary: 15000, allowances: 5000, yearsOfService: 8.5, terminationReason: 'resignation', contractType: 'unlimited' },
        { totalAmount: 93333.33, yearsCalculation: '8 سنوات', eligibilityPercentage: 66.67, breakdown: { firstFiveYears: 50000, afterFiveYears: 70000 } }
      );

      const gosiRecords = getRecordsByType<GOSIRecord>('gosi');
      expect(gosiRecords).toHaveLength(2);
      expect(gosiRecords.every(r => r.type === 'gosi')).toBe(true);

      const eosbRecords = getRecordsByType<EOSBRecord>('eosb');
      expect(eosbRecords).toHaveLength(1);
    });
  });

  describe('getRecordById', () => {
    it('should return the correct record by id', () => {
      const record = saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      const found = getRecordById(record.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(record.id);
    });

    it('should return null for non-existent id', () => {
      const found = getRecordById('non_existent_id');
      expect(found).toBeNull();
    });
  });

  describe('deleteRecord', () => {
    it('should delete a record by id', () => {
      const record = saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      const deleted = deleteRecord(record.id);
      expect(deleted).toBe(true);

      const found = getRecordById(record.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent id', () => {
      const deleted = deleteRecord('non_existent_id');
      expect(deleted).toBe(false);
    });
  });

  describe('clearAllRecords', () => {
    it('should remove all records', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      saveEOSBRecord(
        { basicSalary: 15000, allowances: 5000, yearsOfService: 8.5, terminationReason: 'resignation', contractType: 'unlimited' },
        { totalAmount: 93333.33, yearsCalculation: '8 سنوات', eligibilityPercentage: 66.67, breakdown: { firstFiveYears: 50000, afterFiveYears: 70000 } }
      );

      clearAllRecords();

      const records = getAllRecords();
      expect(records).toHaveLength(0);
    });
  });

  describe('searchRecords', () => {
    it('should find records by employee name', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 },
        { employeeName: 'أحمد محمد', employeeId: 'EMP001' }
      );

      saveGOSIRecord(
        { basicSalary: 15000, housingAllowance: 3750, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1828.125, employerContribution: 2203.125, totalContribution: 4031.25, totalInsurableSalary: 18750 },
        { employeeName: 'سارة علي', employeeId: 'EMP002' }
      );

      const results = searchRecords('أحمد');
      expect(results).toHaveLength(1);
      expect(results[0].metadata?.employeeName).toBe('أحمد محمد');
    });

    it('should find records by employee id', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 },
        { employeeName: 'أحمد محمد', employeeId: 'EMP001' }
      );

      const results = searchRecords('EMP001');
      expect(results).toHaveLength(1);
    });

    it('should find records by type', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      const results = searchRecords('gosi');
      expect(results).toHaveLength(1);
    });
  });

  describe('exportRecordsAsJSON', () => {
    it('should export records as valid JSON', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      const json = exportRecordsAsJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });
  });

  describe('importRecordsFromJSON', () => {
    it('should import records from JSON', () => {
      const recordsToImport = [
        {
          id: 'calc_imported_1',
          type: 'gosi',
          timestamp: Date.now(),
          inputs: { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
          outputs: { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 },
        },
      ];

      const imported = importRecordsFromJSON(JSON.stringify(recordsToImport));
      expect(imported).toBe(1);

      const records = getAllRecords();
      expect(records).toHaveLength(1);
    });

    it('should not duplicate existing records', () => {
      const record = saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      const recordsToImport = [
        {
          id: record.id, // Same ID
          type: 'gosi',
          timestamp: Date.now(),
          inputs: { basicSalary: 20000, housingAllowance: 5000, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
          outputs: { employeeContribution: 2437.5, employerContribution: 2937.5, totalContribution: 5375, totalInsurableSalary: 25000 },
        },
      ];

      const imported = importRecordsFromJSON(JSON.stringify(recordsToImport));
      expect(imported).toBe(0); // No new records imported

      const records = getAllRecords();
      expect(records).toHaveLength(1);
      expect(records[0].inputs.basicSalary).toBe(10000); // Original value
    });
  });

  describe('getHistoryStats', () => {
    it('should return correct statistics', () => {
      saveGOSIRecord(
        { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
      );

      saveGOSIRecord(
        { basicSalary: 15000, housingAllowance: 3750, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
        { employeeContribution: 1828.125, employerContribution: 2203.125, totalContribution: 4031.25, totalInsurableSalary: 18750 }
      );

      saveEOSBRecord(
        { basicSalary: 15000, allowances: 5000, yearsOfService: 8.5, terminationReason: 'resignation', contractType: 'unlimited' },
        { totalAmount: 93333.33, yearsCalculation: '8 سنوات', eligibilityPercentage: 66.67, breakdown: { firstFiveYears: 50000, afterFiveYears: 70000 } }
      );

      const stats = getHistoryStats();

      expect(stats.total).toBe(3);
      expect(stats.byType.gosi).toBe(2);
      expect(stats.byType.eosb).toBe(1);
      expect(stats.byType.leave).toBe(0);
      expect(stats.lastWeek).toBe(3);
      expect(stats.lastMonth).toBe(3);
    });
  });

  describe('getRecentRecords', () => {
    it('should return the specified number of recent records', () => {
      for (let i = 0; i < 5; i++) {
        saveGOSIRecord(
          { basicSalary: 10000 + i * 1000, housingAllowance: 2500, isNonSaudi: false, employerContributionRate: 0.1175, employeeContributionRate: 0.0975 },
          { employeeContribution: 1218.75, employerContribution: 1468.75, totalContribution: 2687.50, totalInsurableSalary: 12500 }
        );
      }

      const recent = getRecentRecords(3);
      expect(recent).toHaveLength(3);
    });
  });

  describe('formatRecordDate', () => {
    it('should format date in Arabic locale', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const formatted = formatRecordDate(timestamp, 'ar-SA');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should format date in English locale', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const formatted = formatRecordDate(timestamp, 'en-US');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getCalculationTypeName', () => {
    it('should return Arabic name', () => {
      expect(getCalculationTypeName('gosi', 'ar')).toBe('حساب التأمينات الاجتماعية');
      expect(getCalculationTypeName('eosb', 'ar')).toBe('حساب نهاية الخدمة');
      expect(getCalculationTypeName('leave', 'ar')).toBe('حساب الإجازات');
    });

    it('should return English name', () => {
      expect(getCalculationTypeName('gosi', 'en')).toBe('GOSI Calculation');
      expect(getCalculationTypeName('eosb', 'en')).toBe('End of Service');
      expect(getCalculationTypeName('leave', 'en')).toBe('Leave Calculation');
    });
  });
});
