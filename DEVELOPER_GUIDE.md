# دليل المطورين - مشروع رابِط (RabitHR)

مرحباً بك في الدليل التقني لمشروع **رابِط (RabitHR)**. هذا المستند يهدف لمساعدة المطورين على فهم بنية المشروع، إعداده، والمساهمة فيه بفعالية.

## 1. نظرة عامة (Overview)

**رابِط** هو منصة شاملة للموارد البشرية (HR) تهدف لخدمة الشركات، الموظفين، ومستقلي الموارد البشرية في المملكة العربية السعودية.

### التقنيات المستخدمة (Tech Stack)
- **Frontend:** React 18, Vite, Tailwind CSS, Radix UI.
- **Backend:** Node.js, Express, tRPC.
- **Database:** MySQL (via Drizzle ORM).
- **Caching/Session:** Redis.
- **Language:** TypeScript (Full Stack).

---

## 2. إعداد بيئة التطوير (Setup)

### المتطلبات
- Node.js (v18+)
- pnpm (موصى به) أو npm
- MySQL Database
- Redis Server

### خطوات التثبيت

1.  **نسخ المستودع:**
    ```bash
    git clone <repository-url>
    cd RabitHR
    ```

2.  **تثبيت الحزم:**
    ```bash
    pnpm install
    ```

3.  **إعداد المتغيرات البيئية:**
    - انسخ ملف `.env.example` إلى `.env`:
      ```bash
      cp .env.example .env
      ```
    - قم بتعديل القيم في `.env` (خاصة `DATABASE_URL` و `REDIS_URL`).

4.  **إعداد قاعدة البيانات:**
    ```bash
    pnpm db:push
    ```

5.  **تشغيل المشروع:**
    ```bash
    pnpm dev
    ```
    سيعمل التطبيق على `http://localhost:5173`.

---

## 3. هيكلية المشروع (Project Structure)

```
RabitHR/
├── client/                 # كود الواجهة الأمامية
│   ├── src/
│   │   ├── components/     # مكونات React (ui, shared)
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── lib/            # دوال مساعدة (utils)
│   │   └── App.tsx         # نقطة الدخول والراوتر
├── server/                 # كود الخادم
│   ├── _core/              # البنية التحتية (logger, redis, auth)
│   ├── routers.ts          # تعريفات tRPC Routers
│   └── index.ts            # نقطة تشغيل السيرفر
├── drizzle/                # ملفات قاعدة البيانات
│   └── schema.ts           # تعريف الجداول والعلاقات
├── public/                 # الملفات العامة (صور، أيقونات)
└── scripts/                # سكربتات مساعدة للتشغيل
```

---

## 4. التعامل مع قاعدة البيانات (Database)

نستخدم **Drizzle ORM** للتعامل مع قاعدة البيانات.

- **تعديل المخطط (Schema):**
  قم بتعديل الملف `drizzle/schema.ts`.

- **تطبيق التغييرات:**
  ```bash
  pnpm db:push
  ```

- **استعراض البيانات (Drizzle Studio):**
  ```bash
  pnpm db:studio
  ```

---

## 5. التعامل مع API (tRPC)

نستخدم **tRPC** لبناء API آمن ومتكامل الأنواع (Type-Safe).

- **إضافة Endpoint جديد:**
  1. اذهب إلى `server/routers.ts`.
  2. أضف الدالة في الـ Router المناسب (مثلاً `auth`, `system`).
  3. استخدم `publicProcedure` للعامة أو `protectedProcedure` للمحمية.

- **استدعاء API في Frontend:**
  ```typescript
  const { data } = trpc.example.hello.useQuery({ text: "world" });
  ```

---

## 6. الاختبارات (Testing)

نستخدم **Vitest** للاختبارات.

- **تشغيل كل الاختبارات:**
  ```bash
  pnpm test
  ```

- **تشغيل اختبارات محددة:**
  ```bash
  pnpm test -- -t "اسم الاختبار"
  ```

- **ملاحظة:** اختبارات Redis تستخدم Mock في بيئة الاختبار، لذا لا تتطلب سيرفر Redis فعلي أثناء الاختبار.

---

## 7. الأمان (Security)

- **CSRF:** نستخدم حماية مخصصة (Double Submit Cookie) في `server/_core/csrf.ts`.
- **Logging:** نستخدم `winston` للتسجيل. استخدم `logger.info()` بدلاً من `console.log()`.
- **Validation:** نستخدم `zod` للتحقق من المدخلات في الـ API.

---

## 8. النشر (Deployment)

المشروع جاهز للنشر على منصات مثل Railway أو Vercel.
- تأكد من تعيين متغيرات البيئة (`NODE_ENV=production`).
- أمر البناء: `pnpm build`.
- أمر التشغيل: `pnpm start` (أو `node dist/server/index.js`).

---

**لأي استفسارات، راجع فريق التطوير أو افتح Issue في المستودع.**
