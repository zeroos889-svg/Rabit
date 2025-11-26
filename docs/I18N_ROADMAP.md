# خارطة الطريق للتطوير المستقبلي
# Development Roadmap

## 📍 الوضع الحالي / Current Status

### ✅ مكتمل / Completed

- [x] نظام ترجمة كامل بلغتين (232 مفتاح)
- [x] مبدل اللغة مع دعم RTL/LTR
- [x] Hook متقدم (useI18n) مع 8+ وظائف
- [x] مكونات ترجمة (TransText + variants)
- [x] أداة تحقق تلقائية
- [x] اختبارات شاملة (15 اختبار)
- [x] توثيق كامل (5 ملفات)

---

## 🎯 المرحلة التالية / Next Phase

### 1. SEO متعدد اللغات / Multilingual SEO

#### الحالة: 🟡 قيد التطوير

**المتطلبات:**
- [ ] تثبيت `react-helmet-async`
- [ ] تفعيل مكون SEO
- [ ] إضافة hreflang tags لكل صفحة
- [ ] إضافة Open Graph meta
- [ ] إضافة Twitter Cards

**الأولوية:** 🔴 عالية  
**الوقت المتوقع:** 2-3 ساعات

```bash
# خطوات التنفيذ
npm install react-helmet-async
# ثم دمج SEO.tsx في الصفحات الرئيسية
```

---

### 2. تحميل كسول للترجمات / Lazy Loading

#### الحالة: 🔵 مخطط

**الهدف:** تحسين الأداء بتحميل الترجمات حسب الحاجة

**المزايا:**
- ⚡ تحميل أسرع للصفحة الأولى
- 📉 تقليل حجم الحزمة الأولية
- 🎯 تحميل ترجمات الصفحة فقط

**التصميم المقترح:**

```typescript
// client/src/lib/i18n.lazy.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// تحميل الترجمات الأساسية فقط
const commonTranslations = {
  ar: {
    nav: { /* ... */ },
    common: { /* ... */ }
  },
  en: { /* ... */ }
};

// دالة لتحميل ترجمات صفحة معينة
export async function loadPageTranslations(page: string) {
  const ar = await import(`./translations/ar/${page}.json`);
  const en = await import(`./translations/en/${page}.json`);
  
  i18n.addResourceBundle("ar", page, ar.default);
  i18n.addResourceBundle("en", page, en.default);
}
```

**هيكل الملفات المقترح:**

```text
client/src/lib/translations/
  ar/
    common.json       # الترجمات المشتركة
    home.json         # صفحة الرئيسية
    tools.json        # صفحة الأدوات
    pricing.json      # صفحة الأسعار
    contact.json      # صفحة التواصل
  en/
    common.json
    home.json
    tools.json
    pricing.json
    contact.json
```

**مثال استخدام:**

```typescript
import { loadPageTranslations } from "@/lib/i18n.lazy";

export function ToolsPage() {
  useEffect(() => {
    loadPageTranslations("tools");
  }, []);

  return (
    <div>
      <h1>{t("tools.title")}</h1>
    </div>
  );
}
```

**الأولوية:** 🟡 متوسطة  
**الوقت المتوقع:** 4-6 ساعات

---

### 3. تحميل ديناميكي من API / Dynamic API Loading

#### الحالة: 🔵 مخطط

**الهدف:** إدارة الترجمات من لوحة تحكم (CMS)

**المزايا:**
- 🔄 تحديث الترجمات بدون نشر جديد
- 👥 السماح للفريق بتحرير الترجمات
- 📊 تتبع التغييرات والنسخ
- 🌍 إضافة لغات جديدة بسهولة

**التصميم المقترح:**

```typescript
// server/routes/translations.ts
export async function getTranslations(lang: string) {
  // جلب من قاعدة البيانات
  const translations = await db
    .select()
    .from(translationsTable)
    .where(eq(translationsTable.language, lang));
  
  return translations;
}
```

**جدول قاعدة البيانات:**

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  language VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id),
  UNIQUE(key, language)
);
```

**مثال API:**

```typescript
// GET /api/translations?lang=ar
{
  "nav.home": "الرئيسية",
  "nav.about": "من نحن",
  // ...
}
```

**الأولوية:** 🟢 منخفضة  
**الوقت المتوقع:** 1-2 يوم

---

### 4. لوحة تحكم الترجمات / Translation Dashboard

#### الحالة: 🔵 مخطط

**الهدف:** واجهة ويب لإدارة الترجمات

**الميزات:**
- 📝 تحرير الترجمات مباشرة
- 🔍 البحث والفلترة
- ✅ مراجعة واعتماد التغييرات
- 📊 إحصائيات وتقارير
- 🔔 تنبيهات للمفاتيح المفقودة

**شاشات مقترحة:**

```text
/admin/translations
  ├─ /list           # قائمة جميع المفاتيح
  ├─ /edit/:key      # تحرير مفتاح معين
  ├─ /new            # إضافة مفتاح جديد
  ├─ /missing        # المفاتيح المفقودة
  └─ /stats          # الإحصائيات
```

**الأولوية:** 🟢 منخفضة  
**الوقت المتوقع:** 3-4 أيام

---

### 5. دعم لغات إضافية / Additional Languages

#### الحالة: 🔵 مخطط

**اللغات المقترحة:**
- 🇫🇷 الفرنسية (French)
- 🇪🇸 الإسبانية (Spanish)
- 🇩🇪 الألمانية (German)

**متطلبات:**
- [ ] إضافة ملفات الترجمة للغة الجديدة
- [ ] تحديث LanguageSwitcher
- [ ] اختبار RTL/LTR للغات الجديدة
- [ ] توثيق اللغة الجديدة

**الأولوية:** 🟢 منخفضة  
**الوقت المتوقع:** 2-3 ساعات لكل لغة

---

### 6. اختبارات تلقائية متقدمة / Advanced Testing

#### الحالة: 🔵 مخطط

**الهدف:** اختبارات شاملة ومستمرة

**المقترحات:**

```typescript
// tests/i18n/translation-coverage.test.ts
describe("Translation Coverage", () => {
  test("all pages have translations", () => {
    const pages = ["home", "tools", "pricing"];
    pages.forEach(page => {
      expect(hasTranslation(`${page}.title`)).toBe(true);
    });
  });

  test("no missing keys in production", () => {
    const missingKeys = findMissingKeys();
    expect(missingKeys).toHaveLength(0);
  });

  test("format functions work correctly", () => {
    const { formatCurrency } = renderHook(() => useI18n());
    expect(formatCurrency(999)).toContain("999");
  });
});
```

**اختبارات E2E:**

```typescript
// e2e/language-switching.spec.ts
test("language switcher works", async ({ page }) => {
  await page.goto("/");
  
  // التحقق من اللغة الافتراضية
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  
  // تبديل اللغة
  await page.click('[data-testid="language-switcher"]');
  await page.click('text=English');
  
  // التحقق من التغيير
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
```

**الأولوية:** 🟡 متوسطة  
**الوقت المتوقع:** 1-2 يوم

---

## 📊 جدول زمني مقترح / Proposed Timeline

| المرحلة | الوقت المتوقع | الأولوية |
|---------|---------------|----------|
| SEO متعدد اللغات | 2-3 ساعات | 🔴 عالية |
| التحميل الكسول | 4-6 ساعات | 🟡 متوسطة |
| الاختبارات المتقدمة | 1-2 يوم | 🟡 متوسطة |
| API ديناميكي | 1-2 يوم | 🟢 منخفضة |
| لوحة التحكم | 3-4 أيام | 🟢 منخفضة |
| لغات إضافية | حسب الحاجة | 🟢 منخفضة |

---

## 🎨 تحسينات UX مقترحة / UX Improvements

### 1. كشف اللغة التلقائي من المتصفح

```typescript
// في i18n.ts
const browserLang = navigator.language.split("-")[0]; // "ar" or "en"
const defaultLang = ["ar", "en"].includes(browserLang) 
  ? browserLang 
  : "ar";
```

### 2. تذكر تفضيلات المستخدم

```typescript
// حفظ التفضيلات في الحساب
const { user } = useAuth();
if (user) {
  await updateUserPreferences({ language: currentLang });
}
```

### 3. رسالة تأكيد عند التبديل

```typescript
// إشعار بسيط
toast.success(
  isArabic 
    ? "تم تغيير اللغة إلى العربية" 
    : "Language changed to English"
);
```

---

## 🔒 أمان وخصوصية / Security & Privacy

### متطلبات GDPR

- [ ] موافقة المستخدم على حفظ اللغة في localStorage
- [ ] سياسة خصوصية واضحة
- [ ] خيار مسح البيانات المحفوظة

### حماية من XSS

```typescript
// في TransText.tsx
if (html) {
  // استخدام DOMPurify
  const cleanHTML = DOMPurify.sanitize(translatedText);
  return <span dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}
```

---

## 📈 مقاييس النجاح / Success Metrics

### KPIs للترجمة:

- ✅ معدل التغطية: 100% (232/232)
- ⚡ سرعة التحميل: < 100ms
- 🎯 معدل استخدام كل لغة
- 🐛 عدد التقارير عن ترجمات خاطئة

### تتبع الاستخدام:

```typescript
// تتبع تبديل اللغة
analytics.track("language_changed", {
  from: previousLang,
  to: currentLang,
  page: window.location.pathname
});
```

---

## 🤝 المساهمة / Contributing

### إضافة ترجمة جديدة:

1. أضف المفتاح في `i18n.ts` (عربي + إنجليزي)
2. شغّل `node scripts/validate-translations.cjs`
3. اختبر في الواجهة
4. أرسل Pull Request

### معايير المراجعة:

- ✅ الترجمة دقيقة وطبيعية
- ✅ لا توجد أخطاء إملائية
- ✅ المفتاح موجود في كلا اللغتين
- ✅ اجتاز اختبار التحقق

---

**آخر تحديث:** 26 نوفمبر 2025  
**الإصدار:** 2.0.0  
**الحالة:** 🟢 نشط
