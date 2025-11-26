/**
 * AI Training Recommender - نظام توصيات التدريب الذكي
 * يحلل أداء ومهارات الموظفين ويقترح برامج تدريبية مخصصة
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

interface EmployeeProfile {
  id: number;
  name: string;
  position: string;
  department: string;
  currentSkills: string[];
  skillLevels: Record<string, "beginner" | "intermediate" | "advanced" | "expert">;
  interests?: string[];
  careerGoals?: string[];
  performanceScore?: number;
  weakAreas?: string[];
}

interface TrainingCourse {
  id: string;
  title: string;
  titleAr: string;
  provider: string;
  type: "online" | "onsite" | "hybrid";
  duration: string; // "2 أسابيع", "3 أشهر", إلخ
  level: "beginner" | "intermediate" | "advanced";
  skills: string[];
  cost?: number;
  language: "ar" | "en" | "both";
  certification: boolean;
  url?: string;
}

interface TrainingRecommendation {
  employeeName: string;
  recommendations: Array<{
    course: TrainingCourse;
    priority: "high" | "medium" | "low";
    priorityAr: "عالية" | "متوسطة" | "منخفضة";
    reason: string;
    expectedImpact: string;
    matchScore: number; // 0-100
    timeline: string; // متى يجب أخذ الدورة
  }>;
  skillGaps: Array<{
    skill: string;
    currentLevel: string;
    targetLevel: string;
    importance: "critical" | "important" | "nice_to_have";
  }>;
  learningPath: {
    phase1: string[]; // الأشهر 1-3
    phase2: string[]; // الأشهر 4-6
    phase3: string[]; // الأشهر 7-12
  };
  estimatedCost: number;
  expectedROI: string;
  summary: string;
}

/**
 * تحليل فجوات المهارات وتوليد توصيات تدريبية
 */
export async function recommendTraining(
  employee: EmployeeProfile,
  availableCourses: TrainingCourse[],
  departmentNeeds?: string[],
  language: "ar" | "en" = "ar"
): Promise<TrainingRecommendation> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت مستشار تطوير مهني وتدريب متخصص. مهمتك تحليل مهارات الموظف واحتياجات العمل واقتراح برامج تدريبية مخصصة.

معايير الاختيار:
1. تحليل فجوات المهارات الحالية
2. ملاءمة الدورة لمستوى الموظف
3. التوافق مع الأهداف المهنية
4. احتياجات القسم والشركة
5. العائد المتوقع من التدريب (ROI)
6. التسلسل المنطقي للتعلم
7. الميزانية والتكلفة
8. التفضيلات الشخصية

قدم خطة تدريب شاملة وعملية.`
    : `You are a professional development and training consultant. Your task is to analyze employee skills and work needs and suggest customized training programs.

Selection criteria:
1. Current skill gap analysis
2. Course suitability for employee level
3. Alignment with career goals
4. Department and company needs
5. Expected training ROI
6. Logical learning sequence
7. Budget and cost
8. Personal preferences

Provide a comprehensive and practical training plan.`;

  const employeeText = `
**الموظف:** ${employee.name}
**المسمى الوظيفي:** ${employee.position}
**القسم:** ${employee.department}
**المهارات الحالية:** ${employee.currentSkills.join(", ")}
**مستويات المهارات:**
${Object.entries(employee.skillLevels)
  .map(([skill, level]) => `- ${skill}: ${level}`)
  .join("\n")}
${employee.weakAreas?.length ? `**المجالات الضعيفة:** ${employee.weakAreas.join(", ")}` : ""}
${employee.careerGoals?.length ? `**الأهداف المهنية:** ${employee.careerGoals.join(", ")}` : ""}
${employee.interests?.length ? `**الاهتمامات:** ${employee.interests.join(", ")}` : ""}
${employee.performanceScore ? `**درجة الأداء:** ${employee.performanceScore}/100` : ""}
  `.trim();

  const coursesText = availableCourses
    .map(
      (c) => `
- ${c.titleAr} (${c.title})
  المزود: ${c.provider}
  النوع: ${c.type}
  المدة: ${c.duration}
  المستوى: ${c.level}
  المهارات: ${c.skills.join(", ")}
  ${c.cost ? `التكلفة: ${c.cost} ريال` : ""}
  ${c.certification ? "شهادة معتمدة" : ""}
`
    )
    .join("\n");

  const userPrompt = isArabic
    ? `حلل احتياجات الموظف التالي واقترح برنامج تدريبي مخصص:

${employeeText}

${departmentNeeds?.length ? `**احتياجات القسم:** ${departmentNeeds.join(", ")}` : ""}

**الدورات التدريبية المتاحة:**
${coursesText}

قدم توصيات بصيغة JSON:
{
  "employeeName": "${employee.name}",
  "recommendations": [
    {
      "courseId": "<معرف الدورة>",
      "priority": "<high أو medium أو low>",
      "priorityAr": "<عالية أو متوسطة أو منخفضة>",
      "reason": "<سبب الترشيح>",
      "expectedImpact": "<الأثر المتوقع>",
      "matchScore": <درجة التطابق 0-100>,
      "timeline": "<متى يجب أخذها>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<اسم المهارة>",
      "currentLevel": "<المستوى الحالي>",
      "targetLevel": "<المستوى المستهدف>",
      "importance": "<critical أو important أو nice_to_have>"
    }
  ],
  "learningPath": {
    "phase1": [<دورات الأشهر 1-3>],
    "phase2": [<دورات الأشهر 4-6>],
    "phase3": [<دورات الأشهر 7-12>]
  },
  "estimatedCost": <التكلفة الإجمالية المتوقعة>,
  "expectedROI": "<العائد المتوقع>",
  "summary": "<ملخص شامل>"
}

ملاحظة: استخدم courseId من الدورات المتاحة فقط.`
    : `Analyze the following employee's needs and suggest a customized training program:

${employeeText}

${departmentNeeds?.length ? `**Department Needs:** ${departmentNeeds.join(", ")}` : ""}

**Available Training Courses:**
${coursesText}

Provide recommendations in JSON format:
{
  "employeeName": "${employee.name}",
  "recommendations": [
    {
      "courseId": "<course id>",
      "priority": "<high or medium or low>",
      "priorityAr": "<Arabic translation>",
      "reason": "<recommendation reason>",
      "expectedImpact": "<expected impact>",
      "matchScore": <match score 0-100>,
      "timeline": "<when to take it>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "currentLevel": "<current level>",
      "targetLevel": "<target level>",
      "importance": "<critical or important or nice_to_have>"
    }
  ],
  "learningPath": {
    "phase1": [<courses for months 1-3>],
    "phase2": [<courses for months 4-6>],
    "phase3": [<courses for months 6-12>]
  },
  "estimatedCost": <total estimated cost>,
  "expectedROI": "<expected ROI>",
  "summary": "<comprehensive summary>"
}

Note: Use courseId from available courses only.`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 2500);

    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const aiRecommendation = JSON.parse(jsonText);

    // ربط الدورات من القائمة المتاحة
    const recommendations = aiRecommendation.recommendations.map((rec: any) => {
      const course = availableCourses.find((c) => c.id === rec.courseId);
      if (!course) {
        console.warn(`Course ${rec.courseId} not found`);
        return null;
      }
      return {
        course,
        priority: rec.priority,
        priorityAr: rec.priorityAr,
        reason: rec.reason,
        expectedImpact: rec.expectedImpact,
        matchScore: rec.matchScore,
        timeline: rec.timeline,
      };
    }).filter(Boolean);

    return {
      employeeName: employee.name,
      recommendations,
      skillGaps: aiRecommendation.skillGaps || [],
      learningPath: aiRecommendation.learningPath || { phase1: [], phase2: [], phase3: [] },
      estimatedCost: aiRecommendation.estimatedCost || 0,
      expectedROI: aiRecommendation.expectedROI || "",
      summary: aiRecommendation.summary || "",
    };
  } catch (error) {
    console.error("Training Recommendation Error:", error);
    return {
      employeeName: employee.name,
      recommendations: [],
      skillGaps: [],
      learningPath: { phase1: [], phase2: [], phase3: [] },
      estimatedCost: 0,
      expectedROI: isArabic ? "غير متاح" : "Not available",
      summary: isArabic
        ? "حدث خطأ في توليد التوصيات"
        : "Error generating recommendations",
    };
  }
}

/**
 * توليد خطة تدريبية للقسم بأكمله
 */
export async function generateDepartmentTrainingPlan(
  departmentName: string,
  employees: EmployeeProfile[],
  departmentGoals: string[],
  budget: number,
  language: "ar" | "en" = "ar"
): Promise<{
  plan: string;
  priorityAreas: string[];
  recommendedCourses: string[];
  timeline: string;
  budgetAllocation: Record<string, number>;
  expectedOutcomes: string[];
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت مستشار تطوير الموارد البشرية. قم بإنشاء خطة تدريبية شاملة لقسم كامل.`
    : `You are an HR development consultant. Create a comprehensive training plan for an entire department.`;

  const employeesText = employees
    .map(
      (e) =>
        `- ${e.name} (${e.position}): مهارات حالية: ${e.currentSkills.slice(0, 3).join(", ")}`
    )
    .join("\n");

  const userPrompt = isArabic
    ? `أنشئ خطة تدريبية لقسم ${departmentName}

**الموظفون:**
${employeesText}

**أهداف القسم:** ${departmentGoals.join(", ")}
**الميزانية المتاحة:** ${budget} ريال

قدم بصيغة JSON:
{
  "plan": "<خطة تفصيلية>",
  "priorityAreas": [<المجالات ذات الأولوية>],
  "recommendedCourses": [<الدورات الموصى بها>],
  "timeline": "<الجدول الزمني>",
  "budgetAllocation": {
    "<مجال>": <المبلغ>
  },
  "expectedOutcomes": [<النتائج المتوقعة>]
}`
    : `Create a training plan for ${departmentName} department

**Employees:**
${employeesText}

**Department Goals:** ${departmentGoals.join(", ")}
**Available Budget:** ${budget} SAR

Provide in JSON format:
{
  "plan": "<detailed plan>",
  "priorityAreas": [<priority areas>],
  "recommendedCourses": [<recommended courses>],
  "timeline": "<timeline>",
  "budgetAllocation": {
    "<area>": <amount>
  },
  "expectedOutcomes": [<expected outcomes>]
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
    console.error("Department Training Plan Error:", error);
    return {
      plan: isArabic ? "حدث خطأ" : "Error occurred",
      priorityAreas: [],
      recommendedCourses: [],
      timeline: "",
      budgetAllocation: {},
      expectedOutcomes: [],
    };
  }
}

/**
 * تقييم فعالية التدريب بعد إتمامه
 */
export async function evaluateTrainingEffectiveness(
  employeeName: string,
  courseName: string,
  preTrainingSkills: Record<string, number>, // 0-10
  postTrainingSkills: Record<string, number>, // 0-10
  performanceChange?: number, // تغير في درجة الأداء
  feedbackComments?: string,
  language: "ar" | "en" = "ar"
): Promise<{
  effectiveness: "excellent" | "good" | "moderate" | "poor";
  effectivenessAr: "ممتاز" | "جيد" | "متوسط" | "ضعيف";
  score: number; // 0-100
  improvements: Array<{
    skill: string;
    improvement: number;
    percentage: number;
  }>;
  roi: string;
  recommendations: string[];
  detailedAnalysis: string;
}> {
  const isArabic = language === "ar";

  // حساب التحسينات
  const improvements = Object.keys(preTrainingSkills).map((skill) => {
    const pre = preTrainingSkills[skill];
    const post = postTrainingSkills[skill] || pre;
    const improvement = post - pre;
    const percentage = pre > 0 ? (improvement / pre) * 100 : 0;
    return { skill, improvement, percentage };
  });

  const avgImprovement =
    improvements.reduce((sum, i) => sum + i.improvement, 0) / improvements.length;

  const systemPrompt = isArabic
    ? `أنت مقيّم برامج تدريبية محترف. قيّم فعالية التدريب بناءً على البيانات المقدمة.`
    : `You are a professional training program evaluator. Assess training effectiveness based on provided data.`;

  const userPrompt = isArabic
    ? `قيّم فعالية التدريب التالي:

**الموظف:** ${employeeName}
**الدورة:** ${courseName}

**التحسينات في المهارات:**
${improvements.map((i) => `- ${i.skill}: +${i.improvement.toFixed(1)} (${i.percentage.toFixed(1)}%)`).join("\n")}

**متوسط التحسين:** ${avgImprovement.toFixed(2)}
${performanceChange ? `**تغير الأداء:** ${performanceChange > 0 ? "+" : ""}${performanceChange}%` : ""}
${feedbackComments ? `**تعليقات الموظف:** ${feedbackComments}` : ""}

قدم تقييماً بصيغة JSON:
{
  "effectiveness": "<excellent أو good أو moderate أو poor>",
  "effectivenessAr": "<ممتاز أو جيد أو متوسط أو ضعيف>",
  "score": <درجة 0-100>,
  "roi": "<تحليل العائد على الاستثمار>",
  "recommendations": [<توصيات للتدريبات المستقبلية>],
  "detailedAnalysis": "<تحليل مفصل>"
}`
    : `Evaluate the effectiveness of the following training:

**Employee:** ${employeeName}
**Course:** ${courseName}

**Skill Improvements:**
${improvements.map((i) => `- ${i.skill}: +${i.improvement.toFixed(1)} (${i.percentage.toFixed(1)}%)`).join("\n")}

**Average Improvement:** ${avgImprovement.toFixed(2)}
${performanceChange ? `**Performance Change:** ${performanceChange > 0 ? "+" : ""}${performanceChange}%` : ""}
${feedbackComments ? `**Employee Feedback:** ${feedbackComments}` : ""}

Provide evaluation in JSON format:
{
  "effectiveness": "<excellent or good or moderate or poor>",
  "effectivenessAr": "<Arabic translation>",
  "score": <score 0-100>,
  "roi": "<ROI analysis>",
  "recommendations": [<recommendations for future training>],
  "detailedAnalysis": "<detailed analysis>"
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

    const evaluation = JSON.parse(jsonText);

    return {
      ...evaluation,
      improvements,
    };
  } catch (error) {
    console.error("Training Evaluation Error:", error);
    return {
      effectiveness: "moderate",
      effectivenessAr: "متوسط",
      score: 50,
      improvements,
      roi: isArabic ? "غير متاح" : "Not available",
      recommendations: [],
      detailedAnalysis: isArabic ? "حدث خطأ" : "Error occurred",
    };
  }
}
