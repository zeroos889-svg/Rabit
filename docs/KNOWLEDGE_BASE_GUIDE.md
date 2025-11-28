# دليل قاعدة المعرفة - Knowledge Base Guide

## نظرة عامة | Overview

قاعدة المعرفة هي نظام لإدارة الأنظمة واللوائح السعودية المتعلقة بالموارد البشرية. تم تصميمها لتكون:
- **خارجية**: ملفات JSON قابلة للتحديث دون تعديل الكود
- **مُخزّنة مؤقتاً**: تخزين مؤقت لمدة 5 دقائق لتحسين الأداء
- **قابلة للبحث**: بحث نصي في جميع الأنظمة
- **ثنائية اللغة**: دعم كامل للعربية والإنجليزية

---

## الأنظمة المتوفرة | Available Regulations

| ID | النظام (AR) | Regulation (EN) | الجهة المسؤولة |
|----|-------------|-----------------|----------------|
| `labor-law` | نظام العمل السعودي | Saudi Labor Law | وزارة الموارد البشرية |
| `gosi` | نظام التأمينات الاجتماعية | GOSI System | المؤسسة العامة للتأمينات |
| `nitaqat` | نظام نطاقات | Nitaqat Program | وزارة الموارد البشرية |
| `qiwa` | منصة قوى | Qiwa Platform | وزارة الموارد البشرية |
| `wps-mudad` | نظام حماية الأجور | WPS - Mudad | وزارة الموارد البشرية |
| `pdpl` | نظام حماية البيانات الشخصية | Personal Data Protection Law | الهيئة السعودية للبيانات |
| `ohs` | نظام السلامة والصحة المهنية | Occupational Health & Safety | وزارة الموارد البشرية |
| `remote-work` | نظام العمل عن بُعد | Remote Work Regulations | وزارة الموارد البشرية |
| `women-employment` | أنظمة عمل المرأة | Women Employment Laws | وزارة الموارد البشرية |
| `violations` | جدول المخالفات والعقوبات | Violations & Penalties | وزارة الموارد البشرية |

---

## هيكل الملفات | File Structure

```
server/ai/knowledge-base/
├── knowledge-base-loader.ts    # نظام التحميل والتخزين المؤقت
└── regulations/
    ├── labor-law.json          # نظام العمل
    ├── gosi.json               # التأمينات الاجتماعية
    ├── nitaqat.json            # نظام نطاقات
    ├── qiwa.json               # منصة قوى
    ├── wps-mudad.json          # حماية الأجور
    ├── pdpl.json               # حماية البيانات
    ├── ohs.json                # السلامة المهنية
    ├── remote-work.json        # العمل عن بُعد
    ├── women-employment.json   # عمل المرأة
    └── violations.json         # المخالفات والعقوبات
```

---

## هيكل ملف النظام | Regulation File Structure

```json
{
  "id": "labor-law",
  "name": {
    "ar": "نظام العمل السعودي",
    "en": "Saudi Labor Law"
  },
  "authority": {
    "ar": "وزارة الموارد البشرية والتنمية الاجتماعية",
    "en": "Ministry of Human Resources and Social Development"
  },
  "version": "2025",
  "lastAmendment": "2024-06-15",
  "effectiveDate": "2006-04-23",
  "status": "active",
  "overview": {
    "ar": "وصف النظام بالعربية",
    "en": "System description in English"
  },
  "articles": {
    "article77": {
      "title": { "ar": "...", "en": "..." },
      "content": { "ar": "...", "en": "..." }
    }
  },
  "categories": ["employment", "contracts", "wages"],
  "keywords": ["عقد عمل", "employment contract"]
}
```

---

## API Endpoints

### 1. الحصول على قائمة الأنظمة المتوفرة
```typescript
// GET /api/trpc/knowledgeBase.getAvailable
const result = await trpc.knowledgeBase.getAvailable.query();
// Returns: { success: true, data: [...], count: 10 }
```

### 2. الحصول على نظام محدد
```typescript
// GET /api/trpc/knowledgeBase.getRegulation?input="labor-law"
const result = await trpc.knowledgeBase.getRegulation.query("labor-law");
// Returns: { success: true, data: {...} }
```

### 3. البحث في قاعدة المعرفة
```typescript
// GET /api/trpc/knowledgeBase.search
const result = await trpc.knowledgeBase.search.query({
  query: "إجازة سنوية",
  categories: ["leave", "entitlements"],
  limit: 10
});
// Returns: { success: true, results: [...], count: 5 }
```

### 4. الحصول على الأنظمة حسب الفئة
```typescript
// GET /api/trpc/knowledgeBase.getByCategory?input="employment"
const result = await trpc.knowledgeBase.getByCategory.query("employment");
// Returns: { success: true, category: "employment", regulations: [...] }
```

### 5. إحصائيات قاعدة المعرفة
```typescript
// GET /api/trpc/knowledgeBase.getStats
const result = await trpc.knowledgeBase.getStats.query();
// Returns: { 
//   success: true, 
//   stats: { 
//     totalRegulations: 10, 
//     categories: {...}, 
//     lastUpdated: "..." 
//   } 
// }
```

### 6. مسح التخزين المؤقت
```typescript
// POST /api/trpc/knowledgeBase.clearCache
const result = await trpc.knowledgeBase.clearCache.mutate();
// Returns: { success: true, message: "تم مسح التخزين المؤقت بنجاح" }
```

---

## استخدام الـ Loader في الكود | Using the Loader

### استيراد الدوال
```typescript
import {
  loadRegulation,
  loadAllRegulations,
  searchRegulations,
  getRegulationsByCategory,
  getKnowledgeBaseStats,
  getAvailableRegulations,
  clearCache
} from './knowledge-base-loader';
```

### تحميل نظام محدد
```typescript
// تحميل نظام العمل
const laborLaw = loadRegulation('labor-law');
console.log(laborLaw.name.ar); // "نظام العمل السعودي"

// تحميل نظام التأمينات
const gosi = loadRegulation('gosi');
console.log(gosi.rates); // { saudi: {...}, nonSaudi: {...} }
```

### البحث في الأنظمة
```typescript
const results = searchRegulations('إجازة أمومة', {
  categories: ['leave', 'women'],
  limit: 5
});

results.forEach(result => {
  console.log(`${result.name.ar} - Score: ${result.score}`);
});
```

### التصنيف حسب الفئة
```typescript
const employmentRegs = getRegulationsByCategory('employment');
// Returns regulations related to employment
```

---

## إضافة نظام جديد | Adding New Regulation

### 1. إنشاء ملف JSON
```bash
touch server/ai/knowledge-base/regulations/new-regulation.json
```

### 2. إضافة المحتوى بالهيكل الصحيح
```json
{
  "id": "new-regulation",
  "name": {
    "ar": "اسم النظام بالعربية",
    "en": "Regulation Name in English"
  },
  "authority": {
    "ar": "الجهة المسؤولة",
    "en": "Responsible Authority"
  },
  "version": "2025",
  "lastAmendment": "2025-01-01",
  "status": "active",
  "overview": {
    "ar": "نظرة عامة عن النظام",
    "en": "Overview of the regulation"
  },
  "categories": ["category1", "category2"],
  "keywords": ["keyword1", "keyword2"]
}
```

### 3. تحديث قائمة الأنظمة في الـ Loader (اختياري)
إذا أردت إضافته للقائمة الافتراضية، قم بتحديث `AVAILABLE_REGULATIONS` في `knowledge-base-loader.ts`.

---

## التخزين المؤقت | Caching

- **مدة التخزين**: 5 دقائق (قابلة للتعديل)
- **مسح التخزين**: `clearCache()` أو عبر API
- **تحديث تلقائي**: يتم إعادة التحميل تلقائياً بعد انتهاء المدة

```typescript
// تعديل مدة التخزين المؤقت
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق بالميلي ثانية
```

---

## الوحدات المستخدمة لقاعدة المعرفة | Modules Using KB

| الوحدة | الاستخدام |
|--------|----------|
| `compliance-checker.ts` | فحص الامتثال لنظام العمل والمخالفات |
| `gosi-calculator.ts` | حساب اشتراكات التأمينات الاجتماعية |
| `contract-generator.ts` | توليد عقود عمل متوافقة مع النظام |
| `saudization-advisor.ts` | تحليل وتوصيات السعودة (نطاقات) |
| `document-validator.ts` | التحقق من صحة المستندات |

---

## أمثلة عملية | Practical Examples

### مثال 1: فحص استحقاق الإجازة
```typescript
import { loadRegulation } from './knowledge-base-loader';

function checkAnnualLeave(yearsOfService: number): number {
  const laborLaw = loadRegulation('labor-law');
  const leaveRules = laborLaw.articles?.article109?.content;
  
  // بناءً على سنوات الخدمة
  if (yearsOfService >= 5) {
    return 30; // 30 يوم بعد 5 سنوات
  }
  return 21; // 21 يوم للأقل من 5 سنوات
}
```

### مثال 2: حساب اشتراكات GOSI
```typescript
import { loadRegulation } from './knowledge-base-loader';

function calculateGOSI(salary: number, isSaudi: boolean) {
  const gosi = loadRegulation('gosi');
  const rates = isSaudi ? gosi.rates?.saudi : gosi.rates?.nonSaudi;
  
  return {
    employee: salary * (rates?.employee || 0) / 100,
    employer: salary * (rates?.employer || 0) / 100
  };
}
```

### مثال 3: التحقق من نسبة السعودة
```typescript
import { loadRegulation } from './knowledge-base-loader';

function checkSaudization(sector: string, saudiCount: number, totalCount: number) {
  const nitaqat = loadRegulation('nitaqat');
  const sectorReq = nitaqat.sectorRequirements?.[sector];
  
  const currentRatio = (saudiCount / totalCount) * 100;
  const required = sectorReq?.minimum || 20;
  
  return {
    current: currentRatio,
    required: required,
    compliant: currentRatio >= required
  };
}
```

---

## استكشاف الأخطاء | Troubleshooting

### الملف غير موجود
```
Error: النظام غير موجود: xyz
```
**الحل**: تأكد من وجود الملف في `server/ai/knowledge-base/regulations/xyz.json`

### خطأ في تحليل JSON
```
Error: خطأ في تحليل ملف النظام
```
**الحل**: تحقق من صحة تنسيق JSON باستخدام أداة التحقق

### التخزين المؤقت قديم
**الحل**: استخدم `clearCache()` لمسح التخزين المؤقت

---

## المراجع | References

- [نظام العمل السعودي - وزارة الموارد البشرية](https://hrsd.gov.sa)
- [التأمينات الاجتماعية - GOSI](https://www.gosi.gov.sa)
- [منصة قوى](https://www.qiwa.sa)
- [نظام حماية البيانات الشخصية - SDAIA](https://sdaia.gov.sa)

---

*آخر تحديث: نوفمبر 2025*
