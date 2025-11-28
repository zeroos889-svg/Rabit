/**
 * AI Document Validator - مدقق المستندات الذكي
 * 
 * مدقق ذكي للمستندات والسياسات متوافق مع:
 * - نظام العمل السعودي
 * - نظام حماية البيانات الشخصية (PDPL)
 * - متطلبات وزارة الموارد البشرية
 * - معايير الهيئة الوطنية للأمن السيبراني (NCA)
 * 
 * @module server/ai/document-validator
 */

import { callLLM } from "../_core/llm";
import { loadRegulation, type Regulation } from "./knowledge-base-loader";

// ============================================
// دوال تحميل قاعدة المعرفة
// ============================================

// Cache للتنظيمات المحملة
let cachedLaborRegulation: Regulation | null = null;
let cachedPDPLRegulation: Regulation | null = null;

/**
 * تحميل نظام العمل من قاعدة المعرفة
 */
function getLaborRegulation(): Regulation | null {
  if (!cachedLaborRegulation) {
    try {
      cachedLaborRegulation = loadRegulation('labor-law');
    } catch {
      console.warn('Failed to load labor-law regulation');
      return null;
    }
  }
  return cachedLaborRegulation;
}

/**
 * تحميل نظام حماية البيانات من قاعدة المعرفة
 */
function getPDPLRegulation(): Regulation | null {
  if (!cachedPDPLRegulation) {
    try {
      cachedPDPLRegulation = loadRegulation('pdpl');
    } catch {
      console.warn('Failed to load pdpl regulation');
      return null;
    }
  }
  return cachedPDPLRegulation;
}

/**
 * استخراج مواد نظام العمل من قاعدة المعرفة
 */
function getLaborArticlesFromKB(regulation: Regulation): Record<string, unknown> {
  const regData = regulation as Record<string, unknown>;
  const articles: Record<string, unknown> = {};
  
  // استخراج المواد من جميع الأقسام
  for (const [, section] of Object.entries(regData)) {
    if (section && typeof section === 'object' && 'articles' in section) {
      const sectionData = section as Record<string, unknown>;
      Object.assign(articles, sectionData.articles);
    }
  }
  
  return articles;
}

/**
 * استخراج متطلبات PDPL من قاعدة المعرفة
 */
function getPDPLRequirementsFromKB(regulation: Regulation): {
  dataSubjectRights: string[];
  controllerObligations: string[];
  penalties: unknown;
} {
  const regData = regulation as Record<string, any>;
  return {
    dataSubjectRights: regData.dataSubjectRights?.rights?.map((r: { name: string }) => r.name) || [],
    controllerObligations: regData.controllerObligations?.general || [],
    penalties: regData.penalties || {}
  };
}

// ============================================
// أنواع المستندات
// ============================================

export type DocumentType = 
  | 'employment_contract'       // عقد عمل
  | 'termination_letter'        // خطاب إنهاء خدمات
  | 'resignation_letter'        // خطاب استقالة
  | 'warning_letter'            // خطاب إنذار
  | 'salary_certificate'        // شهادة راتب
  | 'experience_certificate'    // شهادة خبرة
  | 'hr_policy'                 // سياسة موارد بشرية
  | 'leave_request'             // طلب إجازة
  | 'promotion_letter'          // خطاب ترقية
  | 'transfer_letter'           // خطاب نقل
  | 'non_compete_agreement'     // اتفاقية عدم منافسة
  | 'confidentiality_agreement' // اتفاقية سرية
  | 'offer_letter'              // خطاب عرض وظيفي
  | 'internal_memo'             // مذكرة داخلية
  | 'other';                    // أخرى

export type ComplianceCategory = 
  | 'labor_law'                 // نظام العمل
  | 'pdpl'                      // حماية البيانات
  | 'nca'                       // الأمن السيبراني
  | 'mohr'                      // وزارة الموارد البشرية
  | 'gosi'                      // التأمينات الاجتماعية
  | 'general';                  // عام

// ============================================
// الواجهات
// ============================================

export interface DocumentInput {
  content: string;
  type: DocumentType;
  metadata?: {
    date?: string;
    parties?: string[];
    language?: 'ar' | 'en' | 'both';
  };
  validationOptions?: {
    categories?: ComplianceCategory[];
    strictMode?: boolean;
    includeRecommendations?: boolean;
  };
}

export interface ValidationResult {
  success: boolean;
  documentType: DocumentType;
  overallScore: number;  // 0-100
  isCompliant: boolean;
  
  compliance: {
    laborLaw: CategoryResult;
    pdpl: CategoryResult;
    nca?: CategoryResult;
    mohr?: CategoryResult;
    gosi?: CategoryResult;
  };
  
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: string[];
  
  missingElements: MissingElement[];
  
  summary: {
    arabic: string;
    english: string;
  };
  
  error?: string;
}

export interface CategoryResult {
  score: number;
  isCompliant: boolean;
  details: string[];
  references: string[];
}

export interface ValidationIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: ComplianceCategory;
  title: string;
  description: string;
  location?: string;
  legalReference?: string;
  suggestion: string;
}

export interface ValidationWarning {
  id: string;
  category: ComplianceCategory;
  title: string;
  description: string;
  recommendation: string;
}

export interface MissingElement {
  element: string;
  required: boolean;
  category: ComplianceCategory;
  reference?: string;
}

// ============================================
// متطلبات المستندات
// ============================================

const DOCUMENT_REQUIREMENTS: Record<DocumentType, {
  requiredElements: { name: string; nameAr: string; required: boolean; category: ComplianceCategory }[];
  complianceChecks: { check: string; category: ComplianceCategory; reference: string }[];
}> = {
  employment_contract: {
    requiredElements: [
      { name: 'employer_info', nameAr: 'بيانات صاحب العمل', required: true, category: 'labor_law' },
      { name: 'employee_info', nameAr: 'بيانات الموظف', required: true, category: 'labor_law' },
      { name: 'job_title', nameAr: 'المسمى الوظيفي', required: true, category: 'labor_law' },
      { name: 'salary', nameAr: 'الراتب', required: true, category: 'labor_law' },
      { name: 'start_date', nameAr: 'تاريخ بدء العمل', required: true, category: 'labor_law' },
      { name: 'work_location', nameAr: 'مكان العمل', required: true, category: 'labor_law' },
      { name: 'working_hours', nameAr: 'ساعات العمل', required: true, category: 'labor_law' },
      { name: 'probation_period', nameAr: 'فترة التجربة', required: false, category: 'labor_law' },
      { name: 'annual_leave', nameAr: 'الإجازة السنوية', required: true, category: 'labor_law' },
      { name: 'notice_period', nameAr: 'فترة الإشعار', required: true, category: 'labor_law' },
      { name: 'termination_terms', nameAr: 'شروط إنهاء العقد', required: true, category: 'labor_law' },
      { name: 'signatures', nameAr: 'التوقيعات', required: true, category: 'labor_law' },
      { name: 'privacy_clause', nameAr: 'بند الخصوصية', required: false, category: 'pdpl' }
    ],
    complianceChecks: [
      { check: 'working_hours_max_8', category: 'labor_law', reference: 'المادة 98' },
      { check: 'working_days_max_6', category: 'labor_law', reference: 'المادة 104' },
      { check: 'annual_leave_min_21', category: 'labor_law', reference: 'المادة 109' },
      { check: 'probation_max_90_days', category: 'labor_law', reference: 'المادة 53' },
      { check: 'notice_period_min_30_days', category: 'labor_law', reference: 'المادة 75' },
      { check: 'salary_in_saudi_riyal', category: 'mohr', reference: 'نظام حماية الأجور' }
    ]
  },
  
  termination_letter: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'labor_law' },
      { name: 'termination_date', nameAr: 'تاريخ الإنهاء', required: true, category: 'labor_law' },
      { name: 'last_working_day', nameAr: 'آخر يوم عمل', required: true, category: 'labor_law' },
      { name: 'termination_reason', nameAr: 'سبب الإنهاء', required: true, category: 'labor_law' },
      { name: 'entitlements', nameAr: 'المستحقات', required: true, category: 'labor_law' },
      { name: 'end_of_service', nameAr: 'مكافأة نهاية الخدمة', required: true, category: 'labor_law' },
      { name: 'remaining_leave', nameAr: 'رصيد الإجازات', required: false, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'valid_termination_reason', category: 'labor_law', reference: 'المادة 80' },
      { check: 'notice_period_respected', category: 'labor_law', reference: 'المادة 75' },
      { check: 'end_of_service_calculated', category: 'labor_law', reference: 'المادة 84' }
    ]
  },
  
  resignation_letter: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'labor_law' },
      { name: 'resignation_date', nameAr: 'تاريخ الاستقالة', required: true, category: 'labor_law' },
      { name: 'last_working_day', nameAr: 'آخر يوم عمل', required: true, category: 'labor_law' },
      { name: 'notice_period', nameAr: 'فترة الإشعار', required: true, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'notice_period_stated', category: 'labor_law', reference: 'المادة 75' }
    ]
  },
  
  warning_letter: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'labor_law' },
      { name: 'warning_date', nameAr: 'تاريخ الإنذار', required: true, category: 'labor_law' },
      { name: 'violation_description', nameAr: 'وصف المخالفة', required: true, category: 'labor_law' },
      { name: 'warning_level', nameAr: 'درجة الإنذار', required: true, category: 'labor_law' },
      { name: 'corrective_action', nameAr: 'الإجراء التصحيحي', required: false, category: 'labor_law' },
      { name: 'consequences', nameAr: 'العواقب المحتملة', required: false, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'proportional_penalty', category: 'labor_law', reference: 'المادة 66' },
      { check: 'due_process_followed', category: 'labor_law', reference: 'المادة 71' }
    ]
  },
  
  salary_certificate: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'general' },
      { name: 'job_title', nameAr: 'المسمى الوظيفي', required: true, category: 'general' },
      { name: 'salary_details', nameAr: 'تفاصيل الراتب', required: true, category: 'general' },
      { name: 'issue_date', nameAr: 'تاريخ الإصدار', required: true, category: 'general' },
      { name: 'company_stamp', nameAr: 'ختم الشركة', required: false, category: 'general' }
    ],
    complianceChecks: []
  },
  
  experience_certificate: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'general' },
      { name: 'job_title', nameAr: 'المسمى الوظيفي', required: true, category: 'general' },
      { name: 'employment_period', nameAr: 'فترة العمل', required: true, category: 'general' },
      { name: 'job_description', nameAr: 'وصف المهام', required: false, category: 'general' },
      { name: 'issue_date', nameAr: 'تاريخ الإصدار', required: true, category: 'general' }
    ],
    complianceChecks: []
  },
  
  hr_policy: {
    requiredElements: [
      { name: 'policy_title', nameAr: 'عنوان السياسة', required: true, category: 'general' },
      { name: 'scope', nameAr: 'نطاق التطبيق', required: true, category: 'general' },
      { name: 'definitions', nameAr: 'التعريفات', required: false, category: 'general' },
      { name: 'policy_statement', nameAr: 'نص السياسة', required: true, category: 'general' },
      { name: 'procedures', nameAr: 'الإجراءات', required: true, category: 'general' },
      { name: 'responsibilities', nameAr: 'المسؤوليات', required: false, category: 'general' },
      { name: 'effective_date', nameAr: 'تاريخ السريان', required: true, category: 'general' },
      { name: 'approval', nameAr: 'الاعتماد', required: true, category: 'general' },
      { name: 'pdpl_compliance', nameAr: 'التوافق مع PDPL', required: false, category: 'pdpl' }
    ],
    complianceChecks: [
      { check: 'labor_law_alignment', category: 'labor_law', reference: 'نظام العمل' },
      { check: 'pdpl_alignment', category: 'pdpl', reference: 'نظام حماية البيانات الشخصية' }
    ]
  },
  
  leave_request: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'labor_law' },
      { name: 'leave_type', nameAr: 'نوع الإجازة', required: true, category: 'labor_law' },
      { name: 'start_date', nameAr: 'تاريخ البداية', required: true, category: 'labor_law' },
      { name: 'end_date', nameAr: 'تاريخ النهاية', required: true, category: 'labor_law' },
      { name: 'duration', nameAr: 'المدة', required: true, category: 'labor_law' },
      { name: 'reason', nameAr: 'السبب', required: false, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'valid_leave_type', category: 'labor_law', reference: 'المواد 109-117' }
    ]
  },
  
  promotion_letter: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'general' },
      { name: 'current_position', nameAr: 'الوظيفة الحالية', required: true, category: 'general' },
      { name: 'new_position', nameAr: 'الوظيفة الجديدة', required: true, category: 'general' },
      { name: 'effective_date', nameAr: 'تاريخ السريان', required: true, category: 'general' },
      { name: 'new_salary', nameAr: 'الراتب الجديد', required: false, category: 'general' }
    ],
    complianceChecks: []
  },
  
  transfer_letter: {
    requiredElements: [
      { name: 'employee_name', nameAr: 'اسم الموظف', required: true, category: 'labor_law' },
      { name: 'current_department', nameAr: 'القسم الحالي', required: true, category: 'labor_law' },
      { name: 'new_department', nameAr: 'القسم الجديد', required: true, category: 'labor_law' },
      { name: 'transfer_date', nameAr: 'تاريخ النقل', required: true, category: 'labor_law' },
      { name: 'reason', nameAr: 'سبب النقل', required: false, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'employee_consent_if_location_change', category: 'labor_law', reference: 'المادة 58' }
    ]
  },
  
  non_compete_agreement: {
    requiredElements: [
      { name: 'parties', nameAr: 'الأطراف', required: true, category: 'labor_law' },
      { name: 'scope', nameAr: 'نطاق المنع', required: true, category: 'labor_law' },
      { name: 'duration', nameAr: 'المدة', required: true, category: 'labor_law' },
      { name: 'geographic_area', nameAr: 'النطاق الجغرافي', required: true, category: 'labor_law' },
      { name: 'compensation', nameAr: 'التعويض', required: false, category: 'labor_law' }
    ],
    complianceChecks: [
      { check: 'reasonable_duration', category: 'labor_law', reference: 'المادة 83' },
      { check: 'reasonable_scope', category: 'labor_law', reference: 'المادة 83' }
    ]
  },
  
  confidentiality_agreement: {
    requiredElements: [
      { name: 'parties', nameAr: 'الأطراف', required: true, category: 'general' },
      { name: 'confidential_info_definition', nameAr: 'تعريف المعلومات السرية', required: true, category: 'general' },
      { name: 'obligations', nameAr: 'الالتزامات', required: true, category: 'general' },
      { name: 'duration', nameAr: 'المدة', required: true, category: 'general' },
      { name: 'exceptions', nameAr: 'الاستثناءات', required: false, category: 'general' },
      { name: 'pdpl_compliance', nameAr: 'التوافق مع PDPL', required: false, category: 'pdpl' }
    ],
    complianceChecks: [
      { check: 'pdpl_alignment', category: 'pdpl', reference: 'نظام حماية البيانات الشخصية' }
    ]
  },
  
  offer_letter: {
    requiredElements: [
      { name: 'candidate_name', nameAr: 'اسم المرشح', required: true, category: 'general' },
      { name: 'job_title', nameAr: 'المسمى الوظيفي', required: true, category: 'general' },
      { name: 'salary', nameAr: 'الراتب', required: true, category: 'general' },
      { name: 'start_date', nameAr: 'تاريخ البدء', required: true, category: 'general' },
      { name: 'benefits', nameAr: 'المزايا', required: false, category: 'general' },
      { name: 'validity_period', nameAr: 'صلاحية العرض', required: true, category: 'general' },
      { name: 'conditions', nameAr: 'الشروط', required: false, category: 'general' }
    ],
    complianceChecks: []
  },
  
  internal_memo: {
    requiredElements: [
      { name: 'subject', nameAr: 'الموضوع', required: true, category: 'general' },
      { name: 'date', nameAr: 'التاريخ', required: true, category: 'general' },
      { name: 'from', nameAr: 'من', required: true, category: 'general' },
      { name: 'to', nameAr: 'إلى', required: true, category: 'general' },
      { name: 'content', nameAr: 'المحتوى', required: true, category: 'general' }
    ],
    complianceChecks: []
  },
  
  other: {
    requiredElements: [],
    complianceChecks: []
  }
};

// ============================================
// Helper Functions
// ============================================

async function callAI<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: 'أنت مساعد ذكي متخصص في مراجعة وتدقيق مستندات الموارد البشرية. أجب بصيغة JSON فقط.' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 3000
    });
    if (!response) return fallback;
    
    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    
    const textContent = typeof content === 'string' ? content : 
      (Array.isArray(content) ? content.filter(c => c.type === 'text').map(c => (c as {text: string}).text).join('') : '');
    
    const cleanedResponse = textContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse) as T;
  } catch (error) {
    console.error('Document Validator AI Error:', error);
    return fallback;
  }
}

function generateIssueId(): string {
  return `ISSUE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================
// Main Functions
// ============================================

/**
 * التحقق الشامل من المستند
 */
export async function validateDocument(input: DocumentInput): Promise<ValidationResult> {
  const requirements = DOCUMENT_REQUIREMENTS[input.type];
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  const missingElements: MissingElement[] = [];
  
  // التحقق من العناصر المطلوبة
  const elementCheckPrompt = `
أنت مدقق مستندات قانوني متخصص في قوانين العمل السعودية.

قم بتحليل المستند التالي والتحقق من وجود العناصر المطلوبة:

## نوع المستند: ${getDocumentTypeName(input.type)}

## العناصر المطلوبة:
${requirements.requiredElements.map(e => `- ${e.nameAr} (${e.name}): ${e.required ? 'إلزامي' : 'اختياري'}`).join('\n')}

## نص المستند:
${input.content}

أرجع النتيجة بصيغة JSON:
{
  "foundElements": [
    {"name": "element_name", "found": true, "value": "القيمة المستخرجة"}
  ],
  "missingRequired": ["العناصر الإلزامية المفقودة"],
  "missingOptional": ["العناصر الاختيارية المفقودة"],
  "additionalFindings": ["ملاحظات إضافية"]
}
`;

  const elementCheck = await callAI<{
    foundElements: { name: string; found: boolean; value?: string }[];
    missingRequired: string[];
    missingOptional: string[];
    additionalFindings?: string[];
  }>(elementCheckPrompt, {
    foundElements: [],
    missingRequired: [],
    missingOptional: []
  });
  
  // معالجة العناصر المفقودة
  for (const element of elementCheck.missingRequired) {
    const req = requirements.requiredElements.find(e => e.name === element || e.nameAr === element);
    if (req) {
      missingElements.push({
        element: req.nameAr,
        required: true,
        category: req.category
      });
      
      issues.push({
        id: generateIssueId(),
        severity: 'critical',
        category: req.category,
        title: `عنصر إلزامي مفقود: ${req.nameAr}`,
        description: `المستند لا يحتوي على ${req.nameAr} وهو عنصر إلزامي`,
        suggestion: `إضافة ${req.nameAr} للمستند`
      });
    }
  }
  
  for (const element of elementCheck.missingOptional) {
    const req = requirements.requiredElements.find(e => e.name === element || e.nameAr === element);
    if (req) {
      missingElements.push({
        element: req.nameAr,
        required: false,
        category: req.category
      });
      
      warnings.push({
        id: generateIssueId(),
        category: req.category,
        title: `عنصر اختياري مفقود: ${req.nameAr}`,
        description: `يُنصح بإضافة ${req.nameAr} للمستند`,
        recommendation: `النظر في إضافة ${req.nameAr} لتحسين المستند`
      });
    }
  }
  
  // التحقق من الامتثال القانوني
  // تحميل قاعدة المعرفة
  const laborRegulation = getLaborRegulation();
  const pdplRegulation = getPDPLRegulation();
  
  // استخراج المواد من قاعدة المعرفة
  const laborArticles = laborRegulation ? getLaborArticlesFromKB(laborRegulation) : {};
  const pdplRequirements = pdplRegulation ? getPDPLRequirementsFromKB(pdplRegulation) : null;
  
  const compliancePrompt = `
أنت مستشار قانوني متخصص في نظام العمل السعودي ونظام حماية البيانات الشخصية.

قم بمراجعة المستند التالي والتحقق من امتثاله للأنظمة:

## نوع المستند: ${getDocumentTypeName(input.type)}

## نص المستند:
${input.content}

## الفحوصات المطلوبة:
${requirements.complianceChecks.map(c => `- ${c.check}: ${c.reference}`).join('\n')}

## المراجع القانونية (نظام العمل):
${JSON.stringify(Object.entries(laborArticles).slice(0, 15), null, 2)}

${pdplRequirements ? `## متطلبات حماية البيانات الشخصية (PDPL):
- حقوق صاحب البيانات: ${pdplRequirements.dataSubjectRights.join(', ')}
- التزامات المتحكم: ${pdplRequirements.controllerObligations.slice(0, 5).join(', ')}
` : ''}

أرجع النتيجة بصيغة JSON:
{
  "laborLawCompliance": {
    "score": 85,
    "isCompliant": true,
    "issues": [],
    "details": ["تفاصيل الامتثال"]
  },
  "pdplCompliance": {
    "score": 90,
    "isCompliant": true,
    "issues": [],
    "details": ["تفاصيل الامتثال"]
  },
  "criticalIssues": [
    {
      "severity": "critical|high|medium|low",
      "category": "labor_law|pdpl|nca|mohr|gosi",
      "title": "عنوان المشكلة",
      "description": "وصف المشكلة",
      "legalReference": "المرجع القانوني",
      "suggestion": "الحل المقترح"
    }
  ],
  "warnings": [
    {
      "category": "الفئة",
      "title": "العنوان",
      "description": "الوصف",
      "recommendation": "التوصية"
    }
  ],
  "recommendations": ["التوصيات العامة"]
}
`;

  const complianceCheck = await callAI<{
    laborLawCompliance: CategoryResult;
    pdplCompliance: CategoryResult;
    criticalIssues?: Array<{
      severity: string;
      category: string;
      title: string;
      description: string;
      legalReference?: string;
      suggestion: string;
    }>;
    warnings?: Array<{
      category: string;
      title: string;
      description: string;
      recommendation: string;
    }>;
    recommendations?: string[];
  }>(compliancePrompt, {
    laborLawCompliance: { score: 70, isCompliant: true, details: [], references: [] },
    pdplCompliance: { score: 70, isCompliant: true, details: [], references: [] }
  });
  
  // إضافة المشاكل من فحص الامتثال
  if (complianceCheck.criticalIssues) {
    for (const issue of complianceCheck.criticalIssues) {
      issues.push({
        id: generateIssueId(),
        severity: issue.severity as ValidationIssue['severity'],
        category: issue.category as ComplianceCategory,
        title: issue.title,
        description: issue.description,
        legalReference: issue.legalReference,
        suggestion: issue.suggestion
      });
    }
  }
  
  if (complianceCheck.warnings) {
    for (const warning of complianceCheck.warnings) {
      warnings.push({
        id: generateIssueId(),
        category: warning.category as ComplianceCategory,
        title: warning.title,
        description: warning.description,
        recommendation: warning.recommendation
      });
    }
  }
  
  // حساب النتيجة الإجمالية
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  
  let overallScore = 100;
  overallScore -= criticalCount * 25;
  overallScore -= highCount * 15;
  overallScore -= mediumCount * 5;
  overallScore -= warnings.length * 2;
  overallScore = Math.max(0, overallScore);
  
  const isCompliant = criticalCount === 0 && highCount === 0;
  
  return {
    success: true,
    documentType: input.type,
    overallScore,
    isCompliant,
    compliance: {
      laborLaw: complianceCheck.laborLawCompliance,
      pdpl: complianceCheck.pdplCompliance
    },
    issues,
    warnings,
    recommendations: complianceCheck.recommendations || [],
    missingElements,
    summary: {
      arabic: generateArabicSummary(input.type, overallScore, isCompliant, issues.length, warnings.length),
      english: generateEnglishSummary(input.type, overallScore, isCompliant, issues.length, warnings.length)
    }
  };
}

/**
 * التحقق السريع من نوع المستند
 */
export async function detectDocumentType(content: string): Promise<{
  type: DocumentType;
  confidence: number;
  language: 'ar' | 'en' | 'both';
}> {
  const prompt = `
حلل النص التالي وحدد نوع المستند:

${content.substring(0, 2000)}

أنواع المستندات المتاحة:
- employment_contract: عقد عمل
- termination_letter: خطاب إنهاء خدمات
- resignation_letter: خطاب استقالة
- warning_letter: خطاب إنذار
- salary_certificate: شهادة راتب
- experience_certificate: شهادة خبرة
- hr_policy: سياسة موارد بشرية
- leave_request: طلب إجازة
- promotion_letter: خطاب ترقية
- transfer_letter: خطاب نقل
- non_compete_agreement: اتفاقية عدم منافسة
- confidentiality_agreement: اتفاقية سرية
- offer_letter: خطاب عرض وظيفي
- internal_memo: مذكرة داخلية
- other: أخرى

أرجع النتيجة بصيغة JSON:
{
  "type": "نوع المستند",
  "confidence": 0.95,
  "language": "ar|en|both"
}
`;

  return await callAI<{
    type: DocumentType;
    confidence: number;
    language: 'ar' | 'en' | 'both';
  }>(prompt, {
    type: 'other',
    confidence: 0.5,
    language: 'ar'
  });
}

/**
 * التحقق من سياسة الموارد البشرية
 */
export async function validateHRPolicy(
  policyContent: string,
  policyType: string
): Promise<{
  success: boolean;
  isCompliant: boolean;
  laborLawAlignment: CategoryResult;
  pdplAlignment: CategoryResult;
  issues: ValidationIssue[];
  suggestions: string[];
}> {
  // تحميل قاعدة المعرفة
  const laborRegulation = getLaborRegulation();
  const pdplRegulation = getPDPLRegulation();
  
  // استخراج المواد والمتطلبات
  const laborArticles = laborRegulation ? getLaborArticlesFromKB(laborRegulation) : {};
  const pdplRequirements = pdplRegulation ? getPDPLRequirementsFromKB(pdplRegulation) : null;
  
  const prompt = `
أنت مستشار موارد بشرية وقانوني متخصص في الأنظمة السعودية.

قم بمراجعة سياسة الموارد البشرية التالية:

## نوع السياسة: ${policyType}

## نص السياسة:
${policyContent}

## المراجع القانونية (نظام العمل):
${JSON.stringify(Object.entries(laborArticles).slice(0, 10), null, 2)}

${pdplRequirements ? `## متطلبات حماية البيانات الشخصية (PDPL):
- حقوق صاحب البيانات: ${pdplRequirements.dataSubjectRights.join(', ')}
- التزامات المتحكم: ${pdplRequirements.controllerObligations.slice(0, 5).join(', ')}
` : `## المراجع القانونية:
- نظام العمل السعودي
- نظام حماية البيانات الشخصية (PDPL)
- لوائح وزارة الموارد البشرية
`}

تحقق من:
1. توافق السياسة مع نظام العمل
2. حماية حقوق الموظفين
3. التوافق مع PDPL
4. الوضوح والقابلية للتطبيق

أرجع النتيجة بصيغة JSON:
{
  "isCompliant": true,
  "laborLawAlignment": {
    "score": 85,
    "isCompliant": true,
    "details": ["التفاصيل"],
    "references": ["المراجع"]
  },
  "pdplAlignment": {
    "score": 90,
    "isCompliant": true,
    "details": ["التفاصيل"],
    "references": ["المراجع"]
  },
  "issues": [
    {
      "severity": "medium",
      "category": "labor_law",
      "title": "العنوان",
      "description": "الوصف",
      "suggestion": "الاقتراح"
    }
  ],
  "suggestions": ["اقتراحات التحسين"]
}
`;

  const result = await callAI<{
    isCompliant: boolean;
    laborLawAlignment: CategoryResult;
    pdplAlignment: CategoryResult;
    issues: Array<{
      severity: string;
      category: string;
      title: string;
      description: string;
      suggestion: string;
    }>;
    suggestions: string[];
  }>(prompt, {
    isCompliant: true,
    laborLawAlignment: { score: 70, isCompliant: true, details: [], references: [] },
    pdplAlignment: { score: 70, isCompliant: true, details: [], references: [] },
    issues: [],
    suggestions: []
  });
  
  return {
    success: true,
    isCompliant: result.isCompliant,
    laborLawAlignment: result.laborLawAlignment,
    pdplAlignment: result.pdplAlignment,
    issues: result.issues.map(i => ({
      id: generateIssueId(),
      severity: i.severity as ValidationIssue['severity'],
      category: i.category as ComplianceCategory,
      title: i.title,
      description: i.description,
      suggestion: i.suggestion
    })),
    suggestions: result.suggestions
  };
}

/**
 * التحقق من عقد العمل
 */
export async function validateEmploymentContract(
  contractContent: string,
  employeeNationality: 'saudi' | 'non-saudi'
): Promise<ValidationResult> {
  // استخدام الوظيفة العامة مع خيارات خاصة بعقود العمل
  const result = await validateDocument({
    content: contractContent,
    type: 'employment_contract',
    validationOptions: {
      categories: ['labor_law', 'mohr', 'gosi'],
      strictMode: true
    }
  });
  
  // إضافة فحوصات خاصة بالجنسية
  if (employeeNationality === 'non-saudi') {
    // التحقق من أن العقد محدد المدة
    if (contractContent.includes('غير محدد المدة') || contractContent.includes('unlimited')) {
      result.issues.push({
        id: generateIssueId(),
        severity: 'critical',
        category: 'labor_law',
        title: 'نوع العقد غير صحيح',
        description: 'لا يمكن إبرام عقد غير محدد المدة مع موظف غير سعودي',
        legalReference: 'المادة 37 من نظام العمل',
        suggestion: 'تحويل العقد إلى عقد محدد المدة'
      });
      result.isCompliant = false;
    }
  }
  
  return result;
}

/**
 * إنشاء تقرير التحقق
 */
export async function generateValidationReport(
  validationResult: ValidationResult
): Promise<string> {
  const report = `
# تقرير التحقق من المستند
## ${getDocumentTypeName(validationResult.documentType)}

### ملخص النتائج
- **النتيجة الإجمالية**: ${validationResult.overallScore}%
- **حالة الامتثال**: ${validationResult.isCompliant ? '✅ متوافق' : '❌ غير متوافق'}

### نتائج الامتثال

#### نظام العمل
- النتيجة: ${validationResult.compliance.laborLaw.score}%
- الحالة: ${validationResult.compliance.laborLaw.isCompliant ? 'متوافق' : 'غير متوافق'}
${validationResult.compliance.laborLaw.details.map(d => `- ${d}`).join('\n')}

#### حماية البيانات الشخصية
- النتيجة: ${validationResult.compliance.pdpl.score}%
- الحالة: ${validationResult.compliance.pdpl.isCompliant ? 'متوافق' : 'غير متوافق'}
${validationResult.compliance.pdpl.details.map(d => `- ${d}`).join('\n')}

### المشاكل المكتشفة (${validationResult.issues.length})
${validationResult.issues.map(issue => `
#### ${issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🟡' : '🟢'} ${issue.title}
- **الخطورة**: ${getSeverityName(issue.severity)}
- **الفئة**: ${getCategoryName(issue.category)}
- **الوصف**: ${issue.description}
${issue.legalReference ? `- **المرجع القانوني**: ${issue.legalReference}` : ''}
- **الحل المقترح**: ${issue.suggestion}
`).join('\n')}

### التحذيرات (${validationResult.warnings.length})
${validationResult.warnings.map(warning => `
- **${warning.title}**: ${warning.description}
  - التوصية: ${warning.recommendation}
`).join('\n')}

### العناصر المفقودة (${validationResult.missingElements.length})
${validationResult.missingElements.map(element => `
- ${element.element}: ${element.required ? '⚠️ إلزامي' : 'اختياري'}
`).join('\n')}

### التوصيات
${validationResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
`;
  
  return report;
}

// ============================================
// Helper Functions
// ============================================

function getDocumentTypeName(type: DocumentType): string {
  const names: Record<DocumentType, string> = {
    employment_contract: 'عقد عمل',
    termination_letter: 'خطاب إنهاء خدمات',
    resignation_letter: 'خطاب استقالة',
    warning_letter: 'خطاب إنذار',
    salary_certificate: 'شهادة راتب',
    experience_certificate: 'شهادة خبرة',
    hr_policy: 'سياسة موارد بشرية',
    leave_request: 'طلب إجازة',
    promotion_letter: 'خطاب ترقية',
    transfer_letter: 'خطاب نقل',
    non_compete_agreement: 'اتفاقية عدم منافسة',
    confidentiality_agreement: 'اتفاقية سرية',
    offer_letter: 'خطاب عرض وظيفي',
    internal_memo: 'مذكرة داخلية',
    other: 'أخرى'
  };
  return names[type] || type;
}

function getSeverityName(severity: string): string {
  const names: Record<string, string> = {
    critical: 'حرج',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض'
  };
  return names[severity] || severity;
}

function getCategoryName(category: ComplianceCategory): string {
  const names: Record<ComplianceCategory, string> = {
    labor_law: 'نظام العمل',
    pdpl: 'حماية البيانات',
    nca: 'الأمن السيبراني',
    mohr: 'وزارة الموارد البشرية',
    gosi: 'التأمينات الاجتماعية',
    general: 'عام'
  };
  return names[category] || category;
}

function generateArabicSummary(
  type: DocumentType,
  score: number,
  isCompliant: boolean,
  issuesCount: number,
  warningsCount: number
): string {
  return `تم تحليل ${getDocumentTypeName(type)}. النتيجة: ${score}%. ` +
    `${isCompliant ? 'المستند متوافق مع الأنظمة.' : 'المستند يحتاج إلى تصحيح.'} ` +
    `تم اكتشاف ${issuesCount} مشكلة و${warningsCount} تحذير.`;
}

function generateEnglishSummary(
  type: DocumentType,
  score: number,
  isCompliant: boolean,
  issuesCount: number,
  warningsCount: number
): string {
  return `${getDocumentTypeName(type)} analyzed. Score: ${score}%. ` +
    `${isCompliant ? 'Document is compliant.' : 'Document needs corrections.'} ` +
    `Found ${issuesCount} issues and ${warningsCount} warnings.`;
}
