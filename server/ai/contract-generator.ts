/**
 * AI Contract Generator - مولد العقود الذكي
 * 
 * مولد عقود العمل الذكي المتوافق مع:
 * - نظام العمل السعودي
 * - متطلبات وزارة الموارد البشرية والتنمية الاجتماعية
 * - التأمينات الاجتماعية (GOSI)
 * - نظام حماية الأجور
 * - متطلبات السعودة (نطاقات)
 * 
 * @module server/ai/contract-generator
 */

import { callLLM } from "../_core/llm";
import { loadRegulation, type Regulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Loaders with Cache
// ============================================

let laborLawRegulation: Regulation | null = null;
let nitaqatRegulation: Regulation | null = null;

/**
 * تحميل نظام العمل من قاعدة المعرفة
 */
function getLaborLaw(): Regulation | null {
  if (!laborLawRegulation) {
    try {
      laborLawRegulation = loadRegulation('labor-law');
    } catch {
      return null;
    }
  }
  return laborLawRegulation;
}

/**
 * تحميل نظام نطاقات من قاعدة المعرفة
 */
function getNitaqat(): Regulation | null {
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
 * استخراج المواد القانونية من قاعدة المعرفة
 */
function getLaborArticlesFromKB(regulation: Regulation): Record<string, any> {
  const regData = regulation as Record<string, any>;
  const articles: Record<string, any> = {};
  
  // استخراج المواد من الأقسام المختلفة
  if (regData.sections) {
    for (const [, section] of Object.entries(regData.sections)) {
      if (section && typeof section === 'object' && 'articles' in section) {
        const sectionData = section as Record<string, any>;
        for (const [articleKey, article] of Object.entries(sectionData.articles || {})) {
          articles[articleKey] = article;
        }
      }
    }
  }
  
  return articles;
}

/**
 * استخراج قواعد مكافأة نهاية الخدمة من قاعدة المعرفة
 */
function getEndOfServiceRulesFromKB(regulation: Regulation): any {
  const regData = regulation as Record<string, any>;
  return regData.sections?.endOfService || {
    resignation: {
      lessThan2Years: 0,
      between2And5Years: 0.33,
      between5And10Years: 0.66,
      moreThan10Years: 1
    },
    termination: {
      lessThan5Years: 0.5,
      moreThan5Years: 1
    }
  };
}

// ============================================
// أنواع العقود
// ============================================

export type ContractType = 
  | 'unlimited'      // عقد غير محدد المدة
  | 'fixed'          // عقد محدد المدة
  | 'seasonal'       // عقد موسمي
  | 'project'        // عقد بمهمة محددة
  | 'part-time'      // عقد دوام جزئي
  | 'temporary'      // عقد مؤقت
  | 'training';      // عقد تدريب

export type EmployeeNationality = 'saudi' | 'non-saudi';

export interface ContractInput {
  // بيانات صاحب العمل
  employer: {
    name: string;
    nameEn?: string;
    commercialRegistration: string;
    unifiedNumber?: string;
    address: string;
    city: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    representativeName: string;
    representativeTitle: string;
  };
  
  // بيانات الموظف
  employee: {
    name: string;
    nameEn?: string;
    nationality: EmployeeNationality;
    idNumber: string;
    idType: 'national_id' | 'iqama' | 'passport';
    birthDate: string;
    gender: 'male' | 'female';
    address: string;
    city: string;
    phone: string;
    email?: string;
    bankName?: string;
    iban?: string;
    qualifications?: string;
    experience?: string;
  };
  
  // بيانات العقد
  contract: {
    type: ContractType;
    startDate: string;
    endDate?: string;
    duration?: number; // بالأشهر
    probationPeriod?: number; // بالأيام (أقصى 90 يوم للسعوديين، 180 لغير السعوديين)
    jobTitle: string;
    jobTitleEn?: string;
    department?: string;
    workLocation: string;
    workingHours: number; // ساعات العمل اليومية
    workingDays: number; // أيام العمل الأسبوعية
    basicSalary: number;
    housingAllowance?: number;
    transportAllowance?: number;
    otherAllowances?: { name: string; amount: number }[];
    annualLeave?: number; // أيام الإجازة السنوية (أقل من 21 أو 30)
    noticePeriod?: number; // بالأيام
    benefits?: string[];
    specialTerms?: string[];
  };
  
  // خيارات إضافية
  options?: {
    language: 'ar' | 'en' | 'both';
    includeJobDescription?: boolean;
    includeConfidentialityClause?: boolean;
    includeNonCompeteClause?: boolean;
    includeIntellectualProperty?: boolean;
    customClauses?: string[];
  };
}

export interface GeneratedContract {
  success: boolean;
  contract?: {
    arabic: string;
    english?: string;
    summary: string;
  };
  compliance: {
    isCompliant: boolean;
    issues: ContractIssue[];
    recommendations: string[];
  };
  metadata: {
    generatedAt: string;
    contractNumber?: string;
    validityPeriod?: string;
    renewalTerms?: string;
  };
  error?: string;
}

export interface ContractIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  legalReference?: string;
  suggestion?: string;
}

// ============================================
// Helper Functions
// ============================================

async function callAI<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي متخصص في عقود العمل السعودية. أجب بصيغة JSON فقط.' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 4000
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
    console.error('Contract Generator AI Error:', error);
    return fallback;
  }
}

function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CONTRACT-${year}${month}-${random}`;
}

function calculateTotalSalary(contract: ContractInput['contract']): number {
  let total = contract.basicSalary;
  if (contract.housingAllowance) total += contract.housingAllowance;
  if (contract.transportAllowance) total += contract.transportAllowance;
  if (contract.otherAllowances) {
    total += contract.otherAllowances.reduce((sum, a) => sum + a.amount, 0);
  }
  return total;
}

// ============================================
// Contract Validation
// ============================================

async function validateContractInput(input: ContractInput): Promise<ContractIssue[]> {
  const issues: ContractIssue[] = [];
  const { employee, contract } = input;
  
  // تحميل الأنظمة من قاعدة المعرفة
  const laborLaw = getLaborLaw();
  const nitaqat = getNitaqat();
  
  // Cast to Record for dynamic property access
  const laborData = laborLaw as Record<string, any> | null;
  const nitaqatData = nitaqat as Record<string, any> | null;
  
  // استخراج القيم من قاعدة المعرفة أو استخدام القيم الافتراضية
  const probationDays = laborData?.sections?.probation?.maxDays ?? 180;
  const maxWorkingHours = laborData?.sections?.workingHours?.dailyLimit ?? 8;
  const maxWorkingDays = laborData?.sections?.workingHours?.weeklyDaysLimit ?? 6;
  const minAnnualLeave = laborData?.sections?.leave?.annualLeave?.minimumDays ?? 21;
  const minSaudiSalary = nitaqatData?.minimumWage?.fullBenefit ?? 4000;
  const minNoticePeriod = laborData?.sections?.termination?.noticePeriod?.unlimitedContract ?? 30;
  
  // التحقق من فترة التجربة
  if (contract.probationPeriod && contract.probationPeriod > probationDays) {
    issues.push({
      type: 'error',
      field: 'probationPeriod',
      message: `فترة التجربة تتجاوز الحد الأقصى (${probationDays} يوم)`,
      legalReference: 'المادة 53 من نظام العمل',
      suggestion: `تقليل فترة التجربة إلى ${probationDays} يوم أو أقل`
    });
  }
  
  // التحقق من ساعات العمل
  if (contract.workingHours > maxWorkingHours) {
    issues.push({
      type: 'error',
      field: 'workingHours',
      message: `ساعات العمل تتجاوز الحد الأقصى (${maxWorkingHours} ساعات يومياً)`,
      legalReference: 'المادة 98 من نظام العمل',
      suggestion: `تحديد ساعات العمل بـ ${maxWorkingHours} ساعات يومياً كحد أقصى`
    });
  }
  
  // التحقق من أيام العمل
  if (contract.workingDays > maxWorkingDays) {
    issues.push({
      type: 'error',
      field: 'workingDays',
      message: `أيام العمل تتجاوز الحد الأقصى (${maxWorkingDays} أيام أسبوعياً)`,
      legalReference: 'المادة 104 من نظام العمل',
      suggestion: 'يجب منح يوم راحة أسبوعية على الأقل'
    });
  }
  
  // التحقق من الإجازة السنوية
  if (contract.annualLeave && contract.annualLeave < minAnnualLeave) {
    issues.push({
      type: 'error',
      field: 'annualLeave',
      message: `الإجازة السنوية أقل من الحد الأدنى (${minAnnualLeave} يوم)`,
      legalReference: 'المادة 109 من نظام العمل',
      suggestion: `تحديد الإجازة السنوية بـ ${minAnnualLeave} يوم على الأقل`
    });
  }
  
  // التحقق من الراتب الأساسي (الحد الأدنى للسعوديين)
  if (employee.nationality === 'saudi' && contract.basicSalary < minSaudiSalary) {
    issues.push({
      type: 'warning',
      field: 'basicSalary',
      message: `الراتب أقل من الحد الأدنى المطلوب لاحتساب السعودة (${minSaudiSalary} ريال)`,
      legalReference: 'نظام نطاقات',
      suggestion: `زيادة الراتب إلى ${minSaudiSalary} ريال على الأقل لاحتساب الموظف في نطاقات`
    });
  }
  
  // التحقق من فترة الإشعار
  if (contract.type === 'unlimited' && (!contract.noticePeriod || contract.noticePeriod < minNoticePeriod)) {
    issues.push({
      type: 'warning',
      field: 'noticePeriod',
      message: `فترة الإشعار للعقود غير محددة المدة يجب ألا تقل عن ${minNoticePeriod} يوم`,
      legalReference: 'المادة 75 من نظام العمل',
      suggestion: `تحديد فترة الإشعار بـ 60 يوم للعقود غير محددة المدة`
    });
  }
  
  // التحقق من بيانات الحساب البنكي (نظام حماية الأجور)
  if (!employee.iban) {
    issues.push({
      type: 'warning',
      field: 'employee.iban',
      message: 'لم يتم تحديد رقم IBAN - مطلوب لنظام حماية الأجور',
      legalReference: 'نظام حماية الأجور',
      suggestion: 'إضافة رقم IBAN لضمان التوافق مع نظام حماية الأجور'
    });
  }
  
  // التحقق من نوع العقد للموظف غير السعودي
  if (employee.nationality === 'non-saudi' && contract.type === 'unlimited') {
    issues.push({
      type: 'error',
      field: 'contract.type',
      message: 'لا يمكن إبرام عقد غير محدد المدة مع موظف غير سعودي',
      legalReference: 'المادة 37 من نظام العمل',
      suggestion: 'تحويل العقد إلى عقد محدد المدة'
    });
  }
  
  // التحقق من مدة العقد المحدد
  if (contract.type === 'fixed' && contract.duration && contract.duration > 24) {
    issues.push({
      type: 'info',
      field: 'contract.duration',
      message: 'العقود محددة المدة التي تتجدد تلقائياً قد تتحول لعقود غير محددة المدة',
      legalReference: 'المادة 55 من نظام العمل',
      suggestion: 'مراجعة شروط التجديد بعناية'
    });
  }
  
  return issues;
}

// ============================================
// Main Functions
// ============================================

/**
 * توليد عقد عمل متوافق مع نظام العمل السعودي
 */
export async function generateEmploymentContract(
  input: ContractInput
): Promise<GeneratedContract> {
  // التحقق من المدخلات أولاً
  const validationIssues = await validateContractInput(input);
  const hasErrors = validationIssues.some(i => i.type === 'error');
  
  if (hasErrors) {
    return {
      success: false,
      compliance: {
        isCompliant: false,
        issues: validationIssues,
        recommendations: validationIssues
          .filter(i => i.suggestion)
          .map(i => i.suggestion!)
      },
      metadata: {
        generatedAt: new Date().toISOString()
      },
      error: 'يوجد أخطاء في البيانات المدخلة تمنع إنشاء العقد'
    };
  }
  
  const contractNumber = generateContractNumber();
  const totalSalary = calculateTotalSalary(input.contract);
  
  // تحميل المواد القانونية من قاعدة المعرفة
  const laborLaw = await getLaborLaw();
  const laborArticles = laborLaw ? getLaborArticlesFromKB(laborLaw) : {};
  const articlesPreview = Object.entries(laborArticles).slice(0, 10).map(([key, value]) => ({
    article: key,
    content: value
  }));
  
  const prompt = `
أنت محامي متخصص في قانون العمل السعودي ومسؤول عن صياغة عقود العمل.

قم بإنشاء عقد عمل كامل ومتوافق مع نظام العمل السعودي بناءً على البيانات التالية:

## بيانات صاحب العمل:
- الاسم: ${input.employer.name}
- السجل التجاري: ${input.employer.commercialRegistration}
- الرقم الموحد: ${input.employer.unifiedNumber || 'غير محدد'}
- العنوان: ${input.employer.address}، ${input.employer.city}
- الممثل النظامي: ${input.employer.representativeName} - ${input.employer.representativeTitle}

## بيانات الموظف:
- الاسم: ${input.employee.name}
- الجنسية: ${input.employee.nationality === 'saudi' ? 'سعودي' : 'غير سعودي'}
- رقم الهوية: ${input.employee.idNumber}
- تاريخ الميلاد: ${input.employee.birthDate}
- الجنس: ${input.employee.gender === 'male' ? 'ذكر' : 'أنثى'}
- العنوان: ${input.employee.address}، ${input.employee.city}

## بيانات العقد:
- نوع العقد: ${getContractTypeName(input.contract.type)}
- تاريخ البداية: ${input.contract.startDate}
${input.contract.endDate ? `- تاريخ النهاية: ${input.contract.endDate}` : ''}
- فترة التجربة: ${input.contract.probationPeriod || 90} يوم
- المسمى الوظيفي: ${input.contract.jobTitle}
- مكان العمل: ${input.contract.workLocation}
- ساعات العمل: ${input.contract.workingHours} ساعات يومياً
- أيام العمل: ${input.contract.workingDays} أيام أسبوعياً
- الراتب الأساسي: ${input.contract.basicSalary} ريال
- بدل السكن: ${input.contract.housingAllowance || 0} ريال
- بدل النقل: ${input.contract.transportAllowance || 0} ريال
- إجمالي الراتب: ${totalSalary} ريال
- الإجازة السنوية: ${input.contract.annualLeave || 21} يوم
- فترة الإشعار: ${input.contract.noticePeriod || 30} يوم

## المراجع القانونية الواجب مراعاتها:
${JSON.stringify(articlesPreview, null, 2)}

## الخيارات الإضافية:
- تضمين شرط السرية: ${input.options?.includeConfidentialityClause ? 'نعم' : 'لا'}
- تضمين شرط عدم المنافسة: ${input.options?.includeNonCompeteClause ? 'نعم' : 'لا'}
- تضمين حقوق الملكية الفكرية: ${input.options?.includeIntellectualProperty ? 'نعم' : 'لا'}

أرجع النتيجة بصيغة JSON كالتالي:
{
  "contractArabic": "نص العقد الكامل باللغة العربية مع جميع البنود والمواد",
  "contractEnglish": "Full contract text in English with all clauses (optional)",
  "summary": "ملخص العقد في 3-4 جمل",
  "keyTerms": ["المصطلحات الرئيسية"],
  "legalReferences": ["المراجع القانونية المستخدمة"],
  "specialNotes": ["ملاحظات خاصة إن وجدت"]
}

تأكد من تضمين:
1. ديباجة العقد وتعريف الأطراف
2. مدة العقد وشروط التجديد
3. الواجبات والمسؤوليات
4. الراتب والمزايا
5. ساعات العمل والإجازات
6. فترة التجربة
7. إنهاء العقد وفترة الإشعار
8. السرية والملكية الفكرية (إن وجدت)
9. أحكام عامة
10. التوقيعات
`;

  const result = await callAI<{
    contractArabic: string;
    contractEnglish?: string;
    summary: string;
    keyTerms: string[];
    legalReferences: string[];
    specialNotes?: string[];
  }>(prompt, {
    contractArabic: generateFallbackContract(input, contractNumber, totalSalary),
    summary: 'عقد عمل متوافق مع نظام العمل السعودي',
    keyTerms: ['عقد عمل', 'نظام العمل السعودي', input.contract.jobTitle],
    legalReferences: ['نظام العمل السعودي', 'لائحة نظام العمل']
  });
  
  return {
    success: true,
    contract: {
      arabic: result.contractArabic,
      english: result.contractEnglish,
      summary: result.summary
    },
    compliance: {
      isCompliant: !hasErrors,
      issues: validationIssues,
      recommendations: [
        ...validationIssues.filter(i => i.suggestion).map(i => i.suggestion!),
        ...(result.specialNotes || [])
      ]
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      contractNumber,
      validityPeriod: input.contract.endDate || 'غير محدد',
      renewalTerms: input.contract.type === 'fixed' ? 'يتجدد تلقائياً لمدة مماثلة' : 'غير محدد'
    }
  };
}

/**
 * إنشاء ملحق عقد
 */
export async function generateContractAmendment(
  originalContract: {
    contractNumber: string;
    employerName: string;
    employeeName: string;
    originalDate: string;
  },
  amendments: {
    type: 'salary_change' | 'title_change' | 'location_change' | 'terms_change' | 'other';
    description: string;
    oldValue?: string;
    newValue?: string;
    effectiveDate: string;
    reason?: string;
  }[]
): Promise<{
  success: boolean;
  amendment?: string;
  summary?: string;
  error?: string;
}> {
  const prompt = `
أنت محامي متخصص في قانون العمل السعودي.

قم بإنشاء ملحق عقد عمل لتعديل العقد الأصلي:

## بيانات العقد الأصلي:
- رقم العقد: ${originalContract.contractNumber}
- صاحب العمل: ${originalContract.employerName}
- الموظف: ${originalContract.employeeName}
- تاريخ العقد الأصلي: ${originalContract.originalDate}

## التعديلات المطلوبة:
${amendments.map((a, i) => `
${i + 1}. نوع التعديل: ${getAmendmentTypeName(a.type)}
   - الوصف: ${a.description}
   ${a.oldValue ? `- القيمة القديمة: ${a.oldValue}` : ''}
   ${a.newValue ? `- القيمة الجديدة: ${a.newValue}` : ''}
   - تاريخ السريان: ${a.effectiveDate}
   ${a.reason ? `- السبب: ${a.reason}` : ''}
`).join('\n')}

أرجع النتيجة بصيغة JSON:
{
  "amendmentText": "نص الملحق الكامل",
  "summary": "ملخص التعديلات",
  "legalNotes": ["ملاحظات قانونية"]
}
`;

  const result = await callAI<{
    amendmentText: string;
    summary: string;
    legalNotes?: string[];
  }>(prompt, {
    amendmentText: generateFallbackAmendment(originalContract, amendments),
    summary: 'ملحق تعديل عقد عمل'
  });
  
  return {
    success: true,
    amendment: result.amendmentText,
    summary: result.summary
  };
}

/**
 * إنشاء خطاب إنهاء خدمات
 */
export async function generateTerminationLetter(
  data: {
    employerName: string;
    employeeName: string;
    employeeId: string;
    contractDate: string;
    terminationType: 'resignation' | 'termination' | 'end_of_contract' | 'mutual_agreement';
    terminationDate: string;
    lastWorkingDay: string;
    reason?: string;
    noticePeriodServed: boolean;
    endOfServiceAmount?: number;
    remainingLeaveAmount?: number;
    otherEntitlements?: { name: string; amount: number }[];
  }
): Promise<{
  success: boolean;
  letter?: string;
  compliance?: {
    isCompliant: boolean;
    issues: string[];
  };
  entitlements?: {
    endOfService: number;
    remainingLeave: number;
    noticePeriod: number;
    noticePeriodCompensation?: number;
    total: number;
  };
  error?: string;
}> {
  // تحميل قواعد نهاية الخدمة من قاعدة المعرفة
  const laborLaw = await getLaborLaw();
  const endOfServiceRules = laborLaw ? getEndOfServiceRulesFromKB(laborLaw) : {};
  
  const prompt = `
أنت مستشار موارد بشرية متخصص في قانون العمل السعودي.

قم بإنشاء خطاب إنهاء خدمات رسمي:

## بيانات الإنهاء:
- صاحب العمل: ${data.employerName}
- الموظف: ${data.employeeName}
- رقم الهوية: ${data.employeeId}
- تاريخ العقد: ${data.contractDate}
- نوع الإنهاء: ${getTerminationTypeName(data.terminationType)}
- تاريخ الإنهاء: ${data.terminationDate}
- آخر يوم عمل: ${data.lastWorkingDay}
${data.reason ? `- سبب الإنهاء: ${data.reason}` : ''}
- هل تم خدمة فترة الإشعار: ${data.noticePeriodServed ? 'نعم' : 'لا'}

## المستحقات (إن وجدت):
- مكافأة نهاية الخدمة: ${data.endOfServiceAmount || 0} ريال
- رصيد الإجازات: ${data.remainingLeaveAmount || 0} ريال
${data.otherEntitlements?.map(e => `- ${e.name}: ${e.amount} ريال`).join('\n') || ''}

## المراجع القانونية (قواعد مكافأة نهاية الخدمة):
${JSON.stringify(endOfServiceRules, null, 2)}

أرجع النتيجة بصيغة JSON:
{
  "letter": "نص خطاب إنهاء الخدمات الكامل",
  "compliance": {
    "isCompliant": true,
    "issues": []
  },
  "calculatedEntitlements": {
    "endOfService": 0,
    "remainingLeave": 0,
    "noticePeriodCompensation": 0,
    "total": 0
  },
  "recommendations": []
}

تأكد من:
1. توافق الخطاب مع المادة المناسبة من نظام العمل
2. ذكر جميع المستحقات بوضوح
3. تحديد موعد صرف المستحقات
4. توفير إخلاء طرف ومخالصة نهائية
`;

  const result = await callAI<{
    letter: string;
    compliance: { isCompliant: boolean; issues: string[] };
    calculatedEntitlements: {
      endOfService: number;
      remainingLeave: number;
      noticePeriodCompensation: number;
      noticePeriod?: number;
      total: number;
    };
    recommendations?: string[];
  }>(prompt, {
    letter: generateFallbackTerminationLetter(data),
    compliance: { isCompliant: true, issues: [] },
    calculatedEntitlements: {
      endOfService: data.endOfServiceAmount || 0,
      remainingLeave: data.remainingLeaveAmount || 0,
      noticePeriodCompensation: 0,
      total: (data.endOfServiceAmount || 0) + (data.remainingLeaveAmount || 0)
    }
  });
  
  return {
    success: true,
    letter: result.letter,
    compliance: result.compliance,
    entitlements: {
      endOfService: result.calculatedEntitlements.endOfService,
      remainingLeave: result.calculatedEntitlements.remainingLeave,
      noticePeriod: result.calculatedEntitlements.noticePeriodCompensation,
      noticePeriodCompensation: result.calculatedEntitlements.noticePeriodCompensation,
      total: result.calculatedEntitlements.total
    }
  };
}

/**
 * إنشاء شهادة خبرة
 */
export async function generateExperienceCertificate(
  data: {
    employerName: string;
    employerLogo?: string;
    employeeName: string;
    employeeId: string;
    nationality: string;
    jobTitle: string;
    department?: string;
    startDate: string;
    endDate: string;
    lastSalary?: number;
    performanceRating?: 'excellent' | 'very_good' | 'good' | 'satisfactory';
    additionalNotes?: string;
    language: 'ar' | 'en' | 'both';
  }
): Promise<{
  success: boolean;
  certificate?: {
    arabic?: string;
    english?: string;
  };
  error?: string;
}> {
  const prompt = `
أنت مدير موارد بشرية في شركة سعودية.

قم بإنشاء شهادة خبرة رسمية للموظف:

## بيانات الموظف:
- الاسم: ${data.employeeName}
- رقم الهوية: ${data.employeeId}
- الجنسية: ${data.nationality}
- المسمى الوظيفي: ${data.jobTitle}
${data.department ? `- القسم: ${data.department}` : ''}
- تاريخ الالتحاق: ${data.startDate}
- تاريخ انتهاء الخدمة: ${data.endDate}
${data.lastSalary ? `- آخر راتب: ${data.lastSalary} ريال` : ''}
${data.performanceRating ? `- تقييم الأداء: ${getPerformanceRatingName(data.performanceRating)}` : ''}
${data.additionalNotes ? `- ملاحظات إضافية: ${data.additionalNotes}` : ''}

## صاحب العمل:
- الشركة: ${data.employerName}

اللغة المطلوبة: ${data.language === 'both' ? 'عربي وإنجليزي' : data.language === 'ar' ? 'عربي' : 'إنجليزي'}

أرجع النتيجة بصيغة JSON:
{
  "certificateArabic": "نص الشهادة بالعربية (إن طُلب)",
  "certificateEnglish": "Certificate text in English (if requested)"
}

تأكد من:
1. ذكر المدة الفعلية للعمل
2. وصف المهام بشكل إيجابي
3. عدم ذكر معلومات حساسة (الراتب) في الشهادة
4. إضافة عبارة "أُعطيت هذه الشهادة بناءً على طلبه دون أي مسؤولية على الشركة"
`;

  const result = await callAI<{
    certificateArabic?: string;
    certificateEnglish?: string;
  }>(prompt, {
    certificateArabic: data.language !== 'en' ? generateFallbackExperienceCertificate(data, 'ar') : undefined,
    certificateEnglish: data.language !== 'ar' ? generateFallbackExperienceCertificate(data, 'en') : undefined
  });
  
  return {
    success: true,
    certificate: {
      arabic: result.certificateArabic,
      english: result.certificateEnglish
    }
  };
}

/**
 * إنشاء خطاب تعريف بالراتب
 */
export async function generateSalaryLetter(
  data: {
    employerName: string;
    employeeName: string;
    employeeId: string;
    jobTitle: string;
    joinDate: string;
    basicSalary: number;
    housingAllowance?: number;
    transportAllowance?: number;
    otherAllowances?: { name: string; amount: number }[];
    totalSalary: number;
    purpose: 'bank' | 'embassy' | 'government' | 'other';
    addressedTo?: string;
    language: 'ar' | 'en' | 'both';
  }
): Promise<{
  success: boolean;
  letter?: {
    arabic?: string;
    english?: string;
  };
  error?: string;
}> {
  const prompt = `
أنت مدير موارد بشرية في شركة سعودية.

قم بإنشاء خطاب تعريف بالراتب رسمي:

## بيانات الموظف:
- الاسم: ${data.employeeName}
- رقم الهوية: ${data.employeeId}
- المسمى الوظيفي: ${data.jobTitle}
- تاريخ الالتحاق: ${data.joinDate}

## تفاصيل الراتب:
- الراتب الأساسي: ${data.basicSalary} ريال
${data.housingAllowance ? `- بدل السكن: ${data.housingAllowance} ريال` : ''}
${data.transportAllowance ? `- بدل النقل: ${data.transportAllowance} ريال` : ''}
${data.otherAllowances?.map(a => `- ${a.name}: ${a.amount} ريال`).join('\n') || ''}
- إجمالي الراتب: ${data.totalSalary} ريال

## معلومات الخطاب:
- الغرض: ${getPurposeName(data.purpose)}
${data.addressedTo ? `- موجه إلى: ${data.addressedTo}` : ''}
- اللغة: ${data.language === 'both' ? 'عربي وإنجليزي' : data.language === 'ar' ? 'عربي' : 'إنجليزي'}

## صاحب العمل:
- الشركة: ${data.employerName}

أرجع النتيجة بصيغة JSON:
{
  "letterArabic": "نص الخطاب بالعربية (إن طُلب)",
  "letterEnglish": "Letter text in English (if requested)"
}
`;

  const result = await callAI<{
    letterArabic?: string;
    letterEnglish?: string;
  }>(prompt, {
    letterArabic: data.language !== 'en' ? generateFallbackSalaryLetter(data, 'ar') : undefined,
    letterEnglish: data.language !== 'ar' ? generateFallbackSalaryLetter(data, 'en') : undefined
  });
  
  return {
    success: true,
    letter: {
      arabic: result.letterArabic,
      english: result.letterEnglish
    }
  };
}

// ============================================
// Helper Name Functions
// ============================================

function getContractTypeName(type: ContractType): string {
  const names: Record<ContractType, string> = {
    unlimited: 'عقد غير محدد المدة',
    fixed: 'عقد محدد المدة',
    seasonal: 'عقد موسمي',
    project: 'عقد بمهمة محددة',
    'part-time': 'عقد دوام جزئي',
    temporary: 'عقد مؤقت',
    training: 'عقد تدريب'
  };
  return names[type] || type;
}

function getAmendmentTypeName(type: string): string {
  const names: Record<string, string> = {
    salary_change: 'تعديل الراتب',
    title_change: 'تغيير المسمى الوظيفي',
    location_change: 'تغيير مكان العمل',
    terms_change: 'تعديل شروط العقد',
    other: 'تعديل آخر'
  };
  return names[type] || type;
}

function getTerminationTypeName(type: string): string {
  const names: Record<string, string> = {
    resignation: 'استقالة',
    termination: 'إنهاء خدمات',
    end_of_contract: 'انتهاء العقد',
    mutual_agreement: 'اتفاق الطرفين'
  };
  return names[type] || type;
}

function getPerformanceRatingName(rating: string): string {
  const names: Record<string, string> = {
    excellent: 'ممتاز',
    very_good: 'جيد جداً',
    good: 'جيد',
    satisfactory: 'مرضي'
  };
  return names[rating] || rating;
}

function getPurposeName(purpose: string): string {
  const names: Record<string, string> = {
    bank: 'جهة مصرفية',
    embassy: 'سفارة',
    government: 'جهة حكومية',
    other: 'أخرى'
  };
  return names[purpose] || purpose;
}

// ============================================
// Fallback Templates
// ============================================

function generateFallbackContract(
  input: ContractInput,
  contractNumber: string,
  totalSalary: number
): string {
  return `
بسم الله الرحمن الرحيم

عقد عمل
رقم العقد: ${contractNumber}

تم بتوفيق الله تعالى في يوم ${new Date().toLocaleDateString('ar-SA')} إبرام هذا العقد بين كل من:

الطرف الأول (صاحب العمل):
${input.employer.name}
السجل التجاري: ${input.employer.commercialRegistration}
العنوان: ${input.employer.address}، ${input.employer.city}
ويمثله: ${input.employer.representativeName} بصفته ${input.employer.representativeTitle}

الطرف الثاني (الموظف):
${input.employee.name}
الجنسية: ${input.employee.nationality === 'saudi' ? 'سعودي' : 'غير سعودي'}
رقم الهوية: ${input.employee.idNumber}
العنوان: ${input.employee.address}، ${input.employee.city}

المادة الأولى: التعيين
يُعيّن الطرف الأول الطرف الثاني بوظيفة "${input.contract.jobTitle}" بموجب ${getContractTypeName(input.contract.type)}.

المادة الثانية: مدة العقد
يبدأ هذا العقد من تاريخ ${input.contract.startDate}${input.contract.endDate ? ` وينتهي في ${input.contract.endDate}` : ''}.
فترة التجربة: ${input.contract.probationPeriod || 90} يوم.

المادة الثالثة: الراتب والمزايا
- الراتب الأساسي: ${input.contract.basicSalary} ريال سعودي شهرياً
${input.contract.housingAllowance ? `- بدل السكن: ${input.contract.housingAllowance} ريال` : ''}
${input.contract.transportAllowance ? `- بدل النقل: ${input.contract.transportAllowance} ريال` : ''}
- إجمالي الراتب: ${totalSalary} ريال سعودي شهرياً

المادة الرابعة: ساعات العمل
- ${input.contract.workingHours} ساعات يومياً
- ${input.contract.workingDays} أيام أسبوعياً

المادة الخامسة: الإجازات
- إجازة سنوية: ${input.contract.annualLeave || 21} يوم مدفوعة الأجر
- تطبق أحكام الإجازات الواردة في نظام العمل السعودي

المادة السادسة: إنهاء العقد
- فترة الإشعار: ${input.contract.noticePeriod || 30} يوم
- تطبق أحكام إنهاء العقد الواردة في نظام العمل السعودي

المادة السابعة: أحكام عامة
1. يخضع هذا العقد لنظام العمل السعودي ولوائحه التنفيذية
2. أي خلاف ينشأ عن هذا العقد يحال للجهات المختصة
3. حُرر هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها

التوقيعات:

الطرف الأول                                    الطرف الثاني
_______________                          _______________
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
`;
}

function generateFallbackAmendment(
  originalContract: { contractNumber: string; employerName: string; employeeName: string; originalDate: string },
  amendments: { type: string; description: string; newValue?: string; effectiveDate: string }[]
): string {
  return `
ملحق عقد عمل

إشارة إلى عقد العمل رقم ${originalContract.contractNumber} المؤرخ في ${originalContract.originalDate}
المبرم بين ${originalContract.employerName} (الطرف الأول) و${originalContract.employeeName} (الطرف الثاني)

اتفق الطرفان على تعديل العقد كالتالي:

${amendments.map((a, i) => `
${i + 1}. ${a.description}
   ${a.newValue ? `القيمة الجديدة: ${a.newValue}` : ''}
   تاريخ السريان: ${a.effectiveDate}
`).join('\n')}

وتبقى جميع بنود العقد الأخرى سارية المفعول دون تغيير.

التوقيعات:
الطرف الأول _______________     الطرف الثاني _______________
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
`;
}

function generateFallbackTerminationLetter(data: {
  employerName: string;
  employeeName: string;
  terminationType: string;
  terminationDate: string;
  lastWorkingDay: string;
  endOfServiceAmount?: number;
  remainingLeaveAmount?: number;
}): string {
  return `
خطاب إنهاء خدمات

التاريخ: ${new Date().toLocaleDateString('ar-SA')}

السيد/ ${data.employeeName}

تحية طيبة وبعد،

نفيدكم بأنه قد تم إنهاء خدماتكم لدى ${data.employerName} بسبب ${getTerminationTypeName(data.terminationType)}.

تاريخ الإنهاء: ${data.terminationDate}
آخر يوم عمل: ${data.lastWorkingDay}

المستحقات:
- مكافأة نهاية الخدمة: ${data.endOfServiceAmount || 0} ريال
- رصيد الإجازات: ${data.remainingLeaveAmount || 0} ريال

نتمنى لكم التوفيق في مسيرتكم المهنية.

مع التحية،
${data.employerName}
`;
}

function generateFallbackExperienceCertificate(
  data: { employerName: string; employeeName: string; jobTitle: string; startDate: string; endDate: string },
  language: 'ar' | 'en'
): string {
  if (language === 'ar') {
    return `
شهادة خبرة

نشهد نحن ${data.employerName} بأن السيد/ ${data.employeeName} قد عمل لدينا بوظيفة "${data.jobTitle}" خلال الفترة من ${data.startDate} إلى ${data.endDate}.

وقد أثبت كفاءة عالية في أداء مهامه الوظيفية.

أُعطيت هذه الشهادة بناءً على طلبه دون أي مسؤولية على الشركة.

${data.employerName}
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
`;
  } else {
    return `
EXPERIENCE CERTIFICATE

This is to certify that Mr./Ms. ${data.employeeName} was employed with ${data.employerName} as "${data.jobTitle}" from ${data.startDate} to ${data.endDate}.

During this period, they demonstrated high competence in performing their duties.

This certificate is issued upon request without any liability on the company.

${data.employerName}
Date: ${new Date().toLocaleDateString('en-US')}
`;
  }
}

function generateFallbackSalaryLetter(
  data: { employerName: string; employeeName: string; jobTitle: string; totalSalary: number; purpose: string },
  language: 'ar' | 'en'
): string {
  if (language === 'ar') {
    return `
إلى من يهمه الأمر

خطاب تعريف بالراتب

نفيد بأن السيد/ ${data.employeeName} يعمل لدى ${data.employerName} بوظيفة "${data.jobTitle}" ويتقاضى راتباً شهرياً إجمالياً قدره ${data.totalSalary} ريال سعودي.

أُعطي هذا الخطاب بناءً على طلبه لتقديمه إلى ${getPurposeName(data.purpose)}.

${data.employerName}
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
`;
  } else {
    return `
To Whom It May Concern

SALARY CERTIFICATE

This is to certify that Mr./Ms. ${data.employeeName} is employed with ${data.employerName} as "${data.jobTitle}" with a total monthly salary of SAR ${data.totalSalary}.

This letter is issued upon request for submission to ${getPurposeName(data.purpose)}.

${data.employerName}
Date: ${new Date().toLocaleDateString('en-US')}
`;
  }
}
