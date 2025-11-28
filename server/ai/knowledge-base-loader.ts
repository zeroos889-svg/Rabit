/**
 * Knowledge Base Loader
 * نظام تحميل قاعدة المعرفة للأنظمة السعودية
 * 
 * يوفر هذا الملف واجهة موحدة لتحميل وإدارة الأنظمة واللوائح
 * من ملفات JSON الخارجية بدلاً من تضمينها في الكود
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// أنواع البيانات
export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Regulation {
  id: string;
  name: LocalizedText;
  authority: LocalizedText;
  version: string;
  lastAmendment: string;
  status: 'active' | 'draft' | 'deprecated';
  overview: LocalizedText;
  [key: string]: unknown;
}

export interface AIConfig {
  assistant: {
    name: LocalizedText;
    personality: LocalizedText;
    tone: string[];
    capabilities: LocalizedText[];
  };
  language: {
    default: string;
    supported: string[];
    autoDetect: boolean;
  };
  responses: {
    templates: Record<string, LocalizedText>;
    greetings: LocalizedText[];
    errors: Record<string, LocalizedText>;
  };
  context: {
    systemPrompt: LocalizedText;
    legalDisclaimer: LocalizedText;
    updateNotice: LocalizedText;
  };
}

// مسارات الملفات
const KNOWLEDGE_BASE_PATH = path.join(__dirname, 'knowledge-base');
const REGULATIONS_PATH = path.join(KNOWLEDGE_BASE_PATH, 'regulations');
const CONFIG_PATH = path.join(KNOWLEDGE_BASE_PATH, 'ai-config.json');

// Cache للتخزين المؤقت
let configCache: AIConfig | null = null;
let regulationsCache: Map<string, Regulation> = new Map();
let lastCacheUpdate: Date | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 دقائق

/**
 * تحميل إعدادات الذكاء الاصطناعي
 */
export function loadAIConfig(): AIConfig {
  if (configCache && lastCacheUpdate && 
      (Date.now() - lastCacheUpdate.getTime()) < CACHE_DURATION_MS) {
    return configCache;
  }

  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
    configCache = JSON.parse(configData) as AIConfig;
    lastCacheUpdate = new Date();
    return configCache;
  } catch (error) {
    console.error('خطأ في تحميل إعدادات AI:', error);
    throw new Error('فشل في تحميل إعدادات الذكاء الاصطناعي');
  }
}

/**
 * تحميل نظام/لائحة محددة
 */
export function loadRegulation(regulationId: string): Regulation {
  // التحقق من الكاش
  if (regulationsCache.has(regulationId) && lastCacheUpdate &&
      (Date.now() - lastCacheUpdate.getTime()) < CACHE_DURATION_MS) {
    return regulationsCache.get(regulationId)!;
  }

  const filePath = path.join(REGULATIONS_PATH, `${regulationId}.json`);
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const regulation = JSON.parse(data) as Regulation;
    regulationsCache.set(regulationId, regulation);
    return regulation;
  } catch (error) {
    console.error(`خطأ في تحميل النظام ${regulationId}:`, error);
    throw new Error(`النظام غير موجود: ${regulationId}`);
  }
}

/**
 * تحميل جميع الأنظمة المتاحة
 */
export function loadAllRegulations(): Map<string, Regulation> {
  try {
    const files = fs.readdirSync(REGULATIONS_PATH);
    const regulations = new Map<string, Regulation>();

    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = file.replace('.json', '');
        try {
          const regulation = loadRegulation(id);
          regulations.set(id, regulation);
        } catch {
          // Skip invalid files silently
          continue;
        }
      }
    }

    return regulations;
  } catch (error) {
    console.error('خطأ في تحميل الأنظمة:', error);
    return new Map();
  }
}

/**
 * الحصول على قائمة الأنظمة المتاحة
 */
export function getAvailableRegulations(): string[] {
  try {
    const files = fs.readdirSync(REGULATIONS_PATH);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

// وظائف مساعدة للبحث
function calculateNameScore(nameText: string, queryLower: string, queryWords: string[]): { score: number; matched: boolean } {
  let score = 0;
  const matched = nameText.includes(queryLower);
  if (matched) score += 10;
  for (const word of queryWords) {
    if (nameText.includes(word)) score += 2;
  }
  return { score, matched };
}

function calculateOverviewScore(overviewText: string, queryLower: string, queryWords: string[]): { score: number; matched: boolean } {
  let score = 0;
  const matched = overviewText.includes(queryLower);
  if (matched) score += 5;
  for (const word of queryWords) {
    if (overviewText.includes(word)) score += 1;
  }
  return { score, matched };
}

function calculateTagsScore(tags: string[], queryLower: string): { score: number; matched: boolean } {
  let score = 0;
  let matched = false;
  for (const tag of tags) {
    if (tag.toLowerCase().includes(queryLower)) {
      score += 3;
      matched = true;
    }
  }
  return { score, matched };
}

function shouldIncludeRegulation(regulation: Regulation, categories?: string[]): boolean {
  if (!categories || categories.length === 0) return true;
  const regCategory = (regulation as { category?: string }).category;
  return !regCategory || categories.includes(regCategory);
}

/**
 * البحث في الأنظمة بكلمات مفتاحية
 */
export function searchRegulations(
  query: string,
  options?: {
    categories?: string[];
    language?: 'ar' | 'en';
    limit?: number;
  }
): Array<{
  regulation: Regulation;
  score: number;
  matchedIn: string[];
}> {
  const limit = options?.limit || 10;
  const allRegulations = loadAllRegulations();
  const results: Array<{
    regulation: Regulation;
    score: number;
    matchedIn: string[];
  }> = [];
  
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);

  for (const [, regulation] of allRegulations) {
    if (!shouldIncludeRegulation(regulation, options?.categories)) continue;
    
    const matchedIn: string[] = [];
    
    const nameText = `${regulation.name.ar} ${regulation.name.en}`.toLowerCase();
    const nameResult = calculateNameScore(nameText, queryLower, queryWords);
    if (nameResult.matched) matchedIn.push('name');
    
    const overviewText = `${regulation.overview.ar} ${regulation.overview.en}`.toLowerCase();
    const overviewResult = calculateOverviewScore(overviewText, queryLower, queryWords);
    if (overviewResult.matched) matchedIn.push('overview');
    
    const tags = (regulation as { tags?: string[] }).tags || [];
    const tagsResult = calculateTagsScore(tags, queryLower);
    if (tagsResult.matched) matchedIn.push('tags');
    
    const score = nameResult.score + overviewResult.score + tagsResult.score;
    
    if (score > 0) {
      results.push({ regulation, score, matchedIn });
    }
  }
  
  const sorted = [...results].sort((a, b) => b.score - a.score);
  return sorted.slice(0, limit);
}

/**
 * الحصول على الأنظمة حسب الفئة
 */
export function getRegulationsByCategory(category: string): Regulation[] {
  const allRegulations = loadAllRegulations();
  const results: Regulation[] = [];
  
  // خريطة الفئات إلى معرفات الأنظمة
  const categoryMap: Record<string, string[]> = {
    'labor': ['labor-law'],
    'social_insurance': ['gosi'],
    'saudization': ['nitaqat', 'qiwa'],
    'data_protection': ['pdpl'],
    'health_safety': ['ohs'],
    'wages': ['wps-mudad'],
    'women_employment': ['women-employment'],
    'general': ['violations', 'remote-work']
  };
  
  const regulationIds = categoryMap[category] || [];
  
  for (const id of regulationIds) {
    try {
      const regulation = loadRegulation(id);
      results.push(regulation);
    } catch {
      // تخطي الأنظمة غير الموجودة
    }
  }
  
  // إذا لم توجد أنظمة محددة للفئة، البحث في جميع الأنظمة
  if (results.length === 0) {
    for (const [, regulation] of allRegulations) {
      const regCategory = (regulation as { category?: string }).category;
      if (regCategory === category) {
        results.push(regulation);
      }
    }
  }
  
  return results;
}

/**
 * الحصول على إحصائيات قاعدة المعرفة
 */
export function getKnowledgeBaseStats(): {
  totalRegulations: number;
  categories: Record<string, number>;
  lastUpdate: string | null;
  versions: Array<{ id: string; version: string }>;
  status: {
    active: number;
    draft: number;
    deprecated: number;
  };
} {
  const allRegulations = loadAllRegulations();
  const categories: Record<string, number> = {};
  const status = { active: 0, draft: 0, deprecated: 0 };
  const versions: Array<{ id: string; version: string }> = [];
  
  for (const [, regulation] of allRegulations) {
    // إحصاء الفئات
    const category = (regulation as { category?: string }).category || 'general';
    categories[category] = (categories[category] || 0) + 1;
    
    // إحصاء الحالة
    if (regulation.status === 'active') status.active++;
    else if (regulation.status === 'draft') status.draft++;
    else if (regulation.status === 'deprecated') status.deprecated++;
    
    // جمع الإصدارات
    versions.push({
      id: regulation.id,
      version: regulation.version
    });
  }
  
  return {
    totalRegulations: allRegulations.size,
    categories,
    lastUpdate: lastCacheUpdate?.toISOString() || null,
    versions,
    status
  };
}

/**
 * بناء سياق للذكاء الاصطناعي من الأنظمة ذات الصلة
 */
export function buildAIContext(regulationIds: string[], language: 'ar' | 'en' = 'ar'): string {
  const config = loadAIConfig();
  const regulations = regulationIds.map(id => {
    try {
      return loadRegulation(id);
    } catch {
      return null;
    }
  }).filter(Boolean) as Regulation[];

  let context = config.context.systemPrompt[language] + '\n\n';
  
  context += '### الأنظمة واللوائح ذات الصلة:\n\n';
  
  for (const reg of regulations) {
    context += `## ${reg.name[language]} (${reg.version})\n`;
    context += `${reg.overview[language]}\n`;
    context += `آخر تحديث: ${reg.lastAmendment}\n\n`;
  }

  context += '\n' + config.context.legalDisclaimer[language];
  
  return context;
}

/**
 * الحصول على قالب استجابة
 */
export function getResponseTemplate(templateKey: string, language: 'ar' | 'en' = 'ar'): string {
  const config = loadAIConfig();
  const template = config.responses.templates[templateKey];
  return template ? template[language] : '';
}

/**
 * الحصول على رسالة خطأ
 */
export function getErrorMessage(errorKey: string, language: 'ar' | 'en' = 'ar'): string {
  const config = loadAIConfig();
  const error = config.responses.errors[errorKey];
  return error ? error[language] : config.responses.errors.general[language];
}

/**
 * الحصول على تحية عشوائية
 */
export function getRandomGreeting(language: 'ar' | 'en' = 'ar'): string {
  const config = loadAIConfig();
  const greetings = config.responses.greetings;
  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex][language];
}

/**
 * مسح الكاش
 */
export function clearCache(): void {
  configCache = null;
  regulationsCache.clear();
  lastCacheUpdate = null;
}

/**
 * تحديث الكاش
 */
export function refreshCache(): void {
  clearCache();
  loadAIConfig();
  loadAllRegulations();
}

/**
 * الحصول على معلومات الإصدار
 */
export function getKnowledgeBaseVersion(): {
  regulations: { id: string; version: string; lastAmendment: string }[];
  lastUpdate: Date | null;
} {
  const regulations = loadAllRegulations();
  return {
    regulations: Array.from(regulations.values()).map(r => ({
      id: r.id,
      version: r.version,
      lastAmendment: r.lastAmendment
    })),
    lastUpdate: lastCacheUpdate
  };
}

// تصدير الأنواع والوظائف
export default {
  loadAIConfig,
  loadRegulation,
  loadAllRegulations,
  getAvailableRegulations,
  searchRegulations,
  getRegulationsByCategory,
  getKnowledgeBaseStats,
  buildAIContext,
  getResponseTemplate,
  getErrorMessage,
  getRandomGreeting,
  clearCache,
  refreshCache,
  getKnowledgeBaseVersion
};
