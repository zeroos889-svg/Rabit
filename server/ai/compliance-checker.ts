/**
 * AI Labor Law Compliance Checker - مدقق الامتثال لنظام العمل السعودي
 * Intelligent compliance checking for Saudi Labor Law
 * 
 * محدث لاستخدام قاعدة المعرفة الخارجية بدلاً من البيانات المضمنة
 * @version 2.0.0
 * @updated 2025
 */

import { invokeLLM, type Message } from "../_core/llm";
import { 
  loadRegulation, 
  type Regulation 
} from "./knowledge-base-loader";

// تحميل الأنظمة من قاعدة المعرفة
let laborLawData: Regulation | null = null;
let gosiData: Regulation | null = null;
let violationsData: Regulation | null = null;

function getLaborLaw(): Regulation {
  laborLawData ??= loadRegulation('labor-law');
  return laborLawData;
}

function getGOSI(): Regulation {
  gosiData ??= loadRegulation('gosi');
  return gosiData;
}

function _getViolations(): Regulation {
  violationsData ??= loadRegulation('violations');
  return violationsData;
}

// Helper function to simplify AI calls
async function callAI(messages: Message[], maxTokens = 3000) {
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
// Types & Interfaces
// ============================================

export interface ComplianceCheckRequest {
  type: ComplianceCheckType;
  data: Record<string, any>;
  language?: "ar" | "en";
}

export type ComplianceCheckType = 
  | "termination"
  | "contract"
  | "working_hours"
  | "leave"
  | "salary"
  | "probation"
  | "notice_period"
  | "overtime"
  | "general";

export interface ComplianceCheckResult {
  isCompliant: boolean;
  complianceScore: number; // 0-100
  issues: ComplianceIssue[];
  recommendations: string[];
  legalReferences: LegalReference[];
  riskLevel: "low" | "medium" | "high" | "critical";
  summary: string;
  detailedAnalysis: string;
}

export interface ComplianceIssue {
  severity: "info" | "warning" | "error" | "critical";
  category: string;
  description: string;
  legalBasis: string;
  recommendation: string;
  penalty?: string;
}

export interface LegalReference {
  article: string;
  title: string;
  titleEn: string;
  relevance: string;
  content: string;
}

export interface TerminationCheckData {
  employeeId?: string;
  employeeName: string;
  nationality: "saudi" | "non-saudi";
  contractType: "limited" | "unlimited";
  startDate: string;
  terminationDate: string;
  terminationType: "employer" | "resignation" | "mutual" | "article80";
  terminationReason: string;
  noticePeriodGiven: boolean;
  noticePeriodDays?: number;
  salary: number;
  hasWarnings?: boolean;
  warningCount?: number;
  article80Reason?: string;
}

export interface ContractCheckData {
  contractType: "limited" | "unlimited" | "parttime";
  hasWrittenContract: boolean;
  hasTwoCopies: boolean;
  includesEssentialElements: string[];
  probationPeriod?: number;
  salary: number;
  workLocation: string;
  workingHours: number;
  startDate: string;
  endDate?: string;
  nationality: "saudi" | "non-saudi";
}

export interface WorkingHoursCheckData {
  weeklyHours: number;
  dailyHours: number;
  overtimeHours: number;
  restPeriods: number; // بالدقائق
  isRamadan: boolean;
  employeeReligion?: "muslim" | "other";
}

export interface LeaveCheckData {
  leaveType: "annual" | "sick" | "maternity" | "paternity" | "hajj" | "eid" | "marriage" | "death" | "exam";
  requestedDays: number;
  yearsOfService: number;
  previousLeaveTaken?: number;
  isPaidLeave: boolean;
  hasPerformedHajj?: boolean;
  relationForDeath?: string;
}

export interface SalaryCheckData {
  basicSalary: number;
  allowances: number;
  totalSalary: number;
  paymentMethod: "bank" | "cash" | "check";
  paymentFrequency: "monthly" | "weekly" | "daily";
  isOnTime: boolean;
  delayDays?: number;
  nationality: "saudi" | "non-saudi";
  position?: string;
}

// ============================================
// Main Compliance Checker
// ============================================

/**
 * التحقق الشامل من الامتثال
 */
export async function checkCompliance(
  request: ComplianceCheckRequest
): Promise<ComplianceCheckResult> {
  const language = request.language || "ar";

  // تنفيذ الفحص المناسب
  switch (request.type) {
    case "termination":
      return checkTerminationCompliance(request.data as TerminationCheckData, language);
    case "contract":
      return checkContractCompliance(request.data as ContractCheckData, language);
    case "working_hours":
      return checkWorkingHoursCompliance(request.data as WorkingHoursCheckData, language);
    case "leave":
      return checkLeaveCompliance(request.data as LeaveCheckData, language);
    case "salary":
      return checkSalaryCompliance(request.data as SalaryCheckData, language);
    default:
      return performGeneralComplianceCheck(request.data, language);
  }
}

/**
 * فحص امتثال إنهاء العقد
 */
async function checkTerminationCompliance(
  data: TerminationCheckData,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  const legalReferences: LegalReference[] = [];

  // تحميل بيانات نظام العمل
  const laborLaw = getLaborLaw();
  const articles = laborLaw.articles as Record<string, any>;
  
  // حساب سنوات الخدمة
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.terminationDate);
  const yearsOfService = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  // التحقق من فترة الإشعار
  if (data.contractType === "unlimited" && data.terminationType !== "article80") {
    const requiredNotice = articles.article75?.content?.noticePeriod || 60;
    
    if (!data.noticePeriodGiven) {
      issues.push({
        severity: "error",
        category: "فترة الإشعار",
        description: isArabic 
          ? "لم يتم إعطاء فترة إشعار" 
          : "Notice period was not given",
        legalBasis: "المادة 75",
        recommendation: isArabic 
          ? `يجب إعطاء فترة إشعار ${requiredNotice} يوم أو تعويض بدلاً عنها`
          : `Must provide ${requiredNotice} days notice or compensation in lieu`,
        penalty: isArabic
          ? "تعويض يعادل أجر فترة الإشعار"
          : "Compensation equal to notice period wages",
      });
      
      legalReferences.push({
        article: "75",
        title: "فترة الإشعار",
        titleEn: "Notice Period",
        relevance: "عدم الالتزام بفترة الإشعار القانونية",
        content: articles.article75?.content?.rules?.ar?.join("\n") || "فترة إشعار لا تقل عن 60 يوم",
      });
    } else if (data.noticePeriodDays && data.noticePeriodDays < requiredNotice) {
      issues.push({
        severity: "warning",
        category: "فترة الإشعار",
        description: isArabic 
          ? `فترة الإشعار المعطاة (${data.noticePeriodDays} يوم) أقل من المطلوب (${requiredNotice} يوم)`
          : `Given notice period (${data.noticePeriodDays} days) is less than required (${requiredNotice} days)`,
        legalBasis: "المادة 75",
        recommendation: isArabic 
          ? "يجب تعويض الفرق في فترة الإشعار"
          : "Must compensate for the notice period difference",
      });
    }
  }

  // التحقق من الفصل بموجب المادة 80
  if (data.terminationType === "article80") {
    const validReasons = articles.article80?.content?.cases?.ar || [];
    
    if (!data.article80Reason) {
      issues.push({
        severity: "critical",
        category: "الفصل التأديبي",
        description: isArabic 
          ? "لم يتم تحديد سبب الفصل بموجب المادة 80"
          : "Article 80 termination reason not specified",
        legalBasis: "المادة 80",
        recommendation: isArabic 
          ? "يجب تحديد سبب واضح ومحدد من الأسباب المنصوص عليها في المادة 80"
          : "Must specify a clear reason from Article 80 provisions",
      });
    } else {
      // التحقق من الإنذارات للغياب
      if (data.article80Reason.includes("غياب") || data.article80Reason.includes("absence")) {
        if (!data.hasWarnings || (data.warningCount && data.warningCount < 2)) {
          issues.push({
            severity: "error",
            category: "إجراءات الفصل",
            description: isArabic 
              ? "الفصل بسبب الغياب يتطلب إنذارات مسبقة"
              : "Termination for absence requires prior warnings",
            legalBasis: "المادة 80",
            recommendation: isArabic 
              ? "يجب إنذار العامل كتابياً قبل الفصل"
              : "Employee must be warned in writing before termination",
          });
        }
      }
    }

    legalReferences.push({
      article: "80",
      title: "الفصل بدون مكافأة",
      titleEn: "Dismissal Without Compensation",
      relevance: "الحالات التي يجوز فيها فصل العامل دون مكافأة",
      content: validReasons.join("\n"),
    });
  }

  // حساب مكافأة نهاية الخدمة
  const eosbAmount = calculateEndOfServiceFromKB(
    data.salary,
    yearsOfService,
    data.terminationType === "article80" ? "article80" : 
    data.terminationType === "resignation" ? "resignation" : "employer"
  );

  // إضافة مرجع المادة 84
  legalReferences.push({
    article: "84",
    title: "مكافأة نهاية الخدمة",
    titleEn: "End of Service Award",
    relevance: "حساب مستحقات نهاية الخدمة",
    content: articles.article84?.content?.calculation?.ar?.join("\n") || "حساب مكافأة نهاية الخدمة",
  });

  // تقييم المخاطر
  const criticalIssues = issues.filter(i => i.severity === "critical").length;
  const errorIssues = issues.filter(i => i.severity === "error").length;
  const warningIssues = issues.filter(i => i.severity === "warning").length;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (criticalIssues > 0) riskLevel = "critical";
  else if (errorIssues > 0) riskLevel = "high";
  else if (warningIssues > 0) riskLevel = "medium";

  // حساب نسبة الامتثال
  const complianceScore = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 20) - (warningIssues * 10));

  // توصيات
  if (data.terminationType === "employer" && yearsOfService >= 2) {
    recommendations.push(isArabic 
      ? `يجب دفع مكافأة نهاية الخدمة بمبلغ ${eosbAmount.toFixed(2)} ريال`
      : `End of service benefit of ${eosbAmount.toFixed(2)} SAR must be paid`);
  }

  if (data.noticePeriodGiven && data.terminationType !== "article80") {
    recommendations.push(isArabic 
      ? "تأكد من توثيق الإشعار كتابياً واحتفظ بنسخة"
      : "Ensure notice is documented in writing and keep a copy");
  }

  recommendations.push(isArabic 
    ? "احتفظ بجميع المستندات المتعلقة بإنهاء العقد"
    : "Keep all documents related to contract termination");

  // الملخص
  const summary = isArabic
    ? `تحليل إنهاء عقد ${data.employeeName}: ${issues.length} ملاحظات، مكافأة نهاية الخدمة: ${eosbAmount.toFixed(2)} ريال`
    : `Termination analysis for ${data.employeeName}: ${issues.length} issues, EOSB: ${eosbAmount.toFixed(2)} SAR`;

  // التحليل المفصل باستخدام الذكاء الاصطناعي
  const detailedAnalysis = await generateDetailedAnalysis(
    "termination",
    data,
    issues,
    legalReferences,
    language
  );

  return {
    isCompliant: issues.filter(i => i.severity === "critical" || i.severity === "error").length === 0,
    complianceScore,
    issues,
    recommendations,
    legalReferences,
    riskLevel,
    summary,
    detailedAnalysis,
  };
}

/**
 * فحص امتثال العقد
 */
async function checkContractCompliance(
  data: ContractCheckData,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  const legalReferences: LegalReference[] = [];

  // التحقق من وجود عقد مكتوب
  if (!data.hasWrittenContract) {
    issues.push({
      severity: "warning",
      category: "توثيق العقد",
      description: isArabic 
        ? "لا يوجد عقد عمل مكتوب"
        : "No written employment contract",
      legalBasis: "المادة 50",
      recommendation: isArabic 
        ? "يُنصح بشدة بكتابة عقد العمل لحماية حقوق الطرفين"
        : "Strongly recommended to have a written contract to protect both parties",
    });
  }

  // التحقق من النسختين
  if (data.hasWrittenContract && !data.hasTwoCopies) {
    issues.push({
      severity: "info",
      category: "توثيق العقد",
      description: isArabic 
        ? "يجب أن يكون العقد من نسختين"
        : "Contract should be in two copies",
      legalBasis: "المادة 50",
      recommendation: isArabic 
        ? "تأكد من احتفاظ كل طرف بنسخة من العقد"
        : "Ensure each party keeps a copy of the contract",
    });
  }

  // التحقق من العناصر الأساسية
  const laborLaw = getLaborLaw();
  const contractArticles = laborLaw.articles as Record<string, any>;
  const requiredElements = contractArticles.article50?.content?.essentialElements?.ar || [
    'اسم صاحب العمل وعنوانه',
    'اسم العامل وجنسيته',
    'رقم الهوية أو الإقامة',
    'الأجر المتفق عليه',
    'نوع العمل ومكانه',
    'تاريخ بداية العقد ومدته'
  ];
  const missingElements = requiredElements.filter((e: string) => !data.includesEssentialElements.includes(e));
  
  if (missingElements.length > 0) {
    issues.push({
      severity: "error",
      category: "محتوى العقد",
      description: isArabic 
        ? `العقد يفتقر إلى عناصر أساسية: ${missingElements.join("، ")}`
        : `Contract missing essential elements: ${missingElements.join(", ")}`,
      legalBasis: "المادة 50",
      recommendation: isArabic 
        ? "يجب إضافة جميع العناصر الأساسية للعقد"
        : "Must add all essential elements to the contract",
    });
  }

  // التحقق من فترة التجربة
  if (data.probationPeriod) {
    const maxProbation = 180; // الحد الأقصى بعد التمديد
    if (data.probationPeriod > maxProbation) {
      issues.push({
        severity: "error",
        category: "فترة التجربة",
        description: isArabic 
          ? `فترة التجربة (${data.probationPeriod} يوم) تتجاوز الحد الأقصى (${maxProbation} يوم)`
          : `Probation period (${data.probationPeriod} days) exceeds maximum (${maxProbation} days)`,
        legalBasis: "المادة 51",
        recommendation: isArabic 
          ? "يجب تعديل فترة التجربة لتكون 90 يوم كحد أقصى (أو 180 يوم باتفاق مكتوب)"
          : "Probation must be max 90 days (or 180 days with written agreement)",
      });
    } else if (data.probationPeriod > 90) {
      issues.push({
        severity: "warning",
        category: "فترة التجربة",
        description: isArabic 
          ? "فترة التجربة تتجاوز 90 يوم وتحتاج اتفاق مكتوب"
          : "Probation exceeds 90 days and requires written agreement",
        legalBasis: "المادة 51",
        recommendation: isArabic 
          ? "تأكد من وجود اتفاق مكتوب على تمديد فترة التجربة"
          : "Ensure written agreement exists for probation extension",
      });
    }

    legalReferences.push({
      article: "51",
      title: "فترة التجربة",
      titleEn: "Probation Period",
      relevance: "قواعد فترة التجربة",
      content: contractArticles.article51?.content?.rules?.ar?.join("\n") || "فترة تجربة لا تزيد عن 90 يوم",
    });
  }

  // التحقق من ساعات العمل
  if (data.workingHours > 48) {
    issues.push({
      severity: "error",
      category: "ساعات العمل",
      description: isArabic 
        ? `ساعات العمل الأسبوعية (${data.workingHours}) تتجاوز الحد القانوني (48 ساعة)`
        : `Weekly working hours (${data.workingHours}) exceed legal limit (48 hours)`,
      legalBasis: "المادة 98",
      recommendation: isArabic 
        ? "يجب تخفيض ساعات العمل لتتوافق مع النظام"
        : "Must reduce working hours to comply with regulations",
    });
  }

  // التحقق من الحد الأدنى للراتب (للسعوديين في نطاقات)
  if (data.nationality === "saudi" && data.salary < 4000) {
    issues.push({
      severity: "warning",
      category: "الراتب",
      description: isArabic 
        ? "الراتب أقل من الحد الأدنى لاحتساب السعودي في نطاقات (4000 ريال)"
        : "Salary below minimum for Nitaqat Saudi counting (4000 SAR)",
      legalBasis: "نطاقات",
      recommendation: isArabic 
        ? "لن يُحتسب الموظف ضمن نسبة السعودة في نطاقات"
        : "Employee will not count towards Saudization in Nitaqat",
    });
  }

  legalReferences.push({
    article: "50",
    title: "عقد العمل",
    titleEn: "Employment Contract",
    relevance: "متطلبات العقد الأساسية",
    content: contractArticles.article50?.content?.overview?.ar || "متطلبات عقد العمل الأساسية",
  });

  // التقييم
  const criticalIssues = issues.filter(i => i.severity === "critical").length;
  const errorIssues = issues.filter(i => i.severity === "error").length;
  const warningIssues = issues.filter(i => i.severity === "warning").length;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (criticalIssues > 0) riskLevel = "critical";
  else if (errorIssues > 0) riskLevel = "high";
  else if (warningIssues > 0) riskLevel = "medium";

  const complianceScore = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 20) - (warningIssues * 10));

  recommendations.push(isArabic 
    ? "سجّل العقد في منصة قوى لتوثيقه رسمياً"
    : "Register the contract in Qiwa platform for official documentation");

  const summary = isArabic
    ? `تحليل العقد: ${issues.length} ملاحظات، نسبة الامتثال: ${complianceScore}%`
    : `Contract analysis: ${issues.length} issues, compliance score: ${complianceScore}%`;

  const detailedAnalysis = await generateDetailedAnalysis(
    "contract",
    data,
    issues,
    legalReferences,
    language
  );

  return {
    isCompliant: issues.filter(i => i.severity === "critical" || i.severity === "error").length === 0,
    complianceScore,
    issues,
    recommendations,
    legalReferences,
    riskLevel,
    summary,
    detailedAnalysis,
  };
}

/**
 * فحص امتثال ساعات العمل
 */
async function checkWorkingHoursCompliance(
  data: WorkingHoursCheckData,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  const legalReferences: LegalReference[] = [];

  // تحميل بيانات نظام العمل
  const laborLaw = getLaborLaw();
  const workingHoursArticle = (laborLaw.articles as Record<string, any>).article98;
  
  const maxDaily = data.isRamadan && data.employeeReligion === "muslim" 
    ? (workingHoursArticle?.content?.ramadan?.maxDaily || 6)
    : (workingHoursArticle?.content?.maxDaily || 8);
  
  const maxWeekly = data.isRamadan && data.employeeReligion === "muslim"
    ? (workingHoursArticle?.content?.ramadan?.maxWeekly || 36)
    : (workingHoursArticle?.content?.maxWeekly || 48);
  
  const minRestPeriod = 30; // 30 دقيقة

  // التحقق من الساعات اليومية
  if (data.dailyHours > maxDaily) {
    issues.push({
      severity: "error",
      category: "ساعات العمل",
      description: isArabic 
        ? `ساعات العمل اليومية (${data.dailyHours}) تتجاوز الحد المسموح (${maxDaily} ساعات)`
        : `Daily working hours (${data.dailyHours}) exceed limit (${maxDaily} hours)`,
      legalBasis: "المادة 98",
      recommendation: isArabic 
        ? "خفض ساعات العمل اليومية"
        : "Reduce daily working hours",
    });
  }

  // التحقق من الساعات الأسبوعية
  if (data.weeklyHours > maxWeekly) {
    issues.push({
      severity: "error",
      category: "ساعات العمل",
      description: isArabic 
        ? `ساعات العمل الأسبوعية (${data.weeklyHours}) تتجاوز الحد المسموح (${maxWeekly} ساعة)`
        : `Weekly working hours (${data.weeklyHours}) exceed limit (${maxWeekly} hours)`,
      legalBasis: "المادة 98",
      recommendation: isArabic 
        ? "خفض ساعات العمل الأسبوعية"
        : "Reduce weekly working hours",
    });
  }

  // التحقق من فترات الراحة
  if (data.restPeriods < minRestPeriod) {
    issues.push({
      severity: "warning",
      category: "فترات الراحة",
      description: isArabic 
        ? `فترات الراحة (${data.restPeriods} دقيقة) أقل من المطلوب (30 دقيقة)`
        : `Rest periods (${data.restPeriods} min) less than required (30 min)`,
      legalBasis: "المادة 101",
      recommendation: isArabic 
        ? "يجب منح فترة راحة لا تقل عن 30 دقيقة"
        : "Must provide at least 30 minutes rest period",
    });
  }

  // التحقق من العمل الإضافي
  if (data.overtimeHours > 0) {
    issues.push({
      severity: "info",
      category: "العمل الإضافي",
      description: isArabic 
        ? `تم تسجيل ${data.overtimeHours} ساعات عمل إضافية`
        : `${data.overtimeHours} overtime hours recorded`,
      legalBasis: "المادة 106",
      recommendation: isArabic 
        ? `يجب دفع العمل الإضافي بمعدل 150% (${data.overtimeHours * 1.5} ساعة معادلة)`
        : `Overtime must be paid at 150% rate (${data.overtimeHours * 1.5} equivalent hours)`,
    });
    
    recommendations.push(isArabic 
      ? `تأكد من عدم تجاوز 720 ساعة عمل إضافية سنوياً`
      : `Ensure overtime doesn't exceed 720 hours annually`);
  }

  legalReferences.push({
    article: "98",
    title: "ساعات العمل",
    titleEn: "Working Hours",
    relevance: "الحد الأقصى لساعات العمل",
    content: workingHoursArticle?.content?.rules?.ar?.join("\n") || "لا تزيد ساعات العمل عن 8 ساعات يومياً أو 48 ساعة أسبوعياً",
  });

  const criticalIssues = issues.filter(i => i.severity === "critical").length;
  const errorIssues = issues.filter(i => i.severity === "error").length;
  const warningIssues = issues.filter(i => i.severity === "warning").length;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (criticalIssues > 0) riskLevel = "critical";
  else if (errorIssues > 0) riskLevel = "high";
  else if (warningIssues > 0) riskLevel = "medium";

  const complianceScore = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 20) - (warningIssues * 10));

  const summary = isArabic
    ? `تحليل ساعات العمل: ${issues.length} ملاحظات، نسبة الامتثال: ${complianceScore}%`
    : `Working hours analysis: ${issues.length} issues, compliance: ${complianceScore}%`;

  const detailedAnalysis = await generateDetailedAnalysis(
    "working_hours",
    data,
    issues,
    legalReferences,
    language
  );

  return {
    isCompliant: issues.filter(i => i.severity === "critical" || i.severity === "error").length === 0,
    complianceScore,
    issues,
    recommendations,
    legalReferences,
    riskLevel,
    summary,
    detailedAnalysis,
  };
}

/**
 * فحص امتثال الإجازات
 */
async function checkLeaveCompliance(
  data: LeaveCheckData,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  const legalReferences: LegalReference[] = [];

  // تحميل بيانات الإجازات من قاعدة المعرفة
  const laborLaw = getLaborLaw();
  const leaveArticles = laborLaw.articles as Record<string, any>;
  
  // قيم الإجازات الافتراضية
  const annualLeaveStandard = 21;
  const annualLeaveAfterFive = 30;
  const sickLeaveTotal = 120;
  const hajjLeaveDays = 15;
  const maternityLeaveDays = 70;

  switch (data.leaveType) {
    case "annual": {
      const annualEntitlement = data.yearsOfService >= 5 
        ? annualLeaveAfterFive 
        : annualLeaveStandard;
      
      if (data.requestedDays > annualEntitlement) {
        issues.push({
          severity: "error",
          category: "الإجازة السنوية",
          description: isArabic 
            ? `الأيام المطلوبة (${data.requestedDays}) تتجاوز المستحق (${annualEntitlement} يوم)`
            : `Requested days (${data.requestedDays}) exceed entitlement (${annualEntitlement} days)`,
          legalBasis: "المادة 109",
          recommendation: isArabic 
            ? "تخفيض أيام الإجازة أو تقديمها كإجازة بدون راتب"
            : "Reduce leave days or request as unpaid leave",
        });
      }
      
      legalReferences.push({
        article: "109",
        title: "الإجازة السنوية",
        titleEn: "Annual Leave",
        relevance: "استحقاق الإجازة السنوية",
        content: leaveArticles.article109?.content?.rules?.ar?.join("\n") || `إجازة سنوية ${annualLeaveStandard} يوم (${annualLeaveAfterFive} بعد 5 سنوات)`,
      });
      break;
    }

    case "sick":
      if (data.requestedDays + (data.previousLeaveTaken || 0) > sickLeaveTotal) {
        issues.push({
          severity: "warning",
          category: "الإجازة المرضية",
          description: isArabic 
            ? `تجاوز الحد الأقصى للإجازة المرضية (${sickLeaveTotal} يوم/سنة)`
            : `Exceeded maximum sick leave (${sickLeaveTotal} days/year)`,
          legalBasis: "المادة 117",
          recommendation: isArabic 
            ? "الأيام الإضافية ستكون بدون راتب أو إجازة سنوية"
            : "Additional days will be unpaid or from annual leave",
        });
      }
      
      legalReferences.push({
        article: "117",
        title: "الإجازة المرضية",
        titleEn: "Sick Leave",
        relevance: "قواعد الإجازة المرضية",
        content: leaveArticles.article117?.content?.rules?.ar?.join("\n") || "إجازة مرضية حتى 120 يوم",
      });
      break;

    case "hajj":
      if (data.hasPerformedHajj) {
        issues.push({
          severity: "error",
          category: "إجازة الحج",
          description: isArabic 
            ? "إجازة الحج متاحة فقط لمن لم يؤد الفريضة"
            : "Hajj leave only available for first-time pilgrims",
          legalBasis: "المادة 116",
          recommendation: isArabic 
            ? "يمكن طلب إجازة سنوية أو بدون راتب بدلاً عنها"
            : "Can request annual or unpaid leave instead",
        });
      }
      
      if (data.yearsOfService < 2) {
        issues.push({
          severity: "error",
          category: "إجازة الحج",
          description: isArabic 
            ? "إجازة الحج تتطلب سنتين خدمة متصلة"
            : "Hajj leave requires 2 continuous years of service",
          legalBasis: "المادة 116",
          recommendation: isArabic 
            ? "انتظر حتى إكمال سنتين خدمة"
            : "Wait until completing 2 years of service",
        });
      }
      
      if (data.requestedDays > hajjLeaveDays) {
        issues.push({
          severity: "warning",
          category: "إجازة الحج",
          description: isArabic 
            ? `الأيام المطلوبة تتجاوز الحد الأقصى (${hajjLeaveDays} يوم)`
            : `Requested days exceed maximum (${hajjLeaveDays} days)`,
          legalBasis: "المادة 116",
          recommendation: isArabic 
            ? "تخفيض أيام الإجازة"
            : "Reduce leave days",
        });
      }
      break;

    case "maternity":
      if (data.requestedDays > maternityLeaveDays) {
        issues.push({
          severity: "info",
          category: "إجازة الأمومة",
          description: isArabic 
            ? `الأيام الإضافية (${data.requestedDays - maternityLeaveDays}) ستكون بدون راتب`
            : `Additional days (${data.requestedDays - maternityLeaveDays}) will be unpaid`,
          legalBasis: "المادة 151",
          recommendation: isArabic 
            ? "يحق للموظفة تمديد إجازة الأمومة شهراً بدون راتب"
            : "Employee entitled to extend maternity leave by one month unpaid",
        });
      }
      break;
  }

  const criticalIssues = issues.filter(i => i.severity === "critical").length;
  const errorIssues = issues.filter(i => i.severity === "error").length;
  const warningIssues = issues.filter(i => i.severity === "warning").length;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (criticalIssues > 0) riskLevel = "critical";
  else if (errorIssues > 0) riskLevel = "high";
  else if (warningIssues > 0) riskLevel = "medium";

  const complianceScore = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 20) - (warningIssues * 10));

  const summary = isArabic
    ? `تحليل طلب الإجازة: ${issues.length} ملاحظات`
    : `Leave request analysis: ${issues.length} issues`;

  const detailedAnalysis = await generateDetailedAnalysis(
    "leave",
    data,
    issues,
    legalReferences,
    language
  );

  return {
    isCompliant: issues.filter(i => i.severity === "critical" || i.severity === "error").length === 0,
    complianceScore,
    issues,
    recommendations,
    legalReferences,
    riskLevel,
    summary,
    detailedAnalysis,
  };
}

/**
 * فحص امتثال الرواتب
 */
async function checkSalaryCompliance(
  data: SalaryCheckData,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  const issues: ComplianceIssue[] = [];
  const recommendations: string[] = [];
  const legalReferences: LegalReference[] = [];

  // التحقق من طريقة الدفع
  if (data.paymentMethod !== "bank") {
    issues.push({
      severity: "error",
      category: "طريقة الدفع",
      description: isArabic 
        ? "يجب تحويل الرواتب عبر البنوك (نظام حماية الأجور)"
        : "Salaries must be transferred via banks (Wage Protection System)",
      legalBasis: "نظام حماية الأجور",
      recommendation: isArabic 
        ? "التحويل البنكي إلزامي لجميع المنشآت"
        : "Bank transfer is mandatory for all establishments",
      penalty: isArabic 
        ? "غرامات وإيقاف خدمات"
        : "Fines and service suspension",
    });
  }

  // التحقق من التأخير
  if (!data.isOnTime && data.delayDays) {
    const severity = data.delayDays > 7 ? "error" : "warning";
    issues.push({
      severity,
      category: "موعد الدفع",
      description: isArabic 
        ? `تأخر الراتب ${data.delayDays} أيام`
        : `Salary delayed by ${data.delayDays} days`,
      legalBasis: "المادة 94 + نظام حماية الأجور",
      recommendation: isArabic 
        ? "يجب دفع الرواتب في موعدها المحدد"
        : "Salaries must be paid on time",
    });
  }

  // التحقق من الحد الأدنى للسعوديين
  if (data.nationality === "saudi" && data.totalSalary < 4000) {
    issues.push({
      severity: "warning",
      category: "الحد الأدنى",
      description: isArabic 
        ? "الراتب أقل من الحد الأدنى للاحتساب في نطاقات (4000 ريال)"
        : "Salary below Nitaqat minimum counting threshold (4000 SAR)",
      legalBasis: "نطاقات",
      recommendation: isArabic 
        ? "لن يُحتسب الموظف في نسبة السعودة"
        : "Employee won't count towards Saudization ratio",
    });
  }

  // حساب التأمينات الاجتماعية
  const gosiContributions = calculateGOSIFromKB(data.totalSalary, data.nationality === "saudi");
  recommendations.push(isArabic 
    ? `اشتراك التأمينات الاجتماعية: صاحب العمل ${gosiContributions.employerContribution.toFixed(2)} ريال، الموظف ${gosiContributions.employeeContribution.toFixed(2)} ريال`
    : `GOSI contributions: Employer ${gosiContributions.employerContribution.toFixed(2)} SAR, Employee ${gosiContributions.employeeContribution.toFixed(2)} SAR`);

  // تحميل قواعد الأجور من قاعدة المعرفة
  const laborLaw = getLaborLaw();
  const wagesArticle = (laborLaw.articles as Record<string, any>).article90;
  
  legalReferences.push({
    article: "90-94",
    title: "الأجور",
    titleEn: "Wages",
    relevance: "قواعد دفع الأجور",
    content: wagesArticle?.content?.rules?.ar?.join("\n") || "يجب دفع الأجور في مواعيدها المحددة",
  });

  const criticalIssues = issues.filter(i => i.severity === "critical").length;
  const errorIssues = issues.filter(i => i.severity === "error").length;
  const warningIssues = issues.filter(i => i.severity === "warning").length;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (criticalIssues > 0) riskLevel = "critical";
  else if (errorIssues > 0) riskLevel = "high";
  else if (warningIssues > 0) riskLevel = "medium";

  const complianceScore = Math.max(0, 100 - (criticalIssues * 30) - (errorIssues * 20) - (warningIssues * 10));

  const summary = isArabic
    ? `تحليل الرواتب: ${issues.length} ملاحظات، نسبة الامتثال: ${complianceScore}%`
    : `Salary analysis: ${issues.length} issues, compliance: ${complianceScore}%`;

  const detailedAnalysis = await generateDetailedAnalysis(
    "salary",
    data,
    issues,
    legalReferences,
    language
  );

  return {
    isCompliant: issues.filter(i => i.severity === "critical" || i.severity === "error").length === 0,
    complianceScore,
    issues,
    recommendations,
    legalReferences,
    riskLevel,
    summary,
    detailedAnalysis,
  };
}

/**
 * فحص عام
 */
async function performGeneralComplianceCheck(
  data: Record<string, any>,
  language: "ar" | "en"
): Promise<ComplianceCheckResult> {
  const isArabic = language === "ar";
  
  const systemPrompt = isArabic
    ? `أنت مستشار قانوني متخصص في نظام العمل السعودي. قم بتحليل البيانات المقدمة وتحديد أي مخالفات أو مخاطر قانونية.

قدم تحليلك بصيغة JSON تحتوي على:
- issues: قائمة المشاكل
- recommendations: التوصيات
- riskLevel: مستوى المخاطر (low/medium/high/critical)
- complianceScore: نسبة الامتثال (0-100)
- summary: ملخص التحليل`
    : `You are a legal consultant specialized in Saudi Labor Law. Analyze the provided data and identify any violations or legal risks.

Provide your analysis in JSON format containing:
- issues: list of issues
- recommendations: recommendations
- riskLevel: risk level (low/medium/high/critical)
- complianceScore: compliance score (0-100)
- summary: analysis summary`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(data, null, 2) },
    ], 2500);

    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonText);

    return {
      isCompliant: analysis.complianceScore >= 70,
      complianceScore: analysis.complianceScore || 50,
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || [],
      legalReferences: [],
      riskLevel: analysis.riskLevel || "medium",
      summary: analysis.summary || "",
      detailedAnalysis: "",
    };
  } catch (error) {
    console.error("General Compliance Check Error:", error);
    return {
      isCompliant: false,
      complianceScore: 0,
      issues: [{
        severity: "warning",
        category: "خطأ",
        description: isArabic ? "حدث خطأ في التحليل" : "Analysis error occurred",
        legalBasis: "",
        recommendation: isArabic ? "يرجى المحاولة مرة أخرى" : "Please try again",
      }],
      recommendations: [],
      legalReferences: [],
      riskLevel: "medium",
      summary: isArabic ? "حدث خطأ" : "Error occurred",
      detailedAnalysis: "",
    };
  }
}

/**
 * توليد التحليل المفصل
 */
async function generateDetailedAnalysis(
  type: string,
  data: Record<string, any>,
  issues: ComplianceIssue[],
  legalReferences: LegalReference[],
  language: "ar" | "en"
): Promise<string> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت مستشار قانوني متخصص في نظام العمل السعودي. قدم تحليلاً مفصلاً ومهنياً للحالة المعروضة.

اكتب تقريراً موجزاً يتضمن:
1. ملخص الوضع الحالي
2. النقاط الإيجابية
3. المخاطر والمشاكل
4. الخطوات المقترحة
5. المواد القانونية ذات الصلة`
    : `You are a legal consultant specialized in Saudi Labor Law. Provide a detailed and professional analysis.

Write a concise report including:
1. Current situation summary
2. Positive points
3. Risks and issues
4. Recommended steps
5. Relevant legal articles`;

  const userPrompt = isArabic
    ? `نوع الفحص: ${type}
البيانات: ${JSON.stringify(data, null, 2)}
المشاكل المكتشفة: ${issues.length}
المراجع القانونية: ${legalReferences.map(r => `المادة ${r.article}`).join("، ")}`
    : `Check type: ${type}
Data: ${JSON.stringify(data, null, 2)}
Issues found: ${issues.length}
Legal references: ${legalReferences.map(r => `Article ${r.article}`).join(", ")}`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 1500);

    return response.content;
  } catch (error) {
    console.error("Detailed Analysis Error:", error);
    return isArabic 
      ? "لم يتمكن النظام من توليد التحليل المفصل"
      : "System could not generate detailed analysis";
  }
}

// ============================================
// Exports
// ============================================

export {
  checkTerminationCompliance,
  checkContractCompliance,
  checkWorkingHoursCompliance,
  checkLeaveCompliance,
  checkSalaryCompliance
};

export const complianceChecker = {
  checkCompliance,
  checkTerminationCompliance,
  checkContractCompliance,
  checkWorkingHoursCompliance,
  checkLeaveCompliance,
  checkSalaryCompliance,
};

// ============================================
// Helper Functions for Knowledge Base
// ============================================

/**
 * حساب مكافأة نهاية الخدمة من قاعدة المعرفة
 */
function calculateEndOfServiceFromKB(
  salary: number,
  yearsOfService: number,
  terminationType: "employer" | "resignation" | "article80"
): number {
  // في حالة الفصل بموجب المادة 80 لا مكافأة
  if (terminationType === "article80") {
    return 0;
  }

  // حساب المكافأة الأساسية
  let amount = 0;
  
  // السنوات الخمس الأولى: نصف راتب شهري لكل سنة
  const firstFiveYears = Math.min(yearsOfService, 5);
  amount += firstFiveYears * (salary / 2);
  
  // ما بعد الخمس سنوات: راتب شهري كامل لكل سنة
  if (yearsOfService > 5) {
    const remainingYears = yearsOfService - 5;
    amount += remainingYears * salary;
  }
  
  // في حالة الاستقالة
  if (terminationType === "resignation") {
    if (yearsOfService < 2) {
      return 0; // لا مكافأة
    } else if (yearsOfService < 5) {
      return amount * (1/3); // ثلث المكافأة
    } else if (yearsOfService < 10) {
      return amount * (2/3); // ثلثي المكافأة
    }
    // 10 سنوات فأكثر: المكافأة كاملة
  }
  
  return amount;
}

/**
 * حساب اشتراكات التأمينات الاجتماعية من قاعدة المعرفة
 */
function calculateGOSIFromKB(
  salary: number,
  isSaudi: boolean
): { employerContribution: number; employeeContribution: number; total: number } {
  try {
    const gosiData = getGOSI();
    const rates = (gosiData as any).rates?.saudi || {
      annuities: { employer: 9, employee: 9 },
      saned: { employer: 0.75, employee: 0.75 },
      occupationalHazards: { employer: 2, employee: 0 }
    };
    
    const maxSalary = (gosiData as any).salaryLimits?.maximum || 45000;
    const cappedSalary = Math.min(salary, maxSalary);
    
    if (isSaudi) {
      const employerRate = rates.annuities.employer + rates.saned.employer + rates.occupationalHazards.employer;
      const employeeRate = rates.annuities.employee + rates.saned.employee;
      
      return {
        employerContribution: (cappedSalary * employerRate) / 100,
        employeeContribution: (cappedSalary * employeeRate) / 100,
        total: (cappedSalary * (employerRate + employeeRate)) / 100
      };
    } else {
      // غير السعوديين: أخطار مهنية فقط
      return {
        employerContribution: (cappedSalary * 2) / 100,
        employeeContribution: 0,
        total: (cappedSalary * 2) / 100
      };
    }
  } catch {
    // قيم افتراضية في حالة الخطأ
    if (isSaudi) {
      return {
        employerContribution: (salary * 11.75) / 100,
        employeeContribution: (salary * 9.75) / 100,
        total: (salary * 21.5) / 100
      };
    }
    return {
      employerContribution: (salary * 2) / 100,
      employeeContribution: 0,
      total: (salary * 2) / 100
    };
  }
}

export default complianceChecker;
