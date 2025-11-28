/**
 * Knowledge Base Management Router - مسارات إدارة قاعدة المعرفة
 * 
 * مسارات tRPC لإدارة الأنظمة واللوائح السعودية:
 * - استعراض الأنظمة المتاحة
 * - البحث في قاعدة المعرفة
 * - الحصول على تفاصيل نظام محدد
 * - الحصول على إحصائيات قاعدة المعرفة
 * 
 * @module server/routes/knowledge-base
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";

import {
  loadRegulation,
  loadAllRegulations,
  getAvailableRegulations,
  searchRegulations,
  getRegulationsByCategory,
  getKnowledgeBaseStats,
  clearCache
} from "../ai/knowledge-base-loader";

// ============================================
// Zod Schemas
// ============================================

const regulationIdSchema = z.string().min(1);

const searchQuerySchema = z.object({
  query: z.string().min(2),
  categories: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).optional().default(10)
});

const categorySchema = z.object({
  category: z.enum(['labor', 'social_insurance', 'saudization', 'data_protection', 'health_safety', 'wages', 'women_employment', 'general'])
});

// ============================================
// Router
// ============================================

export const knowledgeBaseRouter = router({
  /**
   * الحصول على قائمة الأنظمة المتاحة
   */
  getAvailable: publicProcedure
    .query(() => {
      try {
        const regulations = getAvailableRegulations();
        return {
          success: true,
          data: regulations,
          count: regulations.length
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في الحصول على قائمة الأنظمة',
          data: [],
          count: 0
        };
      }
    }),

  /**
   * الحصول على نظام محدد بالتفصيل
   */
  getRegulation: publicProcedure
    .input(regulationIdSchema)
    .query(({ input }) => {
      try {
        const regulation = loadRegulation(input);
        return {
          success: true,
          data: regulation
        };
      } catch (_error) {
        return {
          success: false,
          error: `النظام غير موجود: ${input}`,
          data: null
        };
      }
    }),

  /**
   * الحصول على ملخص نظام (بدون التفاصيل الكاملة)
   */
  getRegulationSummary: publicProcedure
    .input(regulationIdSchema)
    .query(({ input }) => {
      try {
        const regulation = loadRegulation(input);
        return {
          success: true,
          data: {
            id: regulation.id,
            name: regulation.name,
            authority: regulation.authority,
            version: regulation.version,
            lastAmendment: regulation.lastAmendment,
            status: regulation.status,
            overview: regulation.overview
          }
        };
      } catch (_error) {
        return {
          success: false,
          error: `النظام غير موجود: ${input}`,
          data: null
        };
      }
    }),

  /**
   * البحث في قاعدة المعرفة
   */
  search: publicProcedure
    .input(searchQuerySchema)
    .query(({ input }) => {
      try {
        const results = searchRegulations(input.query, {
          categories: input.categories,
          limit: input.limit
        });
        return {
          success: true,
          query: input.query,
          results,
          count: results.length
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في البحث',
          query: input.query,
          results: [],
          count: 0
        };
      }
    }),

  /**
   * الحصول على الأنظمة حسب الفئة
   */
  getByCategory: publicProcedure
    .input(categorySchema)
    .query(({ input }) => {
      try {
        const regulations = getRegulationsByCategory(input.category);
        return {
          success: true,
          category: input.category,
          data: regulations.map(r => ({
            id: r.id,
            name: r.name,
            authority: r.authority,
            status: r.status
          })),
          count: regulations.length
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في الحصول على الأنظمة',
          category: input.category,
          data: [],
          count: 0
        };
      }
    }),

  /**
   * الحصول على إحصائيات قاعدة المعرفة
   */
  getStats: publicProcedure
    .query(() => {
      try {
        const stats = getKnowledgeBaseStats();
        return {
          success: true,
          data: stats
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في الحصول على الإحصائيات',
          data: null
        };
      }
    }),

  /**
   * الحصول على جميع الأنظمة (للمسؤولين فقط)
   */
  getAll: protectedProcedure
    .query(() => {
      try {
        const regulations = loadAllRegulations();
        const result: Array<{
          id: string;
          name: { ar: string; en: string };
          authority: { ar: string; en: string };
          version: string;
          status: string;
        }> = [];
        
        for (const [_unusedKey, regulation] of regulations) {
          result.push({
            id: regulation.id,
            name: regulation.name,
            authority: regulation.authority,
            version: regulation.version,
            status: regulation.status
          });
        }
        
        return {
          success: true,
          data: result,
          count: result.length
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في تحميل الأنظمة',
          data: [],
          count: 0
        };
      }
    }),

  /**
   * مسح ذاكرة التخزين المؤقت (للمسؤولين فقط)
   */
  clearCache: protectedProcedure
    .mutation(() => {
      try {
        clearCache();
        return {
          success: true,
          message: 'تم مسح ذاكرة التخزين المؤقت بنجاح'
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في مسح ذاكرة التخزين المؤقت'
        };
      }
    }),

  /**
   * التحقق من صحة قاعدة المعرفة
   */
  validateKnowledgeBase: protectedProcedure
    .query(() => {
      try {
        const available = getAvailableRegulations();
        const validationResults: Array<{
          id: string;
          valid: boolean;
          error?: string;
        }> = [];
        
        for (const id of available) {
          try {
            loadRegulation(id);
            validationResults.push({ id, valid: true });
          } catch (err) {
            validationResults.push({ 
              id, 
              valid: false, 
              error: err instanceof Error ? err.message : 'خطأ غير معروف'
            });
          }
        }
        
        const invalidCount = validationResults.filter(r => !r.valid).length;
        
        return {
          success: true,
          totalRegulations: available.length,
          validCount: available.length - invalidCount,
          invalidCount,
          results: validationResults
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في التحقق من قاعدة المعرفة'
        };
      }
    }),

  /**
   * الحصول على مادة محددة من نظام
   */
  getArticle: publicProcedure
    .input(z.object({
      regulationId: z.string(),
      articleNumber: z.string()
    }))
    .query(({ input }) => {
      try {
        const regulation = loadRegulation(input.regulationId);
        
        // البحث عن المادة في جميع الأقسام
        let foundArticle: unknown = null;
        
        for (const [_unusedKey, section] of Object.entries(regulation)) {
          if (section && typeof section === 'object' && 'articles' in section) {
            const articles = section.articles as Record<string, unknown>;
            if (input.articleNumber in articles) {
              foundArticle = articles[input.articleNumber];
              break;
            }
          }
        }
        
        if (foundArticle) {
          return {
            success: true,
            data: {
              regulationId: input.regulationId,
              articleNumber: input.articleNumber,
              content: foundArticle
            }
          };
        }
        
        return {
          success: false,
          error: `المادة ${input.articleNumber} غير موجودة في ${input.regulationId}`,
          data: null
        };
      } catch (_error) {
        return {
          success: false,
          error: `النظام غير موجود: ${input.regulationId}`,
          data: null
        };
      }
    }),

  /**
   * مقارنة بين نظامين
   */
  compareRegulations: publicProcedure
    .input(z.object({
      regulationId1: z.string(),
      regulationId2: z.string()
    }))
    .query(({ input }) => {
      try {
        const reg1 = loadRegulation(input.regulationId1);
        const reg2 = loadRegulation(input.regulationId2);
        
        return {
          success: true,
          comparison: {
            regulation1: {
              id: reg1.id,
              name: reg1.name,
              authority: reg1.authority,
              version: reg1.version,
              lastAmendment: reg1.lastAmendment,
              status: reg1.status
            },
            regulation2: {
              id: reg2.id,
              name: reg2.name,
              authority: reg2.authority,
              version: reg2.version,
              lastAmendment: reg2.lastAmendment,
              status: reg2.status
            }
          }
        };
      } catch (_error) {
        return {
          success: false,
          error: 'فشل في تحميل أحد الأنظمة للمقارنة',
          comparison: null
        };
      }
    })
});

export type KnowledgeBaseRouter = typeof knowledgeBaseRouter;
