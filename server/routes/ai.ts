/**
 * AI Router - tRPC Procedures
 * مسارات الذكاء الاصطناعي - إجراءات tRPC
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getAIAssistantResponse, generateDocumentContent, analyzeHRData } from "../ai/assistant";
import {
  evaluateEmployeePerformance,
  comparePerformanceWithDepartment,
  generateDevelopmentPlan,
} from "../ai/performance-evaluator";
import {
  evaluateCandidate,
  rankCandidates,
  generateJobDescription,
  generateInterviewQuestions,
} from "../ai/hiring-assistant";
import {
  recommendTraining,
  generateDepartmentTrainingPlan,
  evaluateTrainingEffectiveness,
} from "../ai/training-recommender";

const SUPPORTED_LANGUAGES = ["ar", "en"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const skillLevelScale = ["beginner", "intermediate", "advanced", "expert"] as const;
type SkillLevel = (typeof skillLevelScale)[number];

const performanceMetricsSchema = z.object({
  attendanceRate: z.number().min(0).max(100),
  taskCompletionRate: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  teamworkScore: z.number().min(0).max(100),
  punctualityScore: z.number().min(0).max(100),
  initiativeScore: z.number().min(0).max(100),
  customerSatisfaction: z.number().min(0).max(100).optional(),
  salesPerformance: z.number().min(0).max(100).optional(),
});

const evaluateEmployeeSchema = z.object({
  employeeId: z.number().optional().default(0),
  employeeName: z.string(),
  position: z.string(),
  department: z.string(),
  joiningDate: z.string().default("N/A"),
  reviewPeriod: z.string().optional(),
  metrics: performanceMetricsSchema,
  achievements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  managerNotes: z.string().optional(),
  previousReviews: z.array(z.string()).optional(),
  currentSalary: z.number().optional(),
});

const performanceRatingOptions = ["excellent", "very_good", "good", "needs_improvement", "poor"] as const;
const performanceRatingArOptions = ["ممتاز", "جيد جداً", "جيد", "يحتاج تحسين", "ضعيف"] as const;
const salaryRecommendationActions = ["increase", "maintain", "review"] as const;
const candidateRecommendationOptions = [
  "highly_recommended",
  "recommended",
  "maybe",
  "not_recommended",
] as const;
const candidateRecommendationArOptions = ["موصى به بشدة", "موصى به", "ربما", "غير موصى به"] as const;
const experienceQualityOptions = ["excellent", "good", "average", "below_average"] as const;

type PerformanceEvaluationInput = Parameters<typeof generateDevelopmentPlan>[0];

const performanceEvaluationSchema = z.object({
  overallScore: z.number(),
  rating: z.enum(performanceRatingOptions),
  ratingAr: z.enum(performanceRatingArOptions),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  trainingNeeds: z.array(z.string()),
  careerPath: z.string(),
  salaryRecommendation: z.object({
    action: z.enum(salaryRecommendationActions),
    percentage: z.number().optional(),
    reason: z.string(),
  }),
  promotionReadiness: z.object({
    ready: z.boolean(),
    timeline: z.string(),
    requirements: z.array(z.string()),
  }),
  detailedAnalysis: z.string(),
  actionPlan: z.object({
    shortTerm: z.array(z.string()),
    mediumTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
});

const resumeSchema = z.object({
  candidateName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
      gpa: z.string().optional(),
    })
  ),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      duration: z.string(),
      responsibilities: z.array(z.string()),
    })
  ),
  skills: z.array(z.string()),
  certifications: z.array(z.string()).optional(),
  languages: z
    .array(
      z.object({
        language: z.string(),
        proficiency: z.string(),
      })
    )
    .optional(),
  summary: z.string().optional(),
  summaryPoints: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

const jobRequirementsSchema = z.object({
  title: z.string(),
  department: z.string(),
  level: z.enum(["entry", "mid", "senior", "executive"]),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).optional(),
  minExperience: z.number(),
  education: z.array(z.string()),
  responsibilities: z.array(z.string()),
  salary: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
});

const candidateEvaluationSchema = z.object({
  overallScore: z.number(),
  matchPercentage: z.number(),
  recommendation: z.enum(candidateRecommendationOptions),
  recommendationAr: z.enum(candidateRecommendationArOptions),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  skillsMatch: z.object({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
    additional: z.array(z.string()),
  }),
  experienceAnalysis: z.object({
    relevant: z.boolean(),
    years: z.number(),
    quality: z.enum(experienceQualityOptions),
    details: z.string(),
  }),
  educationMatch: z.object({
    meets: z.boolean(),
    details: z.string(),
  }),
  salaryExpectation: z
    .object({
      estimated: z.number(),
      inRange: z.boolean(),
      notes: z.string(),
    })
    .optional(),
  interviewQuestions: z.array(z.string()),
  redFlags: z.array(z.string()),
  detailedAnalysis: z.string(),
  nextSteps: z.array(z.string()),
});

function normalizeSkillLevels(skillLevels: Record<string, number | string>): Record<string, SkillLevel> {
  const mapNumberToSkillLevel = (value: number): SkillLevel => {
    if (value >= 4.5) return "expert";
    if (value >= 3.5) return "advanced";
    if (value >= 2) return "intermediate";
    return "beginner";
  };

  return Object.fromEntries(
    Object.entries(skillLevels).map(([skill, level]) => {
      if (typeof level === "string") {
        const normalized = skillLevelScale.includes(level as SkillLevel)
          ? (level as SkillLevel)
          : "intermediate";
        return [skill, normalized];
      }

      return [skill, mapNumberToSkillLevel(level)];
    })
  );
}

export const aiRouter = router({
  /**
   * AI Chat
   * محادثة الذكاء الاصطناعي
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message is required"),
        language: z.enum(["ar", "en"]).default("ar"),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, language, conversationHistory } = input;

      const user = ctx.user;
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Determine user type
      const accountType =
        ((user as { accountType?: string | null }).accountType ?? user.userType)?.toString() ??
        "employee";

      let userType: "employee" | "company" | "consultant" | "admin" = "employee";
      if (user.role === "admin") {
        userType = "admin";
      } else if (accountType === "company") {
        userType = "company";
      } else if (accountType === "consultant") {
        userType = "consultant";
      }

      const response = await getAIAssistantResponse(message, {
        userType,
        language,
        conversationHistory,
      });

      return response;
    }),

  /**
   * Generate Document
   * توليد مستند
   */
  generateDocument: protectedProcedure
    .input(
      z.object({
        templateType: z.string().optional(),
        variables: z.record(z.string()).default({}),
        customPrompt: z.string().optional(),
        tone: z.enum(["formal", "semi-formal", "friendly"]).default("formal"),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { templateType, variables, customPrompt, tone, language } = input;

      if (!templateType && !customPrompt) {
        throw new Error("Either templateType or customPrompt is required");
      }

      const content = await generateDocumentContent(
        templateType || "general",
        variables,
        language,
        tone
      );

      // Generate suggestions based on content
      const suggestions =
        language === "ar"
          ? [
              "تأكد من مراجعة جميع التفاصيل قبل الإرسال",
              "يمكنك إضافة شعار الشركة للمستند",
              "احفظ نسخة من المستند في ملف الموظف",
            ]
          : [
              "Review all details before sending",
              "You can add company logo to the document",
              "Save a copy in employee file",
            ];

      return {
        content,
        suggestions,
        metadata: {
          templateType,
          generatedAt: new Date().toISOString(),
          language,
          tone,
        },
      };
    }),

  /**
   * Analyze HR Data
   * تحليل بيانات الموارد البشرية
   */
  analyzeData: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["employees", "leave", "salaries", "performance"]),
        data: z.array(z.any()).max(1000, "Maximum 1000 records allowed"),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { dataType, data, language } = input;

      const user = ctx.user;
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Only allow company and admin users to analyze data
      const accountType =
        ((user as { accountType?: string | null }).accountType ?? user.userType)?.toString();

      if (accountType !== "company" && user.role !== "admin") {
        throw new Error("Access denied. Only companies and admins can analyze data.");
      }

      const analysis = await analyzeHRData(dataType, data, language);

      return {
        ...analysis,
        metadata: {
          dataType,
          recordCount: data.length,
          analyzedAt: new Date().toISOString(),
          language,
        },
      };
    }),

  /**
   * Get AI Suggestions
   * الحصول على اقتراحات الذكاء الاصطناعي
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        language: z.enum(["ar", "en"]).default("ar"),
        context: z.string().default("general"),
      })
    )
    .query(({ input }) => {
      const { language, context } = input;

      const suggestions = {
        ar: {
          general: [
            "كيف أحسب نهاية الخدمة؟",
            "ما هي حقوق الموظف في الإجازات؟",
            "كيف أتعامل مع موظف متغيب؟",
            "ما هي شروط إنهاء العقد؟",
          ],
          payroll: [
            "كيف أحسب الراتب الصافي؟",
            "ما هي نسبة التأمينات الاجتماعية؟",
            "كيف أحسب البدلات والمكافآت؟",
            "ما هو الحد الأدنى للأجور؟",
          ],
          leave: [
            "كم مدة الإجازة السنوية؟",
            "متى يستحق الموظف الإجازة السنوية؟",
            "ما هي أنواع الإجازات المتاحة؟",
            "كيف أحسب رصيد الإجازات؟",
          ],
          legal: [
            "ما هي المادة 84 من نظام العمل؟",
            "كيف أتعامل مع شكوى موظف؟",
            "ما هي عقوبات المخالفات؟",
            "ما هي حقوق الموظف عند الفصل؟",
          ],
        },
        en: {
          general: [
            "How to calculate end of service?",
            "What are employee leave rights?",
            "How to handle absent employee?",
            "What are contract termination conditions?",
          ],
          payroll: [
            "How to calculate net salary?",
            "What is social insurance rate?",
            "How to calculate allowances?",
            "What is minimum wage?",
          ],
          leave: [
            "How long is annual leave?",
            "When does employee earn annual leave?",
            "What leave types are available?",
            "How to calculate leave balance?",
          ],
          legal: [
            "What is Article 84 of Labor Law?",
            "How to handle employee complaint?",
            "What are violation penalties?",
            "What are employee rights on termination?",
          ],
        },
      };

      const contextSuggestions =
        suggestions[language as "ar" | "en"]?.[context as keyof typeof suggestions.ar] ||
        suggestions[language as "ar" | "en"].general;

      return {
        suggestions: contextSuggestions,
        context,
        language,
      };
    }),

  /**
   * AI Health Check
   * فحص صحة الذكاء الاصطناعي
   */
  healthCheck: protectedProcedure.query(async () => {
    const { ENV } = await import("../_core/env");

    const isConfigured = !!(
      ENV.deepseekApiKey ||
      ENV.openaiApiKey ||
      ENV.forgeApiKey
    );

    let provider = "none";
    if (ENV.deepseekApiKey) {
      provider = "deepseek";
    } else if (ENV.openaiApiKey) {
      provider = "openai";
    } else if (ENV.forgeApiKey) {
      provider = "forge";
    }

    return {
      status: isConfigured ? "ok" : "unconfigured",
      provider,
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Evaluate Employee Performance
   * تقييم أداء الموظف
   */
  evaluatePerformance: protectedProcedure
    .input(
      evaluateEmployeeSchema.extend({
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { language, ...data } = input;
      const evaluation = await evaluateEmployeePerformance(
        {
          employeeId: data.employeeId ?? 0,
          employeeName: data.employeeName,
          position: data.position,
          department: data.department,
          joiningDate: data.joiningDate,
          metrics: data.metrics,
          achievements: data.achievements,
          challenges: data.challenges,
          previousReviews: data.previousReviews,
          goals: data.goals,
        },
        language
      );
      return evaluation;
    }),

  /**
   * Compare Performance with Department
   * مقارنة الأداء مع القسم
   */
  comparePerformance: protectedProcedure
    .input(
      z.object({
        employee: evaluateEmployeeSchema,
        departmentAverage: performanceMetricsSchema,
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { employee, departmentAverage, language } = input;
      const comparison = await comparePerformanceWithDepartment(
        employee,
        departmentAverage,
        language
      );
      return comparison;
    }),

  /**
   * Generate Development Plan
   * إنشاء خطة تطوير
   */
  generateDevelopmentPlan: protectedProcedure
    .input(
      z.object({
        evaluation: performanceEvaluationSchema,
        employeeName: z.string(),
        position: z.string(),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const plan = await generateDevelopmentPlan(
        input.evaluation as PerformanceEvaluationInput,
        input.employeeName,
        input.position,
        input.language
      );
      return plan;
    }),

  /**
   * Evaluate Candidate
   * تقييم المرشح
   */
  evaluateCandidate: protectedProcedure
    .input(
      z.object({
        resume: resumeSchema,
        jobRequirements: jobRequirementsSchema,
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const evaluation = await evaluateCandidate(
        input.resume,
        input.jobRequirements,
        input.language
      );
      return evaluation;
    }),

  /**
   * Rank Candidates
   * ترتيب المرشحين
   */
  rankCandidates: protectedProcedure
    .input(
      z.object({
        candidates: z.array(
          z.object({
            resume: resumeSchema,
            evaluation: candidateEvaluationSchema,
          })
        ),
        jobRequirements: jobRequirementsSchema,
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const ranking = await rankCandidates(
        input.candidates,
        input.jobRequirements,
        input.language
      );
      return ranking;
    }),

  /**
   * Generate Job Description
   * إنشاء وصف وظيفي
   */
  generateJobDescription: protectedProcedure
    .input(
      z.object({
        jobRequirements: jobRequirementsSchema,
        companyInfo: z.object({
          name: z.string(),
          industry: z.string(),
          size: z.string(),
          culture: z.string().optional(),
        }),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const jobDescription = await generateJobDescription(
        input.jobRequirements,
        input.companyInfo,
        input.language
      );
      return jobDescription;
    }),

  /**
   * Generate Interview Questions
   * إنشاء أسئلة المقابلة
   */
  generateInterviewQuestions: protectedProcedure
    .input(
      z.object({
        resume: resumeSchema,
        jobRequirements: jobRequirementsSchema,
        focusAreas: z.array(z.string()).default([]),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const questions = await generateInterviewQuestions(
        input.resume,
        input.jobRequirements,
        input.focusAreas,
        input.language
      );
      return questions;
    }),

  /**
   * Recommend Training
   * التوصية بالتدريب
   */
  recommendTraining: protectedProcedure
    .input(
      z.object({
        employee: z.object({
          id: z.number(),
          name: z.string(),
          position: z.string(),
          department: z.string(),
          currentSkills: z.array(z.string()),
          skillLevels: z.record(z.union([z.number().min(1).max(5), z.enum(skillLevelScale)])).default({}),
          interests: z.array(z.string()).optional(),
          careerGoals: z.array(z.string()).optional(),
          performanceScore: z.number().optional(),
          weakAreas: z.array(z.string()).optional(),
        }),
        availableCourses: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              titleAr: z.string(),
              provider: z.string(),
              type: z.enum(["online", "onsite", "hybrid"]),
              duration: z.string(),
              level: z.enum(["beginner", "intermediate", "advanced"]),
              skills: z.array(z.string()),
              cost: z.number().optional(),
              language: z.enum(["ar", "en", "both"]),
              certification: z.boolean(),
              url: z.string().optional(),
            })
          )
          .default([]),
          budget: z.number().optional(),
        departmentNeeds: z.array(z.string()).optional(),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const recommendations = await recommendTraining(
        {
          ...input.employee,
          skillLevels: normalizeSkillLevels(input.employee.skillLevels as Record<string, number | string>),
        },
        input.availableCourses,
        input.departmentNeeds,
        input.language
      );
      return recommendations;
    }),

  /**
   * Generate Department Training Plan
   * إنشاء خطة التدريب للقسم
   */
  generateDepartmentTrainingPlan: protectedProcedure
    .input(
      z.object({
        departmentName: z.string(),
        employees: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            position: z.string(),
            department: z.string(),
            currentSkills: z.array(z.string()),
            skillLevels: z.record(z.union([z.number().min(1).max(5), z.enum(skillLevelScale)])).default({}),
          })
        ),
        departmentGoals: z.array(z.string()).optional(),
        targetSkills: z.array(z.string()).optional(),
        budget: z.number(),
        timeframe: z.string().default("12 months"),
        priorities: z.array(z.string()).optional(),
        employeeCount: z.number().optional(),
        currentSkills: z.record(z.number()).optional(),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const goals = input.departmentGoals?.length
        ? input.departmentGoals
        : input.targetSkills ?? [];

      const plan = await generateDepartmentTrainingPlan(
        input.departmentName,
        input.employees.map((employee) => ({
          ...employee,
          skillLevels: normalizeSkillLevels(employee.skillLevels as Record<string, number | string>),
        })),
        goals,
        input.budget,
        input.language
      );
      return plan;
    }),

  /**
   * Evaluate Training Effectiveness
   * تقييم فعالية التدريب
   */
  evaluateTrainingEffectiveness: protectedProcedure
    .input(
      z.object({
        employeeName: z.string(),
        courseName: z.string(),
        preTrainingSkills: z.record(z.number().min(0).max(10)),
        postTrainingSkills: z.record(z.number().min(0).max(10)),
        performanceChange: z.number().optional(),
        feedbackComments: z.string().optional(),
        language: z.enum(SUPPORTED_LANGUAGES).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const evaluation = await evaluateTrainingEffectiveness(
        input.employeeName,
        input.courseName,
        input.preTrainingSkills,
        input.postTrainingSkills,
        input.performanceChange,
        input.feedbackComments,
        input.language
      );
      return evaluation;
    }),
});
