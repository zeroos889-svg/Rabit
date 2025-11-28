/**
 * AI Performance Evaluator - نظام تقييم الأداء الذكي
 * يستخدم الذكاء الاصطناعي لتقييم أداء الموظفين وتقديم توصيات مفصلة
 * مع دعم كامل للأنظمة السعودية ومعايير الأداء المحلية
 */

import { invokeLLM, type Message } from "../_core/llm";
import { loadRegulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Integration
// ============================================

function getLaborLaw() {
  return loadRegulation('labor-law');
}

function getGOSI() {
  return loadRegulation('gosi');
}

/**
 * الحصول على معايير الأداء من نظام العمل
 */
function getPerformanceStandards(): {
  probationPeriod: number;
  maxProbation: number;
  annualReviewRequired: boolean;
  terminationNotice: Record<string, number>;
} {
  const laborLaw = getLaborLaw() as Record<string, any>;
  
  return {
    probationPeriod: laborLaw?.probationPeriod?.standard || 90,
    maxProbation: laborLaw?.probationPeriod?.maximum || 180,
    annualReviewRequired: true,
    terminationNotice: {
      underTwoYears: 30,
      twoToFiveYears: 60,
      overFiveYears: 90
    }
  };
}

/**
 * التحقق من فترة التجربة
 */
function checkProbationStatus(
  joiningDate: string,
  probationExtended: boolean = false
): {
  inProbation: boolean;
  daysRemaining: number;
  canTerminate: boolean;
  notes: string[];
} {
  const standards = getPerformanceStandards();
  const joinDate = new Date(joiningDate);
  const today = new Date();
  const daysSinceJoining = Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const probationDays = probationExtended ? standards.maxProbation : standards.probationPeriod;
  const inProbation = daysSinceJoining <= probationDays;
  const daysRemaining = Math.max(0, probationDays - daysSinceJoining);
  
  const notes: string[] = [];
  if (inProbation) {
    notes.push(`الموظف في فترة التجربة (${daysRemaining} يوم متبقي)`);
    notes.push('يمكن إنهاء العقد خلال فترة التجربة بدون تعويض');
  } else {
    notes.push('انتهت فترة التجربة');
    notes.push('يجب الالتزام بفترة الإشعار عند إنهاء العقد');
  }
  
  return {
    inProbation,
    daysRemaining,
    canTerminate: inProbation,
    notes
  };
}

// Helper function to simplify AI calls
async function callAI(messages: Message[], maxTokens = 3000) {
  const result = await invokeLLM({
    messages,
    max_tokens: maxTokens,
  });
  
  // Extract text from the response
  const content = result.choices?.[0]?.message?.content;
  
  // Convert content to string
  if (typeof content === "string") {
    return { content };
  }
  
  // If it's an array, extract text parts
  if (Array.isArray(content)) {
    const textParts = content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text || "");
    return { content: textParts.join("\n") };
  }
  
  return { content: "" };
}

interface PerformanceMetrics {
  attendanceRate: number; // نسبة الحضور
  taskCompletionRate: number; // نسبة إنجاز المهام
  qualityScore: number; // درجة الجودة
  teamworkScore: number; // درجة العمل الجماعي
  punctualityScore: number; // درجة الالتزام بالمواعيد
  initiativeScore: number; // درجة المبادرة
  customerSatisfaction?: number; // رضا العملاء (اختياري)
  salesPerformance?: number; // الأداء البيعي (اختياري)
}

interface PerformanceData {
  employeeId: number;
  employeeName: string;
  position: string;
  department: string;
  joiningDate: string;
  metrics: PerformanceMetrics;
  achievements?: string[];
  challenges?: string[];
  previousReviews?: string[];
  goals?: string[];
}

interface PerformanceEvaluation {
  overallScore: number; // الدرجة الإجمالية (0-100)
  rating: "excellent" | "very_good" | "good" | "needs_improvement" | "poor";
  ratingAr: "ممتاز" | "جيد جداً" | "جيد" | "يحتاج تحسين" | "ضعيف";
  strengths: string[]; // نقاط القوة
  weaknesses: string[]; // نقاط الضعف
  recommendations: string[]; // التوصيات
  trainingNeeds: string[]; // احتياجات التدريب
  careerPath: string; // المسار الوظيفي المقترح
  salaryRecommendation: {
    action: "increase" | "maintain" | "review";
    percentage?: number;
    reason: string;
  };
  promotionReadiness: {
    ready: boolean;
    timeline: string; // متى يكون جاهزاً
    requirements: string[]; // المتطلبات
  };
  detailedAnalysis: string; // تحليل مفصل
  actionPlan: {
    shortTerm: string[]; // خطة قصيرة المدى (1-3 أشهر)
    mediumTerm: string[]; // خطة متوسطة المدى (3-6 أشهر)
    longTerm: string[]; // خطة طويلة المدى (6-12 شهر)
  };
}

/**
 * تقييم أداء موظف باستخدام الذكاء الاصطناعي
 */
export async function evaluateEmployeePerformance(
  data: PerformanceData,
  language: "ar" | "en" = "ar"
): Promise<PerformanceEvaluation> {
  const isArabic = language === "ar";

  // بناء السياق للذكاء الاصطناعي
  const metricsText = `
- معدل الحضور: ${data.metrics.attendanceRate}%
- معدل إنجاز المهام: ${data.metrics.taskCompletionRate}%
- درجة الجودة: ${data.metrics.qualityScore}/10
- درجة العمل الجماعي: ${data.metrics.teamworkScore}/10
- درجة الالتزام بالمواعيد: ${data.metrics.punctualityScore}/10
- درجة المبادرة: ${data.metrics.initiativeScore}/10
${data.metrics.customerSatisfaction ? `- رضا العملاء: ${data.metrics.customerSatisfaction}/10` : ""}
${data.metrics.salesPerformance ? `- الأداء البيعي: ${data.metrics.salesPerformance}%` : ""}
  `.trim();

  const achievementsText = data.achievements?.length
    ? `الإنجازات:\n${data.achievements.map((a) => `- ${a}`).join("\n")}`
    : "";

  const challengesText = data.challenges?.length
    ? `التحديات:\n${data.challenges.map((c) => `- ${c}`).join("\n")}`
    : "";

  const goalsText = data.goals?.length
    ? `الأهداف المحددة:\n${data.goals.map((g) => `- ${g}`).join("\n")}`
    : "";

  const systemPrompt = isArabic
    ? `أنت مستشار موارد بشرية خبير متخصص في تقييم أداء الموظفين. مهمتك تحليل بيانات أداء الموظف وتقديم تقييم شامل ومفصل.

المعايير المطلوبة:
1. تحليل موضوعي وعادل بناءً على البيانات الفعلية
2. تقديم نقاط القوة والضعف بوضوح
3. توصيات عملية وقابلة للتطبيق
4. تحديد احتياجات التدريب بدقة
5. اقتراح مسار وظيفي مناسب
6. تقييم الجاهزية للترقية
7. توصية بشأن الراتب مع التبرير
8. خطة عمل واضحة (قصيرة/متوسطة/طويلة المدى)

قدم تقييماً احترافياً يساعد الموظف على التطور والنمو.`
    : `You are an expert HR consultant specializing in employee performance evaluation. Your task is to analyze employee performance data and provide a comprehensive, detailed assessment.

Required criteria:
1. Objective and fair analysis based on actual data
2. Clear identification of strengths and weaknesses
3. Practical, actionable recommendations
4. Precise training needs identification
5. Appropriate career path suggestions
6. Promotion readiness assessment
7. Salary recommendation with justification
8. Clear action plan (short/medium/long term)

Provide a professional evaluation that helps the employee develop and grow.`;

  const userPrompt = isArabic
    ? `قم بتقييم أداء الموظف التالي:

**معلومات الموظف:**
- الاسم: ${data.employeeName}
- المسمى الوظيفي: ${data.position}
- القسم: ${data.department}
- تاريخ الالتحاق: ${data.joiningDate}

**مقاييس الأداء:**
${metricsText}

${achievementsText}
${challengesText}
${goalsText}

قدم تقييماً شاملاً بصيغة JSON يحتوي على:
{
  "overallScore": <رقم من 0-100>,
  "rating": <"excellent" أو "very_good" أو "good" أو "needs_improvement" أو "poor">,
  "ratingAr": <الترجمة العربية>,
  "strengths": [<قائمة نقاط القوة، 5-7 نقاط>],
  "weaknesses": [<قائمة نقاط الضعف، 3-5 نقاط>],
  "recommendations": [<توصيات محددة، 5-8 توصيات>],
  "trainingNeeds": [<احتياجات التدريب، 3-5 دورات/مهارات>],
  "careerPath": "<المسار الوظيفي المقترح>",
  "salaryRecommendation": {
    "action": "<increase أو maintain أو review>",
    "percentage": <نسبة الزيادة المقترحة إن وجدت>,
    "reason": "<سبب التوصية>"
  },
  "promotionReadiness": {
    "ready": <true أو false>,
    "timeline": "<متى يكون جاهزاً>",
    "requirements": [<المتطلبات للترقية>]
  },
  "detailedAnalysis": "<تحليل مفصل شامل>",
  "actionPlan": {
    "shortTerm": [<أهداف 1-3 أشهر>],
    "mediumTerm": [<أهداف 3-6 أشهر>],
    "longTerm": [<أهداف 6-12 شهر>]
  }
}

تأكد من:
- الدقة في التقييم بناءً على الأرقام الفعلية
- التوازن بين الإيجابيات والسلبيات
- التوصيات العملية القابلة للتطبيق
- الاحترافية في الصياغة`
    : `Evaluate the following employee's performance:

**Employee Information:**
- Name: ${data.employeeName}
- Position: ${data.position}
- Department: ${data.department}
- Joining Date: ${data.joiningDate}

**Performance Metrics:**
${metricsText}

${achievementsText}
${challengesText}
${goalsText}

Provide a comprehensive evaluation in JSON format containing:
{
  "overallScore": <number 0-100>,
  "rating": <"excellent" or "very_good" or "good" or "needs_improvement" or "poor">,
  "ratingAr": <Arabic translation>,
  "strengths": [<list of strengths, 5-7 points>],
  "weaknesses": [<list of weaknesses, 3-5 points>],
  "recommendations": [<specific recommendations, 5-8 items>],
  "trainingNeeds": [<training needs, 3-5 courses/skills>],
  "careerPath": "<suggested career path>",
  "salaryRecommendation": {
    "action": "<increase or maintain or review>",
    "percentage": <suggested increase percentage if any>,
    "reason": "<reason for recommendation>"
  },
  "promotionReadiness": {
    "ready": <true or false>,
    "timeline": "<when ready>",
    "requirements": [<requirements for promotion>]
  },
  "detailedAnalysis": "<comprehensive detailed analysis>",
  "actionPlan": {
    "shortTerm": [<goals for 1-3 months>],
    "mediumTerm": [<goals for 3-6 months>],
    "longTerm": [<goals for 6-12 months>]
  }
}

Ensure:
- Accuracy in evaluation based on actual numbers
- Balance between positives and negatives
- Practical, actionable recommendations
- Professional wording`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 3000);

    // استخراج JSON من الرد
    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const evaluation = JSON.parse(jsonText) as PerformanceEvaluation;

    // التحقق من اكتمال البيانات
    if (!evaluation.overallScore || !evaluation.rating) {
      throw new Error("Incomplete evaluation data");
    }

    return evaluation;
  } catch (error) {
    console.error("Performance Evaluation Error:", error);

    // إرجاع تقييم افتراضي في حالة الخطأ
    return {
      overallScore: calculateBasicScore(data.metrics),
      rating: getRating(calculateBasicScore(data.metrics)),
      ratingAr: getRatingAr(calculateBasicScore(data.metrics)),
      strengths: [
        isArabic ? "يظهر التزاماً بالعمل" : "Shows commitment to work",
      ],
      weaknesses: [
        isArabic
          ? "يحتاج إلى تحسين في بعض المجالات"
          : "Needs improvement in some areas",
      ],
      recommendations: [
        isArabic
          ? "مراجعة الأداء مع المشرف المباشر"
          : "Review performance with direct supervisor",
      ],
      trainingNeeds: [isArabic ? "تحديد الاحتياجات التدريبية" : "Identify training needs"],
      careerPath: isArabic ? "يحتاج لتقييم أعمق" : "Needs deeper evaluation",
      salaryRecommendation: {
        action: "maintain",
        reason: isArabic
          ? "يحتاج لتقييم أكثر تفصيلاً"
          : "Needs more detailed evaluation",
      },
      promotionReadiness: {
        ready: false,
        timeline: isArabic ? "يحتاج لتقييم أعمق" : "Needs deeper evaluation",
        requirements: [],
      },
      detailedAnalysis: isArabic
        ? "حدث خطأ في التحليل المفصل. يرجى المحاولة مرة أخرى."
        : "Error in detailed analysis. Please try again.",
      actionPlan: {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
      },
    };
  }
}

/**
 * حساب الدرجة الأساسية بناءً على المقاييس
 */
function calculateBasicScore(metrics: PerformanceMetrics): number {
  const weights = {
    attendance: 0.15,
    taskCompletion: 0.25,
    quality: 0.2,
    teamwork: 0.15,
    punctuality: 0.1,
    initiative: 0.15,
  };

  const score =
    metrics.attendanceRate * weights.attendance +
    metrics.taskCompletionRate * weights.taskCompletion +
    metrics.qualityScore * 10 * weights.quality +
    metrics.teamworkScore * 10 * weights.teamwork +
    metrics.punctualityScore * 10 * weights.punctuality +
    metrics.initiativeScore * 10 * weights.initiative;

  return Math.round(score);
}

/**
 * تحديد التقييم بناءً على الدرجة
 */
function getRating(
  score: number
): "excellent" | "very_good" | "good" | "needs_improvement" | "poor" {
  if (score >= 90) return "excellent";
  if (score >= 80) return "very_good";
  if (score >= 70) return "good";
  if (score >= 60) return "needs_improvement";
  return "poor";
}

/**
 * تحديد التقييم بالعربية
 */
function getRatingAr(
  score: number
): "ممتاز" | "جيد جداً" | "جيد" | "يحتاج تحسين" | "ضعيف" {
  if (score >= 90) return "ممتاز";
  if (score >= 80) return "جيد جداً";
  if (score >= 70) return "جيد";
  if (score >= 60) return "يحتاج تحسين";
  return "ضعيف";
}

/**
 * مقارنة أداء موظف مع المتوسط في القسم
 */
export async function comparePerformanceWithDepartment(
  employeeData: PerformanceData,
  departmentAverage: PerformanceMetrics,
  language: "ar" | "en" = "ar"
): Promise<{
  comparison: string;
  insights: string[];
  recommendations: string[];
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت محلل موارد بشرية خبير. قارن أداء الموظف مع متوسط القسم وقدم رؤى وتوصيات.`
    : `You are an expert HR analyst. Compare employee performance with department average and provide insights and recommendations.`;

  const userPrompt = isArabic
    ? `قارن أداء الموظف التالي مع متوسط القسم:

**أداء الموظف:**
${JSON.stringify(employeeData.metrics, null, 2)}

**متوسط القسم:**
${JSON.stringify(departmentAverage, null, 2)}

قدم:
1. مقارنة تفصيلية
2. رؤى حول الفجوات والتميز
3. توصيات محددة للتحسين

بصيغة JSON:
{
  "comparison": "<نص المقارنة>",
  "insights": [<قائمة الرؤى>],
  "recommendations": [<قائمة التوصيات>]
}`
    : `Compare the following employee's performance with department average:

**Employee Performance:**
${JSON.stringify(employeeData.metrics, null, 2)}

**Department Average:**
${JSON.stringify(departmentAverage, null, 2)}

Provide:
1. Detailed comparison
2. Insights on gaps and excellence
3. Specific recommendations for improvement

In JSON format:
{
  "comparison": "<comparison text>",
  "insights": [<list of insights>],
  "recommendations": [<list of recommendations>]
}`;

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

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Comparison Error:", error);
    return {
      comparison: isArabic
        ? "حدث خطأ في المقارنة"
        : "Error in comparison",
      insights: [],
      recommendations: [],
    };
  }
}

/**
 * توليد خطة تطوير شخصية للموظف
 */
export async function generateDevelopmentPlan(
  evaluation: PerformanceEvaluation,
  employeeName: string,
  position: string,
  language: "ar" | "en" = "ar"
): Promise<{
  plan: string;
  milestones: Array<{
    month: number;
    goal: string;
    metrics: string;
  }>;
  resources: string[];
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت مستشار تطوير مهني. قم بإنشاء خطة تطوير شخصية مفصلة للموظف بناءً على تقييم أدائه.`
    : `You are a professional development consultant. Create a detailed personal development plan for the employee based on their performance evaluation.`;

  const userPrompt = isArabic
    ? `أنشئ خطة تطوير شخصية للموظف:

**الموظف:** ${employeeName}
**المسمى الوظيفي:** ${position}

**نتائج التقييم:**
- الدرجة الإجمالية: ${evaluation.overallScore}/100
- التقييم: ${evaluation.ratingAr}
- نقاط القوة: ${evaluation.strengths.join(", ")}
- نقاط الضعف: ${evaluation.weaknesses.join(", ")}
- احتياجات التدريب: ${evaluation.trainingNeeds.join(", ")}

قدم خطة تطوير شاملة بصيغة JSON:
{
  "plan": "<نص الخطة التفصيلية>",
  "milestones": [
    {
      "month": <رقم الشهر>,
      "goal": "<الهدف>",
      "metrics": "<مقاييس النجاح>"
    }
  ],
  "resources": [<قائمة الموارد والدورات المقترحة>]
}`
    : `Create a personal development plan for the employee:

**Employee:** ${employeeName}
**Position:** ${position}

**Evaluation Results:**
- Overall Score: ${evaluation.overallScore}/100
- Rating: ${evaluation.rating}
- Strengths: ${evaluation.strengths.join(", ")}
- Weaknesses: ${evaluation.weaknesses.join(", ")}
- Training Needs: ${evaluation.trainingNeeds.join(", ")}

Provide a comprehensive development plan in JSON format:
{
  "plan": "<detailed plan text>",
  "milestones": [
    {
      "month": <month number>,
      "goal": "<goal>",
      "metrics": "<success metrics>"
    }
  ],
  "resources": [<list of suggested resources and courses>]
}`;

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

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Development Plan Error:", error);
    return {
      plan: isArabic
        ? "حدث خطأ في إنشاء الخطة"
        : "Error creating plan",
      milestones: [],
      resources: [],
    };
  }
}

// ============================================
// Saudi Compliance Functions
// ============================================

/**
 * تقييم الأداء مع التحقق من الامتثال لنظام العمل السعودي
 */
export async function evaluateWithCompliance(
  data: PerformanceData,
  language: "ar" | "en" = "ar"
): Promise<{
  evaluation: PerformanceEvaluation;
  probationStatus: ReturnType<typeof checkProbationStatus>;
  complianceNotes: string[];
  legalConsiderations: string[];
}> {
  const isArabic = language === "ar";
  
  // 1. التقييم الأساسي
  const evaluation = await evaluateEmployeePerformance(data, language);
  
  // 2. التحقق من فترة التجربة
  const probationStatus = checkProbationStatus(data.joiningDate);
  
  // 3. ملاحظات الامتثال
  const complianceNotes: string[] = [];
  const legalConsiderations: string[] = [];
  
  // التحقق من معدل الحضور
  if (data.metrics.attendanceRate < 75) {
    complianceNotes.push(isArabic
      ? 'معدل الحضور منخفض - قد يؤثر على استحقاق المكافآت'
      : 'Low attendance rate - may affect bonus eligibility');
    legalConsiderations.push(isArabic
      ? 'المادة 80: يجوز للموظف التغيب بدون أجر لمدة لا تزيد عن 20 يوماً متفرقة'
      : 'Article 80: Employee may be absent without pay for up to 20 non-consecutive days');
  }
  
  // التحقق من الأداء في فترة التجربة
  if (probationStatus.inProbation && evaluation.overallScore < 60) {
    legalConsiderations.push(isArabic
      ? 'الموظف في فترة التجربة مع أداء ضعيف - يمكن إنهاء العقد بدون تعويض'
      : 'Employee in probation with poor performance - contract can be terminated without compensation');
  }
  
  // توصيات بناءً على التقييم
  if (evaluation.rating === 'poor' && !probationStatus.inProbation) {
    legalConsiderations.push(isArabic
      ? 'يجب توثيق الأداء الضعيف وإعطاء فرصة للتحسين قبل اتخاذ إجراءات تأديبية'
      : 'Poor performance must be documented and improvement opportunity given before disciplinary action');
  }
  
  if (evaluation.rating === 'excellent') {
    complianceNotes.push(isArabic
      ? 'الموظف مؤهل للترقية والمكافآت حسب سياسة الشركة'
      : 'Employee eligible for promotion and bonuses per company policy');
  }
  
  return {
    evaluation,
    probationStatus,
    complianceNotes,
    legalConsiderations
  };
}

/**
 * حساب استحقاقات نهاية الخدمة بناءً على الأداء
 */
export function calculateEndOfServiceBenefits(
  joiningDate: string,
  salary: number,
  terminationReason: 'resignation' | 'termination' | 'end_of_contract' | 'retirement',
  performanceRating: 'excellent' | 'very_good' | 'good' | 'needs_improvement' | 'poor'
): {
  yearsOfService: number;
  basicEntitlement: number;
  performanceBonus: number;
  totalEntitlement: number;
  breakdown: string[];
} {
  const joinDate = new Date(joiningDate);
  const today = new Date();
  const yearsOfService = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  let basicEntitlement = 0;
  const breakdown: string[] = [];
  
  // حساب مكافأة نهاية الخدمة حسب نظام العمل السعودي
  if (yearsOfService <= 5) {
    basicEntitlement = (salary / 2) * yearsOfService;
    breakdown.push(`أول 5 سنوات: نصف راتب شهري لكل سنة = ${basicEntitlement.toFixed(2)} ريال`);
  } else {
    const firstFiveYears = (salary / 2) * 5;
    const remainingYears = salary * (yearsOfService - 5);
    basicEntitlement = firstFiveYears + remainingYears;
    breakdown.push(`أول 5 سنوات: ${firstFiveYears.toFixed(2)} ريال`);
    breakdown.push(`السنوات التالية: ${remainingYears.toFixed(2)} ريال`);
  }
  
  // تعديل حسب سبب انتهاء الخدمة
  if (terminationReason === 'resignation' && yearsOfService < 2) {
    basicEntitlement = 0;
    breakdown.push('الاستقالة قبل سنتين: لا يستحق مكافأة');
  } else if (terminationReason === 'resignation' && yearsOfService < 5) {
    basicEntitlement = basicEntitlement * (1/3);
    breakdown.push('الاستقالة بين 2-5 سنوات: ثلث المكافأة');
  } else if (terminationReason === 'resignation' && yearsOfService < 10) {
    basicEntitlement = basicEntitlement * (2/3);
    breakdown.push('الاستقالة بين 5-10 سنوات: ثلثي المكافأة');
  }
  
  // مكافأة الأداء المتميز
  let performanceBonus = 0;
  if (performanceRating === 'excellent' && yearsOfService >= 2) {
    performanceBonus = salary * 0.5; // نصف راتب إضافي
    breakdown.push(`مكافأة الأداء المتميز: ${performanceBonus.toFixed(2)} ريال`);
  }
  
  return {
    yearsOfService: Math.floor(yearsOfService * 10) / 10,
    basicEntitlement: Math.round(basicEntitlement),
    performanceBonus: Math.round(performanceBonus),
    totalEntitlement: Math.round(basicEntitlement + performanceBonus),
    breakdown
  };
}

/**
 * تحليل اتجاهات الأداء على مدار فترة زمنية
 */
export async function analyzePerformanceTrends(
  employeeName: string,
  historicalData: Array<{
    period: string;
    metrics: PerformanceMetrics;
    score: number;
  }>,
  language: "ar" | "en" = "ar"
): Promise<{
  trend: 'improving' | 'stable' | 'declining';
  trendAr: 'تحسن' | 'مستقر' | 'تراجع';
  analysis: string;
  predictions: string[];
  recommendations: string[];
}> {
  const isArabic = language === "ar";
  
  if (historicalData.length < 2) {
    return {
      trend: 'stable',
      trendAr: 'مستقر',
      analysis: isArabic ? 'بيانات غير كافية للتحليل' : 'Insufficient data for analysis',
      predictions: [],
      recommendations: []
    };
  }
  
  // حساب الاتجاه
  const scores = historicalData.map(d => d.score);
  const avgChange = (scores[scores.length - 1] - scores[0]) / (scores.length - 1);
  
  let trend: 'improving' | 'stable' | 'declining';
  let trendAr: 'تحسن' | 'مستقر' | 'تراجع';
  
  if (avgChange > 2) {
    trend = 'improving';
    trendAr = 'تحسن';
  } else if (avgChange < -2) {
    trend = 'declining';
    trendAr = 'تراجع';
  } else {
    trend = 'stable';
    trendAr = 'مستقر';
  }
  
  const systemPrompt = isArabic
    ? 'أنت محلل أداء موظفين خبير. حلل اتجاهات الأداء وقدم توقعات وتوصيات.'
    : 'You are an expert employee performance analyst. Analyze performance trends and provide predictions and recommendations.';
  
  const userPrompt = isArabic
    ? `حلل اتجاهات أداء الموظف: ${employeeName}

البيانات التاريخية:
${historicalData.map(d => `- ${d.period}: ${d.score}/100`).join('\n')}

الاتجاه المحسوب: ${trendAr}

قدم تحليلاً بصيغة JSON:
{
  "analysis": "<تحليل مفصل للاتجاه>",
  "predictions": [<توقعات للأداء المستقبلي>],
  "recommendations": [<توصيات للتحسين>]
}`
    : `Analyze performance trends for employee: ${employeeName}

Historical data:
${historicalData.map(d => `- ${d.period}: ${d.score}/100`).join('\n')}

Calculated trend: ${trend}

Provide analysis in JSON format:
{
  "analysis": "<detailed trend analysis>",
  "predictions": [<predictions for future performance>],
  "recommendations": [<recommendations for improvement>]
}`;

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

    const result = JSON.parse(jsonText);
    
    return {
      trend,
      trendAr,
      analysis: result.analysis,
      predictions: result.predictions || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error("Trend Analysis Error:", error);
    return {
      trend,
      trendAr,
      analysis: isArabic ? 'حدث خطأ في التحليل' : 'Analysis error',
      predictions: [],
      recommendations: []
    };
  }
}
