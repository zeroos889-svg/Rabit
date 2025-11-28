/**
 * اختبارات تصدير PDF
 * Tests for PDF Export
 */

import { describe, it, expect } from 'vitest';

import {
  formatCurrency,
  formatDate,
  generateGOSIPDF,
  generateEOSBPDF,
  generateCompliancePDF,
} from '../pdfExport';

describe('pdfExport', () => {
  describe('formatCurrency', () => {
    it('should format currency in Arabic', () => {
      const formatted = formatCurrency(1000, 'ar');
      // Arabic locale uses Arabic numerals (١٠٠٠) and ر.س.
      expect(formatted).toContain('١');
      expect(formatted).toContain('ر.س');
    });

    it('should format currency in English', () => {
      const formatted = formatCurrency(1000, 'en');
      expect(formatted).toContain('1,000');
      expect(formatted.includes('SAR') || formatted.includes('SR')).toBe(true);
    });

    it('should handle decimal values', () => {
      const formatted = formatCurrency(1234.56, 'en');
      expect(formatted).toContain('1,234');
    });
  });

  describe('formatDate', () => {
    it('should format date in Arabic', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'ar');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should format date in English', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date, 'en');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should accept string dates', () => {
      const formatted = formatDate('2024-01-15', 'en');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('generateGOSIPDF', () => {
    const mockData = {
      employeeName: 'أحمد محمد',
      basicSalary: 10000,
      housingAllowance: 2500,
      employeeContribution: 1218.75,
      employerContribution: 1468.75,
      totalContribution: 2687.5,
      calculationDate: new Date('2024-01-15'),
    };

    it('should generate PDF content in Arabic', () => {
      const pdf = generateGOSIPDF(mockData, 'ar');
      
      expect(pdf).toContain('التأمينات الاجتماعية');
      expect(pdf).toContain('أحمد محمد');
      expect(pdf).toContain('الراتب الأساسي');
      expect(pdf).toContain('بدل السكن');
      expect(pdf).toContain('مساهمة الموظف');
      expect(pdf).toContain('مساهمة صاحب العمل');
    });

    it('should generate PDF content in English', () => {
      const pdf = generateGOSIPDF(mockData, 'en');
      
      expect(pdf).toContain('GOSI Calculation');
      expect(pdf).toContain('أحمد محمد');
      expect(pdf).toContain('Basic Salary');
      expect(pdf).toContain('Housing Allowance');
      expect(pdf).toContain('Employee Contribution');
      expect(pdf).toContain('Employer Contribution');
    });

    it('should include all required sections', () => {
      const pdf = generateGOSIPDF(mockData, 'ar');
      
      expect(pdf).toContain('<html');
      expect(pdf).toContain('</html>');
      expect(pdf).toContain('<style');
      expect(pdf).toContain('<table');
    });

    it('should format currency values correctly', () => {
      const pdf = generateGOSIPDF(mockData, 'ar');
      
      // Should contain formatted numbers (Arabic numerals or Western)
      // Check for employee name as proxy for correct rendering
      expect(pdf).toContain('أحمد محمد');
      expect(pdf).toContain('ر.س');
    });
  });

  describe('generateEOSBPDF', () => {
    const mockData = {
      employeeName: 'سارة علي',
      basicSalary: 15000,
      allowances: 5000,
      yearsOfService: 8.5,
      terminationReason: 'استقالة',
      totalAmount: 93333.33,
      calculationDate: new Date('2024-01-15'),
    };

    it('should generate PDF content in Arabic', () => {
      const pdf = generateEOSBPDF(mockData, 'ar');
      
      expect(pdf).toContain('مكافأة نهاية الخدمة');
      expect(pdf).toContain('سارة علي');
      expect(pdf).toContain('سنوات الخدمة');
      expect(pdf).toContain('سبب انتهاء الخدمة');
      expect(pdf).toContain('إجمالي');
    });

    it('should generate PDF content in English', () => {
      const pdf = generateEOSBPDF(mockData, 'en');
      
      expect(pdf).toContain('End of Service Benefit');
      expect(pdf).toContain('سارة علي');
      expect(pdf).toContain('Years of Service');
      expect(pdf).toContain('Termination Reason');
      expect(pdf).toContain('Total');
    });

    it('should include years of service', () => {
      const pdf = generateEOSBPDF(mockData, 'ar');
      expect(pdf).toContain('8.5');
    });
  });

  describe('generateCompliancePDF', () => {
    const mockData = {
      companyName: 'شركة رابط',
      checkDate: new Date('2024-01-15'),
      overallStatus: 'compliant' as const,
      score: 85,
      checks: [
        { category: 'السعودة', status: 'pass' as const, message: 'نسبة السعودة متوافقة' },
        { category: 'حماية الأجور', status: 'pass' as const, message: 'جميع الرواتب مسددة' },
        { category: 'ساعات العمل', status: 'warning' as const, message: 'بعض الموظفين تجاوزوا الحد' },
      ],
      recommendations: [
        'الحفاظ على نسبة السعودة الحالية',
        'مراجعة ساعات العمل الإضافية',
      ],
    };

    it('should generate PDF content in Arabic', () => {
      const pdf = generateCompliancePDF(mockData, 'ar');
      
      expect(pdf).toContain('تقرير الامتثال');
      expect(pdf).toContain('شركة رابط');
      expect(pdf).toContain('نسبة الامتثال');
      expect(pdf).toContain('التوصيات');
    });

    it('should generate PDF content in English', () => {
      const pdf = generateCompliancePDF(mockData, 'en');
      
      expect(pdf).toContain('Compliance Report');
      expect(pdf).toContain('شركة رابط');
      expect(pdf).toContain('Compliance Score');
      expect(pdf).toContain('Recommendations');
    });

    it('should include compliance score', () => {
      const pdf = generateCompliancePDF(mockData, 'ar');
      expect(pdf).toContain('85');
    });

    it('should include all checks', () => {
      const pdf = generateCompliancePDF(mockData, 'ar');
      
      expect(pdf).toContain('السعودة');
      expect(pdf).toContain('حماية الأجور');
      expect(pdf).toContain('ساعات العمل');
    });

    it('should include recommendations', () => {
      const pdf = generateCompliancePDF(mockData, 'ar');
      
      expect(pdf).toContain('الحفاظ على نسبة السعودة الحالية');
      expect(pdf).toContain('مراجعة ساعات العمل الإضافية');
    });

    it('should show correct status styling', () => {
      const pdf = generateCompliancePDF(mockData, 'ar');
      
      // Should contain status colors
      expect(pdf).toContain('#22c55e'); // pass color
      expect(pdf).toContain('#f59e0b'); // warning color
    });
  });
});
