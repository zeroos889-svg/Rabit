# 🚀 دليل استخدام المكونات المحسّنة

## نظرة عامة

تم تطوير مجموعة شاملة من مكونات UI الحديثة والمتحركة لتحسين تجربة المستخدم في تطبيق ربط للموارد البشرية.

---

## 🆕 المكونات الجديدة (v2.0)

### 1. البحث الشامل (Global Search)

```tsx
import { GlobalSearch } from "@/components/GlobalSearch";

function Header() {
  return (
    <header>
      <GlobalSearch />
    </header>
  );
}
```

**اختصارات لوحة المفاتيح:**
- `⌘K` / `Ctrl+K`: فتح البحث
- `ESC`: إغلاق البحث

---

### 2. مساعد AI العائم

```tsx
import { AIAssistant } from "@/components/ai/AIAssistant";

function App() {
  return (
    <div>
      <MainContent />
      <AIAssistant /> {/* يظهر في زاوية الشاشة */}
    </div>
  );
}
```

---

### 3. مركز الإشعارات المتقدم

```tsx
import { AdvancedNotificationCenter } from "@/components/AdvancedNotificationCenter";

function Header() {
  return (
    <header>
      <AdvancedNotificationCenter />
    </header>
  );
}
```

**الميزات:**
- تصنيف الإشعارات
- تحديد كمقروء
- فلترة حسب النوع

---

### 4. تبديل المظهر المحسّن

```tsx
import { EnhancedThemeToggle } from "@/components/theme/EnhancedThemeToggle";

function Header() {
  return <EnhancedThemeToggle />;
}
```

**المظاهر المتاحة:**
- فاتح / داكن / نظام
- ألوان مخصصة

---

### 5. مكونات الموارد البشرية

#### جدولة المقابلات

```tsx
import { InterviewScheduler } from "@/components/hr";

function InterviewsPage() {
  return <InterviewScheduler />;
}
```

#### تقييم الأداء

```tsx
import { PerformanceEvaluation } from "@/components/hr";

function PerformancePage() {
  return <PerformanceEvaluation />;
}
```

#### إدارة التدريب

```tsx
import { TrainingManagement } from "@/components/hr";

function TrainingPage() {
  return <TrainingManagement />;
}
```

#### مؤشرات الأداء

```tsx
import { HRKPIsDashboard } from "@/components/hr";

function KPIsPage() {
  return <HRKPIsDashboard />;
}
```

---

### 6. نظام الرسائل الداخلية

```tsx
import { InternalMessaging } from "@/components/messaging/InternalMessaging";

function MessagingPage() {
  return <InternalMessaging />;
}
```

---

### 7. تصدير التقارير

```tsx
import { ReportExport } from "@/components/reports/ReportExport";

function ReportsPage() {
  return <ReportExport />;
}
```

**صيغ التصدير:**
- PDF
- Excel (.xlsx)
- CSV
- JSON

---

### 8. لوحة التحليلات

```tsx
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
```

---

## 🪝 Hooks الجديدة

### اختصارات لوحة المفاتيح

```tsx
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

function MyComponent() {
  useKeyboardShortcuts();
  // الآن الاختصارات تعمل في التطبيق
}
```

### إشعارات البريد

```tsx
import { useEmailNotifications } from "@/hooks/useEmailNotifications";

function MyComponent() {
  const { sendNotification, isEnabled } = useEmailNotifications();
  
  await sendNotification({
    type: 'leave_request',
    recipientId: 'user-123',
    data: { leaveType: 'annual', days: 5 }
  });
}
```

### إشعارات الدفع

```tsx
import { usePushNotifications } from "@/hooks/usePushNotifications";

function MyComponent() {
  const { permission, requestPermission, sendNotification } = usePushNotifications();
  
  sendNotification({
    title: 'إشعار جديد',
    body: 'لديك رسالة جديدة'
  });
}
```

---

## 📦 المكونات الأصلية

### 1. مكونات الرسوم المتحركة

#### `AnimatedCard`
بطاقة مع حركات دخول وتحويم سلسة

```tsx
import { AnimatedCard } from "@/components/ui/animated-card";

<AnimatedCard delay={0.2} hover={true} className="p-6">
  <h3>محتوى البطاقة</h3>
  <p>نص توضيحي</p>
</AnimatedCard>
```

**الخصائص:**
- `delay`: تأخير الرسوم المتحركة (ثوانٍ)
- `hover`: تفعيل تأثير التحويم
- `className`: فئات CSS إضافية

#### `AnimatedSection`
قسم يظهر عند التمرير

```tsx
import { AnimatedSection } from "@/components/ui/animated-card";

<AnimatedSection>
  <h2>عنوان القسم</h2>
  <p>محتوى القسم</p>
</AnimatedSection>
```

#### `FadeIn`
حركة ظهور تدريجي من اتجاهات مختلفة

```tsx
import { FadeIn } from "@/components/ui/animated-card";

<FadeIn direction="up" delay={0.3}>
  <div>محتوى يظهر من الأسفل</div>
</FadeIn>
```

**الاتجاهات المتاحة:**
- `up`: من الأسفل
- `down`: من الأعلى
- `left`: من اليسار
- `right`: من اليمين

#### `StaggerContainer` & `StaggerItem`
حركات متتالية للعناصر المتعددة

```tsx
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-card";

<StaggerContainer className="grid grid-cols-3 gap-4">
  <StaggerItem>
    <Card>عنصر 1</Card>
  </StaggerItem>
  <StaggerItem>
    <Card>عنصر 2</Card>
  </StaggerItem>
  <StaggerItem>
    <Card>عنصر 3</Card>
  </StaggerItem>
</StaggerContainer>
```

#### `ScaleIn`
حركة تكبير عند الظهور

```tsx
import { ScaleIn } from "@/components/ui/animated-card";

<ScaleIn delay={0.5}>
  <button>زر متحرك</button>
</ScaleIn>
```

---

### 2. مكونات التحميل

#### `LoadingSpinner`
مؤشر تحميل دوّار بأحجام مختلفة

```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

<LoadingSpinner size="lg" text="جاري التحميل..." />
```

**الأحجام المتاحة:**
- `sm`: صغير (16px)
- `md`: متوسط (32px) - افتراضي
- `lg`: كبير (48px)
- `xl`: كبير جداً (64px)

#### `PageLoading`
شاشة تحميل كاملة للصفحات

```tsx
import { PageLoading } from "@/components/ui/loading-spinner";

if (isLoading) {
  return <PageLoading message="جاري تحميل البيانات..." />;
}
```

#### `SkeletonCard`
بطاقة هيكلية للتحميل

```tsx
import { SkeletonCard } from "@/components/ui/loading-spinner";

<div className="grid grid-cols-3 gap-4">
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</div>
```

#### `SkeletonTable`
جدول هيكلي للتحميل

```tsx
import { SkeletonTable } from "@/components/ui/loading-spinner";

<SkeletonTable />
```

---

### 3. بطاقات الإحصائيات

#### `StatCard`
بطاقة إحصائيات احترافية مع رسوم متحركة

```tsx
import { StatCard } from "@/components/ui/stat-card";
import { Users } from "lucide-react";

<StatCard
  title="إجمالي المستخدمين"
  value={5000}
  icon={Users}
  trend={{ value: 12.5, isPositive: true }}
  description="مستخدم نشط"
  gradient="from-blue-500 to-purple-600"
  delay={0.1}
/>
```

**الخصائص:**
- `title`: عنوان البطاقة
- `value`: القيمة الرئيسية
- `icon`: أيقونة من lucide-react
- `trend`: اتجاه التغيير (اختياري)
  - `value`: نسبة التغيير
  - `isPositive`: هل التغيير إيجابي
- `description`: وصف إضافي
- `gradient`: تدرج لوني للخلفية
- `delay`: تأخير الرسوم المتحركة

#### `MiniStatCard`
بطاقة إحصائيات مصغرة

```tsx
import { MiniStatCard } from "@/components/ui/stat-card";
import { Calendar } from "lucide-react";

<MiniStatCard
  label="الإجازات المتبقية"
  value="15"
  icon={Calendar}
  color="bg-blue-500"
/>
```

---

### 4. حالات الفراغ والأخطاء

#### `EmptyState`
حالة عامة للمحتوى الفارغ

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

<EmptyState
  icon={FileText}
  title="لا توجد مستندات"
  description="لم تقم برفع أي مستندات بعد"
  action={
    <Button>رفع مستند</Button>
  }
/>
```

#### `ErrorState`
حالة الخطأ

```tsx
import { ErrorState } from "@/components/ui/empty-state";

<ErrorState
  title="حدث خطأ"
  description="تعذر تحميل البيانات، يرجى المحاولة مرة أخرى"
  action={
    <Button onClick={retry}>إعادة المحاولة</Button>
  }
/>
```

#### `SuccessState`
حالة النجاح

```tsx
import { SuccessState } from "@/components/ui/empty-state";

<SuccessState
  title="تم بنجاح!"
  description="تم حفظ التغييرات بنجاح"
  action={
    <Button asChild>
      <Link href="/dashboard">العودة للوحة التحكم</Link>
    </Button>
  }
/>
```

#### `WarningState`
حالة التحذير

```tsx
import { WarningState } from "@/components/ui/empty-state";

<WarningState
  title="انتبه!"
  description="لديك مهام معلقة تحتاج إلى إنجازها"
  action={
    <Button>عرض المهام</Button>
  }
/>
```

---

## 🎨 أمثلة التطبيق

### مثال: صفحة Dashboard

```tsx
import { useState } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animated-card";
import { StatCard } from "@/components/ui/stat-card";
import { PageLoading } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Briefcase, Target, Award } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery();

  if (isLoading) {
    return <PageLoading message="جاري تحميل لوحة التحكم..." />;
  }

  if (error) {
    return <ErrorState action={<Button onClick={refetch}>إعادة المحاولة</Button>} />;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="لا توجد بيانات"
        description="ابدأ بإضافة بياناتك الأولى"
        action={<Button>إضافة</Button>}
      />
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <FadeIn>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaggerItem>
          <StatCard
            title="إجمالي الموظفين"
            value={156}
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
            gradient="from-blue-500 to-cyan-600"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="الوظائف النشطة"
            value={12}
            icon={Briefcase}
            gradient="from-purple-500 to-pink-600"
            delay={0.1}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="معدل الإنجاز"
            value="87.5%"
            icon={Target}
            trend={{ value: 5.2, isPositive: true }}
            gradient="from-green-500 to-emerald-600"
            delay={0.2}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="التقييم العام"
            value="4.8/5"
            icon={Award}
            gradient="from-orange-500 to-red-600"
            delay={0.3}
          />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
```

### مثال: صفحة قائمة

```tsx
import { AnimatedSection } from "@/components/ui/animated-card";
import { SkeletonCard, SkeletonTable } from "@/components/ui/loading-spinner";

export default function ItemsList() {
  const { data, isLoading } = useQuery();

  return (
    <AnimatedSection>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">القائمة</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {data.map((item) => (
              <AnimatedCard key={item.id} hover>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
```

---

## 🎭 نصائح وأفضل الممارسات

### 1. استخدام الرسوم المتحركة بحكمة
- لا تفرط في استخدام الرسوم المتحركة
- استخدم `delay` لإنشاء تأثيرات متسلسلة جذابة
- حافظ على مدة الرسوم المتحركة قصيرة (0.3-0.6 ثانية)

### 2. Loading States
- استخدم `PageLoading` للصفحات الكاملة
- استخدم `SkeletonCard` للمحتوى الصغير
- استخدم `LoadingSpinner` للأزرار والعناصر الصغيرة

### 3. Error Handling
- دائماً وفر زر "إعادة المحاولة"
- استخدم رسائل خطأ واضحة ومفيدة
- فكر في حالة الفراغ (Empty State)

### 4. الأداء
- استخدم `StaggerContainer` للقوائم الطويلة بحذر
- فكر في lazy loading للمحتوى الكبير
- استخدم `AnimatedSection` فقط للأقسام المرئية

---

## 🌈 التدرجات اللونية المتاحة

```tsx
// أزرق - سماوي
gradient="from-blue-500 to-cyan-600"

// بنفسجي - زهري
gradient="from-purple-500 to-pink-600"

// أخضر - زمردي
gradient="from-green-500 to-emerald-600"

// برتقالي - أحمر
gradient="from-orange-500 to-red-600"

// نيلي - بنفسجي
gradient="from-indigo-500 to-purple-600"

// تيل - أخضر
gradient="from-teal-500 to-green-600"
```

---

## 📱 التجاوبية

جميع المكونات مصممة لتكون responsive بشكل كامل:

```tsx
// مثال على التجاوبية
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* المحتوى */}
</div>

// على الموبايل: عمود واحد
// على التابلت: عمودان
// على الديسكتوب: 4 أعمدة
```

---

## 🔧 التخصيص

### تخصيص الألوان

```tsx
// في tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        600: '#your-darker-color',
      }
    }
  }
}
```

### تخصيص الرسوم المتحركة

```tsx
// تخصيص مدة الرسوم المتحركة
<AnimatedCard
  className="transition-all duration-500" // بدلاً من 300ms
>
  {/* المحتوى */}
</AnimatedCard>
```

---

## 📚 الموارد الإضافية

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🐛 استكشاف الأخطاء

### المشكلة: الرسوم المتحركة لا تعمل
**الحل:** تأكد من تثبيت `framer-motion`:
```bash
npm install framer-motion
```

### المشكلة: الأيقونات لا تظهر
**الحل:** تأكد من استيراد الأيقونة الصحيحة:
```tsx
import { Users } from "lucide-react";
```

### المشكلة: التدرجات اللونية لا تظهر
**الحل:** تأكد من وجود الفئات في tailwind.config.ts

---

تم إنشاء هذا الدليل لمساعدتك في استخدام المكونات المحسّنة بشكل فعال. لأي استفسارات أو مشاكل، يرجى الرجوع إلى الكود المصدري أو فتح issue في المشروع.
