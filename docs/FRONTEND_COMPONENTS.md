# 🎨 توثيق مكونات الواجهة الأمامية - Frontend Components Documentation

> دليل شامل للمكونات الجديدة في نظام RabtHR

---

## 📑 فهرس المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [هيكل الملفات](#هيكل-الملفات)
3. [الصفحات الجديدة (Dashboard)](#الصفحات-الجديدة-dashboard)
4. [الصفحات الرئيسية](#الصفحات-الرئيسية)
5. [مكونات AI](#مكونات-ai)
6. [مكونات الموارد البشرية](#مكونات-الموارد-البشرية)
7. [مكونات التواصل](#مكونات-التواصل)
8. [مكونات البحث والتنقل](#مكونات-البحث-والتنقل)
9. [مكونات المظهر](#مكونات-المظهر)
10. [مكونات التقارير](#مكونات-التقارير)
11. [الآلات الحاسبة](#الآلات-الحاسبة)
12. [مكونات المخططات](#مكونات-المخططات)
13. [Hooks](#hooks)
14. [أدوات مساعدة](#أدوات-مساعدة)
15. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## 🔍 نظرة عامة

### التقنيات المستخدمة

| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| React | 18+ | مكتبة UI |
| TypeScript | 5.0+ | Type Safety |
| Wouter | 3+ | Routing |
| React Query | 5+ | Data Fetching |
| tRPC | 11+ | API Client |
| Recharts | 3.4+ | Charts |
| react-i18next | - | Internationalization |
| Tailwind CSS | 3+ | Styling |
| shadcn/ui | - | UI Components |

### الميزات

- ✅ دعم ثنائي اللغة (العربية/الإنجليزية)
- ✅ RTL Support كامل
- ✅ Type-safe مع TypeScript
- ✅ متجاوب لجميع الشاشات
- ✅ Dark Mode جاهز
- ✅ Accessible (WCAG 2.1)

---

## 📁 هيكل الملفات

```
client/src/
├── components/
│   ├── ai/
│   │   ├── AIAssistant.tsx          # مساعد AI عائم
│   │   ├── AIStatsDashboard.tsx     # لوحة الإحصائيات
│   │   └── CalculationHistory.tsx   # سجل الحسابات
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx   # لوحة التحليلات
│   ├── calculators/
│   │   └── (calculator components)
│   ├── hr/
│   │   ├── HRKPIsDashboard.tsx      # مؤشرات الأداء
│   │   ├── InterviewScheduler.tsx   # جدولة المقابلات
│   │   ├── PerformanceEvaluation.tsx # تقييم الأداء
│   │   ├── TrainingManagement.tsx   # إدارة التدريب
│   │   └── index.ts                 # تصدير المكونات
│   ├── messaging/
│   │   └── InternalMessaging.tsx    # الرسائل الداخلية
│   ├── reports/
│   │   └── ReportExport.tsx         # تصدير التقارير
│   ├── theme/
│   │   └── EnhancedThemeToggle.tsx  # تبديل المظهر المحسّن
│   ├── AdvancedNotificationCenter.tsx # مركز الإشعارات
│   ├── GlobalSearch.tsx             # البحث الشامل
│   └── ui/
│       └── charts.tsx               # مكونات الرسوم البيانية
├── hooks/
│   ├── useAI.ts                     # AI Hooks
│   ├── useEmailNotifications.ts     # إشعارات البريد
│   ├── useKeyboardShortcuts.tsx     # اختصارات لوحة المفاتيح
│   └── usePushNotifications.ts      # إشعارات الدفع
├── lib/
│   ├── calculationHistory.ts        # إدارة سجل الحسابات
│   ├── pdfExport.ts                 # تصدير PDF
│   └── pwa.ts                       # أدوات PWA
├── pages/
│   ├── AIDashboard.tsx              # صفحة AI الرئيسية
│   ├── SaudiRegulations.tsx         # صفحة الأنظمة
│   ├── FinancialCalculators.tsx     # صفحة الآلات الحاسبة
│   └── dashboard/
│       ├── AnalyticsPage.tsx        # صفحة التحليلات
│       ├── InterviewsPage.tsx       # صفحة المقابلات
│       ├── MessagingPage.tsx        # صفحة الرسائل
│       ├── PerformancePage.tsx      # صفحة تقييم الأداء
│       ├── ReportsPage.tsx          # صفحة التقارير
│       └── TrainingPage.tsx         # صفحة التدريب
└── locales/
    └── i18n-ai-tools.ts             # ترجمات AI
```

---

## 📄 الصفحات الجديدة (Dashboard)

### AnalyticsPage - صفحة التحليلات

**المسار:** `/dashboard/analytics`  
**الملف:** `client/src/pages/dashboard/AnalyticsPage.tsx`

#### الوصف
صفحة تحليلات شاملة مع مؤشرات الأداء ولوحات بيانية.

#### الاستخدام

```tsx
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
```

#### المكونات المستخدمة
- `AnalyticsDashboard` - لوحة التحليلات
- `HRKPIsDashboard` - مؤشرات الأداء الرئيسية

---

### TrainingPage - صفحة التدريب

**المسار:** `/dashboard/training`  
**الملف:** `client/src/pages/dashboard/TrainingPage.tsx`

#### الوصف
إدارة الدورات التدريبية وتطوير مهارات الموظفين.

#### الميزات
- إضافة دورات تدريبية جديدة
- تتبع تقدم الموظفين
- شهادات الإنجاز
- تقارير التدريب

---

### InterviewsPage - صفحة المقابلات

**المسار:** `/dashboard/interviews`  
**الملف:** `client/src/pages/dashboard/InterviewsPage.tsx`

#### الوصف
جدولة وإدارة مقابلات التوظيف مع المرشحين.

#### الميزات
- جدولة المقابلات
- إرسال دعوات للمرشحين
- تقييم المرشحين
- سجل المقابلات السابقة

---

### PerformancePage - صفحة تقييم الأداء

**المسار:** `/dashboard/performance`  
**الملف:** `client/src/pages/dashboard/PerformancePage.tsx`

#### الوصف
تقييم أداء الموظفين ومتابعة تحقيق الأهداف.

#### الميزات
- تقييم 360 درجة
- متابعة الأهداف
- خطط التطوير
- تقارير الأداء

---

### MessagingPage - صفحة الرسائل

**المسار:** `/dashboard/messaging`  
**الملف:** `client/src/pages/dashboard/MessagingPage.tsx`

#### الوصف
نظام رسائل داخلي للتواصل بين الموظفين.

#### الميزات
- محادثات فردية وجماعية
- مشاركة الملفات
- إشعارات فورية
- أرشيف المحادثات

---

### ReportsPage - صفحة التقارير

**المسار:** `/dashboard/reports-export`  
**الملف:** `client/src/pages/dashboard/ReportsPage.tsx`

#### الوصف
إنشاء وتصدير تقارير مخصصة بصيغ متعددة.

#### الميزات
- إنشاء تقارير مخصصة
- قوالب جاهزة
- تصدير PDF/Excel/CSV
- جدولة التقارير

---

## 📄 الصفحات الرئيسية

### 1. AIDashboard - لوحة الذكاء الاصطناعي

**المسار:** `/ai`  
**الملف:** `client/src/pages/AIDashboard.tsx`

#### الوصف
الصفحة الرئيسية لأدوات الذكاء الاصطناعي، تعرض جميع الأدوات المتاحة مع روابط سريعة.

#### الاستخدام

```tsx
import { AIDashboard } from '@/pages/AIDashboard';

function App() {
  return <AIDashboard />;
}
```

#### Props
لا تتطلب props خارجية.

#### الأقسام المعروضة
- بطاقة توليد المستندات
- بطاقة فحص الامتثال
- بطاقة المحادثة الذكية
- بطاقة صياغة العقود
- بطاقة الآلات الحاسبة
- بطاقة تحليل الموظفين
- بطاقة قاعدة الأنظمة

---

### 2. SaudiRegulations - الأنظمة السعودية

**المسار:** `/regulations`  
**الملف:** `client/src/pages/SaudiRegulations.tsx`

#### الوصف
صفحة عرض والبحث في الأنظمة واللوائح السعودية.

#### الاستخدام

```tsx
import { SaudiRegulations } from '@/pages/SaudiRegulations';

function App() {
  return <SaudiRegulations />;
}
```

#### الميزات
- عرض جميع الأنظمة المتاحة
- بحث نصي
- فلترة حسب الفئة
- عرض تفاصيل كل نظام
- عرض المواد والبنود

---

### 3. FinancialCalculators - الآلات الحاسبة

**المسار:** `/calculators`  
**الملف:** `client/src/pages/FinancialCalculators.tsx`

#### الوصف
صفحة تجمع جميع الآلات الحاسبة المالية.

#### الاستخدام

```tsx
import { CalculatorsPage } from '@/pages/FinancialCalculators';

function App() {
  return <CalculatorsPage />;
}
```

#### المكونات الفرعية

```tsx
// حاسبة التأمينات
import { GOSICalculator } from '@/pages/FinancialCalculators';

// حاسبة نهاية الخدمة
import { EOSBCalculator } from '@/pages/FinancialCalculators';

// حاسبة الإجازات
import { LeaveCalculator } from '@/pages/FinancialCalculators';
```

---

## 🤖 مكونات AI

### AIAssistant - مساعد AI العائم

**الملف:** `client/src/components/ai/AIAssistant.tsx`

#### الوصف
زر عائم يوفر وصولاً سريعاً لمساعد AI في جميع أنحاء التطبيق.

#### الاستخدام

```tsx
import { AIAssistant } from '@/components/ai/AIAssistant';

function App() {
  return (
    <div>
      <MainContent />
      <AIAssistant />
    </div>
  );
}
```

#### الميزات
- محادثة ذكية مع AI
- اقتراحات سريعة
- أوامر صوتية
- سجل المحادثات

---

### AIStatsDashboard - لوحة الإحصائيات

**الملف:** `client/src/components/ai/AIStatsDashboard.tsx`

#### الوصف
لوحة تحكم تعرض إحصائيات ورسوم بيانية لاستخدام أدوات AI.

#### الاستخدام

```tsx
import { AIStatsDashboard } from '@/components/ai/AIStatsDashboard';

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1>لوحة التحكم</h1>
      <AIStatsDashboard />
    </div>
  );
}
```

#### المكونات الداخلية

##### StatCard
بطاقة إحصائية مع أيقونة وقيمة ومؤشر اتجاه.

```tsx
<StatCard 
  title="نسبة السعودة"
  value="32%"
  icon={Users}
  trend={{ direction: "up", value: "5%" }}
  color="blue"
/>
```

##### SaudizationChart
رسم بياني لنسبة السعودة على مدار الوقت (Area Chart).

##### ComplianceChart
رسم بياني لنتائج فحص الامتثال (Bar Chart).

##### UsageChart
رسم بياني لاستخدام الأدوات (Line Chart).

---

### CalculationHistory - سجل الحسابات

**الملف:** `client/src/components/ai/CalculationHistory.tsx`

#### الوصف
مكون لعرض وإدارة سجل الحسابات السابقة.

#### الاستخدام

```tsx
import { CalculationHistory } from '@/components/ai/CalculationHistory';

function HistoryPage() {
  return <CalculationHistory />;
}
```

#### الميزات
- عرض جميع السجلات
- فلترة حسب النوع
- بحث في السجلات
- تصدير البيانات
- حذف السجلات
- عرض تفاصيل كل سجل

#### Props
لا تتطلب props (تقرأ البيانات من localStorage).

---

## 🧮 الآلات الحاسبة

### GOSICalculator - حاسبة التأمينات

#### الوصف
حساب اشتراكات التأمينات الاجتماعية.

#### الاستخدام

```tsx
import { GOSICalculator } from '@/pages/FinancialCalculators';

function App() {
  const handleCalculate = (result) => {
    console.log('نتيجة الحساب:', result);
  };

  return <GOSICalculator onCalculate={handleCalculate} />;
}
```

#### الحقول المطلوبة
| الحقل | النوع | الوصف |
|-------|------|-------|
| basicSalary | number | الراتب الأساسي |
| housingAllowance | number | بدل السكن |
| isNonSaudi | boolean | هل غير سعودي |

---

## 📊 مكونات الموارد البشرية (HR Components)

### HRKPIsDashboard - مؤشرات الأداء

**الملف:** `client/src/components/hr/HRKPIsDashboard.tsx`

#### الوصف
لوحة مؤشرات الأداء الرئيسية للموارد البشرية.

#### الاستخدام

```tsx
import { HRKPIsDashboard } from '@/components/hr';

function Dashboard() {
  return <HRKPIsDashboard />;
}
```

#### المؤشرات المعروضة
- معدل الدوران الوظيفي
- نسبة الحضور
- متوسط أيام التوظيف
- تكلفة التوظيف
- نسبة الرضا الوظيفي
- معدل الأداء العام

---

### InterviewScheduler - جدولة المقابلات

**الملف:** `client/src/components/hr/InterviewScheduler.tsx`

#### الوصف
مكون لجدولة وإدارة مقابلات التوظيف.

#### الاستخدام

```tsx
import { InterviewScheduler } from '@/components/hr';

function InterviewsPage() {
  return <InterviewScheduler />;
}
```

#### الميزات
- عرض تقويم المقابلات
- إضافة مقابلة جديدة
- إرسال دعوات بالبريد
- تقييم المرشحين
- تسجيل الملاحظات

---

### PerformanceEvaluation - تقييم الأداء

**الملف:** `client/src/components/hr/PerformanceEvaluation.tsx`

#### الوصف
نظام شامل لتقييم أداء الموظفين.

#### الاستخدام

```tsx
import { PerformanceEvaluation } from '@/components/hr';

function PerformancePage() {
  return <PerformanceEvaluation />;
}
```

#### أنواع التقييم
- تقييم ذاتي
- تقييم المدير
- تقييم الزملاء (360 درجة)
- تقييم الأهداف

---

### TrainingManagement - إدارة التدريب

**الملف:** `client/src/components/hr/TrainingManagement.tsx`

#### الوصف
إدارة شاملة للدورات التدريبية.

#### الاستخدام

```tsx
import { TrainingManagement } from '@/components/hr';

function TrainingPage() {
  return <TrainingManagement />;
}
```

#### الميزات
- قائمة الدورات المتاحة
- تسجيل الموظفين
- متابعة التقدم
- شهادات الإنجاز
- تقارير التدريب

---

## 💬 مكونات التواصل

### InternalMessaging - الرسائل الداخلية

**الملف:** `client/src/components/messaging/InternalMessaging.tsx`

#### الوصف
نظام رسائل داخلي متكامل.

#### الاستخدام

```tsx
import { InternalMessaging } from '@/components/messaging/InternalMessaging';

function MessagingPage() {
  return <InternalMessaging />;
}
```

#### الميزات
- محادثات فردية
- مجموعات دردشة
- مشاركة الملفات
- إشعارات فورية
- البحث في الرسائل
- أرشيف المحادثات

---

### AdvancedNotificationCenter - مركز الإشعارات

**الملف:** `client/src/components/AdvancedNotificationCenter.tsx`

#### الوصف
مركز إشعارات متقدم مع فلترة وتصنيف.

#### الاستخدام

```tsx
import { AdvancedNotificationCenter } from '@/components/AdvancedNotificationCenter';

function Header() {
  return (
    <header>
      <AdvancedNotificationCenter />
    </header>
  );
}
```

#### أنواع الإشعارات
- إشعارات النظام
- إشعارات المهام
- إشعارات الرسائل
- تنبيهات عاجلة

---

## 🔍 مكونات البحث والتنقل

### GlobalSearch - البحث الشامل

**الملف:** `client/src/components/GlobalSearch.tsx`

#### الوصف
بحث شامل في جميع أقسام التطبيق مع اختصارات لوحة المفاتيح.

#### الاستخدام

```tsx
import { GlobalSearch } from '@/components/GlobalSearch';

function Header() {
  return (
    <header>
      <GlobalSearch />
    </header>
  );
}
```

#### الميزات
- بحث في الموظفين
- بحث في المستندات
- بحث في الأنظمة
- اختصار لوحة المفاتيح (⌘K / Ctrl+K)
- نتائج فورية
- سجل البحث

---

## 🎨 مكونات المظهر

### EnhancedThemeToggle - تبديل المظهر المحسّن

**الملف:** `client/src/components/theme/EnhancedThemeToggle.tsx`

#### الوصف
تبديل المظهر مع دعم ألوان مخصصة.

#### الاستخدام

```tsx
import { EnhancedThemeToggle } from '@/components/theme/EnhancedThemeToggle';

function Header() {
  return (
    <header>
      <EnhancedThemeToggle />
    </header>
  );
}
```

#### المظاهر المتاحة
- الوضع الفاتح
- الوضع الداكن
- متابعة النظام
- ألوان مخصصة

---

## 📈 مكونات التقارير

### ReportExport - تصدير التقارير

**الملف:** `client/src/components/reports/ReportExport.tsx`

#### الوصف
مكون لإنشاء وتصدير تقارير مخصصة.

#### الاستخدام

```tsx
import { ReportExport } from '@/components/reports/ReportExport';

function ReportsPage() {
  return <ReportExport />;
}
```

#### صيغ التصدير المدعومة
- PDF
- Excel (.xlsx)
- CSV
- JSON

#### أنواع التقارير
- تقرير الرواتب
- تقرير الحضور
- تقرير الإجازات
- تقرير الأداء
- تقرير التوظيف

---

### AnalyticsDashboard - لوحة التحليلات

**الملف:** `client/src/components/analytics/AnalyticsDashboard.tsx`

#### الوصف
لوحة تحليلات شاملة مع رسوم بيانية تفاعلية.

#### الاستخدام

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
```

#### الإحصائيات المعروضة
- إجمالي الموظفين
- معدل الدوران
- تكلفة التوظيف
- معدل الرضا
- رسوم بيانية تفاعلية

---

## 🧮 الآلات الحاسبة (تابع)

### EOSBCalculator - حاسبة نهاية الخدمة

#### الوصف
حساب مكافأة نهاية الخدمة حسب نظام العمل السعودي.

#### الاستخدام

```tsx
import { EOSBCalculator } from '@/pages/FinancialCalculators';

function App() {
  return <EOSBCalculator />;
}
```

#### الحقول المطلوبة
| الحقل | النوع | الوصف |
|-------|------|-------|
| basicSalary | number | الراتب الأساسي |
| allowances | number | البدلات |
| yearsOfService | number | سنوات الخدمة |
| terminationReason | string | سبب انتهاء العلاقة |
| contractType | string | نوع العقد |

---

### LeaveCalculator - حاسبة الإجازات

#### الوصف
حساب استحقاقات الإجازات السنوية.

#### الاستخدام

```tsx
import { LeaveCalculator } from '@/pages/FinancialCalculators';

function App() {
  return <LeaveCalculator />;
}
```

---

## 📊 مكونات المخططات

### استخدام Recharts

المشروع يستخدم Recharts مع تغليفات مخصصة في `components/ui/charts.tsx`.

#### المكونات المتاحة

```tsx
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ResponsiveContainer,
  ChartTooltip,
  ChartLegend,
} from '@/components/ui/charts';
```

#### مثال: Area Chart

```tsx
import { AreaChart, ResponsiveContainer } from '@/components/ui/charts';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
  { month: 'يناير', value: 30 },
  { month: 'فبراير', value: 35 },
  { month: 'مارس', value: 32 },
];

function MyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          fill="#3b82f6" 
          fillOpacity={0.3} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

---

## 🪝 Hooks

### useKeyboardShortcuts - اختصارات لوحة المفاتيح

**الملف:** `client/src/hooks/useKeyboardShortcuts.tsx`

#### الوصف
Hook لإدارة اختصارات لوحة المفاتيح مع دعم التنقل والبحث السريع.

#### الاستخدام

```tsx
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts();

  return (
    <div>
      {/* يمكن عرض قائمة الاختصارات */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
```

#### الاختصارات المتاحة
| الاختصار | الوظيفة |
|----------|---------|
| `⌘K` / `Ctrl+K` | فتح البحث الشامل |
| `⌘/` / `Ctrl+/` | فتح المساعدة |
| `g + h` | الذهاب للرئيسية |
| `g + d` | الذهاب للوحة التحكم |
| `g + e` | الذهاب للموظفين |
| `g + s` | الذهاب للإعدادات |

---

### useEmailNotifications - إشعارات البريد

**الملف:** `client/src/hooks/useEmailNotifications.ts`

#### الوصف
Hook لإدارة إشعارات البريد الإلكتروني.

#### الاستخدام

```tsx
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

function MyComponent() {
  const { 
    sendNotification,
    isEnabled,
    setEnabled,
    preferences,
    updatePreferences 
  } = useEmailNotifications();

  const handleSend = async () => {
    await sendNotification({
      type: 'leave_request',
      recipientId: 'user-123',
      data: { leaveType: 'annual', days: 5 }
    });
  };

  return (
    <div>
      <Switch 
        checked={isEnabled} 
        onCheckedChange={setEnabled} 
      />
    </div>
  );
}
```

#### أنواع الإشعارات
- `leave_request` - طلبات الإجازة
- `attendance_alert` - تنبيهات الحضور
- `payroll_ready` - إشعار الراتب
- `document_expiry` - انتهاء المستندات

---

### usePushNotifications - إشعارات الدفع

**الملف:** `client/src/hooks/usePushNotifications.ts`

#### الوصف
Hook لإدارة إشعارات الدفع (Push Notifications).

#### الاستخدام

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';

function MyComponent() {
  const {
    permission,
    isSupported,
    requestPermission,
    sendNotification
  } = usePushNotifications();

  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, []);

  const handleNotify = () => {
    sendNotification({
      title: 'إشعار جديد',
      body: 'لديك طلب إجازة جديد للمراجعة',
      icon: '/logo.png'
    });
  };

  return (
    <div>
      <p>الحالة: {permission}</p>
      <Button onClick={handleNotify}>إرسال إشعار</Button>
    </div>
  );
}
```

#### خصائص الإشعار
| الخاصية | النوع | الوصف |
|---------|------|-------|
| title | string | عنوان الإشعار |
| body | string | نص الإشعار |
| icon | string | أيقونة الإشعار (اختياري) |
| tag | string | معرف فريد للتجميع (اختياري) |
| data | object | بيانات إضافية (اختياري) |

---

### useAI Hooks

**الملف:** `client/src/hooks/useAI.ts`

#### useDocumentGenerator

```tsx
import { useDocumentGenerator } from '@/hooks/useAI';

function MyComponent() {
  const { 
    templates,          // قائمة القوالب
    isLoadingTemplates, // حالة التحميل
    generateDocument,   // دالة التوليد
    isGenerating,       // جاري التوليد
  } = useDocumentGenerator();

  const handleGenerate = async () => {
    const result = await generateDocument({
      templateCode: 'employment-letter',
      inputData: { employeeName: 'أحمد' },
    });
  };
}
```

#### useComplianceChecker

```tsx
import { useComplianceChecker } from '@/hooks/useAI';

function MyComponent() {
  const {
    checkCompliance,      // فحص الامتثال
    isChecking,           // جاري الفحص
    checkSaudization,     // فحص السعودة
    checkWageProtection,  // فحص حماية الأجور
  } = useComplianceChecker();
}
```

#### useAIChat

```tsx
import { useAIChat } from '@/hooks/useAI';

function MyComponent() {
  const {
    messages,        // الرسائل
    sendMessage,     // إرسال رسالة
    isLoading,       // جاري الإرسال
    clearChat,       // مسح المحادثة
  } = useAIChat();
}
```

#### useFinancialCalculator

```tsx
import { useFinancialCalculator } from '@/hooks/useAI';

function MyComponent() {
  const {
    calculateGOSI,   // حساب التأمينات
    calculateEOSB,   // حساب نهاية الخدمة
    calculateLeave,  // حساب الإجازات
    isCalculating,   // جاري الحساب
  } = useFinancialCalculator();
}
```

#### useRegulations

```tsx
import { useRegulations } from '@/hooks/useAI';

function MyComponent() {
  const {
    regulations,         // جميع الأنظمة
    isLoading,          // جاري التحميل
    searchRegulations,  // البحث
    getRegulation,      // نظام محدد
    getArticle,         // مادة محددة
  } = useRegulations();
}
```

---

## 🛠️ أدوات مساعدة

### pwa.ts - أدوات PWA

**الملف:** `client/src/lib/pwa.ts`

#### الوصف
أدوات لتحويل التطبيق إلى Progressive Web App.

#### الدوال المتاحة

```tsx
import {
  registerServiceWorker,
  isPWAInstallable,
  promptPWAInstall,
  checkForUpdates,
  isStandalone,
  getInstallPrompt,
  subscribeToPush
} from '@/lib/pwa';
```

#### الاستخدام

```tsx
// تسجيل Service Worker
registerServiceWorker();

// التحقق من إمكانية التثبيت
if (isPWAInstallable()) {
  // عرض زر التثبيت
}

// طلب التثبيت
const installed = await promptPWAInstall();

// التحقق من التحديثات
const hasUpdate = await checkForUpdates();

// التحقق من الوضع المستقل
if (isStandalone()) {
  console.log('التطبيق يعمل كـ PWA');
}
```

---

### calculationHistory.ts - إدارة سجل الحسابات

**الملف:** `client/src/lib/calculationHistory.ts`

#### الدوال المتاحة

```tsx
import {
  // حفظ السجلات
  saveGOSIRecord,
  saveEOSBRecord,
  saveLeaveRecord,
  saveSaudizationRecord,
  saveComplianceRecord,
  
  // استرجاع السجلات
  getAllRecords,
  getRecordsByType,
  getRecordById,
  getRecentRecords,
  getRecordsByDateRange,
  searchRecords,
  
  // حذف السجلات
  deleteRecord,
  deleteRecordsByType,
  clearAllRecords,
  
  // تصدير/استيراد
  exportRecordsAsJSON,
  importRecordsFromJSON,
  
  // إحصائيات
  getHistoryStats,
  
  // تنسيق
  formatRecordDate,
  getCalculationTypeName,
} from '@/lib/calculationHistory';
```

#### أمثلة

```tsx
// حفظ سجل GOSI
const record = saveGOSIRecord(
  { basicSalary: 10000, housingAllowance: 2500, isNonSaudi: false },
  { employeeContribution: 1218, employerContribution: 1468, totalContribution: 2686 },
  { employeeName: 'أحمد', employeeId: 'EMP001' }
);

// استرجاع جميع سجلات GOSI
const gosiRecords = getRecordsByType('gosi');

// البحث
const results = searchRecords('أحمد');

// تصدير
const json = exportRecordsAsJSON();
```

---

### pdfExport.ts - تصدير PDF

**الملف:** `client/src/lib/pdfExport.ts`

#### الدوال المتاحة

```tsx
import {
  generateGOSIPDF,
  generateEOSBPDF,
  generateCompliancePDF,
  downloadPDF,
  formatCurrency,
  formatDate,
} from '@/lib/pdfExport';
```

#### أمثلة

```tsx
// توليد PDF لحساب GOSI
const pdfContent = generateGOSIPDF({
  employeeName: 'أحمد محمد',
  basicSalary: 10000,
  housingAllowance: 2500,
  employeeContribution: 1218.75,
  employerContribution: 1468.75,
  totalContribution: 2687.50,
  calculationDate: new Date(),
}, 'ar');

// تنزيل الملف
downloadPDF(pdfContent, 'gosi-calculation.pdf');
```

---

## 🌐 الترجمات - i18n

### ملف الترجمات

**الملف:** `client/src/locales/i18n-ai-tools.ts`

#### البنية

```tsx
export const aiToolsTranslations = {
  ar: {
    aiTools: {
      title: 'أدوات الذكاء الاصطناعي',
      subtitle: 'أدوات ذكية لإدارة الموارد البشرية',
      // ...
    },
    calculators: {
      gosi: {
        title: 'حاسبة التأمينات الاجتماعية',
        // ...
      },
      eosb: {
        title: 'حاسبة نهاية الخدمة',
        // ...
      },
    },
    regulations: {
      title: 'الأنظمة السعودية',
      // ...
    },
  },
  en: {
    aiTools: {
      title: 'AI Tools',
      subtitle: 'Smart tools for HR management',
      // ...
    },
    // ...
  },
};
```

#### الاستخدام

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div>
      <h1>{t('aiTools.title')}</h1>
      <p>{isArabic ? 'مرحباً' : 'Hello'}</p>
    </div>
  );
}
```

---

## 🎯 أمثلة الاستخدام الكاملة

### مثال 1: صفحة حاسبة مخصصة

```tsx
import { useState } from 'react';
import { useFinancialCalculator } from '@/hooks/useAI';
import { saveGOSIRecord } from '@/lib/calculationHistory';
import { generateGOSIPDF, downloadPDF } from '@/lib/pdfExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CustomGOSIPage() {
  const { calculateGOSI, isCalculating } = useFinancialCalculator();
  const [salary, setSalary] = useState(10000);
  const [result, setResult] = useState(null);

  const handleCalculate = async () => {
    const data = await calculateGOSI({
      basicSalary: salary,
      housingAllowance: salary * 0.25,
      isNonSaudi: false,
    });
    
    setResult(data);
    
    // حفظ في السجل
    saveGOSIRecord(
      { basicSalary: salary, housingAllowance: salary * 0.25, isNonSaudi: false },
      data
    );
  };

  const handleExport = () => {
    if (!result) return;
    
    const pdf = generateGOSIPDF({
      employeeName: 'الموظف',
      basicSalary: salary,
      housingAllowance: salary * 0.25,
      ...result,
      calculationDate: new Date(),
    }, 'ar');
    
    downloadPDF(pdf, 'gosi.pdf');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>حاسبة التأمينات</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          placeholder="الراتب الأساسي"
        />
        <Button onClick={handleCalculate} disabled={isCalculating}>
          {isCalculating ? 'جاري الحساب...' : 'احسب'}
        </Button>
        
        {result && (
          <div>
            <p>اشتراك الموظف: {result.employeeContribution}</p>
            <p>اشتراك صاحب العمل: {result.employerContribution}</p>
            <Button onClick={handleExport}>تصدير PDF</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### مثال 2: عرض الأنظمة مع البحث

```tsx
import { useState } from 'react';
import { useRegulations } from '@/hooks/useAI';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export function RegulationsSearch() {
  const { regulations, isLoading, searchRegulations } = useRegulations();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const searchResults = await searchRegulations(query);
    setResults(searchResults);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الأنظمة..."
        />
        <Button onClick={handleSearch}>بحث</Button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.articleNumber}>
            <CardContent>
              <h3>{result.articleTitle}</h3>
              <p>{result.excerpt}</p>
              <span>النظام: {result.regulationName}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔧 التخصيص

### تغيير الألوان

```tsx
// في tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          // ...
        },
      },
    },
  },
};
```

### إضافة ترجمات جديدة

```tsx
// في i18n-ai-tools.ts
export const aiToolsTranslations = {
  ar: {
    myNewFeature: {
      title: 'ميزة جديدة',
      description: 'وصف الميزة',
    },
  },
  en: {
    myNewFeature: {
      title: 'New Feature',
      description: 'Feature description',
    },
  },
};
```

---

## 📞 الدعم

للمساعدة أو الأسئلة:
- 📧 Email: dev@rabt.hr
- 📚 Docs: /docs
- 🐛 Issues: GitHub

---

*آخر تحديث: يناير 2025*
