/**
 * AI Training Recommender - نظام توصيات التدريب الذكي
 * يحلل أداء ومهارات الموظفين ويقترح برامج تدريبية مخصصة
 * مع تكامل قاعدة المعرفة للامتثال للأنظمة السعودية
 */

import { invokeLLM, type Message } from "../_core/llm";
import { loadRegulation } from "./knowledge-base-loader";

// Knowledge Base Helpers
function getLaborLaw() {
  return loadRegulation("labor-law") as Record<string, any>;
}

function getOccupationalHealth() {
  return loadRegulation("occupational-health") as Record<string, any>;
}

function getNitaqat() {
  return loadRegulation("nitaqat") as Record<string, any>;
}

function getWPS() {
  return loadRegulation("wps") as Record<string, any>;
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

// ============================================================
// توصيات التدريب للامتثال - Compliance Training Recommendations
// ============================================================

interface ComplianceTrainingNeed {
  area: string;
  areaAr: string;
  priority: "critical" | "high" | "medium" | "low";
  priorityAr: string;
  description: string;
  descriptionAr: string;
  legalBasis: string;
  requiredFor: string[];
  recommendedCourses: string[];
  deadline?: string;
}

interface ComplianceTrainingPlan {
  employeeId: number;
  employeeName: string;
  role: string;
  requiredTraining: ComplianceTrainingNeed[];
  optionalTraining: ComplianceTrainingNeed[];
  completedTraining: string[];
  complianceScore: number;
  gaps: string[];
  recommendations: string[];
  summary: string;
}

/**
 * تحديد احتياجات التدريب الإلزامي حسب الأنظمة السعودية
 */
export function getComplianceTrainingRequirements(
  role: string,
  department: string,
  isManager: boolean = false,
  isHR: boolean = false,
  isSafetyCritical: boolean = false
): ComplianceTrainingNeed[] {
  const laborLaw = getLaborLaw();
  const occupationalHealth = getOccupationalHealth();
  const nitaqat = getNitaqat();
  const wps = getWPS();
  
  const requirements: ComplianceTrainingNeed[] = [];
  
  // 1. تدريب نظام العمل الأساسي (للجميع)
  requirements.push({
    area: "Saudi Labor Law Basics",
    areaAr: "أساسيات نظام العمل السعودي",
    priority: "high",
    priorityAr: "عالية",
    description: "Understanding of Saudi Labor Law rights and obligations",
    descriptionAr: "فهم حقوق والتزامات نظام العمل السعودي",
    legalBasis: `نظام العمل - ${laborLaw?.metadata?.issueDate || "1426هـ"}`,
    requiredFor: ["all_employees"],
    recommendedCourses: [
      "نظام العمل السعودي للموظفين",
      "حقوق وواجبات العامل",
      "عقود العمل والالتزامات"
    ],
    deadline: "خلال 30 يوم من التعيين"
  });
  
  // 2. تدريب السلامة المهنية
  if (isSafetyCritical || department.toLowerCase().includes("operations") || 
      department.toLowerCase().includes("manufacturing") || department.toLowerCase().includes("عمليات")) {
    requirements.push({
      area: "Occupational Health & Safety",
      areaAr: "الصحة والسلامة المهنية",
      priority: "critical",
      priorityAr: "حرجة",
      description: "Safety training as per OSHA Saudi regulations",
      descriptionAr: "تدريب السلامة وفق لوائح السلامة المهنية",
      legalBasis: occupationalHealth?.metadata?.authority || "وزارة الموارد البشرية",
      requiredFor: ["operations", "manufacturing", "maintenance", "construction"],
      recommendedCourses: [
        "السلامة المهنية في بيئة العمل",
        "الإسعافات الأولية",
        "إدارة مخاطر العمل",
        "استخدام معدات الحماية الشخصية"
      ],
      deadline: "قبل بدء العمل"
    });
  }
  
  // 3. تدريب الموارد البشرية
  if (isHR) {
    requirements.push({
      area: "HR Compliance Training",
      areaAr: "تدريب امتثال الموارد البشرية",
      priority: "critical",
      priorityAr: "حرجة",
      description: "Comprehensive HR compliance including GOSI, Nitaqat, WPS",
      descriptionAr: "امتثال شامل للموارد البشرية شاملاً التأمينات ونطاقات ونظام حماية الأجور",
      legalBasis: "أنظمة متعددة",
      requiredFor: ["hr_department", "hr_managers"],
      recommendedCourses: [
        "نظام التأمينات الاجتماعية للموارد البشرية",
        "برنامج نطاقات وحساب السعودة",
        "نظام حماية الأجور",
        "إجراءات إنهاء الخدمة القانونية",
        "إدارة ملفات الموظفين"
      ]
    });
    
    // تدريب نطاقات
    requirements.push({
      area: "Nitaqat Program",
      areaAr: "برنامج نطاقات",
      priority: "high",
      priorityAr: "عالية",
      description: "Saudization quotas and compliance requirements",
      descriptionAr: "نسب السعودة ومتطلبات الامتثال",
      legalBasis: nitaqat?.metadata?.authority || "وزارة الموارد البشرية",
      requiredFor: ["hr_department"],
      recommendedCourses: [
        "فهم برنامج نطاقات",
        "حساب نسب السعودة",
        "استراتيجيات تحسين نطاق المنشأة"
      ]
    });
    
    // نظام حماية الأجور
    requirements.push({
      area: "Wage Protection System",
      areaAr: "نظام حماية الأجور",
      priority: "high",
      priorityAr: "عالية",
      description: "WPS compliance and salary transfer requirements",
      descriptionAr: "الامتثال لنظام حماية الأجور ومتطلبات تحويل الرواتب",
      legalBasis: wps?.metadata?.authority || "وزارة الموارد البشرية",
      requiredFor: ["hr_department", "finance"],
      recommendedCourses: [
        "نظام حماية الأجور للمنشآت",
        "إدارة مسيرات الرواتب",
        "التعامل مع مخالفات WPS"
      ]
    });
  }
  
  // 4. تدريب المدراء
  if (isManager) {
    requirements.push({
      area: "Management & Labor Law",
      areaAr: "الإدارة ونظام العمل",
      priority: "high",
      priorityAr: "عالية",
      description: "Management responsibilities under Saudi Labor Law",
      descriptionAr: "مسؤوليات المدير وفق نظام العمل السعودي",
      legalBasis: "نظام العمل - باب العقوبات التأديبية",
      requiredFor: ["managers", "supervisors"],
      recommendedCourses: [
        "صلاحيات المدير في نظام العمل",
        "إدارة الأداء القانونية",
        "التعامل مع المخالفات التأديبية",
        "حقوق الموظف أثناء فترة الإنذار"
      ]
    });
    
    requirements.push({
      area: "Performance Management",
      areaAr: "إدارة الأداء",
      priority: "medium",
      priorityAr: "متوسطة",
      description: "Legal aspects of performance evaluation and termination",
      descriptionAr: "الجوانب القانونية لتقييم الأداء وإنهاء الخدمة",
      legalBasis: "نظام العمل - المادة 80",
      requiredFor: ["managers"],
      recommendedCourses: [
        "تقييم الأداء العادل",
        "توثيق أداء الموظف",
        "إجراءات الفصل المشروع"
      ]
    });
  }
  
  // 5. تدريب مكافحة التحرش (للجميع)
  requirements.push({
    area: "Anti-Harassment",
    areaAr: "مكافحة التحرش",
    priority: "high",
    priorityAr: "عالية",
    description: "Saudi anti-harassment law compliance",
    descriptionAr: "الامتثال لنظام مكافحة التحرش السعودي",
    legalBasis: "نظام مكافحة التحرش 1439هـ",
    requiredFor: ["all_employees"],
    recommendedCourses: [
      "التوعية بنظام مكافحة التحرش",
      "الإبلاغ عن حالات التحرش",
      "بيئة عمل آمنة"
    ],
    deadline: "خلال 60 يوم من التعيين"
  });
  
  // 6. حماية البيانات الشخصية
  requirements.push({
    area: "Data Protection",
    areaAr: "حماية البيانات الشخصية",
    priority: "medium",
    priorityAr: "متوسطة",
    description: "Saudi Personal Data Protection Law compliance",
    descriptionAr: "الامتثال لنظام حماية البيانات الشخصية",
    legalBasis: "نظام حماية البيانات الشخصية 1443هـ",
    requiredFor: ["all_employees"],
    recommendedCourses: [
      "أساسيات حماية البيانات الشخصية",
      "التعامل الآمن مع بيانات الموظفين والعملاء"
    ]
  });
  
  return requirements;
}

/**
 * إنشاء خطة تدريب امتثال مخصصة للموظف
 */
export async function generateComplianceTrainingPlan(
  employee: {
    id: number;
    name: string;
    role: string;
    department: string;
    isManager: boolean;
    joinDate: Date;
    completedTraining: string[];
  },
  language: "ar" | "en" = "ar"
): Promise<ComplianceTrainingPlan> {
  const isArabic = language === "ar";
  const isHR = employee.department.toLowerCase().includes("hr") || 
               employee.department.toLowerCase().includes("موارد");
  const isSafety = employee.department.toLowerCase().includes("operations") ||
                   employee.department.toLowerCase().includes("maintenance") ||
                   employee.department.toLowerCase().includes("عمليات");
  
  // الحصول على متطلبات التدريب
  const allRequirements = getComplianceTrainingRequirements(
    employee.role,
    employee.department,
    employee.isManager,
    isHR,
    isSafety
  );
  
  // تصنيف التدريبات إلى مكتملة وغير مكتملة
  const completed = employee.completedTraining || [];
  const requiredTraining: ComplianceTrainingNeed[] = [];
  const optionalTraining: ComplianceTrainingNeed[] = [];
  const gaps: string[] = [];
  
  for (const req of allRequirements) {
    const isCompleted = req.recommendedCourses.some(course => 
      completed.some(c => c.toLowerCase().includes(course.toLowerCase().split(" ")[0]))
    );
    
    if (!isCompleted) {
      if (req.priority === "critical" || req.priority === "high") {
        requiredTraining.push(req);
        gaps.push(req.areaAr);
      } else {
        optionalTraining.push(req);
      }
    }
  }
  
  // حساب درجة الامتثال
  const totalRequired = allRequirements.filter(r => 
    r.priority === "critical" || r.priority === "high"
  ).length;
  const completedRequired = totalRequired - requiredTraining.length;
  const complianceScore = totalRequired > 0 
    ? Math.round((completedRequired / totalRequired) * 100) 
    : 100;
  
  // توليد التوصيات باستخدام الذكاء الاصطناعي
  const systemPrompt = isArabic
    ? `أنت مستشار تدريب متخصص في الامتثال للأنظمة السعودية. قدم توصيات عملية لتطوير الموظف.`
    : `You are a training consultant specialized in Saudi regulatory compliance. Provide practical recommendations for employee development.`;
  
  const userPrompt = isArabic
    ? `قدم توصيات تدريبية للموظف التالي:
    
**الاسم:** ${employee.name}
**الدور:** ${employee.role}
**القسم:** ${employee.department}
**مدير:** ${employee.isManager ? "نعم" : "لا"}
**تاريخ الانضمام:** ${employee.joinDate.toLocaleDateString("ar-SA")}

**فجوات التدريب:**
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "لا توجد فجوات حرجة"}

**درجة الامتثال:** ${complianceScore}%

قدم 3-5 توصيات محددة وملخص قصير.

الرد بصيغة JSON:
{
  "recommendations": ["<توصية 1>", "<توصية 2>", ...],
  "summary": "<ملخص الخطة>"
}`
    : `Provide training recommendations for the following employee:
    
**Name:** ${employee.name}
**Role:** ${employee.role}
**Department:** ${employee.department}
**Manager:** ${employee.isManager ? "Yes" : "No"}
**Join Date:** ${employee.joinDate.toLocaleDateString("en-US")}

**Training Gaps:**
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "No critical gaps"}

**Compliance Score:** ${complianceScore}%

Provide 3-5 specific recommendations and a brief summary.

Reply in JSON format:
{
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "summary": "<plan summary>"
}`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 1500);
    
    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const aiResponse = JSON.parse(jsonText);
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      role: employee.role,
      requiredTraining,
      optionalTraining,
      completedTraining: completed,
      complianceScore,
      gaps,
      recommendations: aiResponse.recommendations || [],
      summary: aiResponse.summary || (isArabic 
        ? `خطة تدريب امتثال للموظف ${employee.name}` 
        : `Compliance training plan for ${employee.name}`)
    };
  } catch (error) {
    console.error("Compliance Training Plan Error:", error);
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      role: employee.role,
      requiredTraining,
      optionalTraining,
      completedTraining: completed,
      complianceScore,
      gaps,
      recommendations: isArabic 
        ? ["إكمال التدريبات الإلزامية في أقرب وقت"] 
        : ["Complete mandatory training as soon as possible"],
      summary: isArabic 
        ? `يحتاج الموظف إلى ${requiredTraining.length} تدريبات إلزامية` 
        : `Employee needs ${requiredTraining.length} mandatory trainings`
    };
  }
}

/**
 * تحديد التدريبات الإلزامية قبل انتهاء فترة الاختبار
 */
export function getProbationTrainingRequirements(
  role: string,
  department: string,
  daysUntilProbationEnd: number
): ComplianceTrainingNeed[] {
  const requirements: ComplianceTrainingNeed[] = [];
  
  // التدريبات الأساسية المطلوبة خلال فترة الاختبار
  if (daysUntilProbationEnd > 0) {
    requirements.push({
      area: "Company Policies",
      areaAr: "سياسات الشركة",
      priority: daysUntilProbationEnd <= 30 ? "critical" : "high",
      priorityAr: daysUntilProbationEnd <= 30 ? "حرجة" : "عالية",
      description: "Understanding of company policies and procedures",
      descriptionAr: "فهم سياسات وإجراءات الشركة",
      legalBasis: "لائحة تنظيم العمل الداخلية",
      requiredFor: ["all_employees"],
      recommendedCourses: [
        "التعريف بالشركة وسياساتها",
        "لائحة العمل الداخلية",
        "قواعد السلوك المهني"
      ],
      deadline: `قبل انتهاء فترة الاختبار (${daysUntilProbationEnd} يوم)`
    });
    
    requirements.push({
      area: "Role-Specific Training",
      areaAr: "تدريب الدور الوظيفي",
      priority: "high",
      priorityAr: "عالية",
      description: "Essential training for job role",
      descriptionAr: "التدريب الأساسي للدور الوظيفي",
      legalBasis: "متطلبات الوظيفة",
      requiredFor: [role],
      recommendedCourses: [
        `تدريب ${role} الأساسي`,
        "الأنظمة والأدوات المستخدمة",
        "إجراءات العمل القياسية"
      ],
      deadline: `خلال 60 يوم من بدء العمل`
    });
  }
  
  return requirements;
}

/**
 * تقرير امتثال التدريب على مستوى الشركة
 */
export async function generateCompanyTrainingComplianceReport(
  employees: Array<{
    id: number;
    name: string;
    role: string;
    department: string;
    isManager: boolean;
    completedTraining: string[];
  }>,
  language: "ar" | "en" = "ar"
): Promise<{
  overallComplianceScore: number;
  departmentScores: Record<string, number>;
  criticalGaps: string[];
  atRiskEmployees: Array<{ name: string; missingTraining: string[] }>;
  recommendations: string[];
  summary: string;
}> {
  const isArabic = language === "ar";
  const departmentScores: Record<string, { total: number; completed: number }> = {};
  const criticalGaps: Set<string> = new Set();
  const atRiskEmployees: Array<{ name: string; missingTraining: string[] }> = [];
  
  for (const emp of employees) {
    const isHR = emp.department.toLowerCase().includes("hr");
    const requirements = getComplianceTrainingRequirements(
      emp.role, emp.department, emp.isManager, isHR, false
    );
    
    const criticalReqs = requirements.filter(r => 
      r.priority === "critical" || r.priority === "high"
    );
    
    const completed = emp.completedTraining || [];
    const missing: string[] = [];
    
    for (const req of criticalReqs) {
      const isCompleted = req.recommendedCourses.some(course =>
        completed.some(c => c.toLowerCase().includes(course.toLowerCase().split(" ")[0]))
      );
      if (!isCompleted) {
        missing.push(req.areaAr);
        criticalGaps.add(req.areaAr);
      }
    }
    
    // تسجيل نتائج القسم
    if (!departmentScores[emp.department]) {
      departmentScores[emp.department] = { total: 0, completed: 0 };
    }
    departmentScores[emp.department].total += criticalReqs.length;
    departmentScores[emp.department].completed += criticalReqs.length - missing.length;
    
    // تحديد الموظفين المعرضين للخطر
    if (missing.length >= 2) {
      atRiskEmployees.push({ name: emp.name, missingTraining: missing });
    }
  }
  
  // حساب النسب
  const deptScores: Record<string, number> = {};
  let totalAll = 0;
  let completedAll = 0;
  
  for (const [dept, scores] of Object.entries(departmentScores)) {
    deptScores[dept] = scores.total > 0 
      ? Math.round((scores.completed / scores.total) * 100) 
      : 100;
    totalAll += scores.total;
    completedAll += scores.completed;
  }
  
  const overallScore = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 100;
  
  // توليد التوصيات
  const recommendations: string[] = [];
  
  if (overallScore < 70) {
    recommendations.push(isArabic 
      ? "يجب وضع خطة عاجلة لرفع مستوى الامتثال التدريبي" 
      : "Urgent plan needed to improve training compliance");
  }
  
  if (criticalGaps.size > 3) {
    recommendations.push(isArabic
      ? "توجد فجوات تدريبية حرجة متعددة تحتاج اهتماماً فورياً"
      : "Multiple critical training gaps require immediate attention");
  }
  
  if (atRiskEmployees.length > employees.length * 0.2) {
    recommendations.push(isArabic
      ? "أكثر من 20% من الموظفين يحتاجون تدريبات إلزامية متعددة"
      : "More than 20% of employees need multiple mandatory trainings");
  }
  
  // ترتيب الأقسام حسب الأولوية
  const lowestDept = Object.entries(deptScores)
    .sort(([, a], [, b]) => a - b)[0];
  if (lowestDept && lowestDept[1] < 60) {
    recommendations.push(isArabic
      ? `قسم ${lowestDept[0]} يحتاج اهتماماً خاصاً (${lowestDept[1]}%)`
      : `${lowestDept[0]} department needs special attention (${lowestDept[1]}%)`);
  }
  
  const summary = isArabic
    ? `تقرير امتثال التدريب: ${employees.length} موظف، متوسط الامتثال ${overallScore}%، ${atRiskEmployees.length} موظف معرض للخطر`
    : `Training Compliance Report: ${employees.length} employees, ${overallScore}% average compliance, ${atRiskEmployees.length} at-risk employees`;
  
  return {
    overallComplianceScore: overallScore,
    departmentScores: deptScores,
    criticalGaps: Array.from(criticalGaps),
    atRiskEmployees: atRiskEmployees.slice(0, 10), // أعلى 10
    recommendations,
    summary
  };
}
