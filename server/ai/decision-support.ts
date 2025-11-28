/**
 * AI Decision Support System - نظام دعم القرارات الذكي
 * يساعد الإدارة في اتخاذ قرارات مبنية على البيانات والأنظمة السعودية
 */

import { invokeLLM, type Message } from "../_core/llm";
import { loadRegulation } from "./knowledge-base-loader";

// ============================================
// Types & Interfaces
// ============================================

export type DecisionType = 
  | 'termination' 
  | 'salary_increase' 
  | 'promotion' 
  | 'hiring' 
  | 'disciplinary'
  | 'leave_approval'
  | 'contract_renewal'
  | 'remote_work';

export interface DecisionContext {
  type: DecisionType;
  employeeId?: number;
  employeeName?: string;
  employeeData?: Record<string, any>;
  companyContext?: {
    sector: string;
    size: string;
    nitaqatBand: string;
    saudiPercentage: number;
  };
  additionalInfo?: Record<string, any>;
}

export interface DecisionRecommendation {
  decision: string;
  decisionAr: string;
  confidence: number; // 0-100
  factors: Array<{
    factor: string;
    factorAr: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  legalConsiderations: string[];
  legalConsiderationsAr: string[];
  risks: Array<{
    risk: string;
    riskAr: string;
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  alternatives: Array<{
    option: string;
    optionAr: string;
    pros: string[];
    cons: string[];
  }>;
  steps: string[];
  stepsAr: string[];
  documentsRequired: string[];
  estimatedCost?: number;
  timeline?: string;
}

// ============================================
// Knowledge Base Access
// ============================================

function getLaborLaw() {
  return loadRegulation('labor-law') as Record<string, any>;
}

function getViolations() {
  return loadRegulation('violations') as Record<string, any>;
}

function getNitaqat() {
  return loadRegulation('nitaqat') as Record<string, any>;
}

// ============================================
// Helper Functions
// ============================================

async function callAI(messages: Message[], maxTokens = 2500) {
  const result = await invokeLLM({
    messages,
    max_tokens: maxTokens,
  });
  
  const content = result.choices?.[0]?.message?.content;
  
  if (typeof content === "string") {
    return { content };
  }
  
  if (Array.isArray(content)) {
    const textParts = content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text || "");
    return { content: textParts.join("\n") };
  }
  
  return { content: "" };
}

// ============================================
// Termination Decision Support
// ============================================

/**
 * تحليل قرار إنهاء الخدمة
 */
export async function analyzeTerminationDecision(
  employeeData: {
    name: string;
    joiningDate: string;
    salary: number;
    nationality: 'saudi' | 'non_saudi';
    position: string;
    performanceScore?: number;
    warnings?: number;
    reason: string;
  },
  companyContext: {
    sector: string;
    currentSaudis: number;
    totalEmployees: number;
    nitaqatBand: string;
  },
  language: "ar" | "en" = "ar"
): Promise<DecisionRecommendation> {
  const isArabic = language === "ar";
  const laborLaw = getLaborLaw();
  const violations = getViolations();
  
  // حساب سنوات الخدمة
  const joinDate = new Date(employeeData.joiningDate);
  const today = new Date();
  const yearsOfService = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // حساب فترة الإشعار المطلوبة
  let noticePeriod = 30;
  if (yearsOfService >= 5) noticePeriod = 60;
  if (yearsOfService >= 10) noticePeriod = 90;
  
  // حساب مكافأة نهاية الخدمة
  let endOfService = 0;
  if (yearsOfService <= 5) {
    endOfService = (employeeData.salary / 2) * yearsOfService;
  } else {
    endOfService = (employeeData.salary / 2) * 5 + employeeData.salary * (yearsOfService - 5);
  }
  
  // تأثير على نطاقات
  let nitaqatImpact = 'neutral';
  if (employeeData.nationality === 'saudi') {
    const newSaudis = companyContext.currentSaudis - 1;
    const newTotal = companyContext.totalEmployees - 1;
    const newRatio = newTotal > 0 ? (newSaudis / newTotal) * 100 : 0;
    const currentRatio = (companyContext.currentSaudis / companyContext.totalEmployees) * 100;
    if (newRatio < currentRatio - 2) nitaqatImpact = 'negative';
  }
  
  const systemPrompt = isArabic
    ? `أنت مستشار موارد بشرية خبير في نظام العمل السعودي. حلل قرار إنهاء الخدمة وقدم توصية قانونية.`
    : `You are an expert HR consultant in Saudi Labor Law. Analyze the termination decision and provide legal recommendation.`;

  const userPrompt = isArabic
    ? `حلل قرار إنهاء خدمة الموظف التالي:

**بيانات الموظف:**
- الاسم: ${employeeData.name}
- المسمى الوظيفي: ${employeeData.position}
- سنوات الخدمة: ${yearsOfService.toFixed(1)} سنة
- الراتب: ${employeeData.salary} ريال
- الجنسية: ${employeeData.nationality === 'saudi' ? 'سعودي' : 'غير سعودي'}
- التقييم: ${employeeData.performanceScore || 'غير متوفر'}/100
- الإنذارات: ${employeeData.warnings || 0}
- سبب الإنهاء: ${employeeData.reason}

**السياق:**
- فترة الإشعار المطلوبة: ${noticePeriod} يوم
- مكافأة نهاية الخدمة المتوقعة: ${Math.round(endOfService)} ريال
- تأثير على نطاقات: ${nitaqatImpact === 'negative' ? 'سلبي' : 'محايد'}
- النطاق الحالي للشركة: ${companyContext.nitaqatBand}

قدم تحليلاً شاملاً بصيغة JSON يتضمن:
1. التوصية (متابعة/تأجيل/إعادة نظر)
2. العوامل المؤثرة
3. الاعتبارات القانونية
4. المخاطر والحلول
5. البدائل المتاحة
6. الخطوات المطلوبة
7. المستندات اللازمة`
    : `Analyze the termination decision for the following employee:...`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const aiResponse = JSON.parse(jsonText);
    
    return {
      decision: aiResponse.decision || 'Review required',
      decisionAr: aiResponse.decisionAr || 'يتطلب مراجعة',
      confidence: aiResponse.confidence || 70,
      factors: aiResponse.factors || [],
      legalConsiderations: [
        `فترة الإشعار المطلوبة: ${noticePeriod} يوم`,
        `مكافأة نهاية الخدمة: ${Math.round(endOfService)} ريال`,
        ...(aiResponse.legalConsiderations || [])
      ],
      legalConsiderationsAr: [
        `Required notice period: ${noticePeriod} days`,
        `End of service: ${Math.round(endOfService)} SAR`,
        ...(aiResponse.legalConsiderationsAr || [])
      ],
      risks: aiResponse.risks || [],
      alternatives: aiResponse.alternatives || [],
      steps: aiResponse.steps || [],
      stepsAr: aiResponse.stepsAr || [],
      documentsRequired: [
        'خطاب إنهاء الخدمة',
        'مخالصة نهاية الخدمة',
        'شهادة الخبرة',
        'إشعار منصة قوى'
      ],
      estimatedCost: Math.round(endOfService + (employeeData.salary * (noticePeriod / 30))),
      timeline: `${noticePeriod} يوم`
    };
  } catch (error) {
    console.error("Termination Analysis Error:", error);
    return {
      decision: 'Manual review required',
      decisionAr: 'يتطلب مراجعة يدوية',
      confidence: 0,
      factors: [],
      legalConsiderations: [
        `فترة الإشعار: ${noticePeriod} يوم`,
        `مكافأة نهاية الخدمة: ${Math.round(endOfService)} ريال`
      ],
      legalConsiderationsAr: [],
      risks: [],
      alternatives: [],
      steps: [],
      stepsAr: [],
      documentsRequired: [],
      estimatedCost: Math.round(endOfService)
    };
  }
}

// ============================================
// Salary Increase Decision Support
// ============================================

/**
 * تحليل قرار زيادة الراتب
 */
export async function analyzeSalaryIncreaseDecision(
  employeeData: {
    name: string;
    currentSalary: number;
    proposedIncrease: number; // نسبة مئوية
    position: string;
    yearsOfService: number;
    performanceScore: number;
    lastIncreaseDate?: string;
    marketSalary?: number;
  },
  language: "ar" | "en" = "ar"
): Promise<DecisionRecommendation> {
  const isArabic = language === "ar";
  
  const newSalary = employeeData.currentSalary * (1 + employeeData.proposedIncrease / 100);
  const increaseAmount = newSalary - employeeData.currentSalary;
  const annualCostIncrease = increaseAmount * 12;
  
  // تحليل العوامل
  const factors: DecisionRecommendation['factors'] = [];
  
  // الأداء
  if (employeeData.performanceScore >= 90) {
    factors.push({
      factor: 'Excellent performance',
      factorAr: 'أداء ممتاز',
      impact: 'positive',
      weight: 30
    });
  } else if (employeeData.performanceScore >= 70) {
    factors.push({
      factor: 'Good performance',
      factorAr: 'أداء جيد',
      impact: 'positive',
      weight: 20
    });
  } else {
    factors.push({
      factor: 'Below average performance',
      factorAr: 'أداء أقل من المتوسط',
      impact: 'negative',
      weight: 25
    });
  }
  
  // سنوات الخدمة
  if (employeeData.yearsOfService >= 5) {
    factors.push({
      factor: 'Long tenure',
      factorAr: 'خدمة طويلة',
      impact: 'positive',
      weight: 15
    });
  }
  
  // مقارنة بالسوق
  if (employeeData.marketSalary) {
    if (newSalary < employeeData.marketSalary * 0.9) {
      factors.push({
        factor: 'Below market rate',
        factorAr: 'أقل من معدل السوق',
        impact: 'positive',
        weight: 20
      });
    } else if (newSalary > employeeData.marketSalary * 1.1) {
      factors.push({
        factor: 'Above market rate',
        factorAr: 'أعلى من معدل السوق',
        impact: 'negative',
        weight: 15
      });
    }
  }
  
  // حساب درجة الثقة
  let confidence = 50;
  for (const f of factors) {
    if (f.impact === 'positive') confidence += f.weight / 2;
    else if (f.impact === 'negative') confidence -= f.weight / 2;
  }
  confidence = Math.max(0, Math.min(100, confidence));
  
  // التوصية
  let decision = 'recommended';
  let decisionAr = 'موصى به';
  
  if (confidence < 40) {
    decision = 'not_recommended';
    decisionAr = 'غير موصى به';
  } else if (confidence < 60) {
    decision = 'review';
    decisionAr = 'يتطلب مراجعة';
  }
  
  return {
    decision,
    decisionAr,
    confidence: Math.round(confidence),
    factors,
    legalConsiderations: [
      isArabic ? 'لا يوجد حد أقصى قانوني للزيادة' : 'No legal cap on salary increase',
      isArabic ? 'يجب تحديث العقد إذا تغير الراتب الأساسي' : 'Contract must be updated if base salary changes'
    ],
    legalConsiderationsAr: [
      'لا يوجد حد أقصى قانوني للزيادة',
      'يجب تحديث العقد إذا تغير الراتب الأساسي'
    ],
    risks: employeeData.proposedIncrease > 20 ? [{
      risk: 'High increase may set precedent',
      riskAr: 'زيادة مرتفعة قد تشكل سابقة',
      probability: 'medium',
      mitigation: 'Document performance justification'
    }] : [],
    alternatives: [
      {
        option: 'Partial increase with bonus',
        optionAr: 'زيادة جزئية مع مكافأة',
        pros: ['Flexible', 'Performance-linked'],
        cons: ['Complex administration']
      },
      {
        option: 'Title upgrade with increase',
        optionAr: 'ترقية المسمى مع الزيادة',
        pros: ['Motivating', 'Justified'],
        cons: ['May affect org structure']
      }
    ],
    steps: [
      'Get budget approval',
      'Prepare salary letter',
      'Update HR system',
      'Notify finance department'
    ],
    stepsAr: [
      'الحصول على موافقة الميزانية',
      'إعداد خطاب الراتب',
      'تحديث نظام الموارد البشرية',
      'إبلاغ الإدارة المالية'
    ],
    documentsRequired: [
      isArabic ? 'خطاب تعديل الراتب' : 'Salary adjustment letter',
      isArabic ? 'ملحق العقد' : 'Contract addendum'
    ],
    estimatedCost: annualCostIncrease,
    timeline: isArabic ? 'فوري' : 'Immediate'
  };
}

// ============================================
// Promotion Decision Support
// ============================================

/**
 * تحليل قرار الترقية
 */
export async function analyzePromotionDecision(
  employeeData: {
    name: string;
    currentPosition: string;
    targetPosition: string;
    yearsInCurrentRole: number;
    performanceHistory: number[]; // آخر 3 تقييمات
    qualifications: string[];
    leadership?: boolean;
  },
  positionRequirements: {
    minExperience: number;
    requiredSkills: string[];
    leadership: boolean;
  },
  language: "ar" | "en" = "ar"
): Promise<DecisionRecommendation> {
  const isArabic = language === "ar";
  
  const factors: DecisionRecommendation['factors'] = [];
  
  // الخبرة
  if (employeeData.yearsInCurrentRole >= positionRequirements.minExperience) {
    factors.push({
      factor: 'Meets experience requirement',
      factorAr: 'يستوفي متطلبات الخبرة',
      impact: 'positive',
      weight: 25
    });
  } else {
    factors.push({
      factor: 'Insufficient experience',
      factorAr: 'خبرة غير كافية',
      impact: 'negative',
      weight: 30
    });
  }
  
  // الأداء المتسق
  const avgPerformance = employeeData.performanceHistory.reduce((a, b) => a + b, 0) / employeeData.performanceHistory.length;
  if (avgPerformance >= 85) {
    factors.push({
      factor: 'Consistently high performance',
      factorAr: 'أداء متميز ومتسق',
      impact: 'positive',
      weight: 30
    });
  } else if (avgPerformance >= 70) {
    factors.push({
      factor: 'Good average performance',
      factorAr: 'أداء جيد في المتوسط',
      impact: 'positive',
      weight: 15
    });
  }
  
  // القيادة
  if (positionRequirements.leadership && employeeData.leadership) {
    factors.push({
      factor: 'Has leadership experience',
      factorAr: 'لديه خبرة قيادية',
      impact: 'positive',
      weight: 20
    });
  } else if (positionRequirements.leadership && !employeeData.leadership) {
    factors.push({
      factor: 'No leadership experience',
      factorAr: 'لا توجد خبرة قيادية',
      impact: 'negative',
      weight: 25
    });
  }
  
  // حساب الثقة
  let confidence = 50;
  for (const f of factors) {
    if (f.impact === 'positive') confidence += f.weight / 2;
    else if (f.impact === 'negative') confidence -= f.weight / 2;
  }
  confidence = Math.max(0, Math.min(100, confidence));
  
  return {
    decision: confidence >= 70 ? 'recommended' : confidence >= 50 ? 'review' : 'not_recommended',
    decisionAr: confidence >= 70 ? 'موصى به' : confidence >= 50 ? 'يتطلب مراجعة' : 'غير موصى به',
    confidence: Math.round(confidence),
    factors,
    legalConsiderations: [
      isArabic ? 'يجب تحديث العقد بالمسمى والراتب الجديد' : 'Contract must be updated with new title and salary',
      isArabic ? 'تسجيل التغيير في منصة قوى' : 'Register change in Qiwa platform'
    ],
    legalConsiderationsAr: [
      'يجب تحديث العقد بالمسمى والراتب الجديد',
      'تسجيل التغيير في منصة قوى'
    ],
    risks: [],
    alternatives: [
      {
        option: 'Acting role first',
        optionAr: 'تكليف مؤقت أولاً',
        pros: ['Test fit', 'Reversible'],
        cons: ['May demotivate']
      }
    ],
    steps: [
      'Prepare promotion letter',
      'Update salary structure',
      'Announce promotion',
      'Update systems'
    ],
    stepsAr: [
      'إعداد خطاب الترقية',
      'تحديث هيكل الراتب',
      'الإعلان عن الترقية',
      'تحديث الأنظمة'
    ],
    documentsRequired: [
      isArabic ? 'خطاب الترقية' : 'Promotion letter',
      isArabic ? 'ملحق العقد' : 'Contract addendum'
    ]
  };
}

// ============================================
// Disciplinary Action Support
// ============================================

/**
 * تحليل الإجراء التأديبي المناسب
 */
export function analyzeDisciplinaryAction(
  violationData: {
    type: string;
    severity: 'minor' | 'moderate' | 'major' | 'severe';
    description: string;
    previousWarnings: number;
    employeeYearsOfService: number;
  },
  language: "ar" | "en" = "ar"
): {
  recommendedAction: string;
  recommendedActionAr: string;
  legalBasis: string;
  escalationPath: string[];
  documentsRequired: string[];
  notes: string[];
} {
  const isArabic = language === "ar";
  const violations = getViolations();
  
  let recommendedAction = 'verbal_warning';
  let recommendedActionAr = 'إنذار شفهي';
  let legalBasis = 'المادة 66 من نظام العمل';
  
  const escalationPath: string[] = [];
  
  // تحديد الإجراء بناءً على شدة المخالفة وعدد الإنذارات السابقة
  switch (violationData.severity) {
    case 'minor':
      if (violationData.previousWarnings === 0) {
        recommendedAction = 'verbal_warning';
        recommendedActionAr = 'إنذار شفهي';
      } else {
        recommendedAction = 'written_warning';
        recommendedActionAr = 'إنذار كتابي';
      }
      escalationPath.push('إنذار شفهي', 'إنذار كتابي أول', 'إنذار كتابي ثاني', 'خصم من الراتب');
      break;
      
    case 'moderate':
      if (violationData.previousWarnings < 2) {
        recommendedAction = 'written_warning';
        recommendedActionAr = 'إنذار كتابي';
      } else {
        recommendedAction = 'salary_deduction';
        recommendedActionAr = 'خصم من الراتب';
      }
      escalationPath.push('إنذار كتابي', 'خصم من الراتب', 'إيقاف مؤقت', 'فصل');
      legalBasis = 'المادة 66-67 من نظام العمل';
      break;
      
    case 'major':
      if (violationData.previousWarnings < 2) {
        recommendedAction = 'salary_deduction';
        recommendedActionAr = 'خصم من الراتب (لا يتجاوز 5 أيام)';
      } else {
        recommendedAction = 'suspension';
        recommendedActionAr = 'إيقاف عن العمل';
      }
      escalationPath.push('خصم من الراتب', 'إيقاف مؤقت', 'فصل مع مكافأة', 'فصل بدون مكافأة');
      legalBasis = 'المادة 67-68 من نظام العمل';
      break;
      
    case 'severe':
      recommendedAction = 'termination';
      recommendedActionAr = 'إنهاء الخدمة';
      legalBasis = 'المادة 80 من نظام العمل';
      escalationPath.push('فصل فوري بدون مكافأة (حسب المادة 80)');
      break;
  }
  
  return {
    recommendedAction,
    recommendedActionAr,
    legalBasis,
    escalationPath,
    documentsRequired: [
      'محضر التحقيق',
      'إقرار الموظف',
      'خطاب الإجراء التأديبي',
      'نسخة للملف'
    ],
    notes: [
      isArabic 
        ? `الموظف لديه ${violationData.previousWarnings} إنذار سابق`
        : `Employee has ${violationData.previousWarnings} previous warnings`,
      isArabic
        ? 'يجب منح الموظف فرصة للدفاع عن نفسه'
        : 'Employee must be given chance to defend themselves',
      isArabic
        ? 'يجب توثيق الإجراء كتابياً'
        : 'Action must be documented in writing'
    ]
  };
}

// ============================================
// Remote Work Decision Support
// ============================================

/**
 * تحليل طلب العمل عن بُعد
 */
export function analyzeRemoteWorkRequest(
  requestData: {
    employeeName: string;
    position: string;
    department: string;
    requestType: 'full' | 'partial' | 'temporary';
    duration?: string;
    reason?: string;
  },
  positionData: {
    remoteWorkEligible: boolean;
    requiresOnsite: string[];
    performanceScore?: number;
  },
  language: "ar" | "en" = "ar"
): {
  recommendation: 'approve' | 'reject' | 'conditional';
  recommendationAr: string;
  conditions?: string[];
  legalRequirements: string[];
  risks: string[];
  notes: string[];
} {
  const isArabic = language === "ar";
  const remoteWorkReg = loadRegulation('remote-work') as Record<string, any>;
  
  let recommendation: 'approve' | 'reject' | 'conditional' = 'conditional';
  let recommendationAr = 'موافقة مشروطة';
  const conditions: string[] = [];
  const risks: string[] = [];
  
  // التحقق من الأهلية
  if (!positionData.remoteWorkEligible) {
    recommendation = 'reject';
    recommendationAr = 'رفض';
    risks.push(isArabic 
      ? 'الوظيفة تتطلب تواجداً ميدانياً'
      : 'Position requires onsite presence');
  } else if (positionData.performanceScore && positionData.performanceScore < 70) {
    recommendation = 'conditional';
    recommendationAr = 'موافقة مشروطة';
    conditions.push(isArabic
      ? 'تحسين الأداء إلى 70% على الأقل'
      : 'Improve performance to at least 70%');
  } else {
    recommendation = 'approve';
    recommendationAr = 'موافقة';
  }
  
  // الشروط الأساسية
  if (recommendation !== 'reject') {
    conditions.push(
      isArabic ? 'توفر اتصال إنترنت مستقر' : 'Stable internet connection',
      isArabic ? 'بيئة عمل مناسبة' : 'Suitable work environment',
      isArabic ? 'الالتزام بساعات العمل' : 'Adhere to working hours',
      isArabic ? 'الاستجابة للتواصل خلال ساعات العمل' : 'Respond to communication during work hours'
    );
  }
  
  return {
    recommendation,
    recommendationAr,
    conditions: conditions.length > 0 ? conditions : undefined,
    legalRequirements: [
      isArabic ? 'يجب تسجيل العقد كعمل عن بُعد في منصة قوى' : 'Contract must be registered as remote work in Qiwa',
      isArabic ? 'يحتفظ الموظف بنفس الحقوق والمزايا' : 'Employee retains same rights and benefits',
      isArabic ? 'يجب توفير أدوات العمل اللازمة' : 'Necessary work tools must be provided'
    ],
    risks: risks.length > 0 ? risks : [
      isArabic ? 'صعوبة المتابعة والإشراف' : 'Difficulty in monitoring and supervision',
      isArabic ? 'تحديات التواصل مع الفريق' : 'Team communication challenges'
    ],
    notes: [
      isArabic
        ? 'العمل عن بُعد منظم بقرار وزاري صادر 2020'
        : 'Remote work regulated by ministerial decision issued 2020',
      isArabic
        ? 'يمكن إلغاء ترتيب العمل عن بُعد بإشعار مسبق'
        : 'Remote work arrangement can be cancelled with prior notice'
    ]
  };
}

// ============================================
// Export
// ============================================

export const decisionSupport = {
  analyzeTerminationDecision,
  analyzeSalaryIncreaseDecision,
  analyzePromotionDecision,
  analyzeDisciplinaryAction,
  analyzeRemoteWorkRequest
};

export default decisionSupport;
