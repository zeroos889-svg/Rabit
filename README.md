<div align="center">

# 🐇 منصة رابِط - Rabit HR Platform

<img src="client/public/LOGO.svg" alt="Rabit Logo" width="280" />

### منصة سعودية متكاملة لإدارة الموارد البشرية

[![Production](https://img.shields.io/badge/Production-Live-success)](https://rabit-app-production.up.railway.app)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-blueviolet)](https://railway.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

[العربية](#العربية) | [English](#english)

</div>

---

<div dir="rtl">

<a name="العربية"></a>

## 🌟 نظرة عامة

**رابِط** هي منصة سعودية شاملة لإدارة الموارد البشرية، مصممة للامتثال الكامل لنظام العمل السعودي. تجمع المنصة بين أحدث التقنيات وأفضل الممارسات لتقديم حل متكامل للشركات السعودية.

### 🔗 الروابط المهمة

| الرابط | الوصف |
|--------|-------|
| 🌐 [التطبيق](https://rabit-app-production.up.railway.app) | النسخة الحية |
| 📊 [Sentry](https://rabithr.sentry.io) | مراقبة الأخطاء |
| 📁 [GitHub](https://github.com/zeroos889-svg/Rabit) | المستودع |

---

## ✨ المميزات الرئيسية

### 👥 إدارة الموارد البشرية
- **إدارة الموظفين** - ملفات شاملة، عقود، وثائق
- **الحضور والانصراف** - تتبع آلي، تقارير مفصلة
- **الإجازات** - أنواع متعددة، موافقات، رصيد تلقائي
- **الرواتب** - حساب آلي، مسيرات، تقارير GOSI

### 💼 نظام التوظيف (ATS)
- **إدارة الوظائف** - نشر، تتبع، تحليلات
- **المتقدمين** - فرز ذكي، مقابلات، تقييم
- **العروض الوظيفية** - قوالب، موافقات، تتبع

### 🤖 الذكاء الاصطناعي
- **مساعد HR ذكي** - إجابات فورية على أسئلة قانون العمل
- **تحليل السير الذاتية** - استخراج البيانات تلقائياً
- **تقييم الأداء الذكي** - تحليل وتوصيات
- **توصيات التدريب** - برامج مخصصة

### 🔐 الأمان والحماية
- **Rate Limiting متقدم** - حماية مع Redis
- **CSRF Protection** - Double Submit Cookie
- **تشفير متقدم** - bcrypt + JWT
- **RBAC** - صلاحيات متعددة المستويات
- **Sentry Integration** - مراقبة الأخطاء لحظياً

### 🌐 دعم ثنائي اللغة
- العربية (RTL) كامل
- الإنجليزية (LTR)
- تبديل فوري بين اللغات

---

## 🛠️ التقنيات المستخدمة

### Frontend
| التقنية | الوصف |
|---------|-------|
| React 18 | مكتبة واجهات المستخدم |
| TypeScript 5 | Type Safety |
| Vite | أداة البناء |
| TailwindCSS | التصميم |
| Radix UI | مكونات UI |
| React Query | إدارة البيانات |
| i18next | الترجمة |

### Backend
| التقنية | الوصف |
|---------|-------|
| Express 5 | Web Framework |
| tRPC | Type-safe APIs |
| Drizzle ORM | إدارة قاعدة البيانات |
| MySQL/TiDB | قاعدة البيانات |
| Redis | التخزين المؤقت |
| Zod | التحقق من البيانات |

### الخدمات السحابية
| الخدمة | الوصف |
|--------|-------|
| Railway | الاستضافة |
| Redis | التخزين المؤقت |
| Sentry | مراقبة الأخطاء |
| Resend | البريد الإلكتروني |
| Cloudinary | تخزين الملفات |
| DeepSeek | الذكاء الاصطناعي |

---

## 🚀 البدء السريع

### المتطلبات
- Node.js >= 18.x
- npm >= 10.x
- MySQL 8.0+ أو TiDB

### التثبيت

```bash
# 1. نسخ المشروع
git clone https://github.com/zeroos889-svg/Rabit.git
cd Rabit

# 2. تثبيت المكتبات
npm install

# 3. إعداد البيئة
cp .env.example .env
# عدّل الملف بالقيم الخاصة بك

# 4. إعداد قاعدة البيانات
npm run db:push

# 5. تشغيل المشروع
npm run dev:full
```

### متغيرات البيئة الأساسية

```env
# قاعدة البيانات
DATABASE_URL=mysql://user:password@host:port/database

# الأمان
JWT_SECRET=your-jwt-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars

# Redis (اختياري)
REDIS_URL=redis://default:password@host:port

# الخدمات
DEEPSEEK_API_KEY=sk-xxx
RESEND_API_KEY=re_xxx
CLOUDINARY_URL=cloudinary://xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📁 هيكل المشروع

```
Rabit/
├── 📁 client/              # تطبيق React (Frontend)
│   ├── src/
│   │   ├── components/    # المكونات
│   │   ├── pages/         # الصفحات
│   │   ├── contexts/      # React Contexts
│   │   ├── hooks/         # Custom Hooks
│   │   └── lib/           # المكتبات
│   └── public/            # الملفات الثابتة
│
├── 📁 server/              # خادم Express (Backend)
│   ├── _core/             # الملفات الأساسية
│   │   ├── index.ts       # نقطة الدخول
│   │   ├── db.ts          # قاعدة البيانات
│   │   ├── redis.ts       # Redis client
│   │   ├── cache.ts       # نظام التخزين المؤقت
│   │   └── email.ts       # خدمة البريد
│   ├── ai/                # خدمات الذكاء الاصطناعي
│   └── routers.ts         # API endpoints
│
├── 📁 drizzle/             # قاعدة البيانات
│   └── schema.ts          # تعريف 55 جدول
│
├── 📁 shared/              # الكود المشترك
│
├── 📁 docs/                # التوثيق
│
└── 📄 package.json
```

---

## 🧪 الاختبارات

```bash
# تشغيل الاختبارات
npm test

# مع واجهة تفاعلية
npm run test:ui

# تغطية الكود
npm run test:coverage
```

---

## 🚢 النشر

### Railway (موصى به)

```bash
# ربط المشروع
npx railway link

# النشر
npx railway up
```

راجع [دليل النشر على Railway](docs/RAILWAY_DEPLOYMENT.md) للتفاصيل.

### Docker

```bash
docker-compose up -d
```

---

## 📚 التوثيق

| الدليل | الوصف |
|--------|-------|
| [📖 دليل التثبيت](docs/INSTALLATION.md) | التثبيت الكامل |
| [👨‍💻 دليل المطور](docs/DEVELOPER_GUIDE.md) | للمطورين |
| [🚀 دليل النشر](docs/RAILWAY_DEPLOYMENT.md) | النشر على Railway |
| [🔐 دليل الأمان](docs/SECURITY_CHECKLIST.md) | أفضل ممارسات الأمان |
| [🌐 دليل الترجمة](docs/I18N_COMPLETE_DOCUMENTATION.md) | نظام اللغات |
| [📡 توثيق API](docs/API_DOCUMENTATION.md) | مرجع API |

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء فرع (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📄 الترخيص

MIT License - راجع [LICENSE](LICENSE)

---

## 👥 الفريق

تم تطوير المشروع بواسطة **فريق رابِط** 🇸🇦

---

## 📞 التواصل

- 🌐 Website: [rabit.hr](https://rabit.hr)
- 📧 Email: support@rabit.sa
- 🐙 GitHub: [@zeroos889-svg](https://github.com/zeroos889-svg)

---

<div align="center">

**صُنع بـ ❤️ في المملكة العربية السعودية**

</div>

</div>

---

<a name="english"></a>

## 🌟 Overview (English)

**Rabit** is a comprehensive Saudi HR management platform, designed for full compliance with Saudi Labor Law. The platform combines modern technologies with best practices to deliver an integrated solution for Saudi companies.

### Key Features

- 👥 **HR Management** - Employees, attendance, leaves, payroll
- 💼 **ATS** - Job postings, applicant tracking, interviews
- 🤖 **AI-Powered** - Smart assistant, CV analysis, recommendations
- 🔐 **Enterprise Security** - Rate limiting, CSRF, encryption, RBAC
- 🌐 **Bilingual** - Full Arabic (RTL) and English support

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express + tRPC + Drizzle ORM
- **Database**: MySQL/TiDB + Redis
- **Services**: Railway, Sentry, Resend, Cloudinary, DeepSeek

### Quick Start

```bash
git clone https://github.com/zeroos889-svg/Rabit.git
cd Rabit
npm install
cp .env.example .env
npm run db:push
npm run dev:full
```

### Documentation

See [docs/](docs/) for full documentation.

---

<div align="center">

**Last Updated: November 28, 2025**

</div>
