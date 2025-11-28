/**
 * AI Hiring Assistant - مساعد التوظيف الذكي
 * يستخدم الذكاء الاصطناعي لفحص السير الذاتية وتقييم المرشحين
 * مع دعم كامل للأنظمة السعودية (نطاقات، قوى، نظام العمل)
 */

import { invokeLLM, type Message } from "../_core/llm";
import { loadRegulation } from "./knowledge-base-loader";

// ============================================
// Saudi Compliance Types
// ============================================

interface SaudiComplianceCheck {
  nitaqatImpact: {
    currentBand: string;
    afterHiring: string;
    recommendation: string;
  };
  workPermitRequired: boolean;
  saudiPreference: boolean;
  localizationRequirement?: {
    required: boolean;
    reason: string;
    alternatives: string[];
  };
  qiwaCompliance: {
    contractType: string;
    registrationRequired: boolean;
    notes: string[];
  };
}

// ============================================
// Knowledge Base Integration
// ============================================

function getLaborLaw() {
  return loadRegulation('labor-law');
}

function getNitaqatRegulation() {
  return loadRegulation('nitaqat');
}

function getQiwaRegulation() {
  return loadRegulation('qiwa');
}

/**
 * التحقق من متطلبات السعودة للوظيفة
 */
function checkSaudizationRequirements(
  position: string,
  sector: string,
  isForSaudi: boolean
): { required: boolean; reason: string; alternatives: string[] } {
  const nitaqat = getNitaqatRegulation() as Record<string, any>;
  const localizedJobs = nitaqat?.localizedJobs || nitaqat?.localizedProfessions || [];
  
  // التحقق من الوظائف المقصورة على السعوديين
  const isLocalized = localizedJobs.some((job: string) => 
    position.toLowerCase().includes(job.toLowerCase())
  );
  
  if (isLocalized && !isForSaudi) {
    return {
      required: true,
      reason: `الوظيفة "${position}" مقصورة على السعوديين حسب قرارات التوطين`,
      alternatives: [
        'توظيف مواطن سعودي',
        'البحث عن وظيفة بديلة غير مقصورة',
        'التقدم بطلب استثناء (إن أمكن)'
      ]
    };
  }
  
  return { required: false, reason: '', alternatives: [] };
}

/**
 * حساب تأثير التوظيف على نطاقات
 */
function calculateNitaqatImpact(
  currentSaudis: number,
  totalEmployees: number,
  sector: string,
  hiringCount: number,
  hiringSaudis: number
): { currentBand: string; afterHiring: string; recommendation: string } {
  const nitaqat = getNitaqatRegulation() as Record<string, any>;
  const bands = nitaqat?.bands || {};
  
  const currentRatio = totalEmployees > 0 ? (currentSaudis / totalEmployees) * 100 : 0;
  const newTotal = totalEmployees + hiringCount;
  const newSaudis = currentSaudis + hiringSaudis;
  const newRatio = newTotal > 0 ? (newSaudis / newTotal) * 100 : 0;
  
  // تحديد النطاق الحالي والجديد
  const getBand = (ratio: number): string => {
    if (ratio >= (bands?.platinum?.min || 40)) return 'بلاتيني';
    if (ratio >= (bands?.green_high?.min || 30)) return 'أخضر مرتفع';
    if (ratio >= (bands?.green_mid?.min || 23)) return 'أخضر متوسط';
    if (ratio >= (bands?.green_low?.min || 17)) return 'أخضر منخفض';
    if (ratio >= (bands?.yellow?.min || 10)) return 'أصفر';
    return 'أحمر';
  };
  
  const currentBand = getBand(currentRatio);
  const afterHiring = getBand(newRatio);
  
  let recommendation = '';
  if (afterHiring === 'أحمر' || afterHiring === 'أصفر') {
    recommendation = 'يُنصح بتوظيف سعوديين لتحسين نطاق الشركة';
  } else if (newRatio > currentRatio) {
    recommendation = 'التوظيف سيحسن نسبة السعودة';
  } else {
    recommendation = 'التوظيف لن يؤثر سلباً على النطاق';
  }
  
  return { currentBand, afterHiring, recommendation };
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

interface Resume {
  candidateName: string;
  email: string;
  phone: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    responsibilities: string[];
  }>;
  skills: string[];
  certifications?: string[];
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  summary?: string;
}

interface JobRequirements {
  title: string;
  department: string;
  level: "entry" | "mid" | "senior" | "executive";
  requiredSkills: string[];
  preferredSkills?: string[];
  minExperience: number; // بالسنوات
  education: string[];
  responsibilities: string[];
  salary?: {
    min: number;
    max: number;
  };
}

interface CandidateEvaluation {
  overallScore: number; // 0-100
  matchPercentage: number; // نسبة التطابق مع الوظيفة
  recommendation: "highly_recommended" | "recommended" | "maybe" | "not_recommended";
  recommendationAr: "موصى به بشدة" | "موصى به" | "ربما" | "غير موصى به";
  strengths: string[];
  weaknesses: string[];
  skillsMatch: {
    matched: string[];
    missing: string[];
    additional: string[];
  };
  experienceAnalysis: {
    relevant: boolean;
    years: number;
    quality: "excellent" | "good" | "average" | "below_average";
    details: string;
  };
  educationMatch: {
    meets: boolean;
    details: string;
  };
  salaryExpectation?: {
    estimated: number;
    inRange: boolean;
    notes: string;
  };
  interviewQuestions: string[]; // أسئلة مقترحة للمقابلة
  redFlags: string[]; // علامات تحذيرية
  detailedAnalysis: string;
  nextSteps: string[];
}

/**
 * تقييم مرشح بناءً على السيرة الذاتية ومتطلبات الوظيفة
 */
export async function evaluateCandidate(
  resume: Resume,
  jobRequirements: JobRequirements,
  language: "ar" | "en" = "ar"
): Promise<CandidateEvaluation> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت خبير توظيف متخصص في فحص السير الذاتية وتقييم المرشحين. مهمتك تحليل السيرة الذاتية بدقة ومقارنتها مع متطلبات الوظيفة.

معايير التقييم:
1. تطابق المهارات المطلوبة
2. الخبرة العملية ذات الصلة
3. المؤهلات التعليمية
4. جودة الإنجازات
5. تسلسل المسار الوظيفي
6. الشهادات المهنية
7. المهارات اللغوية
8. علامات التحذير (فجوات وظيفية، تنقلات متكررة، إلخ)

قدم تقييماً موضوعياً وعادلاً مع توصيات واضحة.`
    : `You are an expert recruiter specializing in resume screening and candidate evaluation. Your task is to accurately analyze resumes and compare them with job requirements.

Evaluation criteria:
1. Required skills match
2. Relevant work experience
3. Educational qualifications
4. Quality of achievements
5. Career progression
6. Professional certifications
7. Language skills
8. Red flags (employment gaps, frequent changes, etc.)

Provide an objective and fair evaluation with clear recommendations.`;

  const resumeText = `
**المرشح:** ${resume.candidateName}
**التعليم:**
${resume.education.map((e) => `- ${e.degree} من ${e.institution} (${e.year})${e.gpa ? ` - المعدل: ${e.gpa}` : ""}`).join("\n")}

**الخبرة:**
${resume.experience
  .map(
    (exp) => `
- ${exp.title} في ${exp.company} (${exp.duration})
  المسؤوليات: ${exp.responsibilities.join(", ")}
`
  )
  .join("\n")}

**المهارات:** ${resume.skills.join(", ")}
${resume.certifications?.length ? `**الشهادات:** ${resume.certifications.join(", ")}` : ""}
${resume.languages?.length ? `**اللغات:** ${resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}` : ""}
${resume.summary ? `**الملخص:** ${resume.summary}` : ""}
  `.trim();

  const jobText = `
**الوظيفة:** ${jobRequirements.title}
**القسم:** ${jobRequirements.department}
**المستوى:** ${jobRequirements.level}
**الخبرة المطلوبة:** ${jobRequirements.minExperience} سنوات
**المهارات المطلوبة:** ${jobRequirements.requiredSkills.join(", ")}
${jobRequirements.preferredSkills?.length ? `**المهارات المفضلة:** ${jobRequirements.preferredSkills.join(", ")}` : ""}
**التعليم المطلوب:** ${jobRequirements.education.join(", ")}
${jobRequirements.salary ? `**الراتب:** ${jobRequirements.salary.min} - ${jobRequirements.salary.max} ريال` : ""}
  `.trim();

  const userPrompt = isArabic
    ? `قيّم المرشح التالي للوظيفة:

${resumeText}

**متطلبات الوظيفة:**
${jobText}

قدم تقييماً شاملاً بصيغة JSON:
{
  "overallScore": <درجة من 0-100>,
  "matchPercentage": <نسبة التطابق 0-100>,
  "recommendation": "<highly_recommended أو recommended أو maybe أو not_recommended>",
  "recommendationAr": "<الترجمة العربية>",
  "strengths": [<قائمة نقاط القوة، 5-7 نقاط>],
  "weaknesses": [<قائمة نقاط الضعف، 3-5 نقاط>],
  "skillsMatch": {
    "matched": [<المهارات المتطابقة>],
    "missing": [<المهارات المفقودة>],
    "additional": [<مهارات إضافية يمتلكها>]
  },
  "experienceAnalysis": {
    "relevant": <true أو false>,
    "years": <عدد سنوات الخبرة ذات الصلة>,
    "quality": "<excellent أو good أو average أو below_average>",
    "details": "<تحليل تفصيلي>"
  },
  "educationMatch": {
    "meets": <true أو false>,
    "details": "<تفاصيل>"
  },
  "salaryExpectation": {
    "estimated": <الراتب المتوقع>,
    "inRange": <true أو false>,
    "notes": "<ملاحظات>"
  },
  "interviewQuestions": [<5-8 أسئلة مقترحة للمقابلة>],
  "redFlags": [<علامات تحذيرية إن وجدت>],
  "detailedAnalysis": "<تحليل شامل ومفصل>",
  "nextSteps": [<الخطوات التالية المقترحة>]
}

كن دقيقاً وموضوعياً في التقييم.`
    : `Evaluate the following candidate for the position:

${resumeText}

**Job Requirements:**
${jobText}

Provide a comprehensive evaluation in JSON format:
{
  "overallScore": <score 0-100>,
  "matchPercentage": <match percentage 0-100>,
  "recommendation": "<highly_recommended or recommended or maybe or not_recommended>",
  "recommendationAr": "<Arabic translation>",
  "strengths": [<list of strengths, 5-7 points>],
  "weaknesses": [<list of weaknesses, 3-5 points>],
  "skillsMatch": {
    "matched": [<matched skills>],
    "missing": [<missing skills>],
    "additional": [<additional skills they have>]
  },
  "experienceAnalysis": {
    "relevant": <true or false>,
    "years": <years of relevant experience>,
    "quality": "<excellent or good or average or below_average>",
    "details": "<detailed analysis>"
  },
  "educationMatch": {
    "meets": <true or false>,
    "details": "<details>"
  },
  "salaryExpectation": {
    "estimated": <expected salary>,
    "inRange": <true or false>,
    "notes": "<notes>"
  },
  "interviewQuestions": [<5-8 suggested interview questions>],
  "redFlags": [<red flags if any>],
  "detailedAnalysis": "<comprehensive detailed analysis>",
  "nextSteps": [<suggested next steps>]
}

Be accurate and objective in the evaluation.`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], 3000);

    let jsonText = response.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const evaluation = JSON.parse(jsonText) as CandidateEvaluation;

    if (!evaluation.overallScore || !evaluation.recommendation) {
      throw new Error("Incomplete evaluation data");
    }

    return evaluation;
  } catch (error) {
    console.error("Candidate Evaluation Error:", error);

    // تقييم افتراضي
    return {
      overallScore: 50,
      matchPercentage: 50,
      recommendation: "maybe",
      recommendationAr: "ربما",
      strengths: [isArabic ? "يحتاج لمراجعة يدوية" : "Needs manual review"],
      weaknesses: [],
      skillsMatch: {
        matched: [],
        missing: [],
        additional: [],
      },
      experienceAnalysis: {
        relevant: false,
        years: 0,
        quality: "average",
        details: isArabic ? "يحتاج لتحليل يدوي" : "Needs manual analysis",
      },
      educationMatch: {
        meets: false,
        details: isArabic ? "يحتاج لمراجعة" : "Needs review",
      },
      interviewQuestions: [],
      redFlags: [],
      detailedAnalysis: isArabic
        ? "حدث خطأ في التحليل. يرجى المراجعة اليدوية."
        : "Analysis error. Please review manually.",
      nextSteps: [],
    };
  }
}

/**
 * مقارنة عدة مرشحين وترتيبهم
 */
export async function rankCandidates(
  candidates: Array<{ resume: Resume; evaluation: CandidateEvaluation }>,
  jobRequirements: JobRequirements,
  language: "ar" | "en" = "ar"
): Promise<{
  ranking: Array<{
    candidateName: string;
    rank: number;
    score: number;
    reason: string;
  }>;
  summary: string;
  topPicks: string[];
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت خبير توظيف. قم بترتيب المرشحين بناءً على تقييماتهم وقدم ملخصاً.`
    : `You are a recruitment expert. Rank candidates based on their evaluations and provide a summary.`;

  const candidatesText = candidates
    .map(
      (c, idx) => `
${idx + 1}. ${c.resume.candidateName}
   - الدرجة: ${c.evaluation.overallScore}/100
   - التطابق: ${c.evaluation.matchPercentage}%
   - التوصية: ${c.evaluation.recommendationAr}
   - نقاط القوة: ${c.evaluation.strengths.slice(0, 3).join(", ")}
`
    )
    .join("\n");

  const userPrompt = isArabic
    ? `رتب المرشحين التاليين للوظيفة: ${jobRequirements.title}

${candidatesText}

قدم بصيغة JSON:
{
  "ranking": [
    {
      "candidateName": "<الاسم>",
      "rank": <الترتيب>,
      "score": <الدرجة>,
      "reason": "<سبب الترتيب>"
    }
  ],
  "summary": "<ملخص المقارنة>",
  "topPicks": [<أسماء أفضل 3 مرشحين>]
}`
    : `Rank the following candidates for position: ${jobRequirements.title}

${candidatesText}

Provide in JSON format:
{
  "ranking": [
    {
      "candidateName": "<name>",
      "rank": <rank>,
      "score": <score>,
      "reason": "<ranking reason>"
    }
  ],
  "summary": "<comparison summary>",
  "topPicks": [<names of top 3 candidates>]
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
    console.error("Ranking Error:", error);
    return {
      ranking: candidates.map((c, idx) => ({
        candidateName: c.resume.candidateName,
        rank: idx + 1,
        score: c.evaluation.overallScore,
        reason: "",
      })),
      summary: isArabic ? "حدث خطأ في الترتيب" : "Ranking error",
      topPicks: [],
    };
  }
}

/**
 * توليد وصف وظيفي احترافي
 */
export async function generateJobDescription(
  jobRequirements: JobRequirements,
  companyInfo: {
    name: string;
    industry: string;
    size: string;
    culture?: string;
  },
  language: "ar" | "en" = "ar"
): Promise<{
  description: string;
  requirements: string;
  benefits: string[];
  applicationInstructions: string;
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت كاتب محتوى موارد بشرية محترف. اكتب وصفاً وظيفياً جذاباً واحترافياً.`
    : `You are a professional HR content writer. Write an attractive and professional job description.`;

  const userPrompt = isArabic
    ? `اكتب وصفاً وظيفياً للوظيفة التالية:

**الوظيفة:** ${jobRequirements.title}
**القسم:** ${jobRequirements.department}
**المستوى:** ${jobRequirements.level}
**الشركة:** ${companyInfo.name}
**الصناعة:** ${companyInfo.industry}
**الحجم:** ${companyInfo.size}

**المتطلبات:**
- المهارات: ${jobRequirements.requiredSkills.join(", ")}
- الخبرة: ${jobRequirements.minExperience} سنوات
- التعليم: ${jobRequirements.education.join(", ")}

قدم بصيغة JSON:
{
  "description": "<وصف شامل وجذاب للوظيفة>",
  "requirements": "<متطلبات واضحة ومحددة>",
  "benefits": [<قائمة المزايا>],
  "applicationInstructions": "<تعليمات التقديم>"
}`
    : `Write a job description for the following position:

**Position:** ${jobRequirements.title}
**Department:** ${jobRequirements.department}
**Level:** ${jobRequirements.level}
**Company:** ${companyInfo.name}
**Industry:** ${companyInfo.industry}
**Size:** ${companyInfo.size}

**Requirements:**
- Skills: ${jobRequirements.requiredSkills.join(", ")}
- Experience: ${jobRequirements.minExperience} years
- Education: ${jobRequirements.education.join(", ")}

Provide in JSON format:
{
  "description": "<comprehensive and attractive job description>",
  "requirements": "<clear and specific requirements>",
  "benefits": [<list of benefits>],
  "applicationInstructions": "<application instructions>"
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
    console.error("Job Description Error:", error);
    return {
      description: isArabic ? "حدث خطأ في التوليد" : "Generation error",
      requirements: "",
      benefits: [],
      applicationInstructions: "",
    };
  }
}

/**
 * اقتراح أسئلة مقابلة مخصصة
 */
export async function generateInterviewQuestions(
  resume: Resume,
  jobRequirements: JobRequirements,
  focusAreas: string[],
  language: "ar" | "en" = "ar"
): Promise<{
  technical: string[];
  behavioral: string[];
  situational: string[];
  cultureF: string[];
}> {
  const isArabic = language === "ar";

  const systemPrompt = isArabic
    ? `أنت خبير موارد بشرية متخصص في المقابلات. اقترح أسئلة مقابلة مخصصة وذكية.`
    : `You are an HR expert specializing in interviews. Suggest customized and smart interview questions.`;

  const userPrompt = isArabic
    ? `اقترح أسئلة مقابلة للمرشح: ${resume.candidateName}
للوظيفة: ${jobRequirements.title}

**مجالات التركيز:** ${focusAreas.join(", ")}

**خبرة المرشح:**
${resume.experience.map((e) => `- ${e.title} في ${e.company}`).join("\n")}

قدم بصيغة JSON:
{
  "technical": [<5 أسئلة تقنية>],
  "behavioral": [<5 أسئلة سلوكية>],
  "situational": [<5 أسئلة موقفية>],
  "cultureFit": [<5 أسئلة التوافق الثقافي>]
}`
    : `Suggest interview questions for candidate: ${resume.candidateName}
For position: ${jobRequirements.title}

**Focus Areas:** ${focusAreas.join(", ")}

**Candidate Experience:**
${resume.experience.map((e) => `- ${e.title} at ${e.company}`).join("\n")}

Provide in JSON format:
{
  "technical": [<5 technical questions>],
  "behavioral": [<5 behavioral questions>],
  "situational": [<5 situational questions>],
  "cultureFit": [<5 culture fit questions>]
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
    console.error("Interview Questions Error:", error);
    return {
      technical: [],
      behavioral: [],
      situational: [],
      cultureF: [],
    };
  }
}

// ============================================
// Saudi Compliance Functions
// ============================================

/**
 * تقييم المرشح مع التحقق من الامتثال للأنظمة السعودية
 */
export async function evaluateCandidateWithCompliance(
  resume: Resume,
  jobRequirements: JobRequirements,
  companyContext: {
    sector: string;
    currentSaudis: number;
    totalEmployees: number;
    currentNitaqatBand: string;
  },
  candidateNationality: 'saudi' | 'non_saudi',
  language: "ar" | "en" = "ar"
): Promise<{
  evaluation: CandidateEvaluation;
  compliance: SaudiComplianceCheck;
  overallRecommendation: string;
}> {
  const isArabic = language === "ar";
  const isSaudi = candidateNationality === 'saudi';
  
  // 1. التقييم الأساسي للمرشح
  const evaluation = await evaluateCandidate(resume, jobRequirements, language);
  
  // 2. التحقق من متطلبات السعودة
  const localizationCheck = checkSaudizationRequirements(
    jobRequirements.title,
    companyContext.sector,
    isSaudi
  );
  
  // 3. حساب تأثير التوظيف على نطاقات
  const nitaqatImpact = calculateNitaqatImpact(
    companyContext.currentSaudis,
    companyContext.totalEmployees,
    companyContext.sector,
    1, // توظيف شخص واحد
    isSaudi ? 1 : 0
  );
  
  // 4. التحقق من متطلبات قوى
  const qiwaCompliance = {
    contractType: isSaudi ? 'عقد عمل سعودي' : 'عقد عمل وافد',
    registrationRequired: true,
    notes: [
      'يجب تسجيل العقد في منصة قوى خلال 7 أيام من التوظيف',
      isSaudi ? 'لا يتطلب تصريح عمل' : 'يتطلب تصريح عمل ساري المفعول',
      'يجب الالتزام بالحد الأدنى للأجور'
    ]
  };
  
  // 5. بناء توصية شاملة
  let overallRecommendation = '';
  
  if (localizationCheck.required) {
    overallRecommendation = isArabic
      ? `⚠️ تنبيه: ${localizationCheck.reason}. البدائل: ${localizationCheck.alternatives.join(', ')}`
      : `⚠️ Warning: ${localizationCheck.reason}. Alternatives: ${localizationCheck.alternatives.join(', ')}`;
  } else if (evaluation.recommendation === 'highly_recommended' || evaluation.recommendation === 'recommended') {
    if (nitaqatImpact.afterHiring === 'أحمر' || nitaqatImpact.afterHiring === 'أصفر') {
      overallRecommendation = isArabic
        ? `المرشح مناسب فنياً، لكن يُنصح بتوظيف سعودي لتحسين نطاق الشركة (${nitaqatImpact.afterHiring})`
        : `Candidate is technically suitable, but hiring a Saudi is recommended to improve Nitaqat band (${nitaqatImpact.afterHiring})`;
    } else {
      overallRecommendation = isArabic
        ? `✅ المرشح مناسب ويتوافق مع متطلبات الامتثال`
        : `✅ Candidate is suitable and complies with regulations`;
    }
  } else {
    overallRecommendation = isArabic
      ? `المرشح يحتاج لمراجعة إضافية. التقييم الفني: ${evaluation.recommendationAr}`
      : `Candidate needs additional review. Technical assessment: ${evaluation.recommendation}`;
  }
  
  return {
    evaluation,
    compliance: {
      nitaqatImpact,
      workPermitRequired: !isSaudi,
      saudiPreference: !isSaudi && (nitaqatImpact.afterHiring === 'أحمر' || nitaqatImpact.afterHiring === 'أصفر'),
      localizationRequirement: localizationCheck.required ? localizationCheck : undefined,
      qiwaCompliance
    },
    overallRecommendation
  };
}

/**
 * حساب تكلفة التوظيف الإجمالية (شاملة رسوم العمالة)
 */
export function calculateHiringCost(
  salary: number,
  isSaudi: boolean,
  includeGosi: boolean = true
): {
  monthlySalary: number;
  gosiEmployer: number;
  gosiEmployee: number;
  expatLevyMonthly: number;
  totalMonthlyCost: number;
  annualCost: number;
  breakdown: Record<string, number>;
} {
  const gosi = loadRegulation('gosi') as Record<string, any>;
  const rates = isSaudi ? gosi?.rates?.saudi : gosi?.rates?.nonSaudi;
  
  const gosiEmployer = includeGosi ? salary * ((rates?.employer || 12) / 100) : 0;
  const gosiEmployee = includeGosi ? salary * ((rates?.employee || 10) / 100) : 0;
  
  // رسوم المقابل المالي للوافدين (400 ريال شهرياً تقريباً)
  const expatLevyMonthly = isSaudi ? 0 : 400;
  
  const totalMonthlyCost = salary + gosiEmployer + expatLevyMonthly;
  
  return {
    monthlySalary: salary,
    gosiEmployer,
    gosiEmployee,
    expatLevyMonthly,
    totalMonthlyCost,
    annualCost: totalMonthlyCost * 12,
    breakdown: {
      'الراتب الأساسي': salary,
      'اشتراك GOSI (صاحب العمل)': gosiEmployer,
      'اشتراك GOSI (الموظف)': gosiEmployee,
      'رسوم المقابل المالي': expatLevyMonthly,
      'إجمالي التكلفة الشهرية': totalMonthlyCost
    }
  };
}

/**
 * توليد إعلان وظيفي متوافق مع الأنظمة السعودية
 */
export async function generateCompliantJobPosting(
  jobRequirements: JobRequirements,
  companyInfo: {
    name: string;
    industry: string;
    size: string;
    location: string;
  },
  preferences: {
    saudiOnly?: boolean;
    remoteAllowed?: boolean;
    experienceRange?: { min: number; max: number };
  },
  language: "ar" | "en" = "ar"
): Promise<{
  posting: string;
  complianceNotes: string[];
  suggestedPlatforms: string[];
}> {
  const isArabic = language === "ar";
  const laborLaw = getLaborLaw() as Record<string, any>;
  
  // التحقق من الوظائف المقصورة
  const nitaqat = getNitaqatRegulation() as Record<string, any>;
  const localizedJobs = nitaqat?.localizedJobs || [];
  const isLocalized = localizedJobs.some((job: string) => 
    jobRequirements.title.toLowerCase().includes(job.toLowerCase())
  );
  
  const complianceNotes: string[] = [];
  
  if (isLocalized) {
    complianceNotes.push(isArabic 
      ? 'هذه الوظيفة مقصورة على السعوديين بموجب قرارات التوطين'
      : 'This position is restricted to Saudi nationals per localization decisions');
  }
  
  complianceNotes.push(isArabic
    ? 'يجب الالتزام بالحد الأدنى للأجور حسب نظام العمل'
    : 'Must comply with minimum wage requirements per Labor Law');
  
  if (preferences.remoteAllowed) {
    complianceNotes.push(isArabic
      ? 'العمل عن بُعد يتطلب تسجيل العقد في منصة قوى'
      : 'Remote work requires contract registration in Qiwa platform');
  }
  
  const systemPrompt = isArabic
    ? `أنت كاتب محتوى موارد بشرية محترف في السعودية. اكتب إعلاناً وظيفياً جذاباً ومتوافقاً مع الأنظمة.`
    : `You are a professional HR content writer in Saudi Arabia. Write an attractive job posting compliant with regulations.`;

  const userPrompt = isArabic
    ? `اكتب إعلاناً وظيفياً للوظيفة التالية:

**الوظيفة:** ${jobRequirements.title}
**الشركة:** ${companyInfo.name}
**الموقع:** ${companyInfo.location}
**الخبرة:** ${jobRequirements.minExperience}+ سنوات
**المهارات:** ${jobRequirements.requiredSkills.join(', ')}
${isLocalized ? '**ملاحظة:** الوظيفة مقصورة على السعوديين' : ''}
${preferences.remoteAllowed ? '**نوع العمل:** يدعم العمل عن بُعد' : ''}

اكتب إعلاناً احترافياً يتضمن:
1. وصف الوظيفة
2. المتطلبات
3. المزايا
4. طريقة التقديم`
    : `Write a job posting for:

**Position:** ${jobRequirements.title}
**Company:** ${companyInfo.name}
**Location:** ${companyInfo.location}
**Experience:** ${jobRequirements.minExperience}+ years
**Skills:** ${jobRequirements.requiredSkills.join(', ')}
${isLocalized ? '**Note:** Position restricted to Saudi nationals' : ''}
${preferences.remoteAllowed ? '**Work Type:** Remote work supported' : ''}

Write a professional posting including:
1. Job description
2. Requirements
3. Benefits
4. How to apply`;

  try {
    const response = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    return {
      posting: response.content,
      complianceNotes,
      suggestedPlatforms: [
        'منصة قوى (Qiwa)',
        'طاقات (Taqat)',
        'LinkedIn',
        'Indeed Saudi Arabia',
        'Bayt.com'
      ]
    };
  } catch (error) {
    console.error("Job Posting Error:", error);
    return {
      posting: isArabic ? 'حدث خطأ في توليد الإعلان' : 'Error generating posting',
      complianceNotes,
      suggestedPlatforms: []
    };
  }
}
