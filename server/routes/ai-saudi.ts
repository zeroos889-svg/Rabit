/**
 * Saudi Compliance AI Router - مسارات الذكاء الاصطناعي للامتثال السعودي
 * 
 * مسارات tRPC للأدوات الذكية المتوافقة مع الأنظمة السعودية:
 * - مدقق الامتثال لنظام العمل
 * - مولد العقود
 * - حاسبة التأمينات الاجتماعية
 * - مستشار السعودة
 * - مدقق المستندات
 * 
 * @module server/routes/ai-saudi
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";

// استيراد الأدوات الذكية
import {
  checkCompliance,
  checkTerminationCompliance
} from "../ai/compliance-checker";

import {
  generateEmploymentContract,
  generateContractAmendment,
  generateTerminationLetter,
  generateExperienceCertificate,
  generateSalaryLetter
} from "../ai/contract-generator";

import {
  calculateGOSIContributions,
  calculateBulkGOSI,
  analyzeGOSICompliance,
  calculateSANEDCompensation,
  generateMonthlyGOSIReport,
  GOSI_RATES
} from "../ai/gosi-calculator";

import {
  analyzeSaudization,
  getAISaudizationAdvice,
  simulateHiringImpact,
  getHiringRecommendations,
  checkEmployeeEligibility,
  NITAQAT_BANDS,
  SAUDIZATION_REQUIREMENTS
} from "../ai/saudization-advisor";

import {
  validateDocument,
  detectDocumentType,
  validateHRPolicy,
  validateEmploymentContract,
  generateValidationReport
} from "../ai/document-validator";

// ============================================
// Zod Schemas
// ============================================

// Contract Input Schema
const employerSchema = z.object({
  name: z.string(),
  nameEn: z.string().optional(),
  commercialRegistration: z.string(),
  unifiedNumber: z.string().optional(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  representativeName: z.string(),
  representativeTitle: z.string(),
});

const employeeSchema = z.object({
  name: z.string(),
  nameEn: z.string().optional(),
  nationality: z.enum(['saudi', 'non-saudi']),
  idNumber: z.string(),
  idType: z.enum(['national_id', 'iqama', 'passport']),
  birthDate: z.string(),
  gender: z.enum(['male', 'female']),
  address: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
});

const contractDetailsSchema = z.object({
  type: z.enum(['unlimited', 'fixed', 'seasonal', 'project', 'part-time', 'temporary', 'training']),
  startDate: z.string(),
  endDate: z.string().optional(),
  duration: z.number().optional(),
  probationPeriod: z.number().optional(),
  jobTitle: z.string(),
  jobTitleEn: z.string().optional(),
  department: z.string().optional(),
  workLocation: z.string(),
  workingHours: z.number().min(1).max(12),
  workingDays: z.number().min(1).max(7),
  basicSalary: z.number().min(0),
  housingAllowance: z.number().optional(),
  transportAllowance: z.number().optional(),
  otherAllowances: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })).optional(),
  annualLeave: z.number().optional(),
  noticePeriod: z.number().optional(),
  benefits: z.array(z.string()).optional(),
  specialTerms: z.array(z.string()).optional(),
});

// Company Profile Schema for Saudization
const companyProfileSchema = z.object({
  name: z.string(),
  commercialRegistration: z.string(),
  sector: z.enum(['retail', 'construction', 'hospitality', 'technology', 'healthcare', 'education', 'manufacturing', 'transport']),
  subSector: z.string().optional(),
  employees: z.object({
    total: z.number(),
    saudi: z.number(),
    nonSaudi: z.number(),
    saudiMale: z.number(),
    saudiFemale: z.number(),
    partTime: z.number(),
    students: z.number(),
    disabled: z.number(),
    remoteWorkers: z.number(),
  }),
  salaries: z.object({
    averageSaudiSalary: z.number(),
    belowMinimumCount: z.number(),
  }),
});

// ============================================
// Router Definition
// ============================================

export const aiSaudiRouter = router({
  // ============================================
  // Compliance Checker Routes
  // ============================================
  
  /**
   * فحص امتثال قرار للنظام
   */
  checkDecisionCompliance: protectedProcedure
    .input(z.object({
      decisionType: z.enum([
        'termination',
        'salary_change',
        'position_change',
        'leave_request',
        'disciplinary_action',
        'promotion',
        'transfer',
        'contract_renewal',
        'probation_extension',
        'working_hours_change'
      ]),
      details: z.record(z.any()),
      context: z.object({
        employeeNationality: z.enum(['saudi', 'non-saudi']),
        contractType: z.enum(['unlimited', 'fixed', 'seasonal', 'project', 'part-time', 'temporary', 'training']),
        employmentDuration: z.number(),
        previousWarnings: z.number().optional(),
      }),
      language: z.enum(['ar', 'en']).default('ar'),
    }))
    .mutation(async ({ input }) => {
      // استخدام checkCompliance العامة
      return await checkCompliance({
        type: input.decisionType as any,
        data: {
          ...input.details,
          ...input.context
        },
        language: input.language
      });
    }),

  /**
   * التحقق من امتثال الإنهاء
   */
  checkTerminationCompliance: protectedProcedure
    .input(z.object({
      employeeData: z.object({
        nationality: z.enum(['saudi', 'non-saudi']),
        contractType: z.enum(['unlimited', 'fixed', 'seasonal', 'project', 'part-time', 'temporary', 'training']),
        joinDate: z.string(),
        lastSalary: z.number(),
        housingAllowance: z.number().optional(),
        transportAllowance: z.number().optional(),
        otherAllowances: z.number().optional(),
        unusedLeaveDays: z.number().optional(),
        previousWarnings: z.array(z.object({
          date: z.string(),
          reason: z.string(),
          type: z.enum(['verbal', 'written', 'final']),
        })).optional(),
      }),
      terminationData: z.object({
        reason: z.string(),
        reasonCode: z.string().optional(),
        terminationDate: z.string(),
        lastWorkingDay: z.string(),
        noticePeriodGiven: z.boolean(),
        noticePeriodDays: z.number().optional(),
        initiatedBy: z.enum(['employer', 'employee', 'mutual']),
      }),
      language: z.enum(['ar', 'en']).default('ar'),
    }))
    .mutation(async ({ input }) => {
      // تحويل البيانات لتتوافق مع واجهة checkTerminationCompliance
      const terminationData = {
        employeeName: 'Employee', // قيمة افتراضية
        nationality: input.employeeData.nationality as 'saudi' | 'non-saudi',
        startDate: input.employeeData.joinDate,
        terminationDate: input.terminationData.terminationDate,
        contractType: (input.employeeData.contractType === 'unlimited' ? 'unlimited' : 'limited') as 'limited' | 'unlimited',
        terminationType: (input.terminationData.initiatedBy === 'employee' ? 'resignation' : 
                         input.terminationData.initiatedBy === 'mutual' ? 'mutual' : 'employer') as 'employer' | 'resignation' | 'mutual' | 'article80',
        salary: input.employeeData.lastSalary,
        noticePeriodGiven: input.terminationData.noticePeriodGiven,
        noticePeriodDays: input.terminationData.noticePeriodDays,
        terminationReason: input.terminationData.reason,
        hasWarnings: (input.employeeData.previousWarnings?.length || 0) > 0,
        warningCount: input.employeeData.previousWarnings?.length || 0
      };
      return await checkTerminationCompliance(terminationData, input.language);
    }),

  /**
   * إنشاء تقرير امتثال شامل
   */
  generateComplianceReport: protectedProcedure
    .input(z.object({
      companyData: z.object({
        name: z.string(),
        commercialRegistration: z.string(),
        sector: z.string(),
        employeeCount: z.number(),
        saudiCount: z.number(),
      }),
      reportType: z.enum(['full', 'labor_law', 'pdpl', 'saudization', 'gosi']),
      period: z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
      includeRecommendations: z.boolean().default(true),
      language: z.enum(['ar', 'en']).default('ar'),
    }))
    .mutation(async ({ input }) => {
      // إنشاء تقرير امتثال باستخدام الدوال المتاحة
      const isArabic = input.language === 'ar';
      
      return {
        success: true,
        report: {
          company: input.companyData,
          period: input.period,
          reportType: input.reportType,
          generatedAt: new Date().toISOString(),
          summary: isArabic 
            ? `تقرير الامتثال لـ ${input.companyData.name}` 
            : `Compliance Report for ${input.companyData.name}`,
          saudizationStatus: {
            totalEmployees: input.companyData.employeeCount,
            saudiEmployees: input.companyData.saudiCount,
            percentage: ((input.companyData.saudiCount / input.companyData.employeeCount) * 100).toFixed(2)
          },
          recommendations: input.includeRecommendations 
            ? [
                isArabic ? 'مراجعة العقود بشكل دوري' : 'Review contracts periodically',
                isArabic ? 'التأكد من الامتثال لنظام العمل' : 'Ensure labor law compliance'
              ]
            : []
        }
      };
    }),

  // ============================================
  // Contract Generator Routes
  // ============================================
  
  /**
   * إنشاء عقد عمل
   */
  generateContract: protectedProcedure
    .input(z.object({
      employer: employerSchema,
      employee: employeeSchema,
      contract: contractDetailsSchema,
      options: z.object({
        language: z.enum(['ar', 'en', 'both']).default('ar'),
        includeJobDescription: z.boolean().optional(),
        includeConfidentialityClause: z.boolean().optional(),
        includeNonCompeteClause: z.boolean().optional(),
        includeIntellectualProperty: z.boolean().optional(),
        customClauses: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return await generateEmploymentContract(input);
    }),

  /**
   * إنشاء ملحق عقد
   */
  generateAmendment: protectedProcedure
    .input(z.object({
      originalContract: z.object({
        contractNumber: z.string(),
        employerName: z.string(),
        employeeName: z.string(),
        originalDate: z.string(),
      }),
      amendments: z.array(z.object({
        type: z.enum(['salary_change', 'title_change', 'location_change', 'terms_change', 'other']),
        description: z.string(),
        oldValue: z.string().optional(),
        newValue: z.string().optional(),
        effectiveDate: z.string(),
        reason: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      return await generateContractAmendment(input.originalContract, input.amendments);
    }),

  /**
   * إنشاء خطاب إنهاء خدمات
   */
  generateTerminationLetter: protectedProcedure
    .input(z.object({
      employerName: z.string(),
      employeeName: z.string(),
      employeeId: z.string(),
      contractDate: z.string(),
      terminationType: z.enum(['resignation', 'termination', 'end_of_contract', 'mutual_agreement']),
      terminationDate: z.string(),
      lastWorkingDay: z.string(),
      reason: z.string().optional(),
      noticePeriodServed: z.boolean(),
      endOfServiceAmount: z.number().optional(),
      remainingLeaveAmount: z.number().optional(),
      otherEntitlements: z.array(z.object({
        name: z.string(),
        amount: z.number(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      return await generateTerminationLetter(input);
    }),

  /**
   * إنشاء شهادة خبرة
   */
  generateExperienceCertificate: protectedProcedure
    .input(z.object({
      employerName: z.string(),
      employerLogo: z.string().optional(),
      employeeName: z.string(),
      employeeId: z.string(),
      nationality: z.string(),
      jobTitle: z.string(),
      department: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      lastSalary: z.number().optional(),
      performanceRating: z.enum(['excellent', 'very_good', 'good', 'satisfactory']).optional(),
      additionalNotes: z.string().optional(),
      language: z.enum(['ar', 'en', 'both']).default('ar'),
    }))
    .mutation(async ({ input }) => {
      return await generateExperienceCertificate(input);
    }),

  /**
   * إنشاء خطاب تعريف بالراتب
   */
  generateSalaryLetter: protectedProcedure
    .input(z.object({
      employerName: z.string(),
      employeeName: z.string(),
      employeeId: z.string(),
      jobTitle: z.string(),
      joinDate: z.string(),
      basicSalary: z.number(),
      housingAllowance: z.number().optional(),
      transportAllowance: z.number().optional(),
      otherAllowances: z.array(z.object({
        name: z.string(),
        amount: z.number(),
      })).optional(),
      totalSalary: z.number(),
      purpose: z.enum(['bank', 'embassy', 'government', 'other']),
      addressedTo: z.string().optional(),
      language: z.enum(['ar', 'en', 'both']).default('ar'),
    }))
    .mutation(async ({ input }) => {
      return await generateSalaryLetter(input);
    }),

  // ============================================
  // GOSI Calculator Routes
  // ============================================
  
  /**
   * حساب اشتراكات التأمينات لموظف واحد
   */
  calculateGOSI: protectedProcedure
    .input(z.object({
      employee: z.object({
        nationality: z.enum(['saudi', 'non-saudi']),
        gender: z.enum(['male', 'female']),
        birthDate: z.string(),
        gosiStartDate: z.string().optional(),
      }),
      salary: z.object({
        basic: z.number(),
        housing: z.number().optional(),
        transport: z.number().optional(),
        commission: z.number().optional(),
        otherAllowances: z.number().optional(),
      }),
      options: z.object({
        includeRetirementProjection: z.boolean().optional(),
        includeEarlyRetirementOptions: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return calculateGOSIContributions(input);
    }),

  /**
   * حساب اشتراكات مجموعة موظفين
   */
  calculateBulkGOSI: protectedProcedure
    .input(z.object({
      employees: z.array(z.object({
        id: z.string(),
        name: z.string(),
        nationality: z.enum(['saudi', 'non-saudi']),
        gender: z.enum(['male', 'female']),
        birthDate: z.string(),
        salary: z.object({
          basic: z.number(),
          housing: z.number().optional(),
          transport: z.number().optional(),
          commission: z.number().optional(),
          otherAllowances: z.number().optional(),
        }),
      })),
    }))
    .mutation(async ({ input }) => {
      return calculateBulkGOSI(input.employees);
    }),

  /**
   * تحليل امتثال التأمينات
   */
  analyzeGOSICompliance: protectedProcedure
    .input(z.object({
      employeeCount: z.number(),
      saudiCount: z.number(),
      totalPayroll: z.number(),
      monthlyGOSIPayment: z.number(),
      registrationStatus: z.enum(['registered', 'not_registered', 'pending']),
      lastPaymentDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await analyzeGOSICompliance(input);
    }),

  /**
   * حساب تعويض ساند
   */
  calculateSANED: protectedProcedure
    .input(z.object({
      lastSalary: z.number(),
      reasonForUnemployment: z.enum(['layoff', 'company_closure', 'contract_end']),
      subscriptionMonths: z.number(),
    }))
    .mutation(async ({ input }) => {
      return calculateSANEDCompensation(
        input.lastSalary,
        input.reasonForUnemployment,
        input.subscriptionMonths
      );
    }),

  /**
   * إنشاء تقرير التأمينات الشهري
   */
  generateGOSIReport: protectedProcedure
    .input(z.object({
      month: z.string(),
      year: z.number(),
      employeeData: z.array(z.object({
        id: z.string(),
        name: z.string(),
        nationality: z.enum(['saudi', 'non-saudi']),
        salary: z.object({
          basic: z.number(),
          housing: z.number().optional(),
          transport: z.number().optional(),
          commission: z.number().optional(),
          otherAllowances: z.number().optional(),
        }),
        status: z.enum(['active', 'new', 'terminated']),
        terminationDate: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      return await generateMonthlyGOSIReport(
        input.month,
        input.year,
        input.employeeData
      );
    }),

  /**
   * الحصول على نسب التأمينات
   */
  getGOSIRates: protectedProcedure
    .query(() => {
      return GOSI_RATES;
    }),

  // ============================================
  // Saudization Advisor Routes
  // ============================================
  
  /**
   * تحليل وضع السعودة
   */
  analyzeSaudization: protectedProcedure
    .input(companyProfileSchema)
    .mutation(async ({ input }) => {
      return analyzeSaudization(input);
    }),

  /**
   * الحصول على نصيحة ذكية للسعودة
   */
  getSaudizationAdvice: protectedProcedure
    .input(z.object({
      profile: companyProfileSchema,
      specificQuestion: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await getAISaudizationAdvice(input.profile, input.specificQuestion);
    }),

  /**
   * محاكاة تأثير التوظيف
   */
  simulateHiringImpact: protectedProcedure
    .input(z.object({
      currentProfile: companyProfileSchema,
      hiringPlan: z.object({
        newSaudis: z.number(),
        newNonSaudis: z.number(),
        terminateSaudis: z.number(),
        terminateNonSaudis: z.number(),
        specialCategories: z.object({
          disabled: z.number().optional(),
          partTime: z.number().optional(),
          students: z.number().optional(),
          remoteWomen: z.number().optional(),
        }).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return simulateHiringImpact(input.currentProfile, input.hiringPlan);
    }),

  /**
   * الحصول على توصيات توظيف
   */
  getHiringRecommendations: protectedProcedure
    .input(z.object({
      profile: companyProfileSchema,
      budget: z.number().optional(),
      urgency: z.enum(['immediate', 'short_term', 'long_term']).optional(),
    }))
    .mutation(async ({ input }) => {
      return await getHiringRecommendations(input.profile, input.budget, input.urgency);
    }),

  /**
   * التحقق من أهلية موظف للاحتساب
   */
  checkEmployeeEligibility: protectedProcedure
    .input(z.object({
      nationality: z.enum(['saudi', 'non-saudi']),
      salary: z.number(),
      workType: z.enum(['full_time', 'part_time', 'remote']),
      isStudent: z.boolean(),
      isDisabled: z.boolean(),
      weeklyHours: z.number(),
    }))
    .mutation(async ({ input }) => {
      return checkEmployeeEligibility(input);
    }),

  /**
   * الحصول على ثوابت نطاقات
   */
  getNitaqatInfo: protectedProcedure
    .query(() => {
      return {
        bands: NITAQAT_BANDS.bands,
        requirements: SAUDIZATION_REQUIREMENTS.sectors,
        countingRules: SAUDIZATION_REQUIREMENTS.saudiCountingRules,
      };
    }),

  // ============================================
  // Document Validator Routes
  // ============================================
  
  /**
   * التحقق من مستند
   */
  validateDocument: protectedProcedure
    .input(z.object({
      content: z.string(),
      type: z.enum([
        'employment_contract',
        'termination_letter',
        'resignation_letter',
        'warning_letter',
        'salary_certificate',
        'experience_certificate',
        'hr_policy',
        'leave_request',
        'promotion_letter',
        'transfer_letter',
        'non_compete_agreement',
        'confidentiality_agreement',
        'offer_letter',
        'internal_memo',
        'other'
      ]),
      metadata: z.object({
        date: z.string().optional(),
        parties: z.array(z.string()).optional(),
        language: z.enum(['ar', 'en', 'both']).optional(),
      }).optional(),
      validationOptions: z.object({
        categories: z.array(z.enum(['labor_law', 'pdpl', 'nca', 'mohr', 'gosi', 'general'])).optional(),
        strictMode: z.boolean().optional(),
        includeRecommendations: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return await validateDocument(input);
    }),

  /**
   * اكتشاف نوع المستند
   */
  detectDocumentType: protectedProcedure
    .input(z.object({
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await detectDocumentType(input.content);
    }),

  /**
   * التحقق من سياسة موارد بشرية
   */
  validateHRPolicy: protectedProcedure
    .input(z.object({
      content: z.string(),
      policyType: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await validateHRPolicy(input.content, input.policyType);
    }),

  /**
   * التحقق من عقد عمل
   */
  validateContract: protectedProcedure
    .input(z.object({
      content: z.string(),
      employeeNationality: z.enum(['saudi', 'non-saudi']),
    }))
    .mutation(async ({ input }) => {
      return await validateEmploymentContract(input.content, input.employeeNationality);
    }),

  /**
   * إنشاء تقرير التحقق
   */
  generateValidationReport: protectedProcedure
    .input(z.object({
      validationResult: z.any(), // سنمرر نتيجة التحقق كاملة
    }))
    .mutation(async ({ input }) => {
      return await generateValidationReport(input.validationResult);
    }),
});
