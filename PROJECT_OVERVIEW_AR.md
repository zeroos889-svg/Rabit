# ملف تعريفي شامل لمنصة رابِط HR

## 1) الفكرة والقيمة
- رابِط منصة موارد بشرية سعودية تجمع الذكاء الاصطناعي مع الامتثال المحلي (نظام العمل + PDPL) لخدمة الشركات، المستقلين في مجال HR، والموظفين.
- تقدم لوحة تحكم واحدة لإدارة التوظيف، القضايا العمالية، المستندات، الاشتراكات، الاستشارات المدفوعة، والإشعارات مع تتبع تدقيق كامل.
- الواجهة عربية/إنجليزية مع تجربة موجهة لكل نوع حساب (موظف، شركة، مستشار، مدير نظام).

## 2) الشرائح المستهدفة وحالات الاستخدام
- الشركات: إدارة التوظيف (ATS)، القضايا والمهام، المستندات الرسمية، الاشتراكات والدفع، التقارير والامتثال.
- مستشارو HR: استقبال الاستشارات المدفوعة، دردشة العميل، جدولة المواعيد، تحصيل الأرباح، وإدارة التوفر.
- الموظفون: الوصول للأدوات الأساسية (حساب نهاية الخدمة، الإجازات، خطابات العمل) ومتابعة بياناتهم.
- إدارة النظام (Admin): التحكم بالمستخدمين، الاشتراكات، الحجزات، الأكواد الترويجية، حوادث الأمن، طلبات البيانات، وسجل التدقيق.

## 3) رحلة التجربة (مختصرة)
- تسجيل واختيار نوع الحساب عبر `/signup` مع تسجيل بريد/كلمة مرور، ملفات استكمال الملف، واستعادة كلمة المرور.
- لوحات التحكم:
  - الشركة/الموظف: Dashboard، إدارة الموظفين، ATS، القضايا والمهام، التذكيرات، التنبيهات، التقارير، الأدوات (حسابات، مولد خطابات، مستندات PDF).
  - المستشار: Dashboard مخصصة، إدارة الحجوزات والرسائل، رفع المستندات، ضبط التوفر والحجب، متابعة الأرباح والتقييمات.
  - الأدمن: إدارة المستخدمين والاشتراكات والحجوزات وسجل التدقيق والدردشة وأكواد الخصم وطلبات البيانات وحوادث الأمن.
- المساعد الذكي والدردشة: ودجت دردشة عامة وزوار مع سجل محادثات، ومساعد مدعوم بـ LLM، ودردشة إدارية للرد.
- الاستشارات: استعراض الخدمات والخبراء، حجز باقة/موعد، دفع عبر Moyasar/Tap، دردشة وتحديثات الحالة، تقييم المستشار.

## 4) المزايا والقدرات الرئيسية
- الهوية والصلاحيات: تسجيل/دخول بالبريد وكلمة مرور (bcrypt)، جلسات JWT على كوكي محمية، RBAC للأدوار (user/employee/company/consultant/admin)، تدقيق لكل عمليات الدخول/التسجيل.
- الذكاء الاصطناعي: `chatRouter` يستخدم LLM (Gemini 2.5 عبر Forge) مع تحديد التاريخ، قص الرسائل، ومنع الإغراق بالرسائل (Rate Limit). يوجد سجل محادثات وVisitor Token للزوار.
- ATS وإدارة التوظيف: وظائف، مرشحين، طلبات توظيف، مراحل مسار، تقييمات، مواعيد مقابلات، أنشطة مرشح، وإشعارات مرتبطة.
- إدارة القضايا والمهام: قضايا HR مع أولوية/حالة، مهام تابعة، تعليقات داخلية/خارجية، وسجل حركات.
- المستندات والقوالب: قوالب نصية ثنائية اللغة مع حقول ديناميكية، توليد مستندات محفوظة، مولد PDF، ومجلد `templates`/`generatedDocuments`.
- الأدوات التشغيلية: حاسبات نهاية الخدمة والإجازات والوقت الإضافي والخصومات، مولد خطابات، لوحة أدوات مدمجة.
- الاستشارات المدفوعة: باقات، حجوزات، رسائل استشارة، تذاكر دعم، توفر المستشار، أرباح وعمولة، تقييمات العملاء.
- الدفع والاشتراكات: خطط متعددة، أكواد خصم واستخدامها، تتبع الدفعات (pending/paid/refunded...) مع دعم بوابتي Moyasar وTap، وجلسات دفع في الواجهة (`/checkout`, callbacks).
- الإشعارات والتدقيق: إشعارات بنوعها وتفضيلات (In-App/Email/Push/SMS)، سجل بريد/رسائل نصية، سجل تدقيق للأحداث، وتتبع استخدام.
- المحتوى والمعرفة: صفحات مدونة، دروس، قاعدة معرفة، دراسات حالة، صفحات سياسات وامتثال كاملة.
- الترجمة والوصول: i18n (ar/en)، مكونات قابلية وصول (SkipLink، RouteAnnouncer، اختصارات لوحة مفاتيح، تباين عالي).

## 5) البنية التقنية
- **الواجهة الأمامية (client/):** React 18 + Vite، توجيه Wouter مع `Suspense` و Lazy Loading، TanStack Query + tRPC للبيانات، TailwindCSS + Radix UI + shadcn-styled components، i18next، رسوميات Lucide، حمايات كوكي/سياسة خصوصية، Toaster وTooltip، ودجت دردشة، حراس `ProtectedRoute` للأدوار.
- **الخلفية (server/):** Express + tRPC (ملفات routers مقسمة: auth/chat/payment/pdf/notifications/reports/admin)، مصادقة JWT على كوكي، Bcrypt لكلمات المرور، Email/Nodemailer (وResend)، Rate limiting للدردشة، RBAC بسيط، تسجيل/Audit عبر Drizzle، تخزين ملفات عبر بوابة Forge (تحقق حجم ونوع)، توليد PDF، تكامل LLM، وخدمات مساعدة في `_core`.
- **البيانات والتخزين:** Drizzle ORM مع MySQL/TiDB، Redis مدعوم عبر `ioredis` (للتخزين المؤقت/الجلسات)، تخزين ملفات S3-compatible عبر Proxy (BUILT_IN_FORGE_API_*).
- **الأمن والامتثال:** Helmet، rate limit، سجلات حوادث أمن، طلبات حقوق صاحب البيانات، سياسات الاحتفاظ، نقل بيانات، موافقات PDPL، تفضيلات إشعارات، سجل تدقيق شامل.
- **الاختبارات والأدوات:** Vitest (وصفقات smoke/chat/pdf/notifications)، TypeScript strict، ESLint، Drizzle Kit للتوليد والترحيل، سكربتات seed، Docker Compose لبيئات التطوير/المراقبة.

## 6) بنية المجلدات (مختصرة)
- `client/` تطبيق React (صفحات، مكونات، سياقات، أدوات، نمط Tailwind).
- `server/` طبقة API و tRPC، خدمات، أمن، تكامل LLM، بريد، دفع، PDF، إشعارات.
- `drizzle/` مخطط قاعدة البيانات (40+ جدول مع أنواع TypeScript).
- `shared/` ثوابت وأنواع مشتركة بين الواجهة والباك.
- `docs/` وكل ملفات الإرشاد/التقارير.
- جذور المساعدة: `Dockerfile`، `docker-compose*.yml`، `scripts/`، `patches/`, `monitoring/`, `rabit-hq/`، تقارير مراجعة/أمان متعددة.

## 7) نظرة على نموذج البيانات (أهم الجداول)
- الهوية والصلاحيات: `users`, `passwords`, `permissions`, `subscriptions`.
- الشركات والأفراد: `companies`, `employees`, `individualHRs`, `consultants`, `consultantDocuments`.
- ATS: `jobs`, `jobApplications`, `candidates`, `pipelineStages`, `candidateEvaluations`, `candidateActivities`, `interviewSchedules`.
- القضايا والمهام: `hrCases`, `tasks`, `caseComments`.
- المستندات والأدوات: `templates`, `generatedDocuments`, `generatedLetters`, `documents`, `calculationHistory`.
- الذكاء والدردشة: `chatConversations`, `chatMessages`, `chatHistory`.
- الاستشارات: `consultationTypes`, `consultationBookings`, `consultationMessages`, `consultingPackages`, `consultingTickets`, `consultingResponses`, `consultantAvailability`, `consultantBlockedDates`, `consultantReviews`, `consultantEarnings`.
- الدفع والخصومات: `payments`, `discountCodes`, `discountCodeUsage`.
- الإشعارات والتتبع: `notifications`, `notificationPreferences`, `emailLogs`, `smsLogs`, `usageEvents`, `auditLogs`.
- الامتثال والأمن: `userConsents`, `dataSubjectRequests`, `retentionPolicies`, `retentionLogs`, `securityIncidents`, `dataTransfers`, `processingActivities`, `customerPdplSettings`.

## 8) التكاملات والخدمات الخارجية
- الدفع: صفحات `/payment`, `/checkout`, callbacks لمويصر (`/payment/moyasar/callback`) وتاب (`/payment/tap/callback`).
- البريد: Nodemailer/Resend مع سجلات إرسال وفشل.
- التخزين: Proxy عبر Forge (رفع/تنزيل مع تحقق نوع/حجم).
- الذكاء الاصطناعي: Forge Chat Completions (Gemini 2.5 Flash).
- التحليلات/التتبع: `usageEvents` + سجل تدقيق، وإمكانية تفعيل Sentry للواجهة.

## 9) الإعداد والتشغيل السريع
```bash
pnpm install
cp .env.example .env.local   # عيّن مفاتيح قاعدة البيانات، Forge API، البريد، مزودي الدفع
pnpm db:push                 # إنشاء الجداول عبر Drizzle
pnpm dev                     # تشغيل الواجهة والباك معاً عبر vite-runner
```
متطلبات أساسية: Node 18+، MySQL/TiDB، Redis (اختياري)، متغيرات بيئة مثل `DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_URL/KEY`, `VITE_APP_*`, مفاتيح بوابتي الدفع.

## 10) الحالة الحالية وملاحظات
- تغطية شاملة للواجهات (Landing، Auth، Dashboards لكل دور، أدوات، استشارات، سياسات).
- قاعدة بيانات موسعة للامتثال السعودي وبيانات HR/ATS/استشارات/دفع.
- مسارات جاهزة للاختبارات (Vitest) وللتشغيل بـ Docker، مع دلائل نشر مفصلة في ملفات README_* و VERCEL_*.
- يمكن توسيع 2FA، تنبيهات الدفع اللحظية، وربط S3/مزود بريد/بوابة دفع حقيقية حسب بيئة الإنتاج.
