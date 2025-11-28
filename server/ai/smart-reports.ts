/**
 * AI Smart Reports Generator - توليد التقارير الذكية
 * Automated report generation with AI insights
 * 
 * متكامل مع قاعدة المعرفة للأنظمة السعودية
 * 
 * @module server/ai/smart-reports
 */

import { callLLM } from "../_core/llm";
import { logger } from "../utils/logger";
import { loadRegulation, searchRegulations, type Regulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Integration
// ============================================

let laborLawCache: Regulation | null = null;
let gosiCache: Regulation | null = null;
let nitaqatCache: Regulation | null = null;

/**
 * تحميل الأنظمة من قاعدة المعرفة
 */
function getRegulations(): { laborLaw: Regulation | null; gosi: Regulation | null; nitaqat: Regulation | null } {
  if (!laborLawCache) {
    try { laborLawCache = loadRegulation('labor-law'); } catch { /* ignore */ }
  }
  if (!gosiCache) {
    try { gosiCache = loadRegulation('gosi'); } catch { /* ignore */ }
  }
  if (!nitaqatCache) {
    try { nitaqatCache = loadRegulation('nitaqat'); } catch { /* ignore */ }
  }
  return { laborLaw: laborLawCache, gosi: gosiCache, nitaqat: nitaqatCache };
}

/**
 * الحصول على سياق قاعدة المعرفة للتقرير
 */
function getKBContextForReport(reportType: ReportType): string {
  const regulations = getRegulations();
  let context = '';
  
  const laborData = regulations.laborLaw as Record<string, unknown> | null;
  const gosiData = regulations.gosi as Record<string, unknown> | null;
  const nitaqatData = regulations.nitaqat as Record<string, unknown> | null;
  
  switch (reportType) {
    case 'salary_benchmark':
      if (laborData) {
        const wages = (laborData as Record<string, unknown>).wages as Record<string, unknown> | undefined;
        context += `\nمعلومات الرواتب من قاعدة المعرفة:\n`;
        context += `- الحد الأدنى لاحتساب نطاقات: ${(wages?.minimumWage as Record<string, unknown>)?.saudi ?? 4000} ريال\n`;
      }
      if (gosiData) {
        const contributions = (gosiData as Record<string, unknown>).contributions as Record<string, unknown> | undefined;
        context += `- نسبة خصم التأمينات (صاحب العمل): ${(contributions?.retirement as Record<string, unknown>)?.employer ?? 9}%\n`;
        context += `- نسبة خصم التأمينات (الموظف): ${(contributions?.retirement as Record<string, unknown>)?.employee ?? 9}%\n`;
      }
      break;
      
    case 'leave_utilization':
      if (laborData) {
        const leaves = (laborData as Record<string, unknown>).leaves as Record<string, unknown> | undefined;
        context += `\nمعلومات الإجازات من قاعدة المعرفة:\n`;
        const annual = (leaves?.article109 as Record<string, unknown>)?.duration as Record<string, unknown> | undefined;
        context += `- الإجازة السنوية: ${annual?.standard ?? 21} يوم (${annual?.afterFiveYears ?? 30} بعد 5 سنوات)\n`;
        context += `- الإجازة المرضية: حتى 120 يوم\n`;
      }
      break;
      
    case 'turnover_analysis':
      if (laborData) {
        context += `\nمعلومات الإنهاء من قاعدة المعرفة:\n`;
        context += `- فترة الإشعار: 60 يوم للعقود غير محددة المدة\n`;
        context += `- مكافأة نهاية الخدمة: نصف شهر لأول 5 سنوات، شهر بعدها\n`;
      }
      if (nitaqatData) {
        context += `- تأثير الدوران على نسبة السعودة\n`;
      }
      break;
      
    default: {
      // البحث العام في قاعدة المعرفة
      const searchResults = searchRegulations(reportType);
      if (searchResults.length > 0) {
        context += `\nمعلومات ذات صلة:\n`;
        searchResults.slice(0, 2).forEach(r => {
          const reg = r as Record<string, unknown>;
          context += `- ${reg.title || reg.id}\n`;
        });
      }
      break;
    }
  }
  
  return context;
}

// ============================================
// Types & Interfaces
// ============================================

export type ReportType = 
  | "monthly_hr"
  | "quarterly_performance"
  | "annual_summary"
  | "turnover_analysis"
  | "salary_benchmark"
  | "attendance_analysis"
  | "leave_utilization"
  | "training_roi"
  | "custom";

export interface ReportConfig {
  type: ReportType;
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  language: "ar" | "en";
  includeCharts: boolean;
  includeRecommendations: boolean;
  companyId?: string;
  department?: string;
  customPrompt?: string;
}

export interface ReportData {
  employees?: EmployeeData[];
  attendance?: AttendanceData[];
  leaves?: LeaveData[];
  performance?: PerformanceData[];
  salaries?: SalaryData[];
  training?: TrainingData[];
  turnover?: TurnoverData[];
}

export interface EmployeeData {
  id: string;
  name: string;
  department: string;
  position: string;
  hireDate: Date;
  status: "active" | "on-leave" | "terminated";
  salary?: number;
}

export interface AttendanceData {
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "present" | "absent" | "late" | "leave" | "holiday";
  hoursWorked?: number;
}

export interface LeaveData {
  employeeId: string;
  type: "annual" | "sick" | "unpaid" | "maternity" | "paternity" | "other";
  startDate: Date;
  endDate: Date;
  status: "approved" | "pending" | "rejected";
  days: number;
}

export interface PerformanceData {
  employeeId: string;
  period: string;
  rating: number; // 1-5
  goals: { target: string; achieved: boolean }[];
  feedback?: string;
}

export interface SalaryData {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
}

export interface TrainingData {
  programName: string;
  participants: number;
  completionRate: number;
  cost: number;
  effectivenessScore?: number;
}

export interface TurnoverData {
  month: string;
  hires: number;
  terminations: number;
  voluntaryExits: number;
  involuntaryExits: number;
}

export interface GeneratedReport {
  title: string;
  period: string;
  generatedAt: Date;
  language: "ar" | "en";
  sections: ReportSection[];
  executiveSummary: string;
  keyMetrics: KeyMetric[];
  insights: string[];
  recommendations: string[];
  chartData?: ChartData[];
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

export interface KeyMetric {
  name: string;
  value: string | number;
  change?: number; // percentage change
  trend: "up" | "down" | "stable";
  isPositive: boolean;
}

export interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut";
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

// ============================================
// Report Templates
// ============================================

const REPORT_TEMPLATES: Record<ReportType, { ar: string; en: string }> = {
  monthly_hr: {
    ar: "التقرير الشهري للموارد البشرية",
    en: "Monthly HR Report",
  },
  quarterly_performance: {
    ar: "تقرير الأداء الفصلي",
    en: "Quarterly Performance Report",
  },
  annual_summary: {
    ar: "الملخص السنوي للموارد البشرية",
    en: "Annual HR Summary",
  },
  turnover_analysis: {
    ar: "تحليل معدل دوران الموظفين",
    en: "Employee Turnover Analysis",
  },
  salary_benchmark: {
    ar: "تقرير مقارنة الرواتب",
    en: "Salary Benchmark Report",
  },
  attendance_analysis: {
    ar: "تحليل الحضور والانصراف",
    en: "Attendance Analysis Report",
  },
  leave_utilization: {
    ar: "تقرير استخدام الإجازات",
    en: "Leave Utilization Report",
  },
  training_roi: {
    ar: "تقرير العائد على الاستثمار في التدريب",
    en: "Training ROI Report",
  },
  custom: {
    ar: "تقرير مخصص",
    en: "Custom Report",
  },
};

// ============================================
// Report Generation
// ============================================

/**
 * Generate a comprehensive HR report
 * مع تكامل قاعدة المعرفة للامتثال السعودي
 */
export async function generateReport(
  config: ReportConfig,
  data: ReportData
): Promise<GeneratedReport> {
  logger.info("Generating report", { 
    context: "SmartReports", 
    type: config.type,
    language: config.language 
  });
  
  // الحصول على سياق قاعدة المعرفة
  const kbContext = getKBContextForReport(config.type);

  const systemPrompt = config.language === "ar"
    ? `أنت خبير في تحليل بيانات الموارد البشرية وكتابة التقارير الاحترافية المتوافقة مع الأنظمة السعودية.

قواعد التقرير:
- استخدم لغة عربية فصحى واضحة ومهنية
- قدم تحليلاً عميقاً مدعوماً بالأرقام
- استخدم نسب مئوية ومقارنات واضحة
- قدم رؤى استراتيجية قابلة للتطبيق
- اذكر الاتجاهات والأنماط الملحوظة
- قدم توصيات محددة وعملية
- تأكد من الامتثال لنظام العمل السعودي
- راجع متطلبات نطاقات والتأمينات الاجتماعية

${kbContext}

الناتج يجب أن يكون بصيغة JSON صالحة.`
    : `You are an expert in HR data analysis and professional report writing compliant with Saudi regulations.

Report guidelines:
- Use clear, professional English
- Provide deep analysis backed by numbers
- Use percentages and clear comparisons
- Offer actionable strategic insights
- Identify trends and patterns
- Provide specific, practical recommendations
- Ensure compliance with Saudi Labor Law
- Check Nitaqat and GOSI requirements

${kbContext}

Output must be valid JSON format.`;

  const reportTitle = REPORT_TEMPLATES[config.type][config.language];
  const periodStr = `${config.period.start.toISOString().split('T')[0]} - ${config.period.end.toISOString().split('T')[0]}`;

  const userPrompt = buildReportPrompt(config, data, reportTitle, periodStr);

  try {
    const response = await callLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4000,
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonRegex.exec(content) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content;
    
    const aiReport = JSON.parse(jsonStr);
    
    // إضافة معلومات الامتثال
    const complianceInfo = generateComplianceInfo(config.type, config.language);

    return {
      title: config.title || reportTitle,
      period: periodStr,
      generatedAt: new Date(),
      language: config.language,
      sections: [...(aiReport.sections || []), ...complianceInfo.sections],
      executiveSummary: aiReport.executiveSummary || "",
      keyMetrics: aiReport.keyMetrics || [],
      insights: [...(aiReport.insights || []), ...complianceInfo.insights],
      recommendations: config.includeRecommendations 
        ? [...(aiReport.recommendations || []), ...complianceInfo.recommendations] 
        : [],
      chartData: config.includeCharts ? generateChartData(data, config.type) : undefined,
    };
  } catch (error) {
    logger.error("Report generation failed", { context: "SmartReports", error });
    throw new Error(config.language === "ar" 
      ? "فشل في توليد التقرير" 
      : "Failed to generate report");
  }
}

/**
 * توليد معلومات الامتثال للتقرير
 */
function generateComplianceInfo(
  reportType: ReportType, 
  language: 'ar' | 'en'
): { sections: ReportSection[]; insights: string[]; recommendations: string[] } {
  const sections: ReportSection[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  const regulations = getRegulations();
  
  if (regulations.laborLaw || regulations.gosi || regulations.nitaqat) {
    if (language === 'ar') {
      sections.push({
        title: 'ملاحظات الامتثال',
        content: 'تم مراجعة التقرير وفقاً للأنظمة السعودية المعمول بها.',
        subsections: [
          { title: 'المصادر المرجعية', content: 'نظام العمل السعودي، نظام التأمينات الاجتماعية، برنامج نطاقات' }
        ]
      });
      
      if (reportType === 'salary_benchmark') {
        insights.push('تأكد من أن جميع الرواتب فوق الحد الأدنى لاحتساب نطاقات (4000 ريال)');
        recommendations.push('مراجعة رواتب السعوديين للتأكد من احتسابهم في نطاقات');
      } else if (reportType === 'leave_utilization') {
        insights.push('الإجازة السنوية المستحقة: 21 يوم (30 بعد 5 سنوات خدمة)');
        recommendations.push('متابعة رصيد الإجازات المتراكمة لتجنب المخالفات');
      } else if (reportType === 'turnover_analysis') {
        insights.push('معدل الدوران يؤثر على نسبة السعودة وتصنيف نطاقات');
        recommendations.push('تطوير برامج الاحتفاظ بالموظفين السعوديين');
      }
    } else {
      sections.push({
        title: 'Compliance Notes',
        content: 'This report has been reviewed according to applicable Saudi regulations.',
        subsections: [
          { title: 'Reference Sources', content: 'Saudi Labor Law, GOSI Regulations, Nitaqat Program' }
        ]
      });
      
      if (reportType === 'salary_benchmark') {
        insights.push('Ensure all salaries are above Nitaqat minimum (4,000 SAR)');
        recommendations.push('Review Saudi employee salaries for Nitaqat compliance');
      } else if (reportType === 'leave_utilization') {
        insights.push('Annual leave entitlement: 21 days (30 after 5 years of service)');
        recommendations.push('Monitor accumulated leave balance to avoid violations');
      } else if (reportType === 'turnover_analysis') {
        insights.push('Turnover rate affects Saudization percentage and Nitaqat classification');
        recommendations.push('Develop retention programs for Saudi employees');
      }
    }
  }
  
  return { sections, insights, recommendations };
}

/**
 * Build employee data section for prompt
 */
function buildEmployeeSection(employees: EmployeeData[], lang: "ar" | "en"): string {
  const active = employees.filter(e => e.status === "active").length;
  const onLeave = employees.filter(e => e.status === "on-leave").length;
  
  return lang === "ar"
    ? `بيانات الموظفين:\n- إجمالي الموظفين: ${employees.length}\n- نشط: ${active}\n- في إجازة: ${onLeave}\n\n`
    : `Employee Data:\n- Total employees: ${employees.length}\n- Active: ${active}\n- On leave: ${onLeave}\n\n`;
}

/**
 * Build attendance data section for prompt
 */
function buildAttendanceSection(attendance: AttendanceData[], lang: "ar" | "en"): string {
  const present = attendance.filter(a => a.status === "present").length;
  const absent = attendance.filter(a => a.status === "absent").length;
  const late = attendance.filter(a => a.status === "late").length;
  
  return lang === "ar"
    ? `بيانات الحضور:\n- إجمالي السجلات: ${attendance.length}\n- حضور: ${present}\n- غياب: ${absent}\n- تأخير: ${late}\n\n`
    : `Attendance Data:\n- Total records: ${attendance.length}\n- Present: ${present}\n- Absent: ${absent}\n- Late: ${late}\n\n`;
}

/**
 * Build leave data section for prompt
 */
function buildLeaveSection(leaves: LeaveData[], lang: "ar" | "en"): string {
  const approved = leaves.filter(l => l.status === "approved").length;
  const totalDays = leaves.reduce((sum, l) => sum + l.days, 0);
  
  return lang === "ar"
    ? `بيانات الإجازات:\n- إجمالي الطلبات: ${leaves.length}\n- المعتمدة: ${approved}\n- إجمالي الأيام: ${totalDays}\n\n`
    : `Leave Data:\n- Total requests: ${leaves.length}\n- Approved: ${approved}\n- Total days: ${totalDays}\n\n`;
}

/**
 * Build performance data section for prompt
 */
function buildPerformanceSection(performance: PerformanceData[], lang: "ar" | "en"): string {
  const avgRating = performance.reduce((sum, p) => sum + p.rating, 0) / performance.length;
  
  return lang === "ar"
    ? `بيانات الأداء:\n- عدد التقييمات: ${performance.length}\n- متوسط التقييم: ${avgRating.toFixed(2)}\n\n`
    : `Performance Data:\n- Number of evaluations: ${performance.length}\n- Average rating: ${avgRating.toFixed(2)}\n\n`;
}

/**
 * Build turnover data section for prompt
 */
function buildTurnoverSection(turnover: TurnoverData[], lang: "ar" | "en"): string {
  const totalHires = turnover.reduce((sum, t) => sum + t.hires, 0);
  const totalTerminations = turnover.reduce((sum, t) => sum + t.terminations, 0);
  
  return lang === "ar"
    ? `بيانات الدوران الوظيفي:\n- إجمالي التعيينات: ${totalHires}\n- إجمالي الإنهاءات: ${totalTerminations}\n\n`
    : `Turnover Data:\n- Total hires: ${totalHires}\n- Total terminations: ${totalTerminations}\n\n`;
}

/**
 * Build the prompt for report generation
 */
function buildReportPrompt(
  config: ReportConfig,
  data: ReportData,
  reportTitle: string,
  periodStr: string
): string {
  const lang = config.language;
  
  let prompt = lang === "ar"
    ? `قم بإنشاء ${reportTitle} للفترة: ${periodStr}\n\n`
    : `Create a ${reportTitle} for the period: ${periodStr}\n\n`;

  // Add data summaries using helper functions
  if (data.employees?.length) {
    prompt += buildEmployeeSection(data.employees, lang);
  }

  if (data.attendance?.length) {
    prompt += buildAttendanceSection(data.attendance, lang);
  }

  if (data.leaves?.length) {
    prompt += buildLeaveSection(data.leaves, lang);
  }

  if (data.performance?.length) {
    prompt += buildPerformanceSection(data.performance, lang);
  }

  if (data.turnover?.length) {
    prompt += buildTurnoverSection(data.turnover, lang);
  }

  // Request format
  prompt += lang === "ar"
    ? `\nقدم التقرير بالتنسيق التالي في JSON:
{
  "executiveSummary": "ملخص تنفيذي شامل",
  "keyMetrics": [
    {"name": "اسم المؤشر", "value": "القيمة", "change": نسبة_التغيير, "trend": "up|down|stable", "isPositive": true|false}
  ],
  "sections": [
    {"title": "عنوان القسم", "content": "محتوى تفصيلي"}
  ],
  "insights": ["رؤية 1", "رؤية 2"],
  "recommendations": ["توصية 1", "توصية 2"]
}`
    : `\nProvide the report in the following JSON format:
{
  "executiveSummary": "comprehensive executive summary",
  "keyMetrics": [
    {"name": "metric name", "value": "value", "change": percentage_change, "trend": "up|down|stable", "isPositive": true|false}
  ],
  "sections": [
    {"title": "section title", "content": "detailed content"}
  ],
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  return prompt;
}

/**
 * Generate chart data based on report data
 */
function generateChartData(data: ReportData, _reportType: ReportType): ChartData[] {
  const charts: ChartData[] = [];

  if (data.employees?.length) {
    // Department distribution
    const deptCounts: Record<string, number> = {};
    for (const e of data.employees) {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    }

    charts.push({
      type: "pie",
      title: "Employee Distribution by Department",
      labels: Object.keys(deptCounts),
      datasets: [{
        label: "Employees",
        data: Object.values(deptCounts),
      }],
    });
  }

  if (data.attendance?.length) {
    // Attendance status distribution
    const statusCounts = {
      present: data.attendance.filter(a => a.status === "present").length,
      absent: data.attendance.filter(a => a.status === "absent").length,
      late: data.attendance.filter(a => a.status === "late").length,
      leave: data.attendance.filter(a => a.status === "leave").length,
    };

    charts.push({
      type: "doughnut",
      title: "Attendance Status Distribution",
      labels: ["Present", "Absent", "Late", "Leave"],
      datasets: [{
        label: "Attendance",
        data: Object.values(statusCounts),
      }],
    });
  }

  if (data.turnover?.length) {
    charts.push({
      type: "bar",
      title: "Monthly Turnover",
      labels: data.turnover.map(t => t.month),
      datasets: [
        {
          label: "Hires",
          data: data.turnover.map(t => t.hires),
          color: "#22c55e",
        },
        {
          label: "Terminations",
          data: data.turnover.map(t => t.terminations),
          color: "#ef4444",
        },
      ],
    });
  }

  if (data.performance?.length) {
    // Performance rating distribution
    const ratings = [1, 2, 3, 4, 5];
    const ratingCounts = ratings.map(r => 
      data.performance!.filter(p => Math.round(p.rating) === r).length
    );

    charts.push({
      type: "bar",
      title: "Performance Rating Distribution",
      labels: ["1 - Poor", "2 - Below Avg", "3 - Average", "4 - Good", "5 - Excellent"],
      datasets: [{
        label: "Employees",
        data: ratingCounts,
      }],
    });
  }

  return charts;
}

// ============================================
// Quick Insights
// ============================================

/**
 * Generate quick insights from HR data
 * مع تكامل قاعدة المعرفة
 */
export async function generateQuickInsights(
  data: ReportData,
  language: "ar" | "en" = "en"
): Promise<string[]> {
  // الحصول على سياق من قاعدة المعرفة
  const regulations = getRegulations();
  let kbContext = '';
  
  if (regulations.laborLaw || regulations.nitaqat) {
    kbContext = language === 'ar' 
      ? '\nملاحظة: تحقق من امتثال البيانات لنظام العمل السعودي ونطاقات.'
      : '\nNote: Check data compliance with Saudi Labor Law and Nitaqat.';
  }
  
  const prompt = language === "ar"
    ? `قدم 5 رؤى سريعة ومهمة من بيانات الموارد البشرية التالية بصيغة JSON array من النصوص.${kbContext}`
    : `Provide 5 quick and important insights from the following HR data as a JSON array of strings.${kbContext}`;

  try {
    const response = await callLLM({
      messages: [
        { role: "user", content: `${prompt}\n\nData: ${JSON.stringify(data, null, 2)}` },
      ],
      maxTokens: 500,
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "[]";
    const jsonRegex = /\[[\s\S]*\]/;
    const jsonMatch = jsonRegex.exec(content) || [content];
    
    const insights = JSON.parse(jsonMatch[0]) as string[];
    
    // إضافة رؤية امتثال إذا كانت البيانات تحتوي على معلومات ذات صلة
    if (data.salaries?.length && regulations.laborLaw) {
      insights.push(language === 'ar' 
        ? 'تأكد من احتساب جميع السعوديين في نطاقات (الحد الأدنى 4000 ريال)'
        : 'Ensure all Saudis are counted in Nitaqat (minimum 4,000 SAR)');
    }
    
    return insights.slice(0, 6);
  } catch (error) {
    logger.error("Quick insights generation failed", { context: "SmartReports", error });
    return [];
  }
}

// ============================================
// New Compliance Report Functions
// ============================================

/**
 * توليد تقرير الامتثال السعودي
 */
export async function generateComplianceReport(
  data: ReportData,
  language: 'ar' | 'en' = 'ar'
): Promise<{
  overallCompliance: number;
  categories: Array<{
    name: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }>;
  summary: string;
}> {
  const regulations = getRegulations();
  const categories: Array<{
    name: string;
    score: number;
    issues: string[];
    recommendations: string[];
  }> = [];
  
  // تحليل امتثال الرواتب
  if (data.salaries?.length) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // التحقق من الحد الأدنى للرواتب
    const belowMinimum = data.salaries.filter(s => s.baseSalary < 4000);
    if (belowMinimum.length > 0) {
      score -= (belowMinimum.length / data.salaries.length) * 50;
      issues.push(language === 'ar' 
        ? `${belowMinimum.length} موظف براتب أقل من 4000 ريال`
        : `${belowMinimum.length} employees with salary below 4,000 SAR`);
      recommendations.push(language === 'ar'
        ? 'رفع رواتب السعوديين إلى الحد الأدنى لاحتسابهم في نطاقات'
        : 'Raise Saudi salaries to minimum for Nitaqat counting');
    }
    
    categories.push({
      name: language === 'ar' ? 'امتثال الرواتب' : 'Salary Compliance',
      score: Math.max(0, Math.round(score)),
      issues,
      recommendations
    });
  }
  
  // تحليل امتثال الإجازات
  if (data.leaves?.length) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // التحقق من الإجازات المرفوضة بدون سبب
    const rejected = data.leaves.filter(l => l.status === 'rejected');
    if (rejected.length > data.leaves.length * 0.3) {
      score -= 20;
      issues.push(language === 'ar'
        ? 'نسبة مرتفعة من الإجازات المرفوضة'
        : 'High rejection rate for leave requests');
    }
    
    categories.push({
      name: language === 'ar' ? 'امتثال الإجازات' : 'Leave Compliance',
      score: Math.max(0, Math.round(score)),
      issues,
      recommendations
    });
  }
  
  // حساب الامتثال الإجمالي
  const overallCompliance = categories.length > 0
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : 100;
  
  const summary = language === 'ar'
    ? `مستوى الامتثال العام: ${overallCompliance}%. ${categories.length} فئات تم تحليلها.`
    : `Overall compliance level: ${overallCompliance}%. ${categories.length} categories analyzed.`;
  
  return {
    overallCompliance,
    categories,
    summary
  };
}

// ============================================
// Export
// ============================================

export const smartReports = {
  generateReport,
  generateQuickInsights,
  generateComplianceReport,
  REPORT_TEMPLATES,
};

export default smartReports;
