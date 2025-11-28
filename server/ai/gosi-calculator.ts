/**
 * AI GOSI Calculator - حاسبة التأمينات الاجتماعية الذكية
 * 
 * حاسبة التأمينات الاجتماعية المتوافقة مع:
 * - نظام التأمينات الاجتماعية السعودي
 * - نظام ساند للتعطل عن العمل
 * - نظام الأخطار المهنية
 * - تعديلات 2025
 * 
 * @module server/ai/gosi-calculator
 */

import { callLLM } from "../_core/llm";
import { loadRegulation, type Regulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Loaders with Cache
// ============================================

let gosiRegulation: Regulation | null = null;

/**
 * تحميل نظام التأمينات الاجتماعية من قاعدة المعرفة
 */
function getGOSIRegulation(): Regulation | null {
  if (!gosiRegulation) {
    try {
      gosiRegulation = loadRegulation('gosi');
    } catch {
      return null;
    }
  }
  return gosiRegulation;
}

/**
 * الحصول على نسب الاشتراكات من قاعدة المعرفة
 */
function getGOSIRatesFromKB(regulation: Regulation): typeof GOSI_RATES {
  const regData = regulation as Record<string, any>;
  const rates = regData.rates?.contributions || {};
  const limits = regData.rates?.salaryLimits || {};
  
  return {
    saudi: {
      annuity: {
        employer: rates.annuity?.employer ?? 9,
        employee: rates.annuity?.employee ?? 9,
        total: rates.annuity?.total ?? 18
      },
      saned: {
        employer: rates.saned?.employer ?? 0.75,
        employee: rates.saned?.employee ?? 0.75,
        total: rates.saned?.total ?? 1.5
      },
      occupationalHazards: {
        employer: rates.occupationalHazards?.employer ?? 2,
        employee: rates.occupationalHazards?.employee ?? 0,
        total: rates.occupationalHazards?.total ?? 2
      }
    },
    nonSaudi: {
      occupationalHazards: {
        employer: rates.occupationalHazards?.employer ?? 2,
        employee: rates.occupationalHazards?.employee ?? 0,
        total: rates.occupationalHazards?.total ?? 2
      }
    },
    salaryLimits: {
      minimum: limits.minimum ?? 1500,
      maximum: limits.maximum ?? 45000,
      sanedMaximum: limits.sanedMaximum ?? 45000
    }
  };
}

/**
 * الحصول على قواعد التقاعد من قاعدة المعرفة
 */
function getRetirementRulesFromKB(regulation: Regulation): typeof EARLY_RETIREMENT_RULES {
  const regData = regulation as Record<string, any>;
  const retirement = regData.retirement || {};
  
  return {
    male: {
      minimumAge: retirement.male?.normalAge ?? 60,
      earlyRetirementAge: retirement.male?.earlyAge ?? 55,
      minimumSubscriptionMonths: (retirement.male?.minimumYears ?? 25) * 12,
      earlyRetirementMinMonths: (retirement.male?.earlyMinimumYears ?? 10) * 12
    },
    female: {
      minimumAge: retirement.female?.normalAge ?? 55,
      earlyRetirementAge: retirement.female?.earlyAge ?? 50,
      minimumSubscriptionMonths: (retirement.female?.minimumYears ?? 25) * 12,
      earlyRetirementMinMonths: (retirement.female?.earlyMinimumYears ?? 10) * 12
    }
  };
}

// ============================================
// ثوابت التأمينات الاجتماعية (Fallback)
// ============================================

export const GOSI_RATES = {
  saudi: {
    annuity: {
      employer: 9,
      employee: 9,
      total: 18
    },
    saned: {
      employer: 0.75,
      employee: 0.75,
      total: 1.5
    },
    occupationalHazards: {
      employer: 2,
      employee: 0,
      total: 2
    }
  },
  nonSaudi: {
    occupationalHazards: {
      employer: 2,
      employee: 0,
      total: 2
    }
  },
  salaryLimits: {
    minimum: 1500,
    maximum: 45000,
    sanedMaximum: 45000
  }
} as const;

export const EARLY_RETIREMENT_RULES = {
  male: {
    minimumAge: 60,
    earlyRetirementAge: 55,
    minimumSubscriptionMonths: 300,
    earlyRetirementMinMonths: 120
  },
  female: {
    minimumAge: 55,
    earlyRetirementAge: 50,
    minimumSubscriptionMonths: 300,
    earlyRetirementMinMonths: 120
  }
};

export const PENSION_CALCULATION = {
  oldSystem: {
    factor: 1/40,
    maxPercentage: 100
  },
  newSystem: {
    factor: 2.5/100,
    maxPercentage: 100
  }
};

// ============================================
// الأنواع والواجهات
// ============================================

export interface GOSIInput {
  employee: {
    nationality: 'saudi' | 'non-saudi';
    gender: 'male' | 'female';
    birthDate: string;
    gosiStartDate?: string;
  };
  salary: {
    basic: number;
    housing?: number;
    transport?: number;
    commission?: number;
    otherAllowances?: number;
  };
  options?: {
    includeRetirementProjection?: boolean;
    includeEarlyRetirementOptions?: boolean;
  };
}

export interface GOSICalculation {
  success: boolean;
  contributions: {
    // الراتب الخاضع للاشتراك
    subscribableSalary: number;
    
    // اشتراك المعاشات (السعوديين فقط)
    annuity?: {
      employerAmount: number;
      employeeAmount: number;
      total: number;
    };
    
    // اشتراك ساند (السعوديين فقط)
    saned?: {
      employerAmount: number;
      employeeAmount: number;
      total: number;
    };
    
    // الأخطار المهنية
    occupationalHazards: {
      employerAmount: number;
      employeeAmount: number;
      total: number;
    };
    
    // الإجماليات
    totalEmployerContribution: number;
    totalEmployeeContribution: number;
    grandTotal: number;
  };
  
  retirement?: {
    eligibleAge: number;
    currentAge: number;
    yearsToRetirement: number;
    estimatedMonthlyPension?: number;
    earlyRetirementOption?: {
      eligible: boolean;
      minimumAge: number;
      pensionReduction?: number;
    };
  };
  
  summary: {
    arabic: string;
    english: string;
  };
  
  error?: string;
}

export interface BulkGOSICalculation {
  success: boolean;
  calculations: {
    employeeId: string;
    employeeName: string;
    nationality: string;
    result: GOSICalculation;
  }[];
  totals: {
    totalEmployerContribution: number;
    totalEmployeeContribution: number;
    grandTotal: number;
    saudiCount: number;
    nonSaudiCount: number;
  };
}

// ============================================
// Helper Functions
// ============================================

async function callAI<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي متخصص في التأمينات الاجتماعية السعودية. أجب بصيغة JSON فقط.' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 2000
    });
    if (!response) return fallback;
    
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    
    const textContent = typeof content === 'string' ? content : 
      (Array.isArray(content) ? content.filter(c => c.type === 'text').map(c => (c as {text: string}).text).join('') : '');
    
    const cleanedResponse = textContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse) as T;
  } catch (error) {
    console.error('GOSI Calculator AI Error:', error);
    return fallback;
  }
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function calculateSubscriptionMonths(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const months = (today.getFullYear() - start.getFullYear()) * 12 + 
                 (today.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function calculateSubscribableSalary(salary: GOSIInput['salary'], rates = GOSI_RATES): number {
  // الراتب الخاضع للاشتراك يشمل:
  // - الراتب الأساسي
  // - بدل السكن (25% من الأساسي إذا لم يُحدد)
  // - العمولات والحوافز (إن وجدت)
  
  let total = salary.basic;
  
  // بدل السكن (افتراضياً 25% من الراتب الأساسي)
  if (salary.housing !== undefined) {
    total += salary.housing;
  } else {
    total += salary.basic * 0.25;
  }
  
  // لا يُحسب بدل النقل ضمن الراتب الخاضع للاشتراك
  // لكن العمولات تُحسب
  if (salary.commission) {
    total += salary.commission;
  }
  
  // تطبيق الحدود من قاعدة المعرفة أو الافتراضية
  const limits = rates.salaryLimits;
  if (total < limits.minimum) {
    return limits.minimum;
  }
  if (total > limits.maximum) {
    return limits.maximum;
  }
  
  return total;
}

// ============================================
// Main Functions
// ============================================

/**
 * حساب اشتراكات التأمينات الاجتماعية لموظف واحد
 */
export async function calculateGOSIContributions(input: GOSIInput): Promise<GOSICalculation> {
  const { employee, salary, options } = input;
  
  // تحميل النظام من قاعدة المعرفة
  const regulation = await getGOSIRegulation();
  const rates = regulation ? getGOSIRatesFromKB(regulation) : GOSI_RATES;
  const retirementRules = regulation ? getRetirementRulesFromKB(regulation) : EARLY_RETIREMENT_RULES;
  
  // حساب الراتب الخاضع للاشتراك
  const subscribableSalary = calculateSubscribableSalary(salary, rates);
  
  // تهيئة النتيجة
  const result: GOSICalculation = {
    success: true,
    contributions: {
      subscribableSalary,
      occupationalHazards: {
        employerAmount: 0,
        employeeAmount: 0,
        total: 0
      },
      totalEmployerContribution: 0,
      totalEmployeeContribution: 0,
      grandTotal: 0
    },
    summary: {
      arabic: '',
      english: ''
    }
  };
  
  if (employee.nationality === 'saudi') {
    // السعوديين: معاشات + ساند + أخطار مهنية
    
    // المعاشات
    const annuityEmployer = (subscribableSalary * rates.saudi.annuity.employer) / 100;
    const annuityEmployee = (subscribableSalary * rates.saudi.annuity.employee) / 100;
    
    result.contributions.annuity = {
      employerAmount: Math.round(annuityEmployer * 100) / 100,
      employeeAmount: Math.round(annuityEmployee * 100) / 100,
      total: Math.round((annuityEmployer + annuityEmployee) * 100) / 100
    };
    
    // ساند
    const sanedSalary = Math.min(subscribableSalary, rates.salaryLimits.sanedMaximum);
    const sanedEmployer = (sanedSalary * rates.saudi.saned.employer) / 100;
    const sanedEmployee = (sanedSalary * rates.saudi.saned.employee) / 100;
    
    result.contributions.saned = {
      employerAmount: Math.round(sanedEmployer * 100) / 100,
      employeeAmount: Math.round(sanedEmployee * 100) / 100,
      total: Math.round((sanedEmployer + sanedEmployee) * 100) / 100
    };
    
    // الأخطار المهنية
    const ohEmployer = (subscribableSalary * rates.saudi.occupationalHazards.employer) / 100;
    
    result.contributions.occupationalHazards = {
      employerAmount: Math.round(ohEmployer * 100) / 100,
      employeeAmount: 0,
      total: Math.round(ohEmployer * 100) / 100
    };
    
    // الإجماليات
    result.contributions.totalEmployerContribution = Math.round(
      (annuityEmployer + sanedEmployer + ohEmployer) * 100
    ) / 100;
    
    result.contributions.totalEmployeeContribution = Math.round(
      (annuityEmployee + sanedEmployee) * 100
    ) / 100;
    
  } else {
    // غير السعوديين: أخطار مهنية فقط
    const ohEmployer = (subscribableSalary * rates.nonSaudi.occupationalHazards.employer) / 100;
    
    result.contributions.occupationalHazards = {
      employerAmount: Math.round(ohEmployer * 100) / 100,
      employeeAmount: 0,
      total: Math.round(ohEmployer * 100) / 100
    };
    
    result.contributions.totalEmployerContribution = Math.round(ohEmployer * 100) / 100;
    result.contributions.totalEmployeeContribution = 0;
  }
  
  result.contributions.grandTotal = 
    result.contributions.totalEmployerContribution + 
    result.contributions.totalEmployeeContribution;
  
  // حساب التقاعد (للسعوديين فقط)
  if (employee.nationality === 'saudi' && options?.includeRetirementProjection) {
    const currentAge = calculateAge(employee.birthDate);
    const genderRules = retirementRules[employee.gender];
    
    result.retirement = {
      eligibleAge: genderRules.minimumAge,
      currentAge,
      yearsToRetirement: Math.max(0, genderRules.minimumAge - currentAge)
    };
    
    // حساب التقاعد المبكر إن طُلب
    if (options.includeEarlyRetirementOptions && employee.gosiStartDate) {
      const subscriptionMonths = calculateSubscriptionMonths(employee.gosiStartDate);
      const canEarlyRetire = subscriptionMonths >= genderRules.earlyRetirementMinMonths &&
                            currentAge >= genderRules.earlyRetirementAge;
      
      result.retirement.earlyRetirementOption = {
        eligible: canEarlyRetire,
        minimumAge: genderRules.earlyRetirementAge,
        pensionReduction: canEarlyRetire ? calculateEarlyRetirementReduction(
          currentAge,
          genderRules.minimumAge
        ) : undefined
      };
    }
    
    // تقدير المعاش الشهري
    if (employee.gosiStartDate) {
      const subscriptionYears = calculateSubscriptionMonths(employee.gosiStartDate) / 12;
      result.retirement.estimatedMonthlyPension = estimateMonthlyPension(
        subscribableSalary,
        subscriptionYears
      );
    }
  }
  
  // إنشاء الملخص
  result.summary = {
    arabic: generateArabicSummary(result, employee.nationality),
    english: generateEnglishSummary(result, employee.nationality)
  };
  
  return result;
}

/**
 * حساب اشتراكات التأمينات الاجتماعية لموظف واحد (متزامن للتوافقية)
 */
export function calculateGOSIContributionsSync(input: GOSIInput): GOSICalculation {
  const { employee, salary, options } = input;
  
  // استخدام القيم الافتراضية
  const rates = GOSI_RATES;
  
  // حساب الراتب الخاضع للاشتراك
  const subscribableSalary = calculateSubscribableSalary(salary, rates);
  
  // تهيئة النتيجة
  const result: GOSICalculation = {
    success: true,
    contributions: {
      subscribableSalary,
      occupationalHazards: {
        employerAmount: 0,
        employeeAmount: 0,
        total: 0
      },
      totalEmployerContribution: 0,
      totalEmployeeContribution: 0,
      grandTotal: 0
    },
    summary: {
      arabic: '',
      english: ''
    }
  };
  
  if (employee.nationality === 'saudi') {
    // السعوديين: معاشات + ساند + أخطار مهنية
    
    // المعاشات
    const annuityEmployer = (subscribableSalary * GOSI_RATES.saudi.annuity.employer) / 100;
    const annuityEmployee = (subscribableSalary * GOSI_RATES.saudi.annuity.employee) / 100;
    
    result.contributions.annuity = {
      employerAmount: Math.round(annuityEmployer * 100) / 100,
      employeeAmount: Math.round(annuityEmployee * 100) / 100,
      total: Math.round((annuityEmployer + annuityEmployee) * 100) / 100
    };
    
    // ساند
    const sanedSalary = Math.min(subscribableSalary, GOSI_RATES.salaryLimits.sanedMaximum);
    const sanedEmployer = (sanedSalary * GOSI_RATES.saudi.saned.employer) / 100;
    const sanedEmployee = (sanedSalary * GOSI_RATES.saudi.saned.employee) / 100;
    
    result.contributions.saned = {
      employerAmount: Math.round(sanedEmployer * 100) / 100,
      employeeAmount: Math.round(sanedEmployee * 100) / 100,
      total: Math.round((sanedEmployer + sanedEmployee) * 100) / 100
    };
    
    // الأخطار المهنية
    const ohEmployer = (subscribableSalary * GOSI_RATES.saudi.occupationalHazards.employer) / 100;
    
    result.contributions.occupationalHazards = {
      employerAmount: Math.round(ohEmployer * 100) / 100,
      employeeAmount: 0,
      total: Math.round(ohEmployer * 100) / 100
    };
    
    // الإجماليات
    result.contributions.totalEmployerContribution = Math.round(
      (annuityEmployer + sanedEmployer + ohEmployer) * 100
    ) / 100;
    
    result.contributions.totalEmployeeContribution = Math.round(
      (annuityEmployee + sanedEmployee) * 100
    ) / 100;
    
  } else {
    // غير السعوديين: أخطار مهنية فقط
    const ohEmployer = (subscribableSalary * GOSI_RATES.nonSaudi.occupationalHazards.employer) / 100;
    
    result.contributions.occupationalHazards = {
      employerAmount: Math.round(ohEmployer * 100) / 100,
      employeeAmount: 0,
      total: Math.round(ohEmployer * 100) / 100
    };
    
    result.contributions.totalEmployerContribution = Math.round(ohEmployer * 100) / 100;
    result.contributions.totalEmployeeContribution = 0;
  }
  
  result.contributions.grandTotal = 
    result.contributions.totalEmployerContribution + 
    result.contributions.totalEmployeeContribution;
  
  // حساب التقاعد (للسعوديين فقط)
  if (employee.nationality === 'saudi' && options?.includeRetirementProjection) {
    const currentAge = calculateAge(employee.birthDate);
    const retirementRules = EARLY_RETIREMENT_RULES[employee.gender];
    
    result.retirement = {
      eligibleAge: retirementRules.minimumAge,
      currentAge,
      yearsToRetirement: Math.max(0, retirementRules.minimumAge - currentAge)
    };
    
    // حساب التقاعد المبكر إن طُلب
    if (options.includeEarlyRetirementOptions && employee.gosiStartDate) {
      const subscriptionMonths = calculateSubscriptionMonths(employee.gosiStartDate);
      const canEarlyRetire = subscriptionMonths >= retirementRules.earlyRetirementMinMonths &&
                            currentAge >= retirementRules.earlyRetirementAge;
      
      result.retirement.earlyRetirementOption = {
        eligible: canEarlyRetire,
        minimumAge: retirementRules.earlyRetirementAge,
        pensionReduction: canEarlyRetire ? calculateEarlyRetirementReduction(
          currentAge,
          retirementRules.minimumAge
        ) : undefined
      };
    }
    
    // تقدير المعاش الشهري
    if (employee.gosiStartDate) {
      const subscriptionYears = calculateSubscriptionMonths(employee.gosiStartDate) / 12;
      result.retirement.estimatedMonthlyPension = estimateMonthlyPension(
        subscribableSalary,
        subscriptionYears
      );
    }
  }
  
  // إنشاء الملخص
  result.summary = {
    arabic: generateArabicSummary(result, employee.nationality),
    english: generateEnglishSummary(result, employee.nationality)
  };
  
  return result;
}

/**
 * حساب نسبة تخفيض المعاش للتقاعد المبكر
 */
function calculateEarlyRetirementReduction(
  currentAge: number,
  normalRetirementAge: number
): number {
  const yearsEarly = normalRetirementAge - currentAge;
  // تخفيض 3% لكل سنة قبل سن التقاعد الطبيعي
  return Math.min(yearsEarly * 3, 30);
}

/**
 * تقدير المعاش الشهري
 */
function estimateMonthlyPension(
  averageSalary: number,
  subscriptionYears: number
): number {
  // صيغة حساب المعاش: متوسط الراتب × عدد سنوات الاشتراك × 2.5%
  const pension = averageSalary * subscriptionYears * PENSION_CALCULATION.newSystem.factor;
  // الحد الأقصى 100% من متوسط الراتب
  return Math.min(Math.round(pension), averageSalary);
}

/**
 * حساب اشتراكات التأمينات لمجموعة موظفين
 */
export async function calculateBulkGOSI(
  employees: Array<{
    id: string;
    name: string;
    nationality: 'saudi' | 'non-saudi';
    gender: 'male' | 'female';
    birthDate: string;
    salary: GOSIInput['salary'];
  }>
): Promise<BulkGOSICalculation> {
  // حساب الاشتراكات لكل موظف
  const calculationsPromises = employees.map(async emp => ({
    employeeId: emp.id,
    employeeName: emp.name,
    nationality: emp.nationality,
    result: await calculateGOSIContributions({
      employee: {
        nationality: emp.nationality,
        gender: emp.gender,
        birthDate: emp.birthDate
      },
      salary: emp.salary
    })
  }));
  
  const calculations = await Promise.all(calculationsPromises);
  
  const totals = {
    totalEmployerContribution: 0,
    totalEmployeeContribution: 0,
    grandTotal: 0,
    saudiCount: 0,
    nonSaudiCount: 0
  };
  
  calculations.forEach(calc => {
    totals.totalEmployerContribution += calc.result.contributions.totalEmployerContribution;
    totals.totalEmployeeContribution += calc.result.contributions.totalEmployeeContribution;
    totals.grandTotal += calc.result.contributions.grandTotal;
    
    if (calc.nationality === 'saudi') {
      totals.saudiCount++;
    } else {
      totals.nonSaudiCount++;
    }
  });
  
  // تقريب الإجماليات
  totals.totalEmployerContribution = Math.round(totals.totalEmployerContribution * 100) / 100;
  totals.totalEmployeeContribution = Math.round(totals.totalEmployeeContribution * 100) / 100;
  totals.grandTotal = Math.round(totals.grandTotal * 100) / 100;
  
  return {
    success: true,
    calculations,
    totals
  };
}

/**
 * تحليل ذكي لمتطلبات التأمينات الاجتماعية
 */
export async function analyzeGOSICompliance(
  companyData: {
    employeeCount: number;
    saudiCount: number;
    totalPayroll: number;
    monthlyGOSIPayment: number;
    registrationStatus: 'registered' | 'not_registered' | 'pending';
    lastPaymentDate?: string;
  }
): Promise<{
  success: boolean;
  analysis: {
    registrationStatus: string;
    paymentStatus: string;
    estimatedContributions: number;
    variance: number;
    issues: string[];
    recommendations: string[];
  };
  compliance: {
    isCompliant: boolean;
    score: number;
    details: string[];
  };
}> {
  const prompt = `
أنت خبير في نظام التأمينات الاجتماعية السعودي.

قم بتحليل بيانات المنشأة التالية وتقييم امتثالها لنظام التأمينات:

## بيانات المنشأة:
- عدد الموظفين: ${companyData.employeeCount}
- عدد السعوديين: ${companyData.saudiCount}
- إجمالي الرواتب الشهرية: ${companyData.totalPayroll} ريال
- مدفوعات التأمينات الشهرية: ${companyData.monthlyGOSIPayment} ريال
- حالة التسجيل: ${companyData.registrationStatus}
${companyData.lastPaymentDate ? `- تاريخ آخر سداد: ${companyData.lastPaymentDate}` : ''}

## نسب الاشتراكات المعتمدة:
- السعوديين: صاحب العمل 11.75%، الموظف 9.75%
- غير السعوديين: صاحب العمل 2%، الموظف 0%

أرجع النتيجة بصيغة JSON:
{
  "analysis": {
    "registrationStatus": "حالة التسجيل (سليم/يحتاج مراجعة/غير مكتمل)",
    "paymentStatus": "حالة السداد (منتظم/متأخر/منقطع)",
    "estimatedContributions": 0,
    "variance": 0,
    "issues": ["قائمة المشاكل المكتشفة"],
    "recommendations": ["التوصيات"]
  },
  "compliance": {
    "isCompliant": true,
    "score": 85,
    "details": ["تفاصيل الامتثال"]
  }
}
`;

  const result = await callAI<{
    analysis: {
      registrationStatus: string;
      paymentStatus: string;
      estimatedContributions: number;
      variance: number;
      issues: string[];
      recommendations: string[];
    };
    compliance: {
      isCompliant: boolean;
      score: number;
      details: string[];
    };
  }>(prompt, {
    analysis: {
      registrationStatus: companyData.registrationStatus === 'registered' ? 'سليم' : 'يحتاج مراجعة',
      paymentStatus: 'غير محدد',
      estimatedContributions: estimateCompanyContributions(companyData),
      variance: companyData.monthlyGOSIPayment - estimateCompanyContributions(companyData),
      issues: [],
      recommendations: ['مراجعة بيانات التأمينات الاجتماعية']
    },
    compliance: {
      isCompliant: companyData.registrationStatus === 'registered',
      score: companyData.registrationStatus === 'registered' ? 70 : 30,
      details: []
    }
  });
  
  return {
    success: true,
    ...result
  };
}

/**
 * تقدير اشتراكات المنشأة
 */
function estimateCompanyContributions(data: {
  employeeCount: number;
  saudiCount: number;
  totalPayroll: number;
}): number {
  const nonSaudiCount = data.employeeCount - data.saudiCount;
  const avgSalary = data.totalPayroll / data.employeeCount;
  
  // تقدير اشتراكات السعوديين
  const saudiContribution = data.saudiCount * avgSalary * 0.2175; // 21.75%
  
  // تقدير اشتراكات غير السعوديين
  const nonSaudiContribution = nonSaudiCount * avgSalary * 0.02; // 2%
  
  return Math.round(saudiContribution + nonSaudiContribution);
}

/**
 * حساب تعويض ساند
 */
export function calculateSANEDCompensation(
  lastSalary: number,
  reasonForUnemployment: 'layoff' | 'company_closure' | 'contract_end',
  subscriptionMonths: number
): {
  eligible: boolean;
  compensationAmount?: number;
  duration?: number;
  conditions?: string[];
  reason?: string;
} {
  // شروط الأهلية لساند
  if (subscriptionMonths < 12) {
    return {
      eligible: false,
      reason: 'يجب أن تكون مدة الاشتراك في ساند 12 شهراً على الأقل خلال 36 شهراً السابقة'
    };
  }
  
  if (reasonForUnemployment === 'contract_end') {
    return {
      eligible: false,
      reason: 'انتهاء العقد لا يعد سبباً للاستحقاق إلا في حالات معينة'
    };
  }
  
  // حساب التعويض
  // الأشهر 1-3: 60% من الراتب
  // الأشهر 4-12: 50% من الراتب
  const cappedSalary = Math.min(lastSalary, GOSI_RATES.salaryLimits.sanedMaximum);
  
  // الحد الأقصى للتعويض الشهري
  const maxMonthlyCompensation = 9000;
  const adjustedFirstThreeMonths = Math.min(cappedSalary * 0.6, maxMonthlyCompensation) * 3;
  const adjustedRemainingMonths = Math.min(cappedSalary * 0.5, maxMonthlyCompensation) * 9;
  
  return {
    eligible: true,
    compensationAmount: Math.round(adjustedFirstThreeMonths + adjustedRemainingMonths),
    duration: 12,
    conditions: [
      'التسجيل في طاقات والبحث النشط عن عمل',
      'حضور برامج التدريب المعتمدة',
      'عدم رفض عروض العمل المناسبة',
      'عدم مغادرة المملكة لأكثر من 60 يوماً'
    ]
  };
}

/**
 * إنشاء تقرير التأمينات الشهري
 */
export async function generateMonthlyGOSIReport(
  month: string,
  year: number,
  employeeData: Array<{
    id: string;
    name: string;
    nationality: 'saudi' | 'non-saudi';
    salary: GOSIInput['salary'];
    status: 'active' | 'new' | 'terminated';
    terminationDate?: string;
  }>
): Promise<{
  success: boolean;
  report: {
    period: string;
    totalEmployees: number;
    activeEmployees: number;
    newEmployees: number;
    terminatedEmployees: number;
    contributions: {
      annuity: number;
      saned: number;
      occupationalHazards: number;
      total: number;
    };
    breakdown: {
      saudi: { count: number; contribution: number };
      nonSaudi: { count: number; contribution: number };
    };
    summary: string;
  };
  error?: string;
}> {
  const activeEmployees = employeeData.filter(e => e.status === 'active');
  const newEmployees = employeeData.filter(e => e.status === 'new');
  const terminatedEmployees = employeeData.filter(e => e.status === 'terminated');
  
  // حساب الاشتراكات
  let totalAnnuity = 0;
  let totalSaned = 0;
  let totalOH = 0;
  let saudiCount = 0;
  let saudiContribution = 0;
  let nonSaudiCount = 0;
  let nonSaudiContribution = 0;
  
  // حساب اشتراكات كل موظف (بالتوازي)
  const allActiveEmployees = [...activeEmployees, ...newEmployees];
  const calculations = await Promise.all(
    allActiveEmployees.map(emp => 
      calculateGOSIContributions({
        employee: {
          nationality: emp.nationality,
          gender: 'male',
          birthDate: '1990-01-01'
        },
        salary: emp.salary
      })
    )
  );
  
  allActiveEmployees.forEach((emp, index) => {
    const calc = calculations[index];
    
    if (emp.nationality === 'saudi') {
      saudiCount++;
      saudiContribution += calc.contributions.grandTotal;
      totalAnnuity += calc.contributions.annuity?.total || 0;
      totalSaned += calc.contributions.saned?.total || 0;
    } else {
      nonSaudiCount++;
      nonSaudiContribution += calc.contributions.grandTotal;
    }
    
    totalOH += calc.contributions.occupationalHazards.total;
  });
  
  return {
    success: true,
    report: {
      period: `${month} ${year}`,
      totalEmployees: employeeData.length,
      activeEmployees: activeEmployees.length + newEmployees.length,
      newEmployees: newEmployees.length,
      terminatedEmployees: terminatedEmployees.length,
      contributions: {
        annuity: Math.round(totalAnnuity * 100) / 100,
        saned: Math.round(totalSaned * 100) / 100,
        occupationalHazards: Math.round(totalOH * 100) / 100,
        total: Math.round((totalAnnuity + totalSaned + totalOH) * 100) / 100
      },
      breakdown: {
        saudi: { count: saudiCount, contribution: Math.round(saudiContribution * 100) / 100 },
        nonSaudi: { count: nonSaudiCount, contribution: Math.round(nonSaudiContribution * 100) / 100 }
      },
      summary: `تقرير التأمينات الاجتماعية لشهر ${month} ${year}: 
        إجمالي الموظفين ${employeeData.length}، 
        السعوديين ${saudiCount}، 
        غير السعوديين ${nonSaudiCount}، 
        إجمالي الاشتراكات ${Math.round((totalAnnuity + totalSaned + totalOH) * 100) / 100} ريال`
    }
  };
}

// ============================================
// Summary Generators
// ============================================

function generateArabicSummary(
  result: GOSICalculation,
  nationality: 'saudi' | 'non-saudi'
): string {
  const lines = [
    `الراتب الخاضع للاشتراك: ${result.contributions.subscribableSalary} ريال`
  ];
  
  if (nationality === 'saudi') {
    lines.push(
      `اشتراك المعاشات: ${result.contributions.annuity?.total} ريال (صاحب العمل: ${result.contributions.annuity?.employerAmount}، الموظف: ${result.contributions.annuity?.employeeAmount})`,
      `اشتراك ساند: ${result.contributions.saned?.total} ريال`,
      `الأخطار المهنية: ${result.contributions.occupationalHazards.total} ريال`
    );
  } else {
    lines.push(
      `الأخطار المهنية: ${result.contributions.occupationalHazards.total} ريال (على صاحب العمل)`
    );
  }
  
  lines.push(
    `إجمالي حصة صاحب العمل: ${result.contributions.totalEmployerContribution} ريال`,
    `إجمالي حصة الموظف: ${result.contributions.totalEmployeeContribution} ريال`,
    `الإجمالي الكلي: ${result.contributions.grandTotal} ريال`
  );
  
  return lines.join('\n');
}

function generateEnglishSummary(
  result: GOSICalculation,
  nationality: 'saudi' | 'non-saudi'
): string {
  const lines = [
    `Subscribable Salary: ${result.contributions.subscribableSalary} SAR`
  ];
  
  if (nationality === 'saudi') {
    lines.push(
      `Annuity: ${result.contributions.annuity?.total} SAR (Employer: ${result.contributions.annuity?.employerAmount}, Employee: ${result.contributions.annuity?.employeeAmount})`,
      `SANED: ${result.contributions.saned?.total} SAR`,
      `Occupational Hazards: ${result.contributions.occupationalHazards.total} SAR`
    );
  } else {
    lines.push(
      `Occupational Hazards: ${result.contributions.occupationalHazards.total} SAR (Employer only)`
    );
  }
  
  lines.push(
    `Total Employer Contribution: ${result.contributions.totalEmployerContribution} SAR`,
    `Total Employee Contribution: ${result.contributions.totalEmployeeContribution} SAR`,
    `Grand Total: ${result.contributions.grandTotal} SAR`
  );
  
  return lines.join('\n');
}
