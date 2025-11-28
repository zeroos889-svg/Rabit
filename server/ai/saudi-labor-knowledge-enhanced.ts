/**
 * Saudi Labor Knowledge Enhanced - قاعدة معرفة نظام العمل المحسّنة
 * 
 * هذا الملف يوفر واجهة موحدة للوصول لقاعدة المعرفة
 * يستخدم ملفات JSON الخارجية للأنظمة واللوائح
 */

import knowledgeBase, {
  loadAIConfig,
  loadRegulation,
  loadAllRegulations,
  searchRegulations,
  buildAIContext,
  getResponseTemplate,
  getErrorMessage,
  type Regulation,
  type AIConfig
} from './knowledge-base-loader';

// Re-export للتوافق مع الكود القديم
export { SAUDI_LABOR_LAW, EOSB_RULES, CONTRACT_TEMPLATES } from './saudi-labor-knowledge';
export { calculateEndOfServiceBenefit, calculateGOSIContributions, calculateAnnualLeave, validateProbationPeriod } from './saudi-labor-knowledge';

// ============================================
// وظائف قاعدة المعرفة المحسّنة
// Enhanced Knowledge Base Functions
// ============================================

/**
 * تحميل نظام العمل من قاعدة المعرفة
 */
export function getLaborLaw(): Regulation {
  return loadRegulation('labor-law');
}

/**
 * تحميل نظام التأمينات الاجتماعية
 */
export function getGOSIRegulation(): Regulation {
  return loadRegulation('gosi');
}

/**
 * تحميل نظام نطاقات
 */
export function getNitaqatRegulation(): Regulation {
  return loadRegulation('nitaqat');
}

/**
 * تحميل نظام حماية الأجور
 */
export function getWPSRegulation(): Regulation {
  return loadRegulation('wps-mudad');
}

/**
 * تحميل نظام قوى
 */
export function getQiwaRegulation(): Regulation {
  return loadRegulation('qiwa');
}

/**
 * تحميل نظام العمل عن بُعد
 */
export function getRemoteWorkRegulation(): Regulation {
  return loadRegulation('remote-work');
}

/**
 * تحميل نظام السلامة والصحة المهنية
 */
export function getOHSRegulation(): Regulation {
  return loadRegulation('ohs');
}

/**
 * تحميل أنظمة عمل المرأة
 */
export function getWomenEmploymentRegulation(): Regulation {
  return loadRegulation('women-employment');
}

/**
 * تحميل جدول المخالفات والعقوبات
 */
export function getViolationsRegulation(): Regulation {
  return loadRegulation('violations');
}

// ============================================
// وظائف البحث والاستعلام
// Search and Query Functions
// ============================================

/**
 * البحث في جميع الأنظمة
 */
export function searchAllRegulations(
  keywords: string[],
  language: 'ar' | 'en' = 'ar'
): Regulation[] {
  const query = keywords.join(' ');
  const results = searchRegulations(query, { language });
  return results.map(r => r.regulation);
}

/**
 * الحصول على قائمة جميع الأنظمة المتاحة
 */
export function getAllAvailableRegulations(): Map<string, Regulation> {
  return loadAllRegulations();
}

/**
 * الحصول على أسماء الأنظمة المتاحة
 */
export function getAvailableRegulationIds(): string[] {
  return knowledgeBase.getAvailableRegulations();
}

// ============================================
// وظائف بناء السياق للذكاء الاصطناعي
// AI Context Building Functions
// ============================================

/**
 * بناء سياق شامل للذكاء الاصطناعي
 */
export function buildComprehensiveAIContext(
  topic: string,
  language: 'ar' | 'en' = 'ar'
): string {
  // تحديد الأنظمة ذات الصلة بالموضوع
  const topicRegulationMap: Record<string, string[]> = {
    'contract': ['labor-law', 'qiwa'],
    'عقد': ['labor-law', 'qiwa'],
    'salary': ['labor-law', 'wps-mudad', 'gosi'],
    'راتب': ['labor-law', 'wps-mudad', 'gosi'],
    'أجر': ['labor-law', 'wps-mudad', 'gosi'],
    'wage': ['labor-law', 'wps-mudad', 'gosi'],
    'gosi': ['gosi', 'labor-law'],
    'تأمينات': ['gosi', 'labor-law'],
    'insurance': ['gosi', 'labor-law'],
    'saudization': ['nitaqat', 'labor-law'],
    'سعودة': ['nitaqat', 'labor-law'],
    'توطين': ['nitaqat', 'labor-law'],
    'nitaqat': ['nitaqat', 'labor-law'],
    'نطاقات': ['nitaqat', 'labor-law'],
    'transfer': ['qiwa', 'labor-law'],
    'نقل': ['qiwa', 'labor-law'],
    'remote': ['remote-work', 'labor-law'],
    'عن بعد': ['remote-work', 'labor-law'],
    'flexible': ['remote-work', 'labor-law'],
    'مرن': ['remote-work', 'labor-law'],
    'safety': ['ohs', 'labor-law'],
    'سلامة': ['ohs', 'labor-law'],
    'health': ['ohs', 'labor-law', 'women-employment'],
    'صحة': ['ohs', 'labor-law', 'women-employment'],
    'women': ['women-employment', 'labor-law'],
    'نساء': ['women-employment', 'labor-law'],
    'مرأة': ['women-employment', 'labor-law'],
    'maternity': ['women-employment', 'gosi', 'labor-law'],
    'أمومة': ['women-employment', 'gosi', 'labor-law'],
    'حمل': ['women-employment', 'labor-law'],
    'violation': ['violations', 'labor-law'],
    'مخالفة': ['violations', 'labor-law'],
    'penalty': ['violations', 'labor-law'],
    'غرامة': ['violations', 'labor-law'],
    'عقوبة': ['violations', 'labor-law'],
    'leave': ['labor-law'],
    'إجازة': ['labor-law'],
    'vacation': ['labor-law'],
    'end of service': ['labor-law', 'gosi'],
    'نهاية خدمة': ['labor-law', 'gosi'],
    'مكافأة': ['labor-law', 'gosi'],
    'termination': ['labor-law', 'qiwa'],
    'فصل': ['labor-law', 'qiwa'],
    'إنهاء': ['labor-law', 'qiwa'],
  };

  // البحث عن الأنظمة ذات الصلة
  const lowerTopic = topic.toLowerCase();
  let relevantRegulations: string[] = ['labor-law']; // الافتراضي

  for (const [keyword, regulations] of Object.entries(topicRegulationMap)) {
    if (lowerTopic.includes(keyword.toLowerCase())) {
      relevantRegulations = [...new Set([...relevantRegulations, ...regulations])];
    }
  }

  return buildAIContext(relevantRegulations, language);
}

/**
 * الحصول على سياق لموضوع محدد
 */
export function getTopicContext(
  regulationIds: string[],
  language: 'ar' | 'en' = 'ar'
): string {
  return buildAIContext(regulationIds, language);
}

// ============================================
// وظائف الاستجابة والقوالب
// Response and Template Functions
// ============================================

/**
 * الحصول على قالب استجابة
 */
export function getTemplate(
  templateKey: string,
  language: 'ar' | 'en' = 'ar'
): string {
  return getResponseTemplate(templateKey, language);
}

/**
 * الحصول على رسالة خطأ
 */
export function getError(
  errorKey: string,
  language: 'ar' | 'en' = 'ar'
): string {
  return getErrorMessage(errorKey, language);
}

/**
 * الحصول على إعدادات الذكاء الاصطناعي
 */
export function getAIConfiguration(): AIConfig {
  return loadAIConfig();
}

// ============================================
// وظائف التحقق من الامتثال
// Compliance Checking Functions
// ============================================

/**
 * التحقق من الامتثال للوائح محددة
 */
export function checkRegulationCompliance(
  data: Record<string, unknown>,
  regulationId: string
): {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // التحقق من وجود النظام
  try {
    loadRegulation(regulationId);
  } catch {
    return {
      compliant: false,
      issues: [`النظام غير موجود: ${regulationId}`],
      recommendations: ['تحقق من معرف النظام الصحيح']
    };
  }

  // فحوصات نظام العمل
  if (regulationId === 'labor-law') {
    checkLaborLawCompliance(data, issues);
  }

  // فحوصات حماية الأجور
  if (regulationId === 'wps-mudad') {
    checkWPSCompliance(data, issues);
  }

  // فحوصات نطاقات
  if (regulationId === 'nitaqat') {
    checkNitaqatCompliance(data, issues);
  }

  // فحوصات التأمينات
  if (regulationId === 'gosi') {
    checkGOSICompliance(data, issues);
  }

  return {
    compliant: issues.length === 0,
    issues,
    recommendations
  };
}

// دوال مساعدة للفحوصات
function checkLaborLawCompliance(data: Record<string, unknown>, issues: string[]): void {
  if (data.contractType && !data.written) {
    issues.push('العقد يجب أن يكون مكتوباً');
  }
  if (data.probationDays && Number(data.probationDays) > 180) {
    issues.push('فترة التجربة تتجاوز الحد المسموح (180 يوم)');
  }
}

function checkWPSCompliance(data: Record<string, unknown>, issues: string[]): void {
  const delayDays = Number(data.paymentDelayDays);
  if (delayDays > 60) {
    issues.push('تأخر صرف الأجور يتجاوز 60 يوماً - إيقاف خدمات');
  } else if (delayDays > 20) {
    issues.push('تأخر صرف الأجور يتجاوز 20 يوماً - طلب تفتيش');
  }
}

function checkNitaqatCompliance(data: Record<string, unknown>, issues: string[]): void {
  if (data.saudizationPercentage !== undefined) {
    const percentage = Number(data.saudizationPercentage);
    if (percentage < 10) {
      issues.push('نسبة التوطين منخفضة جداً - نطاق أحمر');
    }
  }
}

function checkGOSICompliance(data: Record<string, unknown>, issues: string[]): void {
  if (data.salary && !data.gosiRegistered) {
    issues.push('الموظف غير مسجل في التأمينات الاجتماعية');
  }
}

// ============================================
// وظائف المعلومات والإحصائيات
// Information and Statistics Functions
// ============================================

/**
 * الحصول على ملخص الأنظمة
 */
export function getRegulationsSummary(language: 'ar' | 'en' = 'ar'): {
  id: string;
  name: string;
  version: string;
  lastUpdate: string;
}[] {
  const regulations = loadAllRegulations();
  return Array.from(regulations.values()).map(reg => ({
    id: reg.id,
    name: reg.name[language],
    version: reg.version,
    lastUpdate: reg.lastAmendment
  }));
}

/**
 * الحصول على معلومات إصدار قاعدة المعرفة
 */
export function getKnowledgeBaseInfo() {
  return knowledgeBase.getKnowledgeBaseVersion();
}

// تصدير افتراضي
export default {
  // قاعدة المعرفة
  getLaborLaw,
  getGOSIRegulation,
  getNitaqatRegulation,
  getWPSRegulation,
  getQiwaRegulation,
  getRemoteWorkRegulation,
  getOHSRegulation,
  getWomenEmploymentRegulation,
  getViolationsRegulation,
  
  // البحث
  searchAllRegulations,
  getAllAvailableRegulations,
  getAvailableRegulationIds,
  
  // السياق
  buildComprehensiveAIContext,
  getTopicContext,
  
  // القوالب
  getTemplate,
  getError,
  getAIConfiguration,
  
  // الامتثال
  checkRegulationCompliance,
  
  // المعلومات
  getRegulationsSummary,
  getKnowledgeBaseInfo,
};
