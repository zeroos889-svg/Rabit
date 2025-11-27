#  منصة رابِط - Rabit HR Platform

<p align="center">
  <img src="client/public/LOGO.svg" alt="Rabit Logo" width="280" />
</p>

<div dir="rtl">

منصة **رابِط** هي منصة سعودية متكاملة لإدارة الموارد البشرية، مصممة خصيصاً للامتثال الكامل لنظام العمل السعودي.

## ✨ المميزات الرئيسية

- 🔐 **نظام مصادقة متقدم** - تسجيل دخول بالبريد الإلكتروني وتكامل OAuth
- 👥 **إدارة الموظفين** - نظام شامل لإدارة بيانات الموظفين
- 💼 **نظام التوظيف (ATS)** - إدارة الوظائف والمتقدمين
- 📊 **التقارير والإحصائيات** - لوحات تحكم تفاعلية
- 💬 **نظام الاستشارات** - منصة للاستشارات المهنية
- 📝 **توليد المستندات** - قوالب جاهزة للمستندات الرسمية
- 🛡️ **الامتثال القانوني** - متوافق 100% مع نظام العمل السعودي
- 🌐 **دعم ثنائي اللغة** - عربي وإنجليزي

## 📋 المتطلبات الأساسية

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **Redis** (اختياري للتخزين المؤقت)
- **npm** أو **pnpm** أو **yarn**

## 🚀 البدء السريع

### 1. نسخ المشروع

```bash
git clone https://github.com/zeroos889-svg/Rabit.git
cd Rabit
```

### 2. تثبيت المكتبات

```bash
npm install
# أو
pnpm install
```

### 3. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env` وعدّل القيم:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rabithr
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production
```

### 4. إعداد قاعدة البيانات

```bash
# تشغيل migrations
npm run db:push

# تشغيل Drizzle Studio لإدارة البيانات
npm run db:studio
```

### 5. تشغيل المشروع

```bash
# تطوير - Frontend فقط
npm run dev

# تطوير - Backend فقط
npm run dev:server

# تطوير - كامل المشروع
npm run dev:full
```

## 📁 هيكل المشروع

```text
Rabit/
├── client/                  # تطبيق React (Frontend)
│   ├── src/
│   │   ├── components/     # المكونات القابلة لإعادة الاستخدام
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── contexts/       # React Contexts
│   │   ├── hooks/          # Custom Hooks
│   │   └── lib/            # المكتبات والأدوات
│   └── public/             # الملفات الثابتة
│
├── server/                  # خادم Express + tRPC (Backend)
│   ├── _core/              # الملفات الأساسية
│   │   ├── index.ts        # نقطة الدخول
│   │   ├── db.ts           # اتصال قاعدة البيانات
│   │   ├── trpc.ts         # إعداد tRPC
│   │   ├── redis.ts        # Redis client
│   │   └── context.ts      # tRPC context
│   └── routers.ts          # تعريف API endpoints
│
├── drizzle/                 # قاعدة البيانات
│   ├── schema.ts           # تعريف الجداول (55 جدول)
│   └── migrations/         # الهجرات
│
├── shared/                  # الكود المشترك
│   └── const.ts            # الثوابت
│
├── docs/                    # التوثيق
│   └── technical/          # التوثيق التقني
│
└── package.json            # المكتبات والأوامر
```

## 🛠️ الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل Frontend
npm run dev:server       # تشغيل Backend
npm run dev:full         # تشغيل Frontend + Backend

# البناء
npm run build            # بناء Frontend
npm run build:server     # بناء Backend

# الاختبارات
npm run test             # تشغيل الاختبارات
npm run test:ui          # واجهة اختبارات تفاعلية
npm run lint             # فحص الأكواد

# قاعدة البيانات
npm run db:push          # تطبيق التغييرات على القاعدة
npm run db:studio        # فتح Drizzle Studio
npm run db:generate      # توليد migrations
```

## 🔧 التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - مكونات UI
- **React Query** - إدارة البيانات
- **i18next** - الترجمة
- **Wouter** - Routing

### Backend
- **Express** - Web framework
- **tRPC** - Type-safe APIs
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - قاعدة البيانات
- **Redis** - التخزين المؤقت
- **Zod** - Validation

## 📊 قاعدة البيانات

المشروع يحتوي على **55 جدول** شامل يغطي:

- إدارة المستخدمين والصلاحيات
- الشركات والموظفين
- نظام التوظيف (ATS)
- الإجازات والحضور
- الرواتب والمكافآت
- نظام التذاكر
- الاستشارات المهنية
- المستندات والقوالب
- الإشعارات والرسائل
- الامتثال القانوني (PDPL)
- نظام الدفع والاشتراكات

## 🔐 المصادقة والأمان

- مصادقة متعددة (Email/Password, OAuth)
- تشفير كلمات المرور (bcrypt)
- JWT tokens
- نظام الصلاحيات متعدد المستويات
- حماية CSRF
- التحقق من البريد الإلكتروني
- إعادة تعيين كلمة المرور

## 🌍 دعم اللغات

المشروع يدعم بشكل كامل:
- العربية (RTL)
- الإنجليزية (LTR)

مع إمكانية التبديل السلس بين اللغتين.

## 📱 التوافق

- ✅ متصفحات الويب الحديثة
- ✅ أجهزة الموبايل (Responsive)
- ✅ تطبيقات Progressive Web App (PWA)

## 🚢 النشر (Deployment)

### إعداد Production

1. تحديث متغيرات البيئة للـ production
1. بناء المشروع:

```bash
npm run build
npm run build:server
```

1. رفع على Vercel/Railway/DigitalOcean

### Docker (قريباً)

```bash
docker-compose up
```

## 📝 التوثيق الإضافي

- [دليل المطورين](./DEVELOPER_GUIDE.md)
- [دليل البيئة](./ENV_SETUP_GUIDE.md)
- [دليل النشر](./DEPLOYMENT_GUIDE_FULL.md)
- [الأسئلة الشائعة](./docs/FAQ.md)

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](./LICENSE)

## 👥 الفريق

تم تطوير المشروع بواسطة فريق رابِط

## 📞 التواصل

- Website: [rabit.hr](https://rabit.hr)
- Email: support@rabit.hr
- GitHub: [@zeroos889-svg](https://github.com/zeroos889-svg)

## 🙏 شكر وتقدير

شكراً لجميع المكتبات والأدوات مفتوحة المصدر المستخدمة في هذا المشروع.

---

<div align="center">

**صُنع بـ ❤️ في المملكة العربية السعودية**

</div>

</div>

---

## ⚙️ نظرة تقنية سريعة

- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express 5 + tRPC + Drizzle ORM
- **قاعدة البيانات:** MySQL / TiDB (خيار Postgres متاح عبر Drizzle)
- **الكاش والصفوف:** Redis (اختياري)
- **الأمان:** JWT، Security Headers، Rate Limiting، مراقبة سجلات (Winston)
- **اللغات:** دعم عربي/إنجليزي كامل مع تبديل فوري

### المتطلبات المسبقة

| التقنية | الإصدار المقترح |
|---------|------------------|
| Node.js | LTS 18 أو أحدث |
| npm | 10 أو أحدث |
| MySQL أو TiDB | 8.0+ |
| Redis (اختياري) | للتخزين المؤقت والمعالجات غير المتزامنة |

> يمكن استعمال pnpm أو yarn، لكن `package-lock.json` يجعل **npm** الخيار الافتراضي.

### البدء السريع

```bash
git clone https://github.com/zeroos889-svg/Rabit.git
cd Rabit

npm install
cp .env.example .env   # عدّل بيانات MySQL/Redis والبريد

npm run db:push        # مزامنة المخطط
npm run dev:both       # Frontend + Backend
```

### السكربتات الأساسية

| المهمة | الأمر |
|--------|-------|
| واجهة Vite فقط | `npm run dev` |
| الخادم الخلفي فقط | `npm run dev:backend` |
| الواجهة + الخادم | `npm run dev:both` أو `npm run dev:full` |
| بناء نسخة الإنتاج | `npm run build` |
| معاينة البناء | `npm run preview` |
| التحقق من الأنواع | `npm run type-check` |
| الاختبارات | `npm run test` |
| أوامر Drizzle | `npm run db:generate`, `npm run db:studio` |

## 🗂️ بنية المستودع (مختصرة)

```text
├── client/                # واجهة React (مكونات، صفحات، hooks)
├── server/                # Express + tRPC + خدمات البريد/الدفع
├── shared/                # كود مشترك (ثوابت، نماذج، helpers)
├── drizzle/               # مخطط قواعد البيانات وملفات المايجريشن
├── scripts/               # مهام CLI (seed، patch، اختبارات)
├── docs/ + README_*       # أدلة متخصصة (نشر، أمان، تقارير)
└── docker-compose*.yml    # قوالب التشغيل عبر Docker
```

### خريطة الوثائق السريعة

| الملف | الغرض |
|-------|-------|
| `README_COMPLETE.md` | شرح معمق للمنصة والتقنيات |
| `README_DEPLOY_GUIDE_{AR,EN}.md` | دليل النشر على Vercel / Docker / الخوادم |
| `README_EMAIL_PROVIDER.md` | تهيئة مزود البريد (Resend/Nodemailer) |
| `README_REPORTS.md` | توليد التقارير ولوحات المتابعة |
| `DEVELOPER_GUIDE.md` | معايير المساهمة والإعداد للمطورين |
| `ENV_*`, `SECURITY_*`, `DEPLOYMENT_*` | تحقق الأمان والبيئة قبل أي إطلاق |

## ✅ قائمة التحقق قبل النشر

1. شغّل `npm run lint`, `npm run type-check`, و`npm run test` وتأكد من نجاحها.
2. تأكد من ضبط جميع متغيرات البيئة وإزالة أي أسرار من نظام التحكم بالنسخ.
3. راجع `SECURITY_CHECKLIST.md` و`ENVIRONMENT_VARIABLES_FINAL_REPORT.md`.
4. حدّث الروابط والأصول (البريد الرسمي، Sentry، الشعارات) قبل `npm run build`.

## 🤗 الدعم والمساهمة

- المشاكل والاقتراحات عبر GitHub Issues أو البريد [support@rabit.sa](mailto:support@rabit.sa).
- للمساهمة اطلع على `DEVELOPER_GUIDE.md`, `CODE_DOCUMENTATION.md` وباقي أدلة CI.

**آخر تحديث:** 25 نوفمبر 2025

> استخدم هذا الملف كنقطة دخول سريعة، ثم ارجع إلى أدلة README المتخصصة لكل مجال.
