# دليل استخدام الشعار | Logo Usage Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية استخدام شعار رابِط في المشروع بشكل صحيح.

---

## 🎨 ملفات الشعار

### الموقع الحالي
```
client/public/LOGO.svg
```

### أنواع الشعارات المقترحة
```
client/public/
├── LOGO.svg              # الشعار الكامل (المستخدم حالياً)
├── logo-icon.svg         # أيقونة فقط (للفافيكون)
├── logo-horizontal.svg   # شعار أفقي
├── logo-dark.svg         # نسخة للخلفية الداكنة
└── logo-light.svg        # نسخة للخلفية الفاتحة
```

---

## ⚙️ الإعدادات

### متغيرات البيئة (.env)
```bash
VITE_APP_LOGO=/LOGO.svg
VITE_APP_TITLE=رابِط | Rabit
```

### في الكود (client/src/const.ts)
```typescript
export const APP_LOGO = import.meta.env.VITE_APP_LOGO || "/LOGO.svg";
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "رابِط";
```

---

## 🔧 كيفية الاستخدام

### في React Components

#### الطريقة الأساسية
```tsx
import { APP_LOGO } from "@/const";

<img src={APP_LOGO} alt="رابِط | Rabit" className="h-8 w-auto" />
```

#### مع التحميل الكسول (Lazy Loading)
```tsx
<img 
  src={APP_LOGO} 
  alt="رابِط | Rabit" 
  className="h-8 w-auto"
  loading="lazy"
  width={32}
  height={32}
/>
```

#### مع أحجام مختلفة
```tsx
{/* حجم صغير - Header/Navigation */}
<img src={APP_LOGO} alt="رابِط" className="h-8 w-auto" />

{/* حجم متوسط - Cards */}
<img src={APP_LOGO} alt="رابِط" className="h-12 w-auto" />

{/* حجم كبير - Hero/Login */}
<img src={APP_LOGO} alt="رابِط" className="h-20 w-auto" />
```

---

## 📄 الاستخدامات الحالية

### ✅ تم التطبيق

1. **Header.tsx**
   ```tsx
   <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
   ```

2. **Footer.tsx**
   ```tsx
   <img src={APP_LOGO} alt="Rabit" className="h-10 w-10" />
   ```

3. **Login.tsx** ✅ تم التحديث
   ```tsx
   <img src={APP_LOGO} alt="رابِط | Rabit" className="h-20 w-auto" />
   ```

4. **Register.tsx** ✅ تم التحديث
   ```tsx
   <img src={APP_LOGO} alt="رابِط | Rabit" className="h-20 w-auto" />
   ```

5. **EndOfServiceCalculator.tsx**
   ```tsx
   <img src={APP_LOGO} alt="Rabit" className="h-8" />
   ```

6. **LeaveCalculator.tsx**
   ```tsx
   <img src={APP_LOGO} alt="Rabit" className="h-8" />
   ```

7. **Signup.tsx**
   ```tsx
   <img src={APP_LOGO} alt="Rabit" className="h-10 w-10" />
   ```

---

## 📱 PWA و Meta Tags

### index.html
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/LOGO.svg" />
<link rel="apple-touch-icon" href="/LOGO.svg" />

<!-- Open Graph -->
<meta property="og:image" content="/LOGO.svg" />

<!-- Twitter Card -->
<meta name="twitter:image" content="/LOGO.svg" />
```

### manifest.webmanifest
```json
{
  "name": "رابِط - منصة الموارد البشرية الذكية",
  "short_name": "رابِط",
  "icons": [
    {
      "src": "/LOGO.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## 🎨 إرشادات التصميم

### الألوان
- **اللون الأساسي:** أزرق متدرج (#3B82F6 to #8B5CF6)
- **الخلفية الفاتحة:** استخدم الشعار الأصلي
- **الخلفية الداكنة:** استخدم نسخة بألوان فاتحة

### الأحجام الموصى بها

| الموقع | الحجم | Class |
|--------|-------|-------|
| Favicon | 16x16 | - |
| Navigation | 32x32 | `h-8 w-auto` |
| Footer | 40x40 | `h-10 w-auto` |
| Login/Register | 80x80 | `h-20 w-auto` |
| Hero Section | 120x120 | `h-30 w-auto` |
| Loading Screen | 64x64 | `h-16 w-auto` |

### المساحات البيضاء
- احتفظ بمساحة حول الشعار لا تقل عن 25% من حجمه
- لا تضع نصوص أو عناصر قريبة جداً من الشعار

---

## 🚫 ما يجب تجنبه

❌ **لا تفعل:**
- تغيير نسبة العرض إلى الارتفاع
- إضافة تأثيرات أو فلاتر غير متوافقة مع الهوية
- استخدام الشعار بدقة منخفضة
- تدوير الشعار بزوايا غريبة
- تغيير الألوان الأساسية

✅ **افعل:**
- احتفظ بالنسب الأصلية
- استخدم SVG عندما يكون ممكناً
- تأكد من وضوح الشعار
- اتبع إرشادات الألوان

---

## 📧 قوالب البريد الإلكتروني

### استخدام في HTML Email
```html
<!-- Inline في Email -->
<img 
  src="https://yourdomain.com/LOGO.svg" 
  alt="رابِط | Rabit"
  width="120"
  height="120"
  style="display:block; max-width:120px;"
/>
```

### استخدام في Email Templates (Server)
```typescript
// في server/lib/email.ts أو المكان المناسب
const logoUrl = `${process.env.APP_URL}/LOGO.svg`;

const emailTemplate = `
  <img src="${logoUrl}" alt="رابِط" style="height: 60px;" />
`;
```

---

## 🔄 تحديث الشعار

### خطوات تحديث الشعار:

1. **استبدل الملف**
   ```bash
   # ضع الشعار الجديد
   cp new-logo.svg client/public/LOGO.svg
   ```

2. **امسح ذاكرة التخزين المؤقت**
   ```bash
   rm -rf client/dist
   npm run build
   ```

3. **اختبر في جميع الصفحات**
   - صفحة الرئيسية
   - Login/Register
   - Dashboard
   - Footer
   - Email templates

4. **تحقق من PWA**
   - Favicon
   - App icons
   - Splash screens

---

## 🧪 الاختبار

### قائمة التحقق

- [ ] الشعار يظهر في Header
- [ ] الشعار يظهر في Footer
- [ ] الشعار يظهر في Login
- [ ] الشعار يظهر في Register
- [ ] الشعار يظهر في صفحات الخطأ
- [ ] Favicon يعمل في المتصفح
- [ ] Open Graph image صحيح
- [ ] PWA icon صحيح
- [ ] الشعار واضح في الوضع الليلي
- [ ] الشعار واضح في الوضع النهاري
- [ ] الشعار responsive على الموبايل

### أوامر الاختبار
```bash
# تشغيل المشروع
npm run dev

# فتح المتصفح على:
# http://localhost:5173/
# http://localhost:5173/login
# http://localhost:5173/register

# تحقق من console للأخطاء
```

---

## 📊 التحليلات

### تتبع ظهور الشعار

```typescript
// يمكن إضافة tracking عند تحميل الشعار
<img 
  src={APP_LOGO} 
  alt="رابِط"
  onLoad={() => {
    // Track logo loaded
    analytics.track('logo_displayed', { page: 'login' });
  }}
  onError={() => {
    // Track logo error
    console.error('Logo failed to load');
  }}
/>
```

---

## 🔗 موارد إضافية

### روابط مفيدة
- [SVG Optimization](https://jakearchibald.github.io/svgomg/)
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Manifest Generator](https://app-manifest.firebaseapp.com/)

### أدوات
```bash
# تحسين SVG
npm install -g svgo
svgo client/public/LOGO.svg

# تحويل SVG إلى PNG (لو احتجت)
npm install -g sharp-cli
sharp -i LOGO.svg -o logo-192.png resize 192 192
```

---

## 📝 Changelog

### v1.0.0 (25 نوفمبر 2025)
- ✅ تطبيق الشعار في Login.tsx
- ✅ تطبيق الشعار في Register.tsx
- ✅ تحديث .env.example
- ✅ توثيق استخدام الشعار

### المخطط المستقبلي
- [ ] إضافة نسخ بأحجام مختلفة (16, 32, 192, 512)
- [ ] إضافة نسخة للوضع الليلي
- [ ] إنشاء splash screens للـ PWA
- [ ] تحسين الشعار للطباعة

---

**آخر تحديث:** 25 نوفمبر 2025  
**الحالة:** ✅ مطبق وجاهز للاستخدام
