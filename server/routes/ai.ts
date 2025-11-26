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
  generateDevelopmentPlan 
} from "../ai/performance-evaluator";
import { 
  evaluateCandidate, 
  rankCandidates, 
  generateJobDescription, 
  generateInterviewQuestions 
} from "../ai/hiring-assistant";
import { 
  recommendTraining, 
  generateDepartmentTrainingPlan, 
  evaluateTrainingEffectiveness 
} from "../ai/training-recommender";

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
      let userType: "employee" | "company" | "consultant" | "admin" = "employee";
      if (user.role === "admin") {
        userType = "admin";
      } else if (user.accountType === "company") {
        userType = "company";
      } else if (user.accountType === "consultant") {
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
      if (user.accountType !== "company" && user.role !== "admin") {
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
      z.object({
        employeeId: z.number(),
        employeeName: z.string(),
        position: z.string(),
        department: z.string(),
        joiningDate: z.string(),
        reviewPeriod: z.string(),
        metrics: z.object({
          attendanceRate: z.number().min(0).max(100),
          taskCompletionRate: z.number().min(0).max(100),
          qualityScore: z.number().min(0).max(100),
          teamworkScore: z.number().min(0).max(100),
          initiativeScore: z.number().min(0).max(100),
          communicationScore: z.number().min(0).max(100),
        }),
        achievements: z.array(z.string()).optional(),
        challenges: z.array(z.string()).optional(),
        goals: z.array(z.string()).optional(),
        managerNotes: z.string().optional(),
        currentSalary: z.number().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { language, ...data } = input;
      const evaluation = await evaluateEmployeePerformance(data, language);
      return evaluation;
    }),

  /**
   * Compare Performance with Department
   * مقارنة الأداء مع القسم
   */
  comparePerformance: protectedProcedure
    .input(
      z.object({
        employeeName: z.string(),
        employeeScore: z.number(),
        employeeMetrics: z.record(z.number()),
        departmentName: z.string(),
        departmentAverage: z.number(),
        departmentMetrics: z.record(z.number()),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const comparison = await comparePerformanceWithDepartment(input);
      return comparison;
    }),

  /**
   * Generate Development Plan
   * إنشاء خطة تطوير
   */
  generateDevelopmentPlan: protectedProcedure
    .input(
      z.object({
        employeeName: z.string(),
        currentPosition: z.string(),
        targetPosition: z.string().optional(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        careerGoals: z.array(z.string()).optional(),
        timeframe: z.string().default("12 months"),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const plan = await generateDevelopmentPlan(input);
      return plan;
    }),

  /**
   * Evaluate Candidate
   * تقييم المرشح
   */
  evaluateCandidate: protectedProcedure
    .input(
      z.object({
        resume: z.object({
          candidateName: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          summary: z.string().optional(),
          skills: z.array(z.string()),
          experience: z.array(
            z.object({
              title: z.string(),
              company: z.string(),
              duration: z.string(),
              description: z.string(),
            })
          ),
          education: z.array(
            z.object({
              degree: z.string(),
              institution: z.string(),
              year: z.string(),
              gpa: z.string().optional(),
            })
          ),
          certifications: z.array(z.string()).optional(),
          languages: z
            .array(
              z.object({
                language: z.string(),
                proficiency: z.string(),
              })
            )
            .optional(),
          projects: z.array(z.string()).optional(),
        }),
        jobRequirements: z.object({
          title: z.string(),
          requiredSkills: z.array(z.string()),
          preferredSkills: z.array(z.string()).optional(),
          minimumExperience: z.number(),
          education: z.string(),
          responsibilities: z.array(z.string()),
        }),
        language: z.enum(["ar", "en"]).default("ar"),
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
            name: z.string(),
            score: z.number(),
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            experience: z.string(),
            skills: z.array(z.string()),
          })
        ),
        jobTitle: z.string(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const ranking = await rankCandidates(
        input.candidates,
        input.jobTitle,
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
        jobTitle: z.string(),
        department: z.string(),
        level: z.enum(["entry", "mid", "senior", "lead", "manager"]),
        requiredSkills: z.array(z.string()),
        responsibilities: z.array(z.string()),
        qualifications: z.array(z.string()),
        benefits: z.array(z.string()).optional(),
        salaryRange: z
          .object({
            min: z.number(),
            max: z.number(),
          })
          .optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const jobDescription = await generateJobDescription(input);
      return jobDescription;
    }),

  /**
   * Generate Interview Questions
   * إنشاء أسئلة المقابلة
   */
  generateInterviewQuestions: protectedProcedure
    .input(
      z.object({
        jobTitle: z.string(),
        level: z.enum(["entry", "mid", "senior", "lead"]),
        skills: z.array(z.string()),
        candidateBackground: z.string().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const questions = await generateInterviewQuestions(input);
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
          skillLevels: z.record(z.number().min(1).max(5)),
          targetSkills: z.array(z.string()).optional(),
        }),
        availableCourses: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              provider: z.string(),
              duration: z.string(),
              cost: z.number(),
              skills: z.array(z.string()),
              level: z.enum(["beginner", "intermediate", "advanced"]),
            })
          )
          .optional(),
        departmentNeeds: z.array(z.string()).optional(),
        budget: z.number().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const recommendations = await recommendTraining(input);
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
        employeeCount: z.number(),
        currentSkills: z.record(z.number()),
        targetSkills: z.array(z.string()),
        budget: z.number(),
        timeframe: z.string().default("12 months"),
        priorities: z.array(z.string()).optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const plan = await generateDepartmentTrainingPlan(input);
      return plan;
    }),

  /**
   * Evaluate Training Effectiveness
   * تقييم فعالية التدريب
   */
  evaluateTrainingEffectiveness: protectedProcedure
    .input(
      z.object({
        trainingInfo: z.object({
          title: z.string(),
          provider: z.string(),
          duration: z.string(),
          cost: z.number(),
          targetSkills: z.array(z.string()),
        }),
        employee: z.object({
          name: z.string(),
          position: z.string(),
          preTrainingSkills: z.record(z.number().min(1).max(5)),
          postTrainingSkills: z.record(z.number().min(1).max(5)),
        }),
        performanceChange: z.number().optional(),
        feedbackScore: z.number().min(1).max(5).optional(),
        feedbackComments: z.string().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const evaluation = await evaluateTrainingEffectiveness(input);
      return evaluation;
    }),
});
