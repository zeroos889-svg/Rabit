# أمثلة عملية للترجمة
# Translation Code Examples

## 📖 فهرس الأمثلة / Examples Index

1. [صفحة بسيطة / Simple Page](#simple-page)
2. [نموذج تسجيل / Registration Form](#registration-form)
3. [جدول أسعار / Pricing Table](#pricing-table)
4. [قائمة ديناميكية / Dynamic List](#dynamic-list)
5. [إشعارات / Notifications](#notifications)
6. [رسائل خطأ / Error Messages](#error-messages)
7. [تنسيق البيانات / Data Formatting](#data-formatting)
8. [محتوى شرطي / Conditional Content](#conditional-content)

---

## 1. صفحة بسيطة / Simple Page

### المثال الكامل

```typescript
// pages/About.tsx
import { useI18n } from "@/hooks/useI18n";
import { 
  TransHeading1, 
  TransHeading2, 
  TransParagraph 
} from "@/components/TransText";

export function AboutPage() {
  const { t, formatDate, isRTL } = useI18n();

  return (
    <div className={`container mx-auto p-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* العنوان الرئيسي */}
      <TransHeading1 
        tKey="about.title"
        defaultText="About Us"
        className="text-4xl font-bold mb-6"
      />

      {/* الوصف */}
      <TransParagraph 
        tKey="about.description"
        defaultText="We are a leading HR platform"
        className="text-lg text-gray-700 mb-4"
      />

      {/* معلومات إضافية */}
      <div className="bg-gray-100 p-4 rounded">
        <TransHeading2 tKey="about.mission" />
        <TransParagraph tKey="about.missionText" />
      </div>

      {/* تاريخ التأسيس */}
      <p className="mt-4 text-sm text-gray-500">
        {t("about.established")}: {formatDate(new Date("2020-01-01"), "long")}
      </p>
    </div>
  );
}
```

### الترجمات المطلوبة في i18n.ts

```typescript
ar: {
  translation: {
    "about.title": "من نحن",
    "about.description": "نحن منصة رائدة في مجال الموارد البشرية",
    "about.mission": "رؤيتنا",
    "about.missionText": "نسعى لتحسين تجربة الموارد البشرية",
    "about.established": "تأسست في"
  }
},
en: {
  translation: {
    "about.title": "About Us",
    "about.description": "We are a leading HR platform",
    "about.mission": "Our Mission",
    "about.missionText": "We aim to improve HR experience",
    "about.established": "Established in"
  }
}
```

---

## 2. نموذج تسجيل / Registration Form

### المثال الكامل مع validation

```typescript
// components/RegistrationForm.tsx
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { TransButton } from "@/components/TransText";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export function RegistrationForm() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // التحقق من الاسم
    if (!formData.name.trim()) {
      newErrors.name = t("form.error.nameRequired", "Name is required");
    } else if (formData.name.length < 3) {
      newErrors.name = t("form.error.nameShort", "Name must be at least 3 characters");
    }

    // التحقق من البريد
    if (!formData.email.trim()) {
      newErrors.email = t("form.error.emailRequired", "Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("form.error.emailInvalid", "Invalid email format");
    }

    // التحقق من الهاتف
    if (!formData.phone.trim()) {
      newErrors.phone = t("form.error.phoneRequired", "Phone is required");
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = t("form.error.phoneInvalid", "Phone must be 10 digits starting with 05");
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = t("form.error.passwordRequired", "Password is required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("form.error.passwordShort", "Password must be at least 8 characters");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // إرسال البيانات
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      alert(t("form.success.registered", "Registration successful!"));
    } catch (error) {
      alert(t("form.error.serverError", "Server error, please try again"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">
        {t("form.title", "Create Account")}
      </h2>

      {/* حقل الاسم */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.label.name", "Full Name")}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("form.placeholder.name", "Enter your full name")}
          className={`w-full px-3 py-2 border rounded ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* حقل البريد */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.label.email", "Email")}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={t("form.placeholder.email", "example@email.com")}
          className={`w-full px-3 py-2 border rounded ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* حقل الهاتف */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.label.phone", "Phone")}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder={t("form.placeholder.phone", "05xxxxxxxx")}
          className={`w-full px-3 py-2 border rounded ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* حقل كلمة المرور */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.label.password", "Password")}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={t("form.placeholder.password", "Enter password")}
          className={`w-full px-3 py-2 border rounded ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* زر الإرسال */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting 
          ? t("form.button.submitting", "Submitting...") 
          : t("form.button.submit", "Create Account")}
      </button>
    </form>
  );
}
```

### الترجمات المطلوبة

```typescript
ar: {
  translation: {
    "form.title": "إنشاء حساب",
    "form.label.name": "الاسم الكامل",
    "form.label.email": "البريد الإلكتروني",
    "form.label.phone": "رقم الهاتف",
    "form.label.password": "كلمة المرور",
    "form.placeholder.name": "أدخل اسمك الكامل",
    "form.placeholder.email": "example@email.com",
    "form.placeholder.phone": "05xxxxxxxx",
    "form.placeholder.password": "أدخل كلمة المرور",
    "form.button.submit": "إنشاء الحساب",
    "form.button.submitting": "جاري الإرسال...",
    "form.error.nameRequired": "الاسم مطلوب",
    "form.error.nameShort": "الاسم يجب أن يكون 3 أحرف على الأقل",
    "form.error.emailRequired": "البريد الإلكتروني مطلوب",
    "form.error.emailInvalid": "صيغة البريد غير صحيحة",
    "form.error.phoneRequired": "رقم الهاتف مطلوب",
    "form.error.phoneInvalid": "رقم الهاتف يجب أن يكون 10 أرقام يبدأ بـ 05",
    "form.error.passwordRequired": "كلمة المرور مطلوبة",
    "form.error.passwordShort": "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    "form.error.serverError": "خطأ في الخادم، يرجى المحاولة مرة أخرى",
    "form.success.registered": "تم التسجيل بنجاح!"
  }
},
en: {
  translation: {
    "form.title": "Create Account",
    "form.label.name": "Full Name",
    "form.label.email": "Email",
    "form.label.phone": "Phone",
    "form.label.password": "Password",
    "form.placeholder.name": "Enter your full name",
    "form.placeholder.email": "example@email.com",
    "form.placeholder.phone": "05xxxxxxxx",
    "form.placeholder.password": "Enter password",
    "form.button.submit": "Create Account",
    "form.button.submitting": "Submitting...",
    "form.error.nameRequired": "Name is required",
    "form.error.nameShort": "Name must be at least 3 characters",
    "form.error.emailRequired": "Email is required",
    "form.error.emailInvalid": "Invalid email format",
    "form.error.phoneRequired": "Phone is required",
    "form.error.phoneInvalid": "Phone must be 10 digits starting with 05",
    "form.error.passwordRequired": "Password is required",
    "form.error.passwordShort": "Password must be at least 8 characters",
    "form.error.serverError": "Server error, please try again",
    "form.success.registered": "Registration successful!"
  }
}
```

---

## 3. جدول أسعار / Pricing Table

```typescript
// components/PricingTable.tsx
import { useI18n } from "@/hooks/useI18n";
import { TransHeading2, TransParagraph } from "@/components/TransText";

interface PricingPlan {
  id: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

export function PricingTable() {
  const { t, formatCurrency, isRTL } = useI18n();

  const plans: PricingPlan[] = [
    {
      id: "employee",
      price: 0,
      features: [
        "pricing.plan.employee.feature1",
        "pricing.plan.employee.feature2",
        "pricing.plan.employee.feature3"
      ]
    },
    {
      id: "freelancer",
      price: 299,
      features: [
        "pricing.plan.freelancer.feature1",
        "pricing.plan.freelancer.feature2",
        "pricing.plan.freelancer.feature3",
        "pricing.plan.freelancer.feature4"
      ],
      highlighted: true
    },
    {
      id: "company",
      price: 999,
      features: [
        "pricing.plan.company.feature1",
        "pricing.plan.company.feature2",
        "pricing.plan.company.feature3",
        "pricing.plan.company.feature4",
        "pricing.plan.company.feature5"
      ]
    }
  ];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        {t("pricing.title", "Our Plans")}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 ${
              plan.highlighted 
                ? "border-blue-500 shadow-xl scale-105" 
                : "border-gray-300"
            }`}
          >
            {/* اسم الباقة */}
            <TransHeading2 
              tKey={`pricing.plan.${plan.id}.name`}
              className="text-2xl font-bold mb-2"
            />

            {/* السعر */}
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {plan.price === 0 
                ? t("pricing.free", "Free") 
                : formatCurrency(plan.price)}
              <span className="text-sm text-gray-500">
                {plan.price > 0 && ` / ${t("pricing.monthly", "month")}`}
              </span>
            </div>

            {/* الوصف */}
            <TransParagraph 
              tKey={`pricing.plan.${plan.id}.description`}
              className="text-gray-600 mb-6"
            />

            {/* الميزات */}
            <ul className={`space-y-2 mb-6 ${isRTL ? "text-right" : "text-left"}`}>
              {plan.features.map((featureKey) => (
                <li key={featureKey} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t(featureKey)}</span>
                </li>
              ))}
            </ul>

            {/* زر الاشتراك */}
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {t("pricing.subscribe", "Subscribe Now")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. قائمة ديناميكية / Dynamic List

```typescript
// components/JobsList.tsx
import { useI18n } from "@/hooks/useI18n";

interface Job {
  id: number;
  titleKey: string;
  company: string;
  salary: number;
  postedAt: Date;
}

export function JobsList() {
  const { t, formatCurrency, formatRelativeTime } = useI18n();

  const jobs: Job[] = [
    {
      id: 1,
      titleKey: "jobs.title.developer",
      company: "Tech Corp",
      salary: 15000,
      postedAt: new Date(Date.now() - 86400000) // منذ يوم
    },
    {
      id: 2,
      titleKey: "jobs.title.designer",
      company: "Creative Agency",
      salary: 12000,
      postedAt: new Date(Date.now() - 172800000) // منذ يومين
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {t("jobs.available", "Available Jobs")}
      </h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500">
          {t("jobs.noJobs", "No jobs available at the moment")}
        </p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="border rounded p-4 hover:shadow-lg">
            <h3 className="text-xl font-bold mb-2">
              {t(job.titleKey)}
            </h3>
            <p className="text-gray-600 mb-2">{job.company}</p>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-bold">
                {formatCurrency(job.salary)}
              </span>
              <span className="text-sm text-gray-500">
                {formatRelativeTime(job.postedAt)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

---

## 5. إشعارات / Notifications

```typescript
// components/NotificationSystem.tsx
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  messageKey: string;
  values?: Record<string, any>;
}

export function NotificationSystem() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: NotificationType, 
    messageKey: string, 
    values?: Record<string, any>
  ) => {
    const id = Date.now();
    setNotifications([...notifications, { id, type, messageKey, values }]);

    // إزالة بعد 5 ثوان
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  };

  return (
    <>
      {/* الإشعارات */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${colors[notif.type]} text-white px-4 py-3 rounded shadow-lg`}
          >
            {t(notif.messageKey, notif.values)}
          </div>
        ))}
      </div>

      {/* أزرار تجريبية */}
      <div className="space-x-2">
        <button onClick={() => addNotification("success", "notification.saved")}>
          {t("test.success", "Test Success")}
        </button>
        <button onClick={() => addNotification("error", "notification.error")}>
          {t("test.error", "Test Error")}
        </button>
      </div>
    </>
  );
}
```

---

## نصائح إضافية / Additional Tips

### 1. استخدام المتغيرات في الترجمة

```typescript
// في i18n.ts
"welcome.user": "مرحباً {{name}}، لديك {{count}} رسالة جديدة"

// في الكود
t("welcome.user", { name: "أحمد", count: 5 })
// النتيجة: "مرحباً أحمد، لديك 5 رسالة جديدة"
```

### 2. التعامل مع الجمع

```typescript
// في i18n.ts
"items.count_zero": "لا توجد عناصر",
"items.count_one": "عنصر واحد",
"items.count_two": "عنصران",
"items.count_few": "{{count}} عناصر",
"items.count_many": "{{count}} عنصراً",
"items.count_other": "{{count}} عنصر"

// في الكود
t("items.count", { count: 0 })  // "لا توجد عناصر"
t("items.count", { count: 1 })  // "عنصر واحد"
t("items.count", { count: 5 })  // "5 عناصر"
```

### 3. تنسيق HTML في الترجمة

```typescript
// في i18n.ts
"terms.text": "أوافق على <a href='/terms'>الشروط والأحكام</a>"

// في الكود
<TransText tKey="terms.text" html={true} />
```

---

**آخر تحديث:** 26 نوفمبر 2025  
**الملفات المرجعية:**
- `client/src/hooks/useI18n.ts`
- `client/src/components/TransText.tsx`
- `client/src/lib/i18n.ts`
