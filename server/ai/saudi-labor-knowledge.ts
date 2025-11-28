/**
 * Saudi Labor Law Knowledge Base - قاعدة معرفة نظام العمل السعودي
 * Knowledge base for Saudi Labor Law compliance AI tools
 * 
 * ملاحظة: هذا الملف يحتوي على البيانات الثابتة للتوافق مع الكود القديم.
 * للحصول على أحدث البيانات، استخدم knowledge-base-loader.ts
 * 
 * @module server/ai/saudi-labor-knowledge
 * @see ./knowledge-base-loader.ts للنسخة الديناميكية
 */

import { loadRegulation, type Regulation } from './knowledge-base-loader';

// ============================================
// Knowledge Base Integration
// ============================================

let laborLawKBCache: Regulation | null = null;
let gosiKBCache: Regulation | null = null;

/**
 * الحصول على نظام العمل من قاعدة المعرفة الجديدة
 */
function getLaborLawFromKB(): Regulation | null {
  if (!laborLawKBCache) {
    try {
      laborLawKBCache = loadRegulation('labor-law');
    } catch {
      return null;
    }
  }
  return laborLawKBCache;
}

/**
 * الحصول على نظام التأمينات من قاعدة المعرفة الجديدة
 */
function getGOSIFromKB(): Regulation | null {
  if (!gosiKBCache) {
    try {
      gosiKBCache = loadRegulation('gosi');
    } catch {
      return null;
    }
  }
  return gosiKBCache;
}

// ============================================
// نظام العمل السعودي - المواد الأساسية
// Saudi Labor Law - Key Articles
// ============================================

export const SAUDI_LABOR_LAW = {
  // معلومات عامة
  metadata: {
    name: "نظام العمل السعودي",
    nameEn: "Saudi Labor Law",
    issuedBy: "وزارة الموارد البشرية والتنمية الاجتماعية",
    lastUpdate: "2024",
    referenceUrl: "https://hrsd.gov.sa",
  },

  // العقود - المواد 50-70
  contracts: {
    article50: {
      title: "عقد العمل",
      titleEn: "Employment Contract",
      content: `يجب أن يكون عقد العمل مكتوباً ومن نسختين، تُحتفظ كل من طرفيه بنسخة. 
        ويعد العقد قائماً ولو كان غير مكتوب، وفي هذه الحالة يجوز للعامل وحده إثبات العقد وحقوقه التي نشأت عنه بجميع طرق الإثبات.`,
      requirements: [
        "يجب أن يكون مكتوباً",
        "من نسختين",
        "يحتفظ كل طرف بنسخة",
      ],
      essentialElements: [
        "اسم صاحب العمل ومكانه",
        "اسم العامل وجنسيته",
        "ما يلزم لإثبات شخصيته",
        "عنوان إقامته",
        "الأجر المتفق عليه",
        "نوع العمل ومكانه",
        "تاريخ الالتحاق به",
        "مدته إن كان محدد المدة",
      ],
    },
    article51: {
      title: "فترة التجربة",
      titleEn: "Probation Period",
      content: `إذا كان العامل خاضعاً لفترة تجربة، وجب النص على ذلك صراحة في عقد العمل.
        يجب ألا تزيد فترة التجربة على تسعين يوماً، ويجوز باتفاق مكتوب بين العامل وصاحب العمل تمديدها على ألا يزيد مجموعها على مئة وثمانين يوماً.`,
      maxDuration: 90,
      maxExtendedDuration: 180,
      rules: [
        "يجب النص صراحة في العقد",
        "الحد الأقصى 90 يوم",
        "يمكن التمديد كتابياً حتى 180 يوم",
        "لا تحتسب إجازة العيدين والإجازة المرضية",
      ],
    },
    article55: {
      title: "عقد محدد المدة",
      titleEn: "Fixed-Term Contract",
      content: `ينتهي عقد العمل المحدد المدة بانقضاء مدته. 
        فإذا استمر طرفاه في تنفيذه عُدَّ العقد مجدداً لمدة غير محددة.`,
      rules: [
        "ينتهي بانقضاء المدة",
        "التجديد التلقائي يحوله لغير محدد المدة",
        "للسعوديين: بعد التجديد الثالث أو مرور 4 سنوات (أيهما أقل) يصبح غير محدد المدة",
      ],
    },
  },

  // الأجور - المواد 90-103
  wages: {
    article90: {
      title: "الأجر",
      titleEn: "Wages",
      content: "يُدفع أجر العامل بالعملة الرسمية للبلاد كما يجب دفعه في مكان العمل وفي أيام العمل.",
      rules: [
        "يُدفع بالريال السعودي",
        "يُدفع في مكان العمل",
        "يُدفع في أيام العمل",
      ],
    },
    article94: {
      title: "موعد دفع الأجر",
      titleEn: "Wage Payment Deadline",
      content: "يجب دفع أجر العامل في موعد استحقاقه المحدد.",
      deadlines: {
        monthly: "آخر كل شهر (للعمال بالأجر الشهري)",
        weekly: "كل أسبوع (للعمال بالأجر الأسبوعي)",
        daily: "يومياً (للعمال بالأجر اليومي)",
        pieceWork: "خلال أسبوع من تسليم العمل",
      },
    },
    minimumWage: {
      saudi: 4000, // الحد الأدنى لاحتساب نطاقات
      general: null, // لا يوجد حد أدنى عام
      note: "4000 ريال هو الحد الأدنى لاحتساب السعودي في نطاقات",
    },
  },

  // ساعات العمل - المواد 98-108
  workingHours: {
    article98: {
      title: "ساعات العمل",
      titleEn: "Working Hours",
      maxDaily: 8,
      maxWeekly: 48,
      ramadanHours: {
        muslims: { daily: 6, weekly: 36 },
      },
      rules: [
        "لا تزيد عن 8 ساعات في اليوم",
        "لا تزيد عن 48 ساعة في الأسبوع",
        "للمسلمين في رمضان: 6 ساعات / 36 أسبوعياً",
      ],
    },
    article101: {
      title: "فترات الراحة",
      titleEn: "Rest Periods",
      content: "يجب ألا يعمل العامل أكثر من 5 ساعات متواصلة دون فترة راحة لا تقل عن 30 دقيقة.",
      restPeriod: 30, // دقيقة
      maxContinuousWork: 5, // ساعات
    },
    article106: {
      title: "العمل الإضافي",
      titleEn: "Overtime",
      rate: 1.5, // 150% من الأجر
      maxHours: {
        yearly: 720,
      },
    },
  },

  // الإجازات - المواد 109-117
  leaves: {
    article109: {
      title: "الإجازة السنوية",
      titleEn: "Annual Leave",
      duration: {
        standard: 21, // أيام
        afterFiveYears: 30, // أيام بعد 5 سنوات
      },
      rules: [
        "21 يوم كحد أدنى",
        "30 يوم بعد 5 سنوات خدمة",
        "يجب التمتع بها خلال السنة",
        "يمكن تأجيلها باتفاق الطرفين",
      ],
    },
    article113: {
      title: "إجازة الأعياد",
      titleEn: "Eid Holidays",
      eidAlFitr: 4, // أيام
      eidAlAdha: 4, // أيام
      nationalDay: 1, // يوم
      foundationDay: 1, // يوم
    },
    article114: {
      title: "إجازات خاصة مدفوعة",
      titleEn: "Special Paid Leaves",
      types: {
        marriage: { days: 5, forBoth: true },
        childBirth: { days: 3, forFather: true },
        death: { days: 5, relation: "زوج/زوجة أو أصول أو فروع" },
        death_extended: { days: 3, relation: "أقارب آخرين" },
      },
    },
    article117: {
      title: "الإجازة المرضية",
      titleEn: "Sick Leave",
      structure: [
        { days: 30, pay: "100%" },
        { days: 60, pay: "75%" },
        { days: 30, pay: "0%" },
      ],
      maxDays: 120,
      rules: [
        "أول 30 يوم: أجر كامل",
        "ثاني 60 يوم: 75% من الأجر",
        "آخر 30 يوم: بدون أجر",
        "المجموع: 120 يوم خلال السنة",
      ],
    },
    materinityLeave: {
      article151: {
        title: "إجازة الأمومة",
        titleEn: "Maternity Leave",
        duration: 70, // أيام (10 أسابيع)
        distribution: "4 أسابيع قبل الولادة و6 أسابيع بعدها",
        pay: "أجر كامل",
        extension: "شهر إضافي بدون أجر",
      },
    },
    hajjLeave: {
      article116: {
        title: "إجازة الحج",
        titleEn: "Hajj Leave",
        duration: { min: 10, max: 15 },
        condition: "لم يسبق له أداء الفريضة",
        serviceYears: 2, // سنتين متصلتين
        pay: "أجر كامل",
      },
    },
  },

  // نهاية الخدمة - المواد 74-91
  endOfService: {
    article74: {
      title: "أسباب إنهاء العقد",
      titleEn: "Contract Termination Reasons",
      validReasons: [
        "اتفاق الطرفين كتابياً",
        "انتهاء المدة المحددة",
        "إرادة أحد الطرفين في العقود غير محددة المدة",
        "بلوغ العامل سن التقاعد (60 للرجال، 55 للنساء)",
        "القوة القاهرة",
        "إغلاق المنشأة نهائياً",
        "إنهاء النشاط الذي يعمل فيه العامل",
        "أي حالة ينص عليها نظام آخر",
      ],
    },
    article75: {
      title: "فترة الإشعار",
      titleEn: "Notice Period",
      duration: 60, // يوم
      rules: [
        "60 يوم للعقود غير محددة المدة",
        "للعامل بأجر شهري: إشعار كتابي قبل 60 يوم",
        "لغيرهم: إشعار قبل 30 يوم",
      ],
    },
    article80: {
      title: "الفصل بدون مكافأة",
      titleEn: "Dismissal Without Compensation",
      cases: [
        "الاعتداء على صاحب العمل أو المدير",
        "عدم أداء الالتزامات الجوهرية",
        "ارتكاب سلوك سيء أو مخل بالشرف",
        "التزوير للحصول على العمل",
        "التعيين تحت الاختبار",
        "الغياب أكثر من 30 يوم أو 15 يوم متصلة بدون عذر",
        "إفشاء الأسرار الصناعية أو التجارية",
      ],
    },
    article84: {
      title: "مكافأة نهاية الخدمة",
      titleEn: "End of Service Award",
      calculation: {
        first5Years: "نصف شهر عن كل سنة",
        after5Years: "شهر كامل عن كل سنة",
      },
      basis: "آخر أجر",
      rules: [
        "تُحسب على أساس آخر أجر",
        "تشمل جميع البدلات المستحقة",
        "أول 5 سنوات: نصف شهر عن كل سنة",
        "ما بعد 5 سنوات: شهر كامل عن كل سنة",
      ],
    },
    article85: {
      title: "الاستقالة والمكافأة",
      titleEn: "Resignation and Award",
      percentages: {
        lessThan2Years: 0,
        twoTo5Years: "الثلث",
        fiveTo10Years: "الثلثان",
        moreThan10Years: "كامل المكافأة",
      },
    },
    article87: {
      title: "استحقاق المكافأة الكاملة",
      titleEn: "Full Award Entitlement",
      cases: [
        "انتهاء العقد",
        "استقالة المرأة خلال 6 أشهر من الزواج أو 3 أشهر من الولادة",
        "ترك العمل بسبب قوة قاهرة",
      ],
    },
  },

  // السعودة ونطاقات
  saudization: {
    nitaqat: {
      title: "برنامج نطاقات",
      titleEn: "Nitaqat Program",
      categories: {
        platinum: {
          name: "البلاتيني",
          nameEn: "Platinum",
          color: "#c0c0c0",
          benefits: [
            "تأشيرات فورية",
            "نقل الكفالة بدون موافقة",
            "تجديد إقامات لمدة سنتين",
          ],
        },
        highGreen: {
          name: "الأخضر المرتفع",
          nameEn: "High Green",
          color: "#006400",
          benefits: [
            "تأشيرات سريعة",
            "نقل الكفالة بموافقة",
          ],
        },
        midGreen: {
          name: "الأخضر المتوسط",
          nameEn: "Mid Green",
          color: "#228b22",
          benefits: [
            "تأشيرات متاحة",
            "خدمات عادية",
          ],
        },
        lowGreen: {
          name: "الأخضر المنخفض",
          nameEn: "Low Green",
          color: "#32cd32",
          benefits: [
            "تأشيرات محدودة",
            "خدمات أساسية",
          ],
        },
        yellow: {
          name: "الأصفر",
          nameEn: "Yellow",
          color: "#ffd700",
          restrictions: [
            "لا تأشيرات جديدة",
            "مهلة للتصحيح",
          ],
        },
        red: {
          name: "الأحمر",
          nameEn: "Red",
          color: "#ff0000",
          restrictions: [
            "إيقاف الخدمات",
            "غرامات",
            "مهلة للتصحيح أو الإغلاق",
          ],
        },
      },
    },
    requirements: {
      title: "متطلبات السعودة",
      minimumWageForCount: 4000,
      workingHoursForCount: 48,
      rules: [
        "الحد الأدنى 4000 ريال للسعودي لاحتسابه",
        "العمل بدوام كامل (48 ساعة أسبوعياً)",
        "تسجيل في التأمينات الاجتماعية",
        "عقد عمل موثق في قوى",
      ],
    },
    exemptedJobs: {
      title: "المهن المستثناة",
      jobs: [
        "السائقون الخاصون",
        "الحراسة الأمنية الخاصة",
        "عمال النظافة",
        "بعض المهن التخصصية",
      ],
    },
  },

  // التأمينات الاجتماعية
  socialInsurance: {
    gosi: {
      title: "التأمينات الاجتماعية",
      titleEn: "GOSI - General Organization for Social Insurance",
      contributions: {
        retirement: {
          employer: 9,
          employee: 9,
          total: 18,
        },
        occupationalHazards: {
          employer: 2,
          employee: 0,
          total: 2,
        },
        unemployment: {
          employer: 0.75,
          employee: 0.75,
          total: 1.5,
          maxSalary: 45000,
        },
      },
      maxSalary: 45000, // الحد الأعلى للاشتراك
      saudiOnlyBenefits: [
        "معاش التقاعد",
        "تأمين ساند (البطالة)",
      ],
      allWorkersBenefits: [
        "الأخطار المهنية",
        "إصابات العمل",
      ],
    },
    retirementAge: {
      male: 60,
      female: 55,
      earlyRetirement: {
        years: 25, // 300 شهر اشتراك
        minAge: 50,
      },
    },
  },

  // حماية الأجور
  wageProtection: {
    wps: {
      title: "نظام حماية الأجور",
      titleEn: "Wage Protection System",
      requirements: [
        "تحويل الرواتب عبر البنوك",
        "رفع ملفات الأجور الشهرية",
        "الالتزام بالمواعيد المحددة",
      ],
      deadlines: {
        normal: "7 أيام من تاريخ الاستحقاق",
        grace: "3 أيام إضافية",
      },
      penalties: [
        "إيقاف الخدمات",
        "غرامات مالية",
        "إدراج في القائمة الحمراء",
      ],
    },
  },
};

// ============================================
// قواعد حساب نهاية الخدمة
// End of Service Calculation Rules
// ============================================

export const EOSB_RULES = {
  // الاستحقاق الكامل
  fullEntitlement: {
    cases: [
      "انتهاء العقد بسبب صاحب العمل",
      "انتهاء العقد محدد المدة",
      "استقالة بعد 10 سنوات خدمة",
      "استقالة المرأة خلال 6 أشهر من الزواج",
      "استقالة المرأة خلال 3 أشهر من الولادة",
      "القوة القاهرة",
      "بلوغ سن التقاعد",
      "الوفاة",
      "العجز الكلي",
    ],
  },
  
  // الاستحقاق الجزئي
  partialEntitlement: {
    resignation: {
      lessThan2Years: 0,
      from2To5Years: 1/3,
      from5To10Years: 2/3,
      moreThan10Years: 1,
    },
  },
  
  // عدم الاستحقاق
  noEntitlement: {
    cases: [
      "الفصل بموجب المادة 80",
      "الاستقالة خلال أول سنتين",
      "فترة التجربة",
    ],
  },
  
  // الحساب
  calculation: {
    first5Years: 0.5, // نصف شهر لكل سنة
    after5Years: 1, // شهر كامل لكل سنة
    basis: "آخر أجر شامل",
    includes: [
      "الراتب الأساسي",
      "بدل السكن",
      "بدل النقل",
      "البدلات الثابتة الأخرى",
    ],
    excludes: [
      "العمولات المتغيرة",
      "المكافآت الموسمية",
      "البدلات المؤقتة",
    ],
  },
};

// ============================================
// قوالب العقود
// Contract Templates
// ============================================

export const CONTRACT_TEMPLATES = {
  unlimited: {
    title: "عقد عمل غير محدد المدة",
    titleEn: "Indefinite Term Contract",
    requiredClauses: [
      "بيانات صاحب العمل",
      "بيانات العامل",
      "المسمى الوظيفي",
      "الأجر والبدلات",
      "مكان العمل",
      "ساعات العمل",
      "الإجازات",
      "فترة التجربة",
      "فترة الإشعار",
      "أسباب الإنهاء",
    ],
  },
  limited: {
    title: "عقد عمل محدد المدة",
    titleEn: "Fixed Term Contract",
    requiredClauses: [
      "بيانات صاحب العمل",
      "بيانات العامل",
      "المسمى الوظيفي",
      "الأجر والبدلات",
      "مكان العمل",
      "ساعات العمل",
      "الإجازات",
      "فترة التجربة",
      "مدة العقد",
      "تاريخ البداية والنهاية",
      "شروط التجديد",
    ],
  },
  partTime: {
    title: "عقد عمل بدوام جزئي",
    titleEn: "Part-Time Contract",
    maxHours: 25, // ساعة أسبوعياً
    requiredClauses: [
      "بيانات صاحب العمل",
      "بيانات العامل",
      "المسمى الوظيفي",
      "الأجر بالساعة",
      "عدد ساعات العمل",
      "جدول العمل",
      "الحقوق والواجبات",
    ],
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * حساب مكافأة نهاية الخدمة
 * محسّن للعمل مع قاعدة المعرفة الجديدة
 */
export function calculateEndOfServiceBenefit(
  monthlySalary: number,
  yearsOfService: number,
  terminationType: "employer" | "resignation" | "article80"
): {
  amount: number;
  breakdown: string;
  percentage: number;
} {
  // محاولة الحصول على القواعد من قاعدة المعرفة
  const laborLaw = getLaborLawFromKB();
  let first5YearsRate = 0.5;
  let after5YearsRate = 1;
  
  if (laborLaw) {
    const laborData = laborLaw as Record<string, unknown>;
    const endOfService = (laborData.articles as Record<string, unknown> | undefined)?.article84 as Record<string, unknown> | undefined;
    if (endOfService) {
      const calculation = endOfService.calculation as Record<string, unknown> | undefined;
      if (calculation) {
        first5YearsRate = (calculation.first5Years as number) ?? 0.5;
        after5YearsRate = (calculation.after5Years as number) ?? 1;
      }
    }
  }
  
  if (terminationType === "article80" || yearsOfService < 0) {
    return { amount: 0, breakdown: "لا يستحق مكافأة بموجب المادة 80", percentage: 0 };
  }

  // حساب المكافأة الأساسية
  let baseAmount = 0;
  let breakdown = "";

  // أول 5 سنوات: نصف شهر لكل سنة
  const first5Years = Math.min(yearsOfService, 5);
  const first5Amount = first5Years * (monthlySalary * first5YearsRate);
  
  // ما بعد 5 سنوات: شهر كامل لكل سنة
  const after5Years = Math.max(0, yearsOfService - 5);
  const after5Amount = after5Years * (monthlySalary * after5YearsRate);

  baseAmount = first5Amount + after5Amount;
  breakdown = `أول ${first5Years} سنوات: ${first5Amount.toFixed(2)} ريال\n`;
  if (after5Years > 0) {
    breakdown += `باقي ${after5Years} سنوات: ${after5Amount.toFixed(2)} ريال\n`;
  }

  // تطبيق النسبة حسب نوع الإنهاء
  let percentage = 1;
  
  if (terminationType === "resignation") {
    if (yearsOfService < 2) {
      percentage = 0;
    } else if (yearsOfService < 5) {
      percentage = 1/3;
    } else if (yearsOfService < 10) {
      percentage = 2/3;
    } else {
      percentage = 1;
    }
  }

  const finalAmount = baseAmount * percentage;

  return {
    amount: finalAmount,
    breakdown: breakdown + `النسبة المستحقة: ${(percentage * 100).toFixed(0)}%\nالمبلغ النهائي: ${finalAmount.toFixed(2)} ريال`,
    percentage: percentage * 100,
  };
}

/**
 * حساب اشتراكات التأمينات الاجتماعية
 * محسّن للعمل مع قاعدة المعرفة الجديدة
 */
export function calculateGOSIContributions(
  salary: number,
  isSaudi: boolean
): {
  employerContribution: number;
  employeeContribution: number;
  total: number;
  breakdown: {
    retirement: { employer: number; employee: number };
    hazards: { employer: number; employee: number };
    saned: { employer: number; employee: number };
  };
} {
  // محاولة الحصول على النسب من قاعدة المعرفة
  const gosiReg = getGOSIFromKB();
  let maxSalary = 45000;
  let retirementEmployerRate = 0.09;
  let retirementEmployeeRate = 0.09;
  let hazardsRate = 0.02;
  let sanedEmployerRate = 0.0075;
  let sanedEmployeeRate = 0.0075;
  
  if (gosiReg) {
    const gosiData = gosiReg as Record<string, unknown>;
    const contributions = gosiData.contributions as Record<string, unknown> | undefined;
    if (contributions) {
      const retirement = contributions.retirement as Record<string, unknown> | undefined;
      const hazards = contributions.occupationalHazards as Record<string, unknown> | undefined;
      const saned = contributions.saned as Record<string, unknown> | undefined;
      
      if (retirement) {
        retirementEmployerRate = ((retirement.employer as number) ?? 9) / 100;
        retirementEmployeeRate = ((retirement.employee as number) ?? 9) / 100;
      }
      if (hazards) {
        hazardsRate = ((hazards.employer as number) ?? 2) / 100;
      }
      if (saned) {
        sanedEmployerRate = ((saned.employer as number) ?? 0.75) / 100;
        sanedEmployeeRate = ((saned.employee as number) ?? 0.75) / 100;
      }
    }
    maxSalary = (gosiData.maxSalary as number) ?? 45000;
  }
  
  const cappedSalary = Math.min(salary, maxSalary);
  
  // التقاعد (للسعوديين فقط)
  const retirementEmployer = isSaudi ? cappedSalary * retirementEmployerRate : 0;
  const retirementEmployee = isSaudi ? cappedSalary * retirementEmployeeRate : 0;
  
  // الأخطار المهنية (للجميع)
  const hazardsEmployer = cappedSalary * hazardsRate;
  const hazardsEmployee = 0;
  
  // ساند (للسعوديين فقط)
  const sanedEmployer = isSaudi ? cappedSalary * sanedEmployerRate : 0;
  const sanedEmployee = isSaudi ? cappedSalary * sanedEmployeeRate : 0;

  return {
    employerContribution: retirementEmployer + hazardsEmployer + sanedEmployer,
    employeeContribution: retirementEmployee + sanedEmployee,
    total: retirementEmployer + retirementEmployee + hazardsEmployer + sanedEmployer + sanedEmployee,
    breakdown: {
      retirement: { employer: retirementEmployer, employee: retirementEmployee },
      hazards: { employer: hazardsEmployer, employee: hazardsEmployee },
      saned: { employer: sanedEmployer, employee: sanedEmployee },
    },
  };
}

/**
 * حساب الإجازة السنوية المستحقة
 * محسّن للعمل مع قاعدة المعرفة الجديدة
 */
export function calculateAnnualLeave(
  yearsOfService: number,
  daysWorkedInYear: number = 365
): {
  totalDays: number;
  accruedDays: number;
  type: string;
} {
  // محاولة الحصول على القيم من قاعدة المعرفة
  const laborLaw = getLaborLawFromKB();
  let standardLeave = 21;
  let extendedLeave = 30;
  
  if (laborLaw) {
    const laborData = laborLaw as Record<string, unknown>;
    const leaves = (laborData.articles as Record<string, unknown> | undefined)?.article109 as Record<string, unknown> | undefined;
    if (leaves) {
      const duration = leaves.duration as Record<string, unknown> | undefined;
      if (duration) {
        standardLeave = (duration.standard as number) ?? 21;
        extendedLeave = (duration.afterFiveYears as number) ?? 30;
      }
    }
  }
  
  const baseLeave = yearsOfService >= 5 ? extendedLeave : standardLeave;
  const accrued = (baseLeave / 365) * daysWorkedInYear;

  return {
    totalDays: baseLeave,
    accruedDays: Math.round(accrued * 100) / 100,
    type: yearsOfService >= 5 ? `إجازة مميزة (${extendedLeave} يوم)` : `إجازة عادية (${standardLeave} يوم)`,
  };
}

/**
 * التحقق من فترة التجربة
 * محسّن للعمل مع قاعدة المعرفة الجديدة
 */
export function validateProbationPeriod(
  startDate: Date,
  probationDays: number,
  extended: boolean = false
): {
  valid: boolean;
  message: string;
  endDate: Date;
} {
  // محاولة الحصول على القيم من قاعدة المعرفة
  const laborLaw = getLaborLawFromKB();
  let maxStandardDays = 90;
  let maxExtendedDays = 180;
  
  if (laborLaw) {
    const laborData = laborLaw as Record<string, unknown>;
    const probation = (laborData.articles as Record<string, unknown> | undefined)?.article51 as Record<string, unknown> | undefined;
    if (probation) {
      maxStandardDays = (probation.maxDuration as number) ?? 90;
      maxExtendedDays = (probation.maxExtendedDuration as number) ?? 180;
    }
  }
  
  const maxDays = extended ? maxExtendedDays : maxStandardDays;
  
  if (probationDays > maxDays) {
    return {
      valid: false,
      message: `فترة التجربة تتجاوز الحد المسموح (${maxDays} يوم)`,
      endDate: new Date(startDate.getTime() + maxDays * 24 * 60 * 60 * 1000),
    };
  }

  return {
    valid: true,
    message: `فترة التجربة صالحة (${probationDays} يوم)`,
    endDate: new Date(startDate.getTime() + probationDays * 24 * 60 * 60 * 1000),
  };
}

// ============================================
// دوال جديدة للتكامل مع قاعدة المعرفة
// ============================================

/**
 * الحصول على معلومات المادة القانونية
 */
export function getArticleInfo(articleNumber: number): {
  title: string;
  titleEn: string;
  content: string;
  source: string;
} | null {
  const laborLaw = getLaborLawFromKB();
  
  if (laborLaw) {
    const laborData = laborLaw as Record<string, unknown>;
    const articles = laborData.articles as Record<string, unknown> | undefined;
    
    if (articles) {
      const articleKey = `article${articleNumber}`;
      const article = articles[articleKey] as Record<string, unknown> | undefined;
      
      if (article) {
        return {
          title: (article.title as string) ?? `المادة ${articleNumber}`,
          titleEn: (article.titleEn as string) ?? `Article ${articleNumber}`,
          content: (article.content as string) ?? '',
          source: 'قاعدة معرفة Rabit - نظام العمل السعودي'
        };
      }
    }
  }
  
  // البحث في البيانات الثابتة
  const staticArticle = findStaticArticle(articleNumber);
  return staticArticle;
}

/**
 * البحث في البيانات الثابتة
 */
function findStaticArticle(articleNumber: number): {
  title: string;
  titleEn: string;
  content: string;
  source: string;
} | null {
  const articleKey = `article${articleNumber}`;
  
  // البحث في العقود
  if (articleKey in SAUDI_LABOR_LAW.contracts) {
    const article = SAUDI_LABOR_LAW.contracts[articleKey as keyof typeof SAUDI_LABOR_LAW.contracts];
    return {
      title: article.title,
      titleEn: article.titleEn,
      content: article.content,
      source: 'نظام العمل السعودي'
    };
  }
  
  // البحث في ساعات العمل
  if (articleKey in SAUDI_LABOR_LAW.workingHours) {
    const article = SAUDI_LABOR_LAW.workingHours[articleKey as keyof typeof SAUDI_LABOR_LAW.workingHours];
    if (typeof article === 'object' && 'title' in article) {
      return {
        title: article.title as string,
        titleEn: article.titleEn as string,
        content: (article as Record<string, unknown>).content as string ?? '',
        source: 'نظام العمل السعودي'
      };
    }
  }
  
  return null;
}

/**
 * التحقق من صحة ساعات العمل
 */
export function validateWorkingHours(
  dailyHours: number,
  weeklyHours: number,
  isRamadan: boolean = false,
  isMuslim: boolean = true
): {
  valid: boolean;
  issues: string[];
  maxDaily: number;
  maxWeekly: number;
} {
  const laborLaw = getLaborLawFromKB();
  let maxDaily = isRamadan && isMuslim ? 6 : 8;
  let maxWeekly = isRamadan && isMuslim ? 36 : 48;
  
  if (laborLaw) {
    const laborData = laborLaw as Record<string, unknown>;
    const workingHours = (laborData.articles as Record<string, unknown> | undefined)?.article98 as Record<string, unknown> | undefined;
    if (workingHours) {
      if (!isRamadan) {
        maxDaily = (workingHours.maxDaily as number) ?? 8;
        maxWeekly = (workingHours.maxWeekly as number) ?? 48;
      } else if (isMuslim) {
        const ramadanHours = (workingHours.ramadanHours as Record<string, unknown> | undefined)?.muslims as Record<string, unknown> | undefined;
        if (ramadanHours) {
          maxDaily = (ramadanHours.daily as number) ?? 6;
          maxWeekly = (ramadanHours.weekly as number) ?? 36;
        }
      }
    }
  }
  
  const issues: string[] = [];
  
  if (dailyHours > maxDaily) {
    issues.push(`ساعات العمل اليومية (${dailyHours}) تتجاوز الحد الأقصى (${maxDaily})`);
  }
  
  if (weeklyHours > maxWeekly) {
    issues.push(`ساعات العمل الأسبوعية (${weeklyHours}) تتجاوز الحد الأقصى (${maxWeekly})`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    maxDaily,
    maxWeekly
  };
}

/**
 * حساب الإجازة المرضية المستحقة
 */
export function calculateSickLeave(
  daysUsed: number
): {
  remainingFullPay: number;
  remaining75Pay: number;
  remainingNoPay: number;
  totalRemaining: number;
  currentPayRate: number;
} {
  // أول 30 يوم: 100%
  // ثاني 60 يوم: 75%
  // آخر 30 يوم: 0%
  // المجموع: 120 يوم
  
  const fullPayDays = 30;
  const partialPayDays = 60;
  const noPayDays = 30;
  const totalDays = fullPayDays + partialPayDays + noPayDays; // 120
  
  let remainingFullPay = Math.max(0, fullPayDays - daysUsed);
  let remaining75Pay = partialPayDays;
  let remainingNoPay = noPayDays;
  let currentPayRate = 100;
  
  if (daysUsed > fullPayDays) {
    remainingFullPay = 0;
    remaining75Pay = Math.max(0, fullPayDays + partialPayDays - daysUsed);
    currentPayRate = 75;
  }
  
  if (daysUsed > fullPayDays + partialPayDays) {
    remaining75Pay = 0;
    remainingNoPay = Math.max(0, totalDays - daysUsed);
    currentPayRate = 0;
  }
  
  return {
    remainingFullPay,
    remaining75Pay,
    remainingNoPay,
    totalRemaining: remainingFullPay + remaining75Pay + remainingNoPay,
    currentPayRate
  };
}

export default SAUDI_LABOR_LAW;
