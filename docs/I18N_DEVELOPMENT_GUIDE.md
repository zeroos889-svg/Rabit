# دليل التطوير المتقدم لنظام الترجمة
# Advanced Translation System Development Guide

## 📚 المحتويات / Table of Contents

1. [المكونات الجديدة / New Components](#new-components)
2. [الأدوات المساعدة / Utilities](#utilities)
3. [أمثلة الاستخدام / Usage Examples](#usage-examples)
4. [أفضل الممارسات / Best Practices](#best-practices)
5. [الصيانة والتحديث / Maintenance](#maintenance)

---

## 🆕 المكونات الجديدة / New Components

### 1. useI18n Hook

هوك مخصص متقدم يوفر وظائف إضافية للترجمة.

```typescript
import { useI18n } from "@/hooks/useI18n";

function MyComponent() {
  const { 
    t,                    // دالة الترجمة
    lang,                 // اللغة الحالية
    isRTL,               // هل الاتجاه من اليمين لليسار
    isArabic,            // هل اللغة عربية
    isEnglish,           // هل اللغة إنجليزية
    changeLanguage,      // تغيير اللغة
    dir,                 // الاتجاه (rtl/ltr)
    formatNumber,        // تنسيق الأرقام
    formatCurrency,      // تنسيق العملة
    formatDate,          // تنسيق التاريخ
    formatRelativeTime,  // تنسيق الوقت النسبي
  } = useI18n();

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{formatNumber(1234567)}</p>
      <p>{formatCurrency(999)}</p>
      <p>{formatDate(new Date())}</p>
      <p>{formatRelativeTime(new Date())}</p>
    </div>
  );
}
```

#### الميزات / Features:

- ✅ تنسيق الأرقام حسب اللغة
- ✅ تنسيق العملة (ريال سعودي)
- ✅ تنسيق التاريخ (قصير/متوسط/طويل)
- ✅ تنسيق الوقت النسبي ("منذ ساعة")
- ✅ كشف الاتجاه التلقائي

---

### 2. TransText Component

مكون ترجمة متقدم مع دعم HTML والمتغيرات.

```typescript
import { TransText, TransHeading1, TransParagraph } from "@/components/TransText";

function MyPage() {
  return (
    <div>
      {/* Basic usage */}
      <TransText tKey="page.title" />

      {/* With default fallback */}
      <TransText 
        tKey="page.subtitle" 
        defaultText="Default subtitle"
      />

      {/* With variables */}
      <TransText 
        tKey="welcome.message" 
        values={{ name: "أحمد", count: 5 }}
      />

      {/* As heading */}
      <TransHeading1 
        tKey="page.mainTitle"
        className="text-3xl font-bold"
      />

      {/* As paragraph */}
      <TransParagraph 
        tKey="page.description"
        className="text-gray-600"
      />

      {/* With HTML content */}
      <TransText 
        tKey="page.htmlContent"
        html={true}
      />
    </div>
  );
}
```

#### المكونات المساعدة / Helper Components:

- `TransParagraph` - للفقرات
- `TransHeading1`, `TransHeading2`, `TransHeading3` - للعناوين
- `TransButton` - لنص الأزرار

---

### 3. أداة التحقق من الترجمات / Translation Validator

أداة سطر أوامر للتحقق من صحة الترجمات.

```bash
# تشغيل الأداة
node scripts/validate-translations.cjs
```

#### ما تفحصه / What it checks:

✅ المفاتيح المفقودة في أي من اللغتين  
✅ المفاتيح المكررة  
✅ المفاتيح غير المستخدمة  
✅ توازن عدد المفاتيح

#### مثال على المخرجات / Example Output:

```
╔══════════════════════════════════════════════════╗
║  Translation Validator - أداة التحقق من الترجمات ║
╚══════════════════════════════════════════════════╝

📊 Statistics / الإحصائيات
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arabic keys: 232
English keys: 232

✅ All translations are valid!
✅ جميع الترجمات صحيحة!
```

---

## 🛠 الأدوات المساعدة / Utilities

### تنسيق الأرقام / Number Formatting

```typescript
const { formatNumber } = useI18n();

formatNumber(1234567.89);
// العربية: ١٬٢٣٤٬٥٦٧٫٨٩
// English: 1,234,567.89
```

### تنسيق العملة / Currency Formatting

```typescript
const { formatCurrency } = useI18n();

formatCurrency(999);
// العربية: ٩٩٩٫٠٠ ر.س.
// English: SAR 999.00

formatCurrency(1500, "USD");
// USD 1,500.00
```

### تنسيق التاريخ / Date Formatting

```typescript
const { formatDate } = useI18n();

formatDate(new Date(), "short");
// 26/11/2025

formatDate(new Date(), "medium");
// ٢٦ نوفمبر ٢٠٢٥

formatDate(new Date(), "long");
// الثلاثاء، ٢٦ نوفمبر ٢٠٢٥
```

### تنسيق الوقت النسبي / Relative Time Formatting

```typescript
const { formatRelativeTime } = useI18n();

formatRelativeTime(new Date(Date.now() - 60000));
// منذ دقيقة / 1 minute ago

formatRelativeTime(new Date(Date.now() - 3600000));
// منذ ساعة / 1 hour ago
```

---

## 📖 أمثلة الاستخدام / Usage Examples

### مثال 1: صفحة بسيطة / Simple Page

```typescript
import { useI18n } from "@/hooks/useI18n";
import { TransHeading1, TransParagraph } from "@/components/TransText";

export function AboutPage() {
  const { t, formatDate } = useI18n();

  return (
    <div>
      <TransHeading1 
        tKey="about.title"
        defaultText="About Us"
        className="text-4xl font-bold mb-4"
      />
      
      <TransParagraph 
        tKey="about.description"
        defaultText="We are a leading HR platform"
      />

      <p>
        {t("about.established")}: {formatDate(new Date("2020-01-01"))}
      </p>
    </div>
  );
}
```

### مثال 2: قائمة ديناميكية / Dynamic List

```typescript
import { useI18n } from "@/hooks/useI18n";

export function PricingTable() {
  const { t, formatCurrency } = useI18n();

  const plans = [
    { id: "employee", price: 0 },
    { id: "freelancer", price: 299 },
    { id: "company", price: 999 },
  ];

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h3>{t(`pricing.plan.${plan.id}.name`)}</h3>
          <p>{formatCurrency(plan.price)}</p>
          <p>{t(`pricing.plan.${plan.id}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
```

### مثال 3: نموذج مع رسائل خطأ / Form with Error Messages

```typescript
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

export function ContactForm() {
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = t("form.error.required", "This field is required");
    }

    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        placeholder={t("form.email.placeholder", "Enter your email")}
      />
      {errors.email && (
        <span className="error">{errors.email}</span>
      )}
      
      <button type="submit">
        {t("form.submit", "Submit")}
      </button>
    </form>
  );
}
```

---

## ✅ أفضل الممارسات / Best Practices

### 1. استخدام المفاتيح بشكل منظم / Use Organized Keys

```typescript
// ✅ Good - منظم
"nav.home"
"nav.about"
"nav.contact"

// ❌ Bad - غير منظم
"home"
"aboutLink"
"contactUsButton"
```

### 2. توفير قيمة افتراضية / Provide Fallback

```typescript
// ✅ Good - مع قيمة افتراضية
const title = t("page.title", "Default Title");

// ❌ Bad - بدون قيمة افتراضية
const title = t("page.title");
```

### 3. استخدام المتغيرات / Use Variables

```typescript
// ✅ Good - استخدام المتغيرات
t("welcome.message", "Welcome {{name}}", { name: userName });

// ❌ Bad - دمج مباشر
t("welcome.message") + " " + userName;
```

### 4. فصل النصوص الطويلة / Separate Long Texts

```typescript
// ✅ Good - نصوص قصيرة
"page.title": "الصفحة الرئيسية"
"page.description": "وصف الصفحة"

// ❌ Bad - نص طويل واحد
"page.content": "الصفحة الرئيسية - وصف طويل جداً..."
```

### 5. استخدام TransText للمكونات / Use TransText for Components

```typescript
// ✅ Good - مكون مخصص
<TransHeading1 tKey="page.title" />

// ❌ Bad - دالة في JSX
<h1>{t("page.title")}</h1>
```

---

## 🔧 الصيانة والتحديث / Maintenance

### إضافة مفتاح جديد / Adding New Key

1. افتح `client/src/lib/i18n.ts`
2. أضف المفتاح في قسم `ar`:

```typescript
ar: {
  translation: {
    "my.new.key": "النص بالعربية",
  }
}
```

3. أضف نفس المفتاح في قسم `en`:

```typescript
en: {
  translation: {
    "my.new.key": "Text in English",
  }
}
```

4. شغّل أداة التحقق:

```bash
node scripts/validate-translations.cjs
```

### البحث عن مفتاح / Finding a Key

```bash
# البحث في ملف الترجمة
grep "my.key" client/src/lib/i18n.ts

# البحث في الكود
grep -r "my.key" client/src/
```

### حذف مفتاح غير مستخدم / Removing Unused Key

1. تأكد أنه غير مستخدم:

```bash
grep -r "old.key" client/src/
```

2. احذفه من كلا اللغتين
3. شغّل الأداة للتحقق

---

## 📊 الإحصائيات الحالية / Current Statistics

```
إجمالي المفاتيح: 232 مفتاح
العربية: 232 ✅
الإنجليزية: 232 ✅
التوازن: 100% ✅
```

---

## 🚀 السكريبتات المتاحة / Available Scripts

```bash
# التحقق من الترجمات
npm run validate:translations

# فحص نظام الترجمة الكامل
./test-i18n.sh

# عرض صفحة الاختبار التفاعلية
open test-i18n.html
```

---

## 📞 المساعدة / Support

للمزيد من المعلومات:
- راجع: `TRANSLATION_AUDIT_REPORT.md`
- الأدوات: `scripts/validate-translations.cjs`
- الاختبار: `test-i18n.html`

---

**آخر تحديث:** 26 نوفمبر 2025  
**الحالة:** ✅ جاهز للاستخدام  
**الإصدار:** 2.0.0 - Advanced
