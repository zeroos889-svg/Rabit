/**
 * AI Resume Analyzer Module - تحليل السير الذاتية بالذكاء الاصطناعي
 * Advanced resume parsing and candidate matching
 * مع تكامل قاعدة المعرفة للامتثال للأنظمة السعودية
 */

import { callLLM } from "../_core/llm";
import { logger } from "../utils/logger";
import { loadRegulation } from "./knowledge-base-loader";

// Knowledge Base Helpers
function getLaborLaw() {
  return loadRegulation("labor-law") as Record<string, any>;
}

function getNitaqat() {
  return loadRegulation("nitaqat") as Record<string, any>;
}

function getLocalizedJobs() {
  return loadRegulation("localized-jobs") as Record<string, any>;
}

// ============================================
// Types & Interfaces
// ============================================

export interface ResumeData {
  rawText: string;
  fileName?: string;
  fileType?: "pdf" | "docx" | "txt";
}

export interface ParsedResume {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: LanguageSkill[];
  };
  certifications: Certification[];
  totalExperienceYears: number;
  confidence: number;
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface LanguageSkill {
  language: string;
  proficiency: "native" | "fluent" | "professional" | "conversational" | "basic";
}

export interface JobRequirements {
  title: string;
  department?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minExperienceYears: number;
  maxExperienceYears?: number;
  requiredEducation?: string;
  requiredCertifications?: string[];
  jobDescription?: string;
}

export interface CandidateMatch {
  overallScore: number; // 0-100
  skillsMatch: {
    score: number;
    matched: string[];
    missing: string[];
    additional: string[];
  };
  experienceMatch: {
    score: number;
    yearsRequired: number;
    yearsHave: number;
    relevantRoles: string[];
  };
  educationMatch: {
    score: number;
    meetsRequirement: boolean;
    details: string;
  };
  certificationsMatch: {
    score: number;
    matched: string[];
    missing: string[];
  };
  strengths: string[];
  concerns: string[];
  recommendation: "highly_recommended" | "recommended" | "consider" | "not_recommended";
  summaryAr: string;
  summaryEn: string;
}

// ============================================
// Resume Parsing
// ============================================

/**
 * Parse resume text into structured data
 */
export async function parseResume(
  resume: ResumeData,
  language: "ar" | "en" = "en"
): Promise<ParsedResume> {
  logger.info("Parsing resume", { context: "ResumeAnalyzer", fileName: resume.fileName });

  const systemPrompt = `You are an expert resume parser. Extract structured information from resumes accurately.

Output must be valid JSON with this exact structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "portfolio": "string or null"
  },
  "summary": "string or null",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string or null",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null",
      "current": boolean,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "field": "string",
      "institution": "string",
      "location": "string or null",
      "graduationDate": "YYYY or null",
      "gpa": "string or null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "languages": [{"language": "string", "proficiency": "native|fluent|professional|conversational|basic"}]
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM or null",
      "expiryDate": "YYYY-MM or null",
      "credentialId": "string or null"
    }
  ],
  "totalExperienceYears": number
}

Rules:
- Extract ALL information available
- For dates, use YYYY-MM format when possible, YYYY if only year available
- Mark current job with current: true and endDate: null
- Calculate totalExperienceYears accurately
- Separate technical skills (programming, tools, technologies) from soft skills
- If information is not found, use null or empty array`;

  try {
    const response = await callLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Parse this resume:\n\n${resume.rawText}` },
      ],
      maxTokens: 2000,
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonRegex.exec(content) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content;
    
    const parsed = JSON.parse(jsonStr) as Omit<ParsedResume, "confidence">;
    
    return {
      ...parsed,
      confidence: 0.85,
    };
  } catch (error) {
    logger.error("Resume parsing failed", { context: "ResumeAnalyzer", error });
    throw new Error(language === "ar" 
      ? "فشل في تحليل السيرة الذاتية" 
      : "Failed to parse resume");
  }
}

// ============================================
// Candidate Matching
// ============================================

/**
 * Match a parsed resume against job requirements
 */
export async function matchCandidate(
  resume: ParsedResume,
  requirements: JobRequirements
): Promise<CandidateMatch> {
  logger.info("Matching candidate to job", { 
    context: "ResumeAnalyzer", 
    jobTitle: requirements.title,
    candidateName: resume.personalInfo.name 
  });

  const systemPrompt = `You are an expert recruiter AI. Analyze how well a candidate matches job requirements.

Provide a detailed, objective analysis with scores from 0-100. Be fair but thorough.

Output must be valid JSON with this structure:
{
  "overallScore": number (0-100),
  "skillsMatch": {
    "score": number (0-100),
    "matched": ["skills the candidate has that match requirements"],
    "missing": ["required skills the candidate lacks"],
    "additional": ["valuable skills not required but candidate has"]
  },
  "experienceMatch": {
    "score": number (0-100),
    "yearsRequired": number,
    "yearsHave": number,
    "relevantRoles": ["relevant job titles from experience"]
  },
  "educationMatch": {
    "score": number (0-100),
    "meetsRequirement": boolean,
    "details": "explanation"
  },
  "certificationsMatch": {
    "score": number (0-100),
    "matched": ["certifications that match requirements"],
    "missing": ["required certifications missing"]
  },
  "strengths": ["top 3-5 candidate strengths for this role"],
  "concerns": ["top 3-5 concerns or gaps"],
  "recommendation": "highly_recommended | recommended | consider | not_recommended",
  "summaryAr": "Arabic summary in 2-3 sentences",
  "summaryEn": "English summary in 2-3 sentences"
}

Scoring guidelines:
- 90-100: Exceptional match, exceeds requirements
- 75-89: Strong match, meets all key requirements
- 60-74: Good match, meets most requirements
- 40-59: Partial match, some gaps but potential
- 0-39: Poor match, significant gaps`;

  const userPrompt = `
Job Requirements:
- Title: ${requirements.title}
- Department: ${requirements.department || "Not specified"}
- Required Skills: ${requirements.requiredSkills.join(", ")}
- Preferred Skills: ${requirements.preferredSkills?.join(", ") || "None specified"}
- Experience Required: ${requirements.minExperienceYears}-${requirements.maxExperienceYears || "+"} years
- Education Required: ${requirements.requiredEducation || "Not specified"}
- Required Certifications: ${requirements.requiredCertifications?.join(", ") || "None"}
- Job Description: ${requirements.jobDescription || "Not provided"}

Candidate Resume:
- Name: ${resume.personalInfo.name}
- Location: ${resume.personalInfo.location || "Not specified"}
- Total Experience: ${resume.totalExperienceYears} years
- Summary: ${resume.summary || "Not provided"}

Work Experience:
${resume.experience.map(exp => 
  `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`
).join("\n")}

Education:
${resume.education.map(edu => 
  `- ${edu.degree} in ${edu.field} from ${edu.institution}`
).join("\n")}

Technical Skills: ${resume.skills.technical.join(", ")}
Soft Skills: ${resume.skills.soft.join(", ")}
Languages: ${resume.skills.languages.map(l => `${l.language} (${l.proficiency})`).join(", ")}

Certifications:
${resume.certifications.map(cert => `- ${cert.name} by ${cert.issuer}`).join("\n")}

Analyze the match and provide scores.`;

  try {
    const response = await callLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1500,
    });

    const rawContent2 = response.choices[0]?.message?.content;
    const content = typeof rawContent2 === 'string' ? rawContent2 : "{}";
    const jsonRegex2 = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonRegex2.exec(content) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content;
    
    return JSON.parse(jsonStr) as CandidateMatch;
  } catch (error) {
    logger.error("Candidate matching failed", { context: "ResumeAnalyzer", error });
    
    // Return a basic match result on error
    return {
      overallScore: 0,
      skillsMatch: { score: 0, matched: [], missing: requirements.requiredSkills, additional: [] },
      experienceMatch: { 
        score: 0, 
        yearsRequired: requirements.minExperienceYears, 
        yearsHave: resume.totalExperienceYears,
        relevantRoles: [] 
      },
      educationMatch: { score: 0, meetsRequirement: false, details: "Error in analysis" },
      certificationsMatch: { score: 0, matched: [], missing: [] },
      strengths: [],
      concerns: ["Analysis failed - manual review required"],
      recommendation: "consider",
      summaryAr: "حدث خطأ في التحليل، يرجى المراجعة اليدوية",
      summaryEn: "Analysis error occurred, manual review required",
    };
  }
}

// ============================================
// Batch Processing
// ============================================

/**
 * Rank multiple candidates against a job
 */
export async function rankCandidates(
  resumes: ParsedResume[],
  requirements: JobRequirements
): Promise<Array<{ resume: ParsedResume; match: CandidateMatch; rank: number }>> {
  logger.info("Ranking candidates", { 
    context: "ResumeAnalyzer", 
    candidateCount: resumes.length,
    jobTitle: requirements.title 
  });

  const results: Array<{ resume: ParsedResume; match: CandidateMatch; rank: number }> = [];

  // Process all candidates
  for (const resume of resumes) {
    try {
      const match = await matchCandidate(resume, requirements);
      results.push({ resume, match, rank: 0 });
    } catch (error) {
      logger.warn("Failed to match candidate", { 
        context: "ResumeAnalyzer",
        candidateName: resume.personalInfo.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Continue processing other candidates even if one fails
    }
  }

  // Sort by overall score and assign ranks
  results.sort((a, b) => b.match.overallScore - a.match.overallScore);
  for (const [index, result] of results.entries()) {
    result.rank = index + 1;
  }

  return results;
}

// ============================================
// Skills Gap Analysis
// ============================================

/**
 * Analyze skills gap for a candidate
 */
export async function analyzeSkillsGap(
  resume: ParsedResume,
  targetRole: string,
  language: "ar" | "en" = "en"
): Promise<{
  currentSkills: string[];
  requiredSkills: string[];
  gaps: string[];
  recommendations: Array<{
    skill: string;
    priority: "high" | "medium" | "low";
    resources: string[];
    timeToLearn: string;
  }>;
  summary: string;
}> {
  const systemPrompt = language === "ar" 
    ? `أنت خبير في تطوير المهارات المهنية. قم بتحليل الفجوة في المهارات للموظف وقدم توصيات محددة للتطوير.`
    : `You are an expert in professional skills development. Analyze the skills gap for an employee and provide specific development recommendations.`;

  const userPrompt = language === "ar"
    ? `
المهارات الحالية:
التقنية: ${resume.skills.technical.join(", ")}
الشخصية: ${resume.skills.soft.join(", ")}

الدور المستهدف: ${targetRole}
سنوات الخبرة: ${resume.totalExperienceYears}

قدم تحليلاً شاملاً للفجوة في المهارات مع توصيات للتطوير بصيغة JSON.`
    : `
Current Skills:
Technical: ${resume.skills.technical.join(", ")}
Soft: ${resume.skills.soft.join(", ")}

Target Role: ${targetRole}
Years of Experience: ${resume.totalExperienceYears}

Provide a comprehensive skills gap analysis with development recommendations in JSON format.`;

  try {
    const response = await callLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 1500,
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const jsonMatch = jsonRegex.exec(content) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content;
    
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error("Skills gap analysis failed", { context: "ResumeAnalyzer", error });
    
    return {
      currentSkills: [...resume.skills.technical, ...resume.skills.soft],
      requiredSkills: [],
      gaps: [],
      recommendations: [],
      summary: language === "ar" 
        ? "حدث خطأ في التحليل" 
        : "Analysis error occurred",
    };
  }
}

// ============================================
// Export Functions
// ============================================

export const resumeAnalyzer = {
  parseResume,
  matchCandidate,
  rankCandidates,
  analyzeSkillsGap,
};

export default resumeAnalyzer;

// ============================================
// Saudi Compliance Analysis - تحليل الامتثال السعودي
// ============================================

interface SaudiComplianceInfo {
  nationalityStatus: "saudi" | "gcc" | "expat" | "unknown";
  nationalityStatusAr: string;
  isSaudiCandidate: boolean;
  isGCCCitizen: boolean;
  visaRequired: boolean;
  
  // تحليل الوظائف المقصورة
  localizedJobAnalysis: {
    positionLocalizedToSaudis: boolean;
    localizedPositionName?: string;
    canApply: boolean;
    reason: string;
    reasonAr: string;
  };
  
  // تحليل نطاقات
  nitaqatImpact: {
    countsAsLocalContent: boolean;
    nitaqatPoints: number;
    impactOnBand: "positive" | "neutral" | "negative";
    details: string;
    detailsAr: string;
  };
  
  // المؤهلات السعودية المعترف بها
  saudiQualifications: {
    hasSaudiDegree: boolean;
    recognizedInstitutions: string[];
    professionalLicenses: string[];
    needsEquivalency: boolean;
  };
  
  // متطلبات التوظيف
  hiringRequirements: {
    documentsNeeded: string[];
    additionalChecks: string[];
    estimatedProcessingTime: string;
  };
  
  recommendations: string[];
  complianceScore: number; // 0-100
}

/**
 * تحليل مؤهلات المرشح للامتثال للأنظمة السعودية
 */
export async function analyzeSaudiCompliance(
  resume: ParsedResume,
  targetPosition: string,
  sector: string,
  language: "ar" | "en" = "ar"
): Promise<SaudiComplianceInfo> {
  const isArabic = language === "ar";
  const localizedJobs = getLocalizedJobs();
  const nitaqat = getNitaqat();
  
  // تحديد الجنسية من السيرة الذاتية
  const nationalityInfo = detectNationality(resume);
  
  // تحليل الوظائف المقصورة
  const localizedAnalysis = checkLocalizedPosition(targetPosition, sector, nationalityInfo.isSaudi, localizedJobs);
  
  // تحليل أثر نطاقات
  const nitaqatImpact = analyzeNitaqatImpact(nationalityInfo, nitaqat);
  
  // تحليل المؤهلات السعودية
  const qualifications = analyzeSaudiQualifications(resume);
  
  // تحديد متطلبات التوظيف
  const hiringReqs = getHiringRequirements(nationalityInfo, qualifications);
  
  // حساب درجة الامتثال
  let complianceScore = 100;
  if (!localizedAnalysis.canApply) complianceScore -= 50;
  if (nationalityInfo.visaRequired) complianceScore -= 10;
  if (qualifications.needsEquivalency) complianceScore -= 10;
  if (!nationalityInfo.isSaudi && !nationalityInfo.isGCC) complianceScore -= 15;
  
  // توليد التوصيات
  const recommendations: string[] = [];
  
  if (!localizedAnalysis.canApply) {
    recommendations.push(isArabic 
      ? `هذه الوظيفة مقصورة على السعوديين - ${localizedAnalysis.reasonAr}`
      : `This position is localized to Saudis - ${localizedAnalysis.reason}`);
  }
  
  if (qualifications.needsEquivalency) {
    recommendations.push(isArabic
      ? "يحتاج المرشح لمعادلة شهادته من وزارة التعليم"
      : "Candidate needs degree equivalency from Ministry of Education");
  }
  
  if (nationalityInfo.visaRequired) {
    recommendations.push(isArabic
      ? "المرشح يحتاج تأشيرة عمل وتصريح عمل"
      : "Candidate requires work visa and work permit");
  }
  
  if (nitaqatImpact.impactOnBand === "positive") {
    recommendations.push(isArabic
      ? "توظيف هذا المرشح سيحسن نطاق المنشأة"
      : "Hiring this candidate will improve company's Nitaqat band");
  }
  
  return {
    nationalityStatus: nationalityInfo.status,
    nationalityStatusAr: nationalityInfo.statusAr,
    isSaudiCandidate: nationalityInfo.isSaudi,
    isGCCCitizen: nationalityInfo.isGCC,
    visaRequired: nationalityInfo.visaRequired,
    localizedJobAnalysis: localizedAnalysis,
    nitaqatImpact,
    saudiQualifications: qualifications,
    hiringRequirements: hiringReqs,
    recommendations,
    complianceScore: Math.max(0, complianceScore)
  };
}

/**
 * تحديد جنسية المرشح من السيرة الذاتية
 */
function detectNationality(resume: ParsedResume): {
  status: "saudi" | "gcc" | "expat" | "unknown";
  statusAr: string;
  isSaudi: boolean;
  isGCC: boolean;
  visaRequired: boolean;
} {
  const location = resume.personalInfo.location?.toLowerCase() || "";
  const name = resume.personalInfo.name?.toLowerCase() || "";
  const education = resume.education.map(e => e.institution.toLowerCase()).join(" ");
  
  // مؤشرات سعودية
  const saudiIndicators = [
    "saudi", "سعودي", "riyadh", "الرياض", "jeddah", "جدة", 
    "dammam", "الدمام", "makkah", "مكة", "madinah", "المدينة",
    "ksa", "المملكة العربية السعودية"
  ];
  
  // دول مجلس التعاون
  const gccCountries = [
    "uae", "إمارات", "kuwait", "كويت", "bahrain", "بحرين",
    "qatar", "قطر", "oman", "عمان"
  ];
  
  // التحقق من المؤشرات
  const hasSaudiIndicator = saudiIndicators.some(ind => 
    location.includes(ind) || education.includes(ind)
  );
  
  const hasGCCIndicator = gccCountries.some(ind => 
    location.includes(ind) || education.includes(ind)
  );
  
  // جامعات سعودية معروفة
  const saudiUniversities = [
    "king saud", "الملك سعود", "king abdulaziz", "الملك عبدالعزيز",
    "king fahd", "الملك فهد", "umm al-qura", "أم القرى",
    "imam muhammad", "الإمام محمد", "princess nourah", "الأميرة نورة"
  ];
  
  const hasSaudiDegree = saudiUniversities.some(uni => 
    education.includes(uni)
  );
  
  if (hasSaudiIndicator || hasSaudiDegree) {
    return {
      status: "saudi",
      statusAr: "سعودي",
      isSaudi: true,
      isGCC: false,
      visaRequired: false
    };
  }
  
  if (hasGCCIndicator) {
    return {
      status: "gcc",
      statusAr: "مواطن خليجي",
      isSaudi: false,
      isGCC: true,
      visaRequired: false // مواطنو الخليج لا يحتاجون تأشيرة
    };
  }
  
  return {
    status: "unknown",
    statusAr: "غير محدد",
    isSaudi: false,
    isGCC: false,
    visaRequired: true
  };
}

/**
 * التحقق من الوظائف المقصورة على السعوديين
 */
function checkLocalizedPosition(
  position: string,
  sector: string,
  isSaudi: boolean,
  localizedJobs: Record<string, any>
): {
  positionLocalizedToSaudis: boolean;
  localizedPositionName?: string;
  canApply: boolean;
  reason: string;
  reasonAr: string;
} {
  const positionLower = position.toLowerCase();
  
  // قائمة الوظائف المقصورة الشائعة
  const localizedPositions = [
    { en: "hr", ar: "موارد بشرية", positions: ["hr manager", "hr director", "مدير موارد بشرية"] },
    { en: "security", ar: "أمن", positions: ["security guard", "حارس أمن", "security officer"] },
    { en: "reception", ar: "استقبال", positions: ["receptionist", "موظف استقبال"] },
    { en: "sales", ar: "مبيعات", positions: ["sales representative", "مندوب مبيعات"] },
    { en: "accounting", ar: "محاسبة", positions: ["accountant", "محاسب", "cashier", "أمين صندوق"] },
    { en: "government relations", ar: "علاقات حكومية", positions: ["government relations", "معقب", "علاقات حكومية"] }
  ];
  
  // التحقق من تطابق الوظيفة
  for (const category of localizedPositions) {
    if (category.positions.some(p => positionLower.includes(p.toLowerCase()))) {
      if (isSaudi) {
        return {
          positionLocalizedToSaudis: true,
          localizedPositionName: category.ar,
          canApply: true,
          reason: "Saudi candidate eligible for localized position",
          reasonAr: "المرشح السعودي مؤهل للوظيفة المقصورة"
        };
      } else {
        return {
          positionLocalizedToSaudis: true,
          localizedPositionName: category.ar,
          canApply: false,
          reason: `This position (${category.en}) is localized to Saudis only`,
          reasonAr: `هذه الوظيفة (${category.ar}) مقصورة على السعوديين فقط`
        };
      }
    }
  }
  
  return {
    positionLocalizedToSaudis: false,
    canApply: true,
    reason: "Position is open to all nationalities",
    reasonAr: "الوظيفة متاحة لجميع الجنسيات"
  };
}

/**
 * تحليل أثر التوظيف على نطاقات
 */
function analyzeNitaqatImpact(
  nationalityInfo: { isSaudi: boolean; isGCC: boolean },
  nitaqat: Record<string, any>
): {
  countsAsLocalContent: boolean;
  nitaqatPoints: number;
  impactOnBand: "positive" | "neutral" | "negative";
  details: string;
  detailsAr: string;
} {
  if (nationalityInfo.isSaudi) {
    return {
      countsAsLocalContent: true,
      nitaqatPoints: 1,
      impactOnBand: "positive",
      details: "Saudi employee counts fully towards Saudization quota",
      detailsAr: "الموظف السعودي يحتسب بالكامل في نسبة السعودة"
    };
  }
  
  if (nationalityInfo.isGCC) {
    return {
      countsAsLocalContent: false,
      nitaqatPoints: 0,
      impactOnBand: "neutral",
      details: "GCC citizen does not count towards Saudization but doesn't require sponsorship",
      detailsAr: "المواطن الخليجي لا يحتسب في السعودة لكن لا يحتاج كفالة"
    };
  }
  
  return {
    countsAsLocalContent: false,
    nitaqatPoints: 0,
    impactOnBand: "negative",
    details: "Expat hire will increase total headcount without improving Saudization ratio",
    detailsAr: "توظيف أجنبي سيزيد إجمالي الموظفين دون تحسين نسبة السعودة"
  };
}

/**
 * تحليل المؤهلات السعودية
 */
function analyzeSaudiQualifications(resume: ParsedResume): {
  hasSaudiDegree: boolean;
  recognizedInstitutions: string[];
  professionalLicenses: string[];
  needsEquivalency: boolean;
} {
  const saudiUniversities = [
    "king saud university", "جامعة الملك سعود",
    "king abdulaziz university", "جامعة الملك عبدالعزيز",
    "king fahd university", "جامعة الملك فهد",
    "umm al-qura university", "جامعة أم القرى",
    "imam muhammad ibn saud", "جامعة الإمام محمد",
    "princess nourah university", "جامعة الأميرة نورة",
    "king khalid university", "جامعة الملك خالد",
    "qassim university", "جامعة القصيم",
    "taibah university", "جامعة طيبة",
    "jazan university", "جامعة جازان"
  ];
  
  const recognizedInternational = [
    "harvard", "mit", "stanford", "oxford", "cambridge",
    "american university", "british university"
  ];
  
  const recognizedInstitutions: string[] = [];
  let hasSaudiDegree = false;
  let needsEquivalency = false;
  
  for (const edu of resume.education) {
    const instLower = edu.institution.toLowerCase();
    
    // التحقق من الجامعات السعودية
    if (saudiUniversities.some(uni => instLower.includes(uni.toLowerCase()))) {
      hasSaudiDegree = true;
      recognizedInstitutions.push(edu.institution);
    }
    // التحقق من الجامعات الدولية المعترف بها
    else if (recognizedInternational.some(uni => instLower.includes(uni.toLowerCase()))) {
      recognizedInstitutions.push(edu.institution);
    }
    // جامعات أخرى قد تحتاج معادلة
    else if (edu.degree.toLowerCase().includes("bachelor") || 
             edu.degree.toLowerCase().includes("master") ||
             edu.degree.toLowerCase().includes("بكالوريوس") ||
             edu.degree.toLowerCase().includes("ماجستير")) {
      needsEquivalency = true;
    }
  }
  
  // الرخص المهنية
  const professionalLicenses: string[] = [];
  const licenseCertifications = [
    "cpa", "cma", "cfa", "pmp", "shrm", "cipd",
    "socpa", "هيئة المحاسبين", "هيئة المهندسين"
  ];
  
  for (const cert of resume.certifications) {
    if (licenseCertifications.some(lic => 
      cert.name.toLowerCase().includes(lic.toLowerCase())
    )) {
      professionalLicenses.push(cert.name);
    }
  }
  
  return {
    hasSaudiDegree,
    recognizedInstitutions,
    professionalLicenses,
    needsEquivalency: needsEquivalency && !hasSaudiDegree
  };
}

/**
 * تحديد متطلبات التوظيف حسب حالة المرشح
 */
function getHiringRequirements(
  nationalityInfo: { isSaudi: boolean; isGCC: boolean; visaRequired: boolean },
  qualifications: { needsEquivalency: boolean }
): {
  documentsNeeded: string[];
  additionalChecks: string[];
  estimatedProcessingTime: string;
} {
  const documents: string[] = [];
  const checks: string[] = [];
  
  // المستندات الأساسية للجميع
  documents.push("صورة الهوية / جواز السفر");
  documents.push("السيرة الذاتية");
  documents.push("صور الشهادات الأكاديمية");
  
  if (nationalityInfo.isSaudi) {
    documents.push("صورة الهوية الوطنية");
    documents.push("شهادة حسن السيرة (للوظائف الحساسة)");
    checks.push("التحقق من المؤهلات عبر منصة مقيم");
    return {
      documentsNeeded: documents,
      additionalChecks: checks,
      estimatedProcessingTime: "3-5 أيام عمل"
    };
  }
  
  if (nationalityInfo.isGCC) {
    documents.push("جواز السفر ساري المفعول");
    documents.push("بطاقة الهوية الخليجية");
    checks.push("التحقق من صلاحية الهوية");
    return {
      documentsNeeded: documents,
      additionalChecks: checks,
      estimatedProcessingTime: "5-7 أيام عمل"
    };
  }
  
  // للأجانب
  documents.push("جواز السفر ساري (6 أشهر على الأقل)");
  documents.push("شهادات الخبرة مصدقة من السفارة");
  documents.push("الشهادات الأكاديمية مصدقة ومترجمة");
  documents.push("صورة شخصية بخلفية بيضاء");
  documents.push("فحص طبي معتمد");
  
  if (qualifications.needsEquivalency) {
    documents.push("معادلة الشهادة من وزارة التعليم");
  }
  
  checks.push("التحقق من عدم وجود حظر دخول");
  checks.push("الفحص الطبي للأمراض المعدية");
  checks.push("التحقق من المهنة في جواز السفر");
  checks.push("مطابقة المهنة مع التأشيرة المطلوبة");
  
  return {
    documentsNeeded: documents,
    additionalChecks: checks,
    estimatedProcessingTime: "2-4 أسابيع (يشمل إجراءات التأشيرة)"
  };
}

/**
 * مطابقة المرشح مع متطلبات الوظيفة مع اعتبارات السعودة
 */
export async function matchCandidateWithCompliance(
  resume: ParsedResume,
  requirements: JobRequirements,
  sector: string,
  prioritizeSaudization: boolean = true,
  language: "ar" | "en" = "ar"
): Promise<CandidateMatch & { complianceInfo: SaudiComplianceInfo }> {
  // المطابقة الأساسية
  const basicMatch = await matchCandidate(resume, requirements);
  
  // تحليل الامتثال السعودي
  const complianceInfo = await analyzeSaudiCompliance(
    resume, 
    requirements.title, 
    sector, 
    language
  );
  
  // تعديل الدرجة بناءً على الامتثال
  let adjustedScore = basicMatch.overallScore;
  
  if (prioritizeSaudization) {
    if (complianceInfo.isSaudiCandidate) {
      adjustedScore = Math.min(100, adjustedScore + 10);
      basicMatch.strengths.push(language === "ar" 
        ? "مرشح سعودي - يدعم نسبة السعودة"
        : "Saudi candidate - supports Saudization quota");
    }
    
    if (!complianceInfo.localizedJobAnalysis.canApply) {
      adjustedScore = 0;
      basicMatch.concerns.unshift(language === "ar"
        ? "الوظيفة مقصورة على السعوديين"
        : "Position is localized to Saudis only");
      basicMatch.recommendation = "not_recommended";
    }
  }
  
  return {
    ...basicMatch,
    overallScore: adjustedScore,
    complianceInfo
  };
}

/**
 * ترتيب المرشحين مع اعتبارات السعودة
 */
export async function rankCandidatesWithCompliance(
  resumes: ParsedResume[],
  requirements: JobRequirements,
  sector: string,
  prioritizeSaudization: boolean = true,
  language: "ar" | "en" = "ar"
): Promise<Array<{
  resume: ParsedResume;
  match: CandidateMatch;
  complianceInfo: SaudiComplianceInfo;
  rank: number;
}>> {
  const results: Array<{
    resume: ParsedResume;
    match: CandidateMatch;
    complianceInfo: SaudiComplianceInfo;
    rank: number;
  }> = [];
  
  for (const resume of resumes) {
    try {
      const matchWithCompliance = await matchCandidateWithCompliance(
        resume, requirements, sector, prioritizeSaudization, language
      );
      
      results.push({
        resume,
        match: matchWithCompliance,
        complianceInfo: matchWithCompliance.complianceInfo,
        rank: 0
      });
    } catch (error) {
      logger.warn("Failed to match candidate with compliance", {
        context: "ResumeAnalyzer",
        candidateName: resume.personalInfo.name,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  
  // ترتيب مع أولوية السعوديين إذا مطلوب
  results.sort((a, b) => {
    if (prioritizeSaudization) {
      // السعوديون أولاً
      if (a.complianceInfo.isSaudiCandidate && !b.complianceInfo.isSaudiCandidate) return -1;
      if (!a.complianceInfo.isSaudiCandidate && b.complianceInfo.isSaudiCandidate) return 1;
    }
    // ثم حسب الدرجة
    return b.match.overallScore - a.match.overallScore;
  });
  
  // تعيين الرتب
  for (const [index, result] of results.entries()) {
    result.rank = index + 1;
  }
  
  return results;
}
