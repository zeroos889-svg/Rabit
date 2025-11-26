# نظام الترجمة - البداية السريعة
# Translation System - Quick Start

## 🚀 البداية السريعة

### الطريقة 1: استخدام Hook (موصى به)

```typescript
import { useI18n } from "@/hooks/useI18n";

function MyComponent() {
  const { t, formatCurrency, formatDate } = useI18n();
  
  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{formatCurrency(999)}</p>
      <p>{formatDate(new Date())}</p>
    </div>
  );
}
```

### الطريقة 2: استخدام المكونات

```typescript
import { TransHeading1, TransParagraph } from "@/components/TransText";

function MyPage() {
  return (
    <div>
      <TransHeading1 tKey="page.title" />
      <TransParagraph tKey="page.description" />
    </div>
  );
}
```

---

## 📁 الملفات الرئيسية

| الملف | الوظيفة |
|------|---------|
| `client/src/lib/i18n.ts` | جميع الترجمات (232 مفتاح) |
| `client/src/hooks/useI18n.ts` | Hook متقدم للترجمة |
| `client/src/components/TransText.tsx` | مكونات الترجمة |
| `scripts/validate-translations.cjs` | أداة التحقق |

---

## ⚡ وظائف متقدمة

### تنسيق الأرقام

```typescript
formatNumber(1234567)
// العربية: ١٬٢٣٤٬٥٦٧
// English: 1,234,567
```

### تنسيق العملة

```typescript
formatCurrency(999)
// العربية: ٩٩٩٫٠٠ ر.س.
// English: SAR 999.00
```

### تنسيق التاريخ

```typescript
formatDate(new Date(), "medium")
// العربية: ٢٦ نوفمبر ٢٠٢٥
// English: Nov 26, 2025
```

### الوقت النسبي

```typescript
formatRelativeTime(new Date(Date.now() - 3600000))
// العربية: منذ ساعة
// English: 1 hour ago
```

---

## 🧪 الاختبار

```bash
# التحقق من الترجمات
node scripts/validate-translations.cjs

# اختبار شامل
./test-i18n.sh

# صفحة اختبار تفاعلية
open test-i18n.html
```

---

## ✅ الحالة الحالية

```text
✅ العربية: 232 مفتاح
✅ الإنجليزية: 232 مفتاح
✅ التوازن: 100%
✅ الاختبارات: 15/15 نجحت
✅ الوظائف: useI18n + TransText + Validator
```

---

## 📚 المزيد من التفاصيل

راجع: `docs/I18N_DEVELOPMENT_GUIDE.md`
