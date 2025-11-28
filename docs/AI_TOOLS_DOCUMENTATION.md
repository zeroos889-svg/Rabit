# 🤖 توثيق أدوات الذكاء الاصطناعي - RabtHR AI Tools Documentation

> نظام شامل للأدوات المدعومة بالذكاء الاصطناعي ومتوافقة مع أنظمة العمل السعودية

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Tests-237%20Passing-green.svg)]()

---

## 📑 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [قاعدة المعرفة التنظيمية](#قاعدة-المعرفة-التنظيمية)
3. [الآلات الحاسبة المالية](#الآلات-الحاسبة-المالية)
4. [أدوات الامتثال](#أدوات-الامتثال)
5. [أدوات صياغة العقود](#أدوات-صياغة-العقود)
6. [أدوات تحليل الموظفين](#أدوات-تحليل-الموظفين)
7. [API Reference](#api-reference)
8. [Frontend Components](#frontend-components)
9. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## 🔍 نظرة عامة

### الهدف
توفير منظومة متكاملة من الأدوات الذكية لإدارة الموارد البشرية، مصممة خصيصًا للتوافق مع:

- ✅ نظام العمل السعودي
- ✅ نظام التأمينات الاجتماعية (GOSI)
- ✅ برنامج نطاقات للسعودة
- ✅ حماية الأجور (WPS)
- ✅ قوانين الإجازات والمكافآت

### المميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🧠 ذكاء اصطناعي متقدم | تحليل ذكي للبيانات والتوصيات |
| 📊 تحليلات فورية | رسوم بيانية وإحصائيات محدثة |
| 🔒 أمان عالي | حماية البيانات والخصوصية |
| 🌐 ثنائي اللغة | دعم كامل للعربية والإنجليزية |
| 📱 متجاوب | يعمل على جميع الأجهزة |
| ✅ 237 اختبار | تغطية شاملة للاختبارات |

---

## 📚 قاعدة المعرفة التنظيمية

### الأنظمة المدعومة

```typescript
type SupportedRegulation = 
  | 'saudi-labor-law'           // نظام العمل السعودي
  | 'gosi'                      // التأمينات الاجتماعية
  | 'nitaqat'                   // نطاقات
  | 'wage-protection'           // حماية الأجور
  | 'end-of-service'            // نهاية الخدمة
  | 'annual-leave'              // الإجازات السنوية
  | 'working-hours'             // ساعات العمل
  | 'women-employment'          // توظيف المرأة
  | 'remote-work'               // العمل عن بعد
  | 'occupational-safety'       // السلامة المهنية
  | 'contract-regulations';     // أنظمة العقود
```

### API Endpoints

#### استرجاع جميع الأنظمة
```http
GET /api/trpc/knowledgeBase.getAllRegulations
```

**Response:**
```json
{
  "result": {
    "data": [
      {
        "id": "saudi-labor-law",
        "nameAr": "نظام العمل السعودي",
        "nameEn": "Saudi Labor Law",
        "categoryAr": "قوانين العمل",
        "categoryEn": "Labor Laws",
        "description": "...",
        "articles": [...],
        "lastUpdated": "2024-01-15"
      }
    ]
  }
}
```

#### استرجاع نظام محدد
```http
GET /api/trpc/knowledgeBase.getRegulation?input={"id":"gosi"}
```

#### البحث في الأنظمة
```http
GET /api/trpc/knowledgeBase.searchRegulations?input={"query":"نهاية الخدمة","language":"ar"}
```

#### استرجاع مادة محددة
```http
GET /api/trpc/knowledgeBase.getArticle?input={"regulationId":"saudi-labor-law","articleNumber":"80"}
```

### React Hook

```typescript
import { useRegulations } from '@/hooks/useAI';

function RegulationsPage() {
  const { 
    regulations,    // جميع الأنظمة
    isLoading,      // حالة التحميل
    error,          // الأخطاء
    searchRegulations,  // دالة البحث
    getRegulation,      // استرجاع نظام
    getArticle          // استرجاع مادة
  } = useRegulations();

  // البحث
  const results = await searchRegulations('إجازة سنوية');
  
  // استرجاع نظام محدد
  const laborLaw = await getRegulation('saudi-labor-law');
  
  // استرجاع مادة محددة
  const article80 = await getArticle('saudi-labor-law', '80');
}
```

---

## 🧮 الآلات الحاسبة المالية

### 1. حاسبة التأمينات الاجتماعية (GOSI)

#### الوصف
حساب اشتراكات التأمينات الاجتماعية للموظفين السعوديين وغير السعوديين.

#### معدلات الاشتراك (2024)

| النوع | صاحب العمل | الموظف |
|-------|------------|--------|
| معاشات (سعودي) | 9% | 9% |
| أخطار مهنية | 2% | - |
| ساند (سعودي) | 0.75% | 0.75% |
| غير سعودي | 2% | - |

#### API

```http
POST /api/trpc/financialCalculator.calculateGOSI
Content-Type: application/json

{
  "basicSalary": 10000,
  "housingAllowance": 2500,
  "isNonSaudi": false,
  "employerContributionRate": 0.1175,
  "employeeContributionRate": 0.0975
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "employeeContribution": 1218.75,
      "employerContribution": 1468.75,
      "totalContribution": 2687.50,
      "totalInsurableSalary": 12500,
      "breakdown": {
        "pension": { "employee": 1125, "employer": 1125 },
        "annuities": { "employer": 250 },
        "saned": { "employee": 93.75, "employer": 93.75 }
      }
    }
  }
}
```

#### React Component

```typescript
import { GOSICalculator } from '@/components/calculators/GOSICalculator';

function App() {
  return (
    <GOSICalculator 
      onCalculate={(result) => console.log(result)}
      showHistory={true}
      enablePDFExport={true}
    />
  );
}
```

---

### 2. حاسبة مكافأة نهاية الخدمة (EOSB)

#### قواعد الحساب

| سنوات الخدمة | نسبة الاستحقاق |
|--------------|----------------|
| أقل من 2 سنة | 0% (استقالة) |
| 2-5 سنوات | ثلث المكافأة |
| 5-10 سنوات | ثلثي المكافأة |
| أكثر من 10 سنوات | المكافأة كاملة |

#### حساب المكافأة

- **أول 5 سنوات:** نصف راتب شهري عن كل سنة
- **بعد 5 سنوات:** راتب شهري كامل عن كل سنة

#### API

```http
POST /api/trpc/financialCalculator.calculateEOSB
Content-Type: application/json

{
  "basicSalary": 15000,
  "allowances": 5000,
  "yearsOfService": 8.5,
  "terminationReason": "resignation",
  "contractType": "unlimited"
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "totalAmount": 93333.33,
      "yearsCalculation": "8 سنوات و 6 أشهر",
      "eligibilityPercentage": 66.67,
      "breakdown": {
        "firstFiveYears": 50000,
        "afterFiveYears": 70000,
        "adjustedTotal": 93333.33
      },
      "warnings": []
    }
  }
}
```

---

### 3. حاسبة الإجازات

#### استحقاقات الإجازة السنوية

| سنوات الخدمة | الاستحقاق |
|--------------|-----------|
| أقل من 5 سنوات | 21 يوم |
| 5 سنوات فأكثر | 30 يوم |

#### API

```http
POST /api/trpc/financialCalculator.calculateLeave
Content-Type: application/json

{
  "yearsOfService": 6,
  "usedDays": 10,
  "carryOverDays": 5,
  "dailySalary": 500
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "annualEntitlement": 30,
      "remainingDays": 25,
      "totalAccrued": 35,
      "cashValue": 17500,
      "expiryDate": "2025-03-31"
    }
  }
}
```

---

## ✅ أدوات الامتثال

### 1. فحص الامتثال الشامل

```http
POST /api/trpc/complianceChecker.checkCompliance
Content-Type: application/json

{
  "employeeData": {
    "name": "أحمد محمد",
    "nationality": "SA",
    "salary": 8000,
    "contractType": "unlimited",
    "workingHours": 48
  },
  "companyData": {
    "sector": "retail",
    "size": "medium",
    "totalEmployees": 50,
    "saudiEmployees": 20
  }
}
```

### 2. فحص نسبة السعودة

```http
POST /api/trpc/complianceChecker.checkSaudization
Content-Type: application/json

{
  "sector": "retail",
  "companySize": "medium",
  "totalEmployees": 100,
  "saudiEmployees": 25
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "currentPercentage": 25,
      "requiredPercentage": 30,
      "band": "yellow",
      "isCompliant": false,
      "shortfall": 5,
      "recommendations": [
        "توظيف 5 موظفين سعوديين إضافيين للوصول للنطاق الأخضر",
        "الاستفادة من برنامج دعم التوظيف"
      ]
    }
  }
}
```

### 3. فحص حماية الأجور

```http
POST /api/trpc/complianceChecker.checkWageProtection
Content-Type: application/json

{
  "employeeSalary": 5000,
  "paymentDate": "2024-01-10",
  "paymentMethod": "bank_transfer",
  "contractSalary": 5000
}
```

---

## 📝 أدوات صياغة العقود

### أنواع العقود المدعومة

1. **عقد عمل غير محدد المدة**
2. **عقد عمل محدد المدة**
3. **عقد تدريب**
4. **عقد عمل بدوام جزئي**
5. **عقد عمل عن بُعد**
6. **عقد موسمي**

### API

```http
POST /api/trpc/contractGenerator.generate
Content-Type: application/json

{
  "type": "unlimited",
  "employeeInfo": {
    "name": "أحمد محمد",
    "nationalId": "1234567890",
    "nationality": "SA"
  },
  "jobInfo": {
    "title": "مهندس برمجيات",
    "department": "التقنية",
    "salary": 15000
  },
  "companyInfo": {
    "name": "شركة رابط",
    "crNumber": "1010123456"
  },
  "terms": {
    "probationPeriod": 90,
    "noticePeriod": 30,
    "workingHours": 8
  }
}
```

---

## 👥 أدوات تحليل الموظفين

### 1. تحليل الأداء

```http
POST /api/trpc/employeeAnalyzer.analyzePerformance
Content-Type: application/json

{
  "employeeId": "EMP001",
  "metrics": {
    "attendance": 95,
    "tasksCompleted": 45,
    "qualityScore": 88
  },
  "period": "2024-Q1"
}
```

### 2. التنبؤ بالاستقالة

```http
POST /api/trpc/employeeAnalyzer.predictAttrition
Content-Type: application/json

{
  "employeeId": "EMP001",
  "factors": {
    "tenure": 2.5,
    "salaryGrowth": 5,
    "promotions": 0,
    "satisfactionScore": 3.5
  }
}
```

### 3. توصيات التطوير

```http
POST /api/trpc/employeeAnalyzer.getDevelopmentPlan
Content-Type: application/json

{
  "employeeId": "EMP001",
  "currentSkills": ["javascript", "react"],
  "targetRole": "Senior Developer"
}
```

---

## 🎨 Frontend Components

### المكونات المتاحة

```typescript
// Dashboard الرئيسي
import { AIDashboard } from '@/pages/AIDashboard';

// صفحة الأنظمة
import { SaudiRegulations } from '@/pages/SaudiRegulations';

// الآلات الحاسبة
import { CalculatorsPage } from '@/pages/FinancialCalculators';
import { GOSICalculator } from '@/components/calculators/GOSICalculator';
import { EOSBCalculator } from '@/components/calculators/EOSBCalculator';
import { LeaveCalculator } from '@/components/calculators/LeaveCalculator';

// الرسوم البيانية
import { AIStatsDashboard } from '@/components/ai/AIStatsDashboard';

// سجل الحسابات
import { CalculationHistory } from '@/components/ai/CalculationHistory';
```

### استخدام المكونات

```tsx
import { AIDashboard } from '@/pages/AIDashboard';
import { AIStatsDashboard } from '@/components/ai/AIStatsDashboard';
import { CalculationHistory } from '@/components/ai/CalculationHistory';

function AIPage() {
  return (
    <div className="space-y-8">
      {/* لوحة التحكم */}
      <AIDashboard />
      
      {/* الإحصائيات */}
      <AIStatsDashboard />
      
      {/* سجل الحسابات */}
      <CalculationHistory />
    </div>
  );
}
```

---

## 💾 سجل الحسابات

### حفظ السجلات

```typescript
import { 
  saveGOSIRecord,
  saveEOSBRecord,
  getAllRecords,
  getRecordsByType 
} from '@/lib/calculationHistory';

// حفظ حساب GOSI
const record = saveGOSIRecord(
  {
    basicSalary: 10000,
    housingAllowance: 2500,
    isNonSaudi: false,
    employerContributionRate: 0.1175,
    employeeContributionRate: 0.0975
  },
  {
    employeeContribution: 1218.75,
    employerContribution: 1468.75,
    totalContribution: 2687.50,
    totalInsurableSalary: 12500
  },
  {
    employeeName: 'أحمد محمد',
    employeeId: 'EMP001'
  }
);

// استرجاع السجلات
const allRecords = getAllRecords();
const gosiRecords = getRecordsByType('gosi');
```

### تصدير السجلات

```typescript
import { exportRecordsAsJSON } from '@/lib/calculationHistory';

// تصدير كـ JSON
const jsonData = exportRecordsAsJSON();

// تنزيل الملف
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
```

---

## 📤 تصدير PDF

### الاستخدام

```typescript
import { 
  generateGOSIPDF, 
  generateEOSBPDF,
  downloadPDF 
} from '@/lib/pdfExport';

// توليد PDF لحساب GOSI
const pdfContent = generateGOSIPDF({
  employeeName: 'أحمد محمد',
  basicSalary: 10000,
  housingAllowance: 2500,
  employeeContribution: 1218.75,
  employerContribution: 1468.75,
  totalContribution: 2687.50,
  calculationDate: new Date()
}, 'ar');

// تنزيل PDF
downloadPDF(pdfContent, 'gosi-calculation.pdf');
```

---

## 🛠️ Hooks المتاحة

```typescript
// جميع hooks الخاصة بالذكاء الاصطناعي
import {
  useDocumentGenerator,    // توليد المستندات
  useComplianceChecker,    // فحص الامتثال
  useAIChat,              // المحادثة الذكية
  useContractGenerator,   // صياغة العقود
  useFinancialCalculator, // الحاسبات المالية
  useEmployeeAnalyzer,    // تحليل الموظفين
  useRegulations          // قاعدة الأنظمة
} from '@/hooks/useAI';
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
# جميع الاختبارات
npm test

# اختبارات AI فقط
npm test -- --grep "AI"

# اختبارات Knowledge Base
npm test -- --grep "knowledge"
```

### نتائج الاختبارات

```
✓ Knowledge Base Tests (15 tests)
  ✓ getAllRegulations returns all regulations
  ✓ getRegulation returns specific regulation
  ✓ searchRegulations finds relevant results
  ✓ getArticle returns specific article
  ...

✓ Financial Calculator Tests (25 tests)
  ✓ calculates GOSI correctly for Saudi employee
  ✓ calculates GOSI correctly for non-Saudi
  ✓ calculates EOSB for resignation
  ✓ calculates EOSB for termination
  ...

✓ Compliance Checker Tests (20 tests)
  ✓ checks saudization compliance
  ✓ validates wage protection
  ...

Test Suites: 21 passed
Tests: 237 passed
```

---

## 📋 Routes

```typescript
// المسارات المتاحة
const routes = [
  { path: '/ai', component: AIDashboard },
  { path: '/regulations', component: SaudiRegulations },
  { path: '/calculators', component: CalculatorsPage },
];
```

---

## 🔐 الأمان

### حماية البيانات

- جميع البيانات مشفرة أثناء النقل (HTTPS)
- لا يتم تخزين بيانات الموظفين الحساسة على الخادم
- السجلات المحلية مخزنة في localStorage فقط
- دعم كامل لـ GDPR وقوانين الخصوصية

### Validation

```typescript
// جميع المدخلات تُفحص باستخدام Zod
const GOSIInputSchema = z.object({
  basicSalary: z.number().positive().max(50000),
  housingAllowance: z.number().nonnegative(),
  isNonSaudi: z.boolean(),
  employerContributionRate: z.number().min(0).max(1),
  employeeContributionRate: z.number().min(0).max(1)
});
```

---

## 🚀 التثبيت والتشغيل

```bash
# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev

# البناء للإنتاج
npm run build

# تشغيل الاختبارات
npm test
```

---

## 📞 الدعم

للمساعدة أو الاستفسارات:
- 📧 Email: support@rabt.hr
- 📚 Documentation: /docs
- 🐛 Issues: GitHub Issues

---

## 📜 الترخيص

حقوق النشر © 2024 RabtHR. جميع الحقوق محفوظة.

---

*آخر تحديث: يناير 2025*
