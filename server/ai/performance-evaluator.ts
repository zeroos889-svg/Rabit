/**
 * AI Performance Evaluator - نظام تقييم الأداء الذكي
 * يستخدم الذكاء الاصطناعي لتقييم أداء الموظفين وتقديم توصيات مفصلة
 */

import { invokeLLM, type Message } from "../_core/llm";

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
