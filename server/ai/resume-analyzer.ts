/**
 * AI Resume Analyzer Module - تحليل السير الذاتية بالذكاء الاصطناعي
 * Advanced resume parsing and candidate matching
 */

import { callLLM } from "../_core/llm";
import { logger } from "../utils/logger";

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
