/**
 * Advanced AI Router - Additional tRPC Procedures
 * مسارات الذكاء الاصطناعي المتقدمة - إجراءات tRPC إضافية
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  evaluateEmployeePerformance
} from "../ai/performance-evaluator";
import { 
  evaluateCandidate, 
  generateInterviewQuestions 
} from "../ai/hiring-assistant";
import { 
  recommendTraining
} from "../ai/training-recommender";

export const aiAdvancedRouter = router({
  /**
   * Performance Evaluator
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
          punctualityScore: z.number().min(0).max(100),
        }),
        achievements: z.array(z.string()),
        challenges: z.array(z.string()),
        goals: z.array(z.string()),
        managerNotes: z.string(),
        currentSalary: z.number().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      const { language, ...data } = input;
      return await evaluateEmployeePerformance(data, language);
    }),

  /**
   * Evaluate Candidate
   */
  evaluateCandidate: protectedProcedure
    .input(
      z.object({
        resume: z.object({
          candidateName: z.string(),
          email: z.string().email(),
          phone: z.string(),
          summary: z.string(),
          skills: z.array(z.string()),
          experience: z.array(
            z.object({
              title: z.string(),
              company: z.string(),
              duration: z.string(),
              responsibilities: z.array(z.string()),
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
          certifications: z.array(z.string()),
          languages: z.array(
            z.object({
              language: z.string(),
              proficiency: z.string(),
            })
          ),
          projects: z.array(z.string()).optional(),
        }),
        jobRequirements: z.object({
          title: z.string(),
          department: z.string(),
          level: z.enum(["entry", "mid", "senior", "executive"]),
          requiredSkills: z.array(z.string()),
          preferredSkills: z.array(z.string()).optional(),
          minExperience: z.number(),
          education: z.array(z.string()),
          responsibilities: z.array(z.string()),
          salary: z.object({
            min: z.number(),
            max: z.number(),
          }).optional(),
        }),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      return await evaluateCandidate(
        input.resume,
        input.jobRequirements,
        input.language
      );
    }),

  /**
   * Generate Interview Questions
   */
  generateInterviewQuestions: protectedProcedure
    .input(
      z.object({
        resume: z.object({
          candidateName: z.string(),
          email: z.string().email(),
          phone: z.string(),
          summary: z.string(),
          skills: z.array(z.string()),
          experience: z.array(
            z.object({
              title: z.string(),
              company: z.string(),
              duration: z.string(),
              responsibilities: z.array(z.string()),
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
          certifications: z.array(z.string()),
          languages: z.array(
            z.object({
              language: z.string(),
              proficiency: z.string(),
            })
          ),
          projects: z.array(z.string()).optional(),
        }),
        jobRequirements: z.object({
          title: z.string(),
          department: z.string(),
          level: z.enum(["entry", "mid", "senior", "executive"]),
          requiredSkills: z.array(z.string()),
          preferredSkills: z.array(z.string()).optional(),
          minExperience: z.number(),
          education: z.array(z.string()),
          responsibilities: z.array(z.string()),
          salary: z.object({
            min: z.number(),
            max: z.number(),
          }).optional(),
        }),
        focusAreas: z.array(z.string()),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      return await generateInterviewQuestions(
        input.resume,
        input.jobRequirements,
        input.focusAreas,
        input.language
      );
    }),

  /**
   * Recommend Training
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
          skillLevels: z.record(z.enum(["beginner", "intermediate", "advanced", "expert"])),
          interests: z.array(z.string()),
          careerGoals: z.array(z.string()),
          performanceScore: z.number(),
          weakAreas: z.array(z.string()),
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
          .optional(),
        departmentNeeds: z.array(z.string()).optional(),
        budget: z.number().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
      })
    )
    .mutation(async ({ input }) => {
      return await recommendTraining(
        input.employee,
        input.availableCourses || [],
        input.departmentNeeds,
        input.language
      );
    }),
});
