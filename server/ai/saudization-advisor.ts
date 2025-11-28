/**
 * AI Saudization Advisor - مستشار السعودة الذكي (نطاقات)
 * 
 * مستشار ذكي للسعودة متوافق مع:
 * - برنامج نطاقات المحدث
 * - قرارات وزارة الموارد البشرية والتنمية الاجتماعية
 * - متطلبات التوطين القطاعية
 * - نظام أجور السعوديين
 * 
 * @module server/ai/saudization-advisor
 */

import { callLLM } from "../_core/llm";
import { loadRegulation, type Regulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Loaders with Cache
// ============================================

let nitaqatRegulation: Regulation | null = null;

/**
 * تحميل نظام نطاقات من قاعدة المعرفة
 */
function getNitaqatRegulation(): Regulation | null {
  if (!nitaqatRegulation) {
    try {
      nitaqatRegulation = loadRegulation('nitaqat');
    } catch {
      return null;
    }
  }
  return nitaqatRegulation;
}

/**
 * الحصول على النطاقات من قاعدة المعرفة
 */
function getNitaqatBandsFromKB(regulation: Regulation): typeof NITAQAT_BANDS {
  const regData = regulation as Record<string, any>;
  const bands = regData.bands || {};
  
  return {
    bands: {
      platinum: {
        nameAr: bands.platinum?.nameAr ?? 'البلاتيني',
        nameEn: bands.platinum?.nameEn ?? 'Platinum',
        color: bands.platinum?.color ?? '#E5E4E2',
        minPercentage: 0,
        benefits: bands.platinum?.benefits ?? [
          'تأشيرات عمل بدون قيود',
          'نقل خدمات بدون موافقة',
          'تغيير مهن بدون قيود',
          'فتح ملف منشأة جديدة'
        ]
      },
      green_high: {
        nameAr: bands.greenHigh?.nameAr ?? 'الأخضر المرتفع',
        nameEn: bands.greenHigh?.nameEn ?? 'High Green',
        color: bands.greenHigh?.color ?? '#006400',
        benefits: bands.greenHigh?.benefits ?? [
          'تأشيرات عمل متاحة',
          'نقل خدمات متاح',
          'تغيير مهن بموافقة'
        ]
      },
      green_medium: {
        nameAr: bands.greenMedium?.nameAr ?? 'الأخضر المتوسط',
        nameEn: bands.greenMedium?.nameEn ?? 'Medium Green',
        color: bands.greenMedium?.color ?? '#228B22',
        benefits: bands.greenMedium?.benefits ?? [
          'تأشيرات عمل محدودة',
          'نقل خدمات متاح',
          'تغيير مهن بموافقة'
        ]
      },
      green_low: {
        nameAr: bands.greenLow?.nameAr ?? 'الأخضر المنخفض',
        nameEn: bands.greenLow?.nameEn ?? 'Low Green',
        color: bands.greenLow?.color ?? '#32CD32',
        benefits: bands.greenLow?.benefits ?? [
          'تأشيرات عمل محدودة جداً',
          'نقل خدمات بشروط'
        ]
      },
      yellow: {
        nameAr: bands.yellow?.nameAr ?? 'الأصفر',
        nameEn: bands.yellow?.nameEn ?? 'Yellow',
        color: bands.yellow?.color ?? '#FFD700',
        benefits: [],
        restrictions: bands.yellow?.restrictions ?? [
          'لا تأشيرات عمل جديدة',
          'نقل خدمات من النطاق الأخضر فقط',
          'مهلة 6 أشهر للتصحيح'
        ]
      },
      red: {
        nameAr: bands.red?.nameAr ?? 'الأحمر',
        nameEn: bands.red?.nameEn ?? 'Red',
        color: bands.red?.color ?? '#FF0000',
        benefits: [],
        restrictions: bands.red?.restrictions ?? [
          'إيقاف جميع الخدمات',
          'لا تأشيرات عمل',
          'لا نقل خدمات',
          'مهلة 3 أشهر للتصحيح',
          'عقوبات إضافية'
        ]
      }
    }
  };
}

/**
 * الحصول على قواعد احتساب السعودي من قاعدة المعرفة
 */
function getSaudiCountingRulesFromKB(regulation: Regulation): typeof SAUDIZATION_REQUIREMENTS.saudiCountingRules {
  const regData = regulation as Record<string, any>;
  const rules = regData.countingRules || {};
  const minWage = regData.minimumWage || {};
  
  return {
    minimumSalary: minWage.fullBenefit ?? 4000,
    fullTimeMinHours: rules.fullTimeMinHours ?? 48,
    partTimeMinHours: rules.partTimeMinHours ?? 24,
    partTimeWeight: rules.partTimeWeight ?? 0.5,
    studentWeight: rules.studentWeight ?? 0.5,
    disabledWeight: rules.disabledWeight ?? 4,
    femaleInRemoteWeight: rules.femaleInRemoteWeight ?? 2,
    premiumJobWeight: rules.premiumJobWeight ?? 2
  };
}

/**
 * الحصول على متطلبات السعودة القطاعية من قاعدة المعرفة
 */
function getSaudizationRequirementsFromKB(regulation: Regulation): typeof SAUDIZATION_REQUIREMENTS.sectors {
  const regData = regulation as Record<string, any>;
  const sectors = regData.sectors || {};
  
  // إعادة بناء الهيكل المتوقع من بيانات قاعدة المعرفة
  const result: Record<string, any> = {};
  
  for (const [key, sectorData] of Object.entries(sectors)) {
    const sector = sectorData as Record<string, any>;
    result[key] = {
      nameAr: sector.nameAr || key,
      nameEn: sector.nameEn || key,
      requirements: sector.requirements || {},
      localizedJobs: sector.localizedJobs || []
    };
  }
  
  return result as typeof SAUDIZATION_REQUIREMENTS.sectors;
}

// ============================================
// ثوابت برنامج نطاقات
// ============================================

export const NITAQAT_BANDS = {
  // النطاقات الرئيسية
  bands: {
    platinum: {
      nameAr: 'البلاتيني',
      nameEn: 'Platinum',
      color: '#E5E4E2',
      minPercentage: 0, // يعتمد على النشاط
      benefits: [
        'تأشيرات عمل بدون قيود',
        'نقل خدمات بدون موافقة',
        'تغيير مهن بدون قيود',
        'فتح ملف منشأة جديدة'
      ]
    },
    green_high: {
      nameAr: 'الأخضر المرتفع',
      nameEn: 'High Green',
      color: '#006400',
      benefits: [
        'تأشيرات عمل متاحة',
        'نقل خدمات متاح',
        'تغيير مهن بموافقة'
      ]
    },
    green_medium: {
      nameAr: 'الأخضر المتوسط',
      nameEn: 'Medium Green',
      color: '#228B22',
      benefits: [
        'تأشيرات عمل محدودة',
        'نقل خدمات متاح',
        'تغيير مهن بموافقة'
      ]
    },
    green_low: {
      nameAr: 'الأخضر المنخفض',
      nameEn: 'Low Green',
      color: '#32CD32',
      benefits: [
        'تأشيرات عمل محدودة جداً',
        'نقل خدمات بشروط'
      ]
    },
    yellow: {
      nameAr: 'الأصفر',
      nameEn: 'Yellow',
      color: '#FFD700',
      benefits: [],
      restrictions: [
        'لا تأشيرات عمل جديدة',
        'نقل خدمات من النطاق الأخضر فقط',
        'مهلة 6 أشهر للتصحيح'
      ]
    },
    red: {
      nameAr: 'الأحمر',
      nameEn: 'Red',
      color: '#FF0000',
      benefits: [],
      restrictions: [
        'إيقاف جميع الخدمات',
        'لا تأشيرات عمل',
        'لا نقل خدمات',
        'مهلة 3 أشهر للتصحيح',
        'عقوبات إضافية'
      ]
    }
  }
} as const;

// النسب المطلوبة حسب حجم المنشأة والنشاط
export const SAUDIZATION_REQUIREMENTS = {
  // قطاعات رئيسية
  sectors: {
    retail: {
      nameAr: 'التجزئة',
      nameEn: 'Retail',
      requirements: {
        '1-9': 0,           // أقل من 10 موظفين
        '10-49': 12,
        '50-499': 15,
        '500+': 20
      },
      localizedJobs: [
        'مبيعات',
        'خدمة عملاء',
        'كاشير',
        'مدير معرض'
      ]
    },
    construction: {
      nameAr: 'المقاولات',
      nameEn: 'Construction',
      requirements: {
        '1-9': 0,
        '10-49': 6,
        '50-499': 8,
        '500+': 10
      }
    },
    hospitality: {
      nameAr: 'الضيافة',
      nameEn: 'Hospitality',
      requirements: {
        '1-9': 0,
        '10-49': 20,
        '50-499': 25,
        '500+': 30
      },
      localizedJobs: [
        'استقبال',
        'خدمة الغرف',
        'محاسب',
        'مدير فرع'
      ]
    },
    technology: {
      nameAr: 'التقنية',
      nameEn: 'Technology',
      requirements: {
        '1-9': 0,
        '10-49': 25,
        '50-499': 30,
        '500+': 35
      }
    },
    healthcare: {
      nameAr: 'الصحة',
      nameEn: 'Healthcare',
      requirements: {
        '1-9': 0,
        '10-49': 5,
        '50-499': 8,
        '500+': 10
      }
    },
    education: {
      nameAr: 'التعليم',
      nameEn: 'Education',
      requirements: {
        '1-9': 0,
        '10-49': 50,
        '50-499': 60,
        '500+': 70
      }
    },
    manufacturing: {
      nameAr: 'الصناعة',
      nameEn: 'Manufacturing',
      requirements: {
        '1-9': 0,
        '10-49': 10,
        '50-499': 12,
        '500+': 15
      }
    },
    transport: {
      nameAr: 'النقل',
      nameEn: 'Transport',
      requirements: {
        '1-9': 0,
        '10-49': 10,
        '50-499': 15,
        '500+': 20
      }
    }
  },
  
  // شروط احتساب السعودي
  saudiCountingRules: {
    minimumSalary: 4000,        // الحد الأدنى للراتب
    fullTimeMinHours: 48,       // ساعات الدوام الكامل أسبوعياً
    partTimeMinHours: 24,       // ساعات الدوام الجزئي
    partTimeWeight: 0.5,        // وزن الدوام الجزئي
    studentWeight: 0.5,         // وزن الطالب العامل
    disabledWeight: 4,          // وزن ذوي الإعاقة
    femaleInRemoteWeight: 2,    // وزن المرأة في العمل عن بُعد
    premiumJobWeight: 2         // وزن الوظائف النوعية
  }
};

// ============================================
// الأنواع والواجهات
// ============================================

export type SectorType = keyof typeof SAUDIZATION_REQUIREMENTS.sectors;
export type CompanySizeRange = '1-9' | '10-49' | '50-499' | '500+';
export type NitaqatBand = keyof typeof NITAQAT_BANDS.bands;

export interface CompanyProfile {
  name: string;
  commercialRegistration: string;
  sector: SectorType;
  subSector?: string;
  employees: {
    total: number;
    saudi: number;
    nonSaudi: number;
    saudiMale: number;
    saudiFemale: number;
    partTime: number;
    students: number;
    disabled: number;
    remoteWorkers: number;
  };
  salaries: {
    averageSaudiSalary: number;
    belowMinimumCount: number;
  };
}

export interface SaudizationAnalysis {
  success: boolean;
  currentStatus: {
    band: NitaqatBand;
    bandNameAr: string;
    bandNameEn: string;
    actualPercentage: number;
    requiredPercentage: number;
    weightedSaudiCount: number;
    gap: number;
    isCompliant: boolean;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  hiringPlan?: {
    saudisNeeded: number;
    suggestedRoles: string[];
    estimatedCost: number;
    timeframe: string;
  };
  risks: {
    level: 'low' | 'medium' | 'high' | 'critical';
    issues: string[];
    penalties?: string[];
  };
  benefits: string[];
  summary: {
    arabic: string;
    english: string;
  };
}

export interface HiringRecommendation {
  role: string;
  roleAr: string;
  quantity: number;
  salaryRange: { min: number; max: number };
  qualifications: string[];
  impact: number; // التأثير على نسبة السعودة
  priority: 'high' | 'medium' | 'low';
}

// ============================================
// Helper Functions
// ============================================

async function callAI<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي متخصص في برنامج نطاقات والسعودة. أجب بصيغة JSON فقط.' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 3000
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
    console.error('Saudization Advisor AI Error:', error);
    return fallback;
  }
}

function getCompanySizeRange(employeeCount: number): CompanySizeRange {
  if (employeeCount < 10) return '1-9';
  if (employeeCount < 50) return '10-49';
  if (employeeCount < 500) return '50-499';
  return '500+';
}

/**
 * حساب العدد الموزون للسعوديين (متزامن - مع fallback)
 */
function calculateWeightedSaudiCountSync(
  employees: CompanyProfile['employees'],
  countingRules?: typeof SAUDIZATION_REQUIREMENTS.saudiCountingRules
): number {
  const rules = countingRules || SAUDIZATION_REQUIREMENTS.saudiCountingRules;
  
  let weighted = 0;
  
  // الموظفون السعوديون بدوام كامل
  const fullTimeSaudis = employees.saudi - employees.partTime - employees.students;
  weighted += fullTimeSaudis;
  
  // الدوام الجزئي
  weighted += employees.partTime * rules.partTimeWeight;
  
  // الطلاب
  weighted += employees.students * rules.studentWeight;
  
  // ذوي الإعاقة (يحسب 4 موظفين)
  weighted += employees.disabled * rules.disabledWeight;
  
  // النساء في العمل عن بُعد
  const remoteWomen = Math.min(employees.remoteWorkers, employees.saudiFemale);
  weighted += remoteWomen * (rules.femaleInRemoteWeight - 1); // إضافة الفرق
  
  return weighted;
}

/**
 * حساب العدد الموزون للسعوديين (غير متزامن - من قاعدة المعرفة)
 * @deprecated استخدم calculateWeightedSaudiCountSync بدلاً منها
 */
async function calculateWeightedSaudiCount(
  employees: CompanyProfile['employees']
): Promise<number> {
  try {
    const regulation = getNitaqatRegulation();
    if (regulation) {
      const rules = getSaudiCountingRulesFromKB(regulation);
      return calculateWeightedSaudiCountSync(employees, rules);
    }
  } catch (error) {
    console.warn('Failed to load counting rules from KB, using defaults:', error);
  }
  return calculateWeightedSaudiCountSync(employees);
}

/**
 * تحديد نطاق نطاقات (متزامن)
 */
function determineNitaqatBandSync(
  actualPercentage: number,
  requiredPercentage: number,
  _sector: SectorType,
  kbBands?: ReturnType<typeof getNitaqatBandsFromKB>
): NitaqatBand {
  const diff = actualPercentage - requiredPercentage;
  
  // استخدام العتبات من قاعدة المعرفة إن وجدت
  if (kbBands?.bands) {
    const bands = kbBands.bands as Record<string, any>;
    if (bands.platinum && diff >= (bands.platinum.minDifference ?? 30)) return 'platinum';
    if (bands.green_high && diff >= (bands.green_high.minDifference ?? 20)) return 'green_high';
    if (bands.green_medium && diff >= (bands.green_medium.minDifference ?? 10)) return 'green_medium';
    if (bands.green_low && diff >= (bands.green_low.minDifference ?? 0)) return 'green_low';
    if (bands.yellow && diff >= (bands.yellow.minDifference ?? -10)) return 'yellow';
    return 'red';
  }
  
  // القيم الافتراضية
  if (diff >= 30) return 'platinum';
  if (diff >= 20) return 'green_high';
  if (diff >= 10) return 'green_medium';
  if (diff >= 0) return 'green_low';
  if (diff >= -10) return 'yellow';
  return 'red';
}

/**
 * تحديد نطاق نطاقات (غير متزامن)
 * @deprecated استخدم determineNitaqatBandSync بدلاً منها
 */
async function determineNitaqatBand(
  actualPercentage: number,
  requiredPercentage: number,
  sector: SectorType
): Promise<NitaqatBand> {
  try {
    const regulation = getNitaqatRegulation();
    if (regulation) {
      const bands = getNitaqatBandsFromKB(regulation);
      return determineNitaqatBandSync(actualPercentage, requiredPercentage, sector, bands);
    }
  } catch (error) {
    console.warn('Failed to load bands from KB, using defaults:', error);
  }
  return determineNitaqatBandSync(actualPercentage, requiredPercentage, sector);
}

// ============================================
// Main Functions
// ============================================

/**
 * تحليل وضع السعودة للمنشأة (غير متزامن - يستخدم قاعدة المعرفة)
 */
export async function analyzeSaudization(profile: CompanyProfile): Promise<SaudizationAnalysis> {
  // تحميل قاعدة المعرفة
  const regulation = await getNitaqatRegulation();
  const sectorRequirements = regulation 
    ? getSaudizationRequirementsFromKB(regulation) 
    : SAUDIZATION_REQUIREMENTS.sectors;
  const countingRules = regulation 
    ? getSaudiCountingRulesFromKB(regulation) 
    : SAUDIZATION_REQUIREMENTS.saudiCountingRules;
  const kbBands = regulation ? getNitaqatBandsFromKB(regulation) : null;
  
  const sizeRange = getCompanySizeRange(profile.employees.total);
  const sectorReq = sectorRequirements[profile.sector];
  const requiredPercentage = sectorReq?.requirements?.[sizeRange] || 10;
  
  const weightedSaudiCount = calculateWeightedSaudiCountSync(profile.employees, countingRules);
  const actualPercentage = (weightedSaudiCount / profile.employees.total) * 100;
  const gap = requiredPercentage - actualPercentage;
  
  const band = determineNitaqatBandSync(actualPercentage, requiredPercentage, profile.sector, kbBands ?? undefined);
  const bandInfo = NITAQAT_BANDS.bands[band];
  
  const isCompliant = gap <= 0;
  
  // حساب عدد السعوديين المطلوبين
  let saudisNeeded = 0;
  if (gap > 0) {
    saudisNeeded = Math.ceil((requiredPercentage * profile.employees.total / 100) - weightedSaudiCount);
  }
  
  // تحديد مستوى المخاطر
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const risks: string[] = [];
  const penalties: string[] = [];
  
  if (band === 'red') {
    riskLevel = 'critical';
    risks.push('المنشأة في النطاق الأحمر - إيقاف الخدمات');
    penalties.push(
      'إيقاف إصدار تأشيرات العمل',
      'إيقاف نقل خدمات العمالة',
      'إيقاف تغيير المهن',
      'غرامات مالية محتملة'
    );
  } else if (band === 'yellow') {
    riskLevel = 'high';
    risks.push('المنشأة في النطاق الأصفر - مهلة 6 أشهر للتصحيح');
    penalties.push(
      'تقييد إصدار تأشيرات العمل',
      'تقييد نقل الخدمات'
    );
  } else if (band === 'green_low') {
    riskLevel = 'medium';
    risks.push('المنشأة قريبة من الحد الأدنى');
  }
  
  // التحقق من الرواتب (استخدام الحد الأدنى من قاعدة المعرفة)
  const minimumSalary = countingRules.minimumSalary || 4000;
  if (profile.salaries.belowMinimumCount > 0) {
    risks.push(`${profile.salaries.belowMinimumCount} موظف سعودي براتب أقل من ${minimumSalary} ريال - لا يُحتسب في نطاقات`);
  }
  
  // التوصيات
  const recommendations = generateRecommendations(profile, gap, band, saudisNeeded, countingRules);
  
  // خطة التوظيف (استخدام الوظائف من قاعدة المعرفة)
  const sectorReqData = sectorReq as Record<string, any> | undefined;
  const localizedJobs = sectorReqData?.localizedJobs || ['وظائف إدارية', 'خدمة عملاء'];
  const hiringPlan = saudisNeeded > 0 ? {
    saudisNeeded,
    suggestedRoles: localizedJobs as string[],
    estimatedCost: saudisNeeded * profile.salaries.averageSaudiSalary * 12,
    timeframe: getTimeframeByBand(band)
  } : undefined;
  
  return {
    success: true,
    currentStatus: {
      band,
      bandNameAr: bandInfo.nameAr,
      bandNameEn: bandInfo.nameEn,
      actualPercentage: Math.round(actualPercentage * 100) / 100,
      requiredPercentage,
      weightedSaudiCount: Math.round(weightedSaudiCount * 100) / 100,
      gap: Math.round(gap * 100) / 100,
      isCompliant
    },
    recommendations,
    hiringPlan,
    risks: {
      level: riskLevel,
      issues: risks,
      penalties: penalties.length > 0 ? penalties : undefined
    },
    benefits: [...(bandInfo.benefits || [])] as string[],
    summary: {
      arabic: generateArabicSummary(profile, actualPercentage, requiredPercentage, band, saudisNeeded),
      english: generateEnglishSummary(profile, actualPercentage, requiredPercentage, band, saudisNeeded)
    }
  };
}

/**
 * تحديد الإطار الزمني حسب النطاق
 */
function getTimeframeByBand(bandType: NitaqatBand): string {
  if (bandType === 'red') return '3 أشهر';
  if (bandType === 'yellow') return '6 أشهر';
  return '12 شهر';
}

/**
 * تحليل وضع السعودة للمنشأة (متزامن - للتوافق)
 */
export function analyzeSaudizationSync(profile: CompanyProfile): SaudizationAnalysis {
  const sizeRange = getCompanySizeRange(profile.employees.total);
  const sectorRequirements = SAUDIZATION_REQUIREMENTS.sectors[profile.sector];
  const requiredPercentage = sectorRequirements?.requirements[sizeRange] || 10;
  
  const weightedSaudiCount = calculateWeightedSaudiCountSync(profile.employees);
  const actualPercentage = (weightedSaudiCount / profile.employees.total) * 100;
  const gap = requiredPercentage - actualPercentage;
  
  const band = determineNitaqatBandSync(actualPercentage, requiredPercentage, profile.sector);
  const bandInfo = NITAQAT_BANDS.bands[band];
  
  const isCompliant = gap <= 0;
  
  let saudisNeeded = 0;
  if (gap > 0) {
    saudisNeeded = Math.ceil((requiredPercentage * profile.employees.total / 100) - weightedSaudiCount);
  }
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const risks: string[] = [];
  const penalties: string[] = [];
  
  if (band === 'red') {
    riskLevel = 'critical';
    risks.push('المنشأة في النطاق الأحمر - إيقاف الخدمات');
    penalties.push(
      'إيقاف إصدار تأشيرات العمل',
      'إيقاف نقل خدمات العمالة',
      'إيقاف تغيير المهن',
      'غرامات مالية محتملة'
    );
  } else if (band === 'yellow') {
    riskLevel = 'high';
    risks.push('المنشأة في النطاق الأصفر - مهلة 6 أشهر للتصحيح');
    penalties.push(
      'تقييد إصدار تأشيرات العمل',
      'تقييد نقل الخدمات'
    );
  } else if (band === 'green_low') {
    riskLevel = 'medium';
    risks.push('المنشأة قريبة من الحد الأدنى');
  }
  
  if (profile.salaries.belowMinimumCount > 0) {
    risks.push(`${profile.salaries.belowMinimumCount} موظف سعودي براتب أقل من 4000 ريال - لا يُحتسب في نطاقات`);
  }
  
  const recommendations = generateRecommendations(profile, gap, band, saudisNeeded);
  
  const sectorReqData = sectorRequirements as Record<string, any> | undefined;
  const hiringPlan = saudisNeeded > 0 ? {
    saudisNeeded,
    suggestedRoles: (sectorReqData?.localizedJobs || ['وظائف إدارية', 'خدمة عملاء']) as string[],
    estimatedCost: saudisNeeded * profile.salaries.averageSaudiSalary * 12,
    timeframe: getTimeframeByBand(band)
  } : undefined;
  
  return {
    success: true,
    currentStatus: {
      band,
      bandNameAr: bandInfo.nameAr,
      bandNameEn: bandInfo.nameEn,
      actualPercentage: Math.round(actualPercentage * 100) / 100,
      requiredPercentage,
      weightedSaudiCount: Math.round(weightedSaudiCount * 100) / 100,
      gap: Math.round(gap * 100) / 100,
      isCompliant
    },
    recommendations,
    hiringPlan,
    risks: {
      level: riskLevel,
      issues: risks,
      penalties: penalties.length > 0 ? penalties : undefined
    },
    benefits: [...(bandInfo.benefits || [])] as string[],
    summary: {
      arabic: generateArabicSummary(profile, actualPercentage, requiredPercentage, band, saudisNeeded),
      english: generateEnglishSummary(profile, actualPercentage, requiredPercentage, band, saudisNeeded)
    }
  };
}

/**
 * توليد التوصيات
 */
function generateRecommendations(
  profile: CompanyProfile,
  gap: number,
  band: NitaqatBand,
  saudisNeeded: number,
  countingRules?: typeof SAUDIZATION_REQUIREMENTS.saudiCountingRules
): SaudizationAnalysis['recommendations'] {
  const rules = countingRules || SAUDIZATION_REQUIREMENTS.saudiCountingRules;
  const minimumSalary = rules.minimumSalary || 4000;
  
  const immediate: string[] = [];
  const shortTerm: string[] = [];
  const longTerm: string[] = [];
  
  // توصيات فورية
  if (band === 'red' || band === 'yellow') {
    immediate.push(
      'مراجعة عقود العمالة الوافدة وإنهاء غير الضروري منها',
      'التسجيل في بوابة طاقات لاستقطاب الكفاءات السعودية'
    );
    
    if (profile.salaries.belowMinimumCount > 0) {
      immediate.push(`رفع رواتب السعوديين تحت الحد الأدنى إلى ${minimumSalary} ريال على الأقل`);
    }
  }
  
  if (saudisNeeded > 0) {
    immediate.push(`توظيف ${saudisNeeded} موظف سعودي على الأقل`);
  }
  
  // توصيات قصيرة المدى مع استخدام قواعد الاحتساب من قاعدة المعرفة
  const femaleWeight = rules.femaleInRemoteWeight || 2;
  const disabledWeightVal = rules.disabledWeight || 4;
  const partTimeWeight = rules.partTimeWeight || 0.5;
  
  shortTerm.push(
    'الاستفادة من برنامج دعم التوظيف (هدف)',
    `توظيف النساء في العمل عن بُعد (يُحتسب بـ ${femaleWeight} ضعف)`,
    `توظيف ذوي الإعاقة (يُحتسب بـ ${disabledWeightVal} أضعاف)`
  );
  
  if (profile.employees.partTime < profile.employees.saudi * 0.2) {
    shortTerm.push(`النظر في توظيف سعوديين بدوام جزئي (يُحتسب بـ ${partTimeWeight})`);
  }
  
  // توصيات طويلة المدى
  longTerm.push(
    'إنشاء برامج تدريب وتأهيل داخلية',
    'الشراكة مع الجامعات والكليات التقنية',
    'تطوير مسارات وظيفية للموظفين السعوديين',
    'الاستثمار في برامج الاحتفاظ بالموظفين'
  );
  
  return { immediate, shortTerm, longTerm };
}

/**
 * تحليل ذكي للسعودة باستخدام AI
 */
export async function getAISaudizationAdvice(
  profile: CompanyProfile,
  specificQuestion?: string
): Promise<{
  success: boolean;
  advice: string;
  actionPlan?: string[];
  estimatedImpact?: string;
}> {
  const analysis = await analyzeSaudization(profile);
  
  const prompt = `
أنت مستشار توطين (سعودة) خبير في برنامج نطاقات السعودي.

## بيانات المنشأة:
- الاسم: ${profile.name}
- القطاع: ${SAUDIZATION_REQUIREMENTS.sectors[profile.sector]?.nameAr || profile.sector}
- إجمالي الموظفين: ${profile.employees.total}
- السعوديين: ${profile.employees.saudi}
- غير السعوديين: ${profile.employees.nonSaudi}
- النطاق الحالي: ${analysis.currentStatus.bandNameAr}
- نسبة السعودة الفعلية: ${analysis.currentStatus.actualPercentage}%
- نسبة السعودة المطلوبة: ${analysis.currentStatus.requiredPercentage}%
- الفجوة: ${analysis.currentStatus.gap}%

## بيانات إضافية:
- متوسط راتب السعوديين: ${profile.salaries.averageSaudiSalary} ريال
- عدد براتب أقل من 4000: ${profile.salaries.belowMinimumCount}
- موظفات: ${profile.employees.saudiFemale}
- دوام جزئي: ${profile.employees.partTime}
- طلاب: ${profile.employees.students}
- ذوي إعاقة: ${profile.employees.disabled}
- عمل عن بُعد: ${profile.employees.remoteWorkers}

${specificQuestion ? `## سؤال محدد: ${specificQuestion}` : ''}

قدم نصيحة شاملة تتضمن:
1. تحليل الوضع الحالي
2. خطة عمل واضحة ومرحلية
3. طرق الاستفادة من برامج الدعم الحكومية
4. تحذيرات من المخاطر المحتملة

أرجع النتيجة بصيغة JSON:
{
  "advice": "النصيحة الشاملة",
  "actionPlan": ["الخطوة 1", "الخطوة 2"],
  "estimatedImpact": "التأثير المتوقع",
  "warnings": ["تحذيرات مهمة"],
  "opportunities": ["فرص متاحة"]
}
`;

  const result = await callAI<{
    advice: string;
    actionPlan: string[];
    estimatedImpact: string;
    warnings?: string[];
    opportunities?: string[];
  }>(prompt, {
    advice: `المنشأة في ${analysis.currentStatus.bandNameAr}. ${analysis.currentStatus.isCompliant ? 'الوضع مطابق للمتطلبات.' : `مطلوب توظيف ${analysis.hiringPlan?.saudisNeeded || 0} سعودي إضافي.`}`,
    actionPlan: analysis.recommendations.immediate,
    estimatedImpact: analysis.currentStatus.isCompliant ? 'الوضع مستقر' : 'تحسن متوقع خلال 3-6 أشهر'
  });
  
  return {
    success: true,
    advice: result.advice,
    actionPlan: result.actionPlan,
    estimatedImpact: result.estimatedImpact
  };
}

/**
 * محاكاة تأثير قرارات التوظيف
 */
export async function simulateHiringImpact(
  currentProfile: CompanyProfile,
  hiringPlan: {
    newSaudis: number;
    newNonSaudis: number;
    terminateSaudis: number;
    terminateNonSaudis: number;
    specialCategories?: {
      disabled?: number;
      partTime?: number;
      students?: number;
      remoteWomen?: number;
    };
  }
): Promise<{
  before: SaudizationAnalysis['currentStatus'];
  after: SaudizationAnalysis['currentStatus'];
  improvement: number;
  recommendation: string;
}> {
  // الحالة الحالية
  const beforeAnalysis = await analyzeSaudization(currentProfile);
  
  // الحالة المتوقعة
  const newProfile: CompanyProfile = {
    ...currentProfile,
    employees: {
      ...currentProfile.employees,
      total: currentProfile.employees.total + hiringPlan.newSaudis + hiringPlan.newNonSaudis 
             - hiringPlan.terminateSaudis - hiringPlan.terminateNonSaudis,
      saudi: currentProfile.employees.saudi + hiringPlan.newSaudis - hiringPlan.terminateSaudis,
      nonSaudi: currentProfile.employees.nonSaudi + hiringPlan.newNonSaudis - hiringPlan.terminateNonSaudis,
      disabled: currentProfile.employees.disabled + (hiringPlan.specialCategories?.disabled || 0),
      partTime: currentProfile.employees.partTime + (hiringPlan.specialCategories?.partTime || 0),
      students: currentProfile.employees.students + (hiringPlan.specialCategories?.students || 0),
      remoteWorkers: currentProfile.employees.remoteWorkers + (hiringPlan.specialCategories?.remoteWomen || 0)
    }
  };
  
  const afterAnalysis = await analyzeSaudization(newProfile);
  const improvement = afterAnalysis.currentStatus.actualPercentage - beforeAnalysis.currentStatus.actualPercentage;
  
  let recommendation = '';
  if (afterAnalysis.currentStatus.band !== beforeAnalysis.currentStatus.band) {
    recommendation = `هذه الخطة ستنقل المنشأة من ${beforeAnalysis.currentStatus.bandNameAr} إلى ${afterAnalysis.currentStatus.bandNameAr}`;
  } else if (improvement > 0) {
    recommendation = `ستتحسن نسبة السعودة بمقدار ${Math.round(improvement * 100) / 100}%`;
  } else {
    recommendation = 'لن تؤثر هذه الخطة بشكل إيجابي على نسبة السعودة';
  }
  
  return {
    before: beforeAnalysis.currentStatus,
    after: afterAnalysis.currentStatus,
    improvement: Math.round(improvement * 100) / 100,
    recommendation
  };
}

/**
 * الحصول على توصيات توظيف محددة
 */
export async function getHiringRecommendations(
  profile: CompanyProfile,
  budget?: number,
  _urgency?: 'immediate' | 'short_term' | 'long_term'
): Promise<{
  success: boolean;
  recommendations: HiringRecommendation[];
  totalCost: number;
  expectedImpact: number;
}> {
  const analysis = await analyzeSaudization(profile);
  const sectorInfo = SAUDIZATION_REQUIREMENTS.sectors[profile.sector];
  
  const recommendations: HiringRecommendation[] = [];
  
  if (analysis.currentStatus.gap > 0) {
    // توصية بتوظيف ذوي الإعاقة (تأثير عالي)
    recommendations.push({
      role: 'Administrative Assistant (Disabled)',
      roleAr: 'مساعد إداري (من ذوي الإعاقة)',
      quantity: Math.min(2, Math.ceil(analysis.currentStatus.gap / 40)), // كل واحد = 4 سعوديين
      salaryRange: { min: 4000, max: 6000 },
      qualifications: ['ثانوية عامة', 'مهارات حاسوب أساسية'],
      impact: 40, // تأثير 40% على نسبة السعودة لكل موظف
      priority: 'high'
    });
    
    // توصية بتوظيف نساء في العمل عن بُعد
    if (profile.employees.remoteWorkers < profile.employees.total * 0.1) {
      recommendations.push({
        role: 'Remote Customer Service',
        roleAr: 'خدمة عملاء (عمل عن بُعد)',
        quantity: Math.min(5, Math.ceil(analysis.currentStatus.gap / 20)),
        salaryRange: { min: 4000, max: 7000 },
        qualifications: ['بكالوريوس', 'مهارات تواصل', 'إنترنت مستقر'],
        impact: 20,
        priority: 'high'
      });
    }
    
    // وظائف القطاع
    const localizedJobs = (sectorInfo as Record<string, any>)?.localizedJobs as string[] | undefined;
    if (localizedJobs) {
      localizedJobs.slice(0, 3).forEach((job: string, index: number) => {
        recommendations.push({
          role: job,
          roleAr: job,
          quantity: Math.ceil(analysis.currentStatus.gap / (10 * (index + 1))),
          salaryRange: { min: 4500, max: 8000 },
          qualifications: ['حسب متطلبات الوظيفة'],
          impact: 10,
          priority: index === 0 ? 'high' : 'medium'
        });
      });
    }
  }
  
  // حساب التكلفة الإجمالية
  const totalCost = recommendations.reduce((sum, rec) => {
    return sum + (rec.quantity * rec.salaryRange.max * 12);
  }, 0);
  
  // حساب التأثير المتوقع
  const expectedImpact = recommendations.reduce((sum, rec) => {
    return sum + (rec.quantity * rec.impact / profile.employees.total);
  }, 0);
  
  // تصفية حسب الميزانية إن وجدت
  let filteredRecommendations = recommendations;
  if (budget) {
    filteredRecommendations = [];
    let runningCost = 0;
    for (const rec of recommendations.sort((a, b) => b.priority.localeCompare(a.priority))) {
      const recCost = rec.quantity * rec.salaryRange.max * 12;
      if (runningCost + recCost <= budget) {
        filteredRecommendations.push(rec);
        runningCost += recCost;
      }
    }
  }
  
  return {
    success: true,
    recommendations: filteredRecommendations,
    totalCost: Math.round(totalCost),
    expectedImpact: Math.round(expectedImpact * 100) / 100
  };
}

/**
 * التحقق من أهلية موظف للاحتساب في نطاقات
 */
export function checkEmployeeEligibility(
  employee: {
    nationality: 'saudi' | 'non-saudi';
    salary: number;
    workType: 'full_time' | 'part_time' | 'remote';
    isStudent: boolean;
    isDisabled: boolean;
    weeklyHours: number;
  }
): {
  eligible: boolean;
  weight: number;
  issues: string[];
  suggestions: string[];
} {
  const rules = SAUDIZATION_REQUIREMENTS.saudiCountingRules;
  const issues: string[] = [];
  const suggestions: string[] = [];
  let weight = 0;
  
  if (employee.nationality !== 'saudi') {
    return {
      eligible: false,
      weight: 0,
      issues: ['الموظف غير سعودي - لا يُحتسب في نطاقات'],
      suggestions: []
    };
  }
  
  // التحقق من الراتب
  if (employee.salary < rules.minimumSalary) {
    issues.push(`الراتب (${employee.salary} ريال) أقل من الحد الأدنى (${rules.minimumSalary} ريال)`);
    suggestions.push(`رفع الراتب إلى ${rules.minimumSalary} ريال على الأقل`);
    return {
      eligible: false,
      weight: 0,
      issues,
      suggestions
    };
  }
  
  // حساب الوزن
  if (employee.isDisabled) {
    weight = rules.disabledWeight;
  } else if (employee.isStudent) {
    weight = rules.studentWeight;
    if (employee.weeklyHours < 24) {
      issues.push('ساعات العمل أقل من الحد الأدنى للطالب (24 ساعة)');
      weight = 0;
    }
  } else if (employee.workType === 'part_time') {
    weight = rules.partTimeWeight;
    if (employee.weeklyHours < rules.partTimeMinHours) {
      issues.push(`ساعات العمل (${employee.weeklyHours}) أقل من الحد الأدنى للدوام الجزئي (${rules.partTimeMinHours})`);
      weight = 0;
    }
  } else if (employee.workType === 'remote' && employee.weeklyHours >= rules.fullTimeMinHours) {
    weight = rules.femaleInRemoteWeight;
  } else {
    weight = 1;
    if (employee.weeklyHours < rules.fullTimeMinHours) {
      issues.push(`ساعات العمل (${employee.weeklyHours}) أقل من الدوام الكامل (${rules.fullTimeMinHours})`);
      suggestions.push('النظر في تصنيف الموظف كدوام جزئي');
    }
  }
  
  return {
    eligible: weight > 0,
    weight,
    issues,
    suggestions
  };
}

// ============================================
// Summary Generators
// ============================================

function generateArabicSummary(
  profile: CompanyProfile,
  actualPercentage: number,
  requiredPercentage: number,
  band: NitaqatBand,
  saudisNeeded: number
): string {
  const bandInfo = NITAQAT_BANDS.bands[band];
  
  let summary = `منشأة ${profile.name} تقع في ${bandInfo.nameAr}.\n`;
  summary += `نسبة السعودة الحالية: ${Math.round(actualPercentage * 100) / 100}%\n`;
  summary += `النسبة المطلوبة: ${requiredPercentage}%\n`;
  
  if (saudisNeeded > 0) {
    summary += `مطلوب توظيف ${saudisNeeded} موظف سعودي إضافي للوصول للنسبة المطلوبة.`;
  } else {
    summary += `المنشأة متوافقة مع متطلبات السعودة.`;
  }
  
  return summary;
}

function generateEnglishSummary(
  profile: CompanyProfile,
  actualPercentage: number,
  requiredPercentage: number,
  band: NitaqatBand,
  saudisNeeded: number
): string {
  const bandInfo = NITAQAT_BANDS.bands[band];
  
  let summary = `${profile.name} is in ${bandInfo.nameEn} band.\n`;
  summary += `Current Saudization: ${Math.round(actualPercentage * 100) / 100}%\n`;
  summary += `Required: ${requiredPercentage}%\n`;
  
  if (saudisNeeded > 0) {
    summary += `Need to hire ${saudisNeeded} more Saudi employees to meet requirements.`;
  } else {
    summary += `Company is compliant with Saudization requirements.`;
  }
  
  return summary;
}
