# 🔌 دليل تفعيل الخدمات - منصة رابِط HR
# Services Activation Guide - RabitHR Platform

<div dir="rtl">

## 📋 نظرة عامة | Overview

دليل شامل لتفعيل وإعداد جميع الخدمات الخارجية المستخدمة في منصة رابِط HR.

</div>

---

## 📊 حالة الخدمات الحالية | Current Services Status

| الخدمة | Service | الحالة | Status | الأولوية |
|--------|---------|--------|--------|----------|
| 🗄️ MySQL | Database | ✅ مفعّل | Active | ⭐⭐⭐ |
| 🔴 Redis | Cache | ✅ مفعّل | Active | ⭐⭐⭐ |
| 📧 Resend | Email | ✅ مفعّل | Active | ⭐⭐⭐ |
| ☁️ Cloudinary | Storage | ✅ مفعّل | Active | ⭐⭐ |
| 🤖 DeepSeek | AI | ✅ مفعّل | Active | ⭐⭐ |
| 🔍 Sentry | Monitoring | ✅ مفعّل | Active | ⭐⭐⭐ |
| 💳 Moyasar | Payments | ⏳ يحتاج تفعيل | Pending | ⭐⭐⭐ |
| 📱 SMS | Notifications | ⏳ يحتاج تفعيل | Pending | ⭐⭐ |

---

## 1. 📧 Email Service (Resend) ⭐⭐⭐

### ✅ الحالة: مفعّل على Railway

<div dir="rtl">

### الإعداد الحالي:

</div>

```bash
# Environment Variables (Railway)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# SMTP Fallback (اختياري)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxxx
SMTP_FROM=noreply@rabithr.com
SMTP_SECURE=true
```

### خطوات التفعيل:

1. **إنشاء حساب Resend:**
   ```bash
   # 1. اذهب إلى https://resend.com
   # 2. سجّل حساب جديد
   # 3. تحقق من بريدك الإلكتروني
   ```

2. **إضافة Domain:**
   ```bash
   # في لوحة تحكم Resend:
   # Settings → Domains → Add Domain
   # أضف DNS records المطلوبة
   ```

3. **الحصول على API Key:**
   ```bash
   # Settings → API Keys → Create API Key
   # انسخ المفتاح (يبدأ بـ re_)
   ```

### اختبار الإرسال:

```typescript
// server/_core/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@rabithr.com',
  to: 'user@example.com',
  subject: 'مرحباً من رابِط HR',
  html: '<h1>أهلاً بك!</h1>'
});
```

### البدائل المدعومة:

| Provider | SMTP Host | Port |
|----------|-----------|------|
| SendGrid | smtp.sendgrid.net | 587 |
| AWS SES | email-smtp.{region}.amazonaws.com | 587 |
| Mailgun | smtp.mailgun.org | 587 |

---

## 2. 🔴 Redis Cache ⭐⭐⭐

### ✅ الحالة: مفعّل على Railway

```bash
# Environment Variables (Railway)
REDIS_URL=redis://default:password@shuttle.proxy.rlwy.net:26479
DISABLE_REDIS=false
```

### الإعداد المحلي:

```bash
# Docker Compose
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

### الاستخدام في الكود:

```typescript
// server/_core/redis.ts
import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// Cache example
await redis.set('key', 'value', { EX: 3600 }); // 1 hour TTL
const value = await redis.get('key');
```

### الوظائف المدعومة:

- 🔐 **Session Storage**: تخزين جلسات المستخدمين
- 🚀 **Rate Limiting**: تحديد معدل الطلبات
- 📦 **Cache**: تخزين مؤقت للبيانات
- 🔔 **Pub/Sub**: للإشعارات الفورية

---

## 3. ☁️ Cloudinary Storage ⭐⭐

### ✅ الحالة: مفعّل على Railway

```bash
# Environment Variables (Railway)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# أو بشكل منفصل:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxx
```

### خطوات التفعيل:

1. **إنشاء حساب:**
   ```bash
   # 1. اذهب إلى https://cloudinary.com
   # 2. سجّل حساب مجاني (25GB storage)
   # 3. انسخ CLOUDINARY_URL من Dashboard
   ```

2. **إعداد Upload Preset (اختياري):**
   ```bash
   # Settings → Upload → Upload presets
   # أنشئ preset جديد لـ unsigned uploads
   ```

### الاستخدام:

```typescript
// server/_core/storage.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true // استخدم HTTPS
});

// رفع صورة
const result = await cloudinary.uploader.upload(file, {
  folder: 'rabithr/avatars',
  transformation: [
    { width: 200, height: 200, crop: 'fill' }
  ]
});
```

### المميزات:

| الميزة | الوصف |
|--------|-------|
| 🖼️ تحويل الصور | تغيير الحجم والتنسيق تلقائياً |
| 🎬 الفيديو | دعم رفع وتحويل الفيديو |
| 📁 PDF | معاينة ملفات PDF |
| 🔒 الأمان | روابط موقعة ومحمية |

---

## 4. 🤖 DeepSeek AI ⭐⭐

### ✅ الحالة: مفعّل على Railway

```bash
# Environment Variables (Railway)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
```

### خطوات التفعيل:

1. **إنشاء حساب:**
   ```bash
   # 1. اذهب إلى https://platform.deepseek.com
   # 2. سجّل حساب جديد
   # 3. أضف رصيد (الأسعار منخفضة جداً)
   ```

2. **الحصول على API Key:**
   ```bash
   # API Keys → Create new key
   # انسخ المفتاح
   ```

### الاستخدام:

```typescript
// server/_core/llm.ts
import OpenAI from 'openai';

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

const response = await deepseek.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: 'أنت مساعد موارد بشرية ذكي' },
    { role: 'user', content: 'ما هي أفضل ممارسات التوظيف؟' }
  ],
  max_tokens: 2000,
  temperature: 0.7
});
```

### النماذج المتاحة:

| النموذج | الاستخدام | السعر |
|---------|----------|-------|
| deepseek-chat | محادثات عامة | $0.14/1M tokens |
| deepseek-coder | برمجة | $0.14/1M tokens |

### البدائل المدعومة:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_PROVIDER=openai

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
AI_PROVIDER=anthropic
```

---

## 5. 🔍 Sentry Error Tracking ⭐⭐⭐

### ✅ الحالة: مفعّل على Railway

```bash
# Environment Variables (Railway)
SENTRY_DSN=https://xxx@o4509314249187328.ingest.us.sentry.io/xxx
VITE_SENTRY_DSN=https://xxx@o4509314249187328.ingest.us.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxx
```

### خطوات التفعيل:

1. **إنشاء مشروع Sentry:**
   ```bash
   # 1. اذهب إلى https://sentry.io
   # 2. أنشئ Organization جديدة
   # 3. أنشئ Project (اختر Node.js + React)
   ```

2. **الحصول على DSN:**
   ```bash
   # Settings → Projects → [Project] → Client Keys (DSN)
   # انسخ الـ DSN
   ```

### إعداد السيرفر:

```typescript
// server/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration()
  ]
});

// التقاط خطأ
Sentry.captureException(error);
Sentry.captureMessage('Something happened');
```

### إعداد العميل:

```typescript
// client/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1
});
```

### اختبار التكامل:

```bash
# من الـ API
curl -X POST "https://rabit-app-production.up.railway.app/api/trpc/system.testSentryError"
```

### لوحة التحكم:

- 🔗 **URL**: https://rabithr.sentry.io
- 📊 **Issues**: عرض الأخطاء
- 📈 **Performance**: تتبع الأداء
- 🔄 **Releases**: ربط الأخطاء بالإصدارات

---

## 6. 💳 Payment Gateway (Moyasar) ⭐⭐⭐

### ⏳ الحالة: يحتاج تفعيل

```bash
# Environment Variables
# Test Mode (للتطوير)
MOYASAR_API_KEY=sk_test_xxxxxxxxxxxxx
MOYASAR_SECRET_KEY=xxxxxxxxxxxxx
PAYMENT_MODE=test

# Production Mode
MOYASAR_API_KEY=sk_live_xxxxxxxxxxxxx
MOYASAR_SECRET_KEY=xxxxxxxxxxxxx
PAYMENT_MODE=live
```

### خطوات التفعيل:

1. **إنشاء حساب Moyasar:**
   ```bash
   # 1. اذهب إلى https://moyasar.com
   # 2. سجّل كشركة (يتطلب سجل تجاري)
   # 3. أكمل التحقق من الهوية
   # 4. انتظر الموافقة (1-3 أيام عمل)
   ```

2. **الحصول على API Keys:**
   ```bash
   # Dashboard → Settings → API Keys
   # انسخ Secret Key (يبدأ بـ sk_test_ أو sk_live_)
   ```

3. **إعداد Webhook:**
   ```bash
   # Dashboard → Settings → Webhooks
   # URL: https://rabit-app-production.up.railway.app/api/webhooks/moyasar
   # Events: payment.paid, payment.failed, payment.refunded
   ```

### الاستخدام:

```typescript
// server/payments/moyasar.ts
const payment = await moyasar.createPayment({
  amount: 10000, // 100.00 SAR (بالهللات)
  currency: 'SAR',
  description: 'اشتراك شهري - رابِط HR',
  callback_url: 'https://rabithr.com/payment/callback',
  source: {
    type: 'creditcard',
    // ... card details
  }
});
```

### البدائل:

| Provider | الدول المدعومة | العمولة |
|----------|---------------|---------|
| Tap Payment | الخليج + مصر | 2.5% + 1 SAR |
| PayTabs | الخليج | 2.75% |
| HyperPay | السعودية | 2.5% |

---

## 7. 📱 SMS Service (Unifonic) ⭐⭐

### ⏳ الحالة: يحتاج تفعيل

```bash
# Environment Variables
SMS_PROVIDER=unifonic
UNIFONIC_APP_SID=xxxxxxxxxxxxx
UNIFONIC_SENDER_ID=RABITHR
```

### خطوات التفعيل:

1. **إنشاء حساب Unifonic:**
   ```bash
   # 1. اذهب إلى https://www.unifonic.com
   # 2. سجّل كشركة
   # 3. أكمل التحقق
   # 4. اشحن رصيد
   ```

2. **تسجيل Sender ID:**
   ```bash
   # يتطلب موافقة هيئة الاتصالات السعودية
   # المدة: 3-7 أيام عمل
   ```

### الاستخدام:

```typescript
// server/_core/sms.ts
await unifonic.send({
  recipient: '+966xxxxxxxxx',
  body: 'رمز التحقق: 123456',
  senderID: 'RABITHR'
});
```

### البدائل:

| Provider | المنطقة | السعر |
|----------|---------|-------|
| Twilio | عالمي | $0.05/SMS |
| MessageBird | عالمي | $0.04/SMS |
| Nexmo | عالمي | $0.06/SMS |

---

## 8. 🗄️ MySQL Database ⭐⭐⭐

### ✅ الحالة: مفعّل على Railway

```bash
# Environment Variables (Railway)
DATABASE_URL=mysql://root:password@shortline.proxy.rlwy.net:18829/railway
```

### الإعداد المحلي:

```bash
# Docker Compose
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: rabithr
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

### Migrations:

```bash
# تشغيل Migrations
npx drizzle-kit push

# إنشاء Migration جديد
npx drizzle-kit generate

# عرض حالة قاعدة البيانات
npx drizzle-kit studio
```

---

## 9. 🔐 Authentication (JWT + Sessions) ⭐⭐⭐

### ✅ الحالة: مفعّل

```bash
# Environment Variables
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-super-secret-session-key
JWT_EXPIRES_IN=7d
```

### الإعداد:

```typescript
// server/auth/config.ts
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  session: {
    secret: process.env.SESSION_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
```

---

## 10. 🔒 SSL/TLS Certificates ⭐⭐⭐

### ✅ الحالة: مفعّل تلقائياً على Railway

Railway يوفر SSL تلقائياً لجميع التطبيقات.

### للنشر الذاتي (Let's Encrypt):

```bash
# باستخدام Certbot
certbot certonly --webroot \
  -w /var/www/certbot \
  -d rabithr.com \
  -d www.rabithr.com \
  --email admin@rabithr.com \
  --agree-tos
```

---

## 📋 Environment Variables الكاملة

### Railway Production:

```bash
# Database
DATABASE_URL=mysql://root:xxx@shortline.proxy.rlwy.net:18829/railway

# Redis
REDIS_URL=redis://default:xxx@shuttle.proxy.rlwy.net:26479
DISABLE_REDIS=false

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-super-secret-session-key

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxxx
SMTP_FROM=noreply@rabithr.com
SMTP_SECURE=true

# AI
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx

# Storage
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Monitoring
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
VITE_SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxx

# App
NODE_ENV=production
VITE_APP_URL=https://rabit-app-production.up.railway.app
PORT=3000
```

### التطوير المحلي:

```bash
# .env.local
DATABASE_URL=mysql://root:password@localhost:3306/rabithr
REDIS_URL=redis://localhost:6379
DISABLE_REDIS=true  # أو false إذا كان Redis يعمل محلياً

JWT_SECRET=dev-secret-key-for-local-development
SESSION_SECRET=dev-session-secret

# يمكن استخدام نفس مفاتيح الإنتاج للخدمات الخارجية
# أو إنشاء مفاتيح اختبار منفصلة
```

---

## 📋 Checklist النشر | Deployment Checklist

### ✅ الخدمات المفعّلة حالياً:

- [x] 🗄️ MySQL Database - Railway
- [x] 🔴 Redis Cache - Railway  
- [x] 📧 Resend Email - API Key configured
- [x] ☁️ Cloudinary Storage - URL configured
- [x] 🤖 DeepSeek AI - API Key configured
- [x] 🔍 Sentry Monitoring - DSN configured
- [x] 🔐 JWT Authentication - Secrets configured
- [x] 🔒 SSL/TLS - Railway auto-managed

### ⏳ الخدمات المطلوب تفعيلها:

- [ ] 💳 Moyasar Payment Gateway
- [ ] 📱 Unifonic SMS Service
- [ ] 🔔 Firebase Push Notifications
- [ ] 📊 Grafana Monitoring (للنشر الذاتي)

---

## 🔧 فحص الخدمات | Health Checks

### فحص شامل:

```bash
# 1. Health Check الرئيسي
curl https://rabit-app-production.up.railway.app/api/health

# 2. فحص قاعدة البيانات (من خلال API)
curl https://rabit-app-production.up.railway.app/api/trpc/healthCheck

# 3. اختبار Sentry
curl -X POST https://rabit-app-production.up.railway.app/api/trpc/system.testSentryError
```

### فحص محلي:

```bash
# Docker environment
docker exec rabithr-app node -e "console.log('App OK')"
docker exec rabithr-db mysqladmin ping -h localhost
docker exec rabithr-redis redis-cli ping
```

---

## 🆘 استكشاف الأخطاء | Troubleshooting

### مشاكل شائعة وحلولها:

<div dir="rtl">

#### 1. خطأ اتصال قاعدة البيانات:
</div>

```bash
# تحقق من DATABASE_URL
echo $DATABASE_URL

# اختبر الاتصال
mysql -h shortline.proxy.rlwy.net -P 18829 -u root -p
```

<div dir="rtl">

#### 2. خطأ Redis:
</div>

```bash
# تحقق من REDIS_URL
echo $REDIS_URL

# أو عطّل Redis مؤقتاً
DISABLE_REDIS=true
```

<div dir="rtl">

#### 3. البريد لا يُرسل:
</div>

```bash
# تحقق من سجلات الخطأ في Sentry
# أو فحص الـ logs
docker logs rabithr-app 2>&1 | grep -i "email\|resend"
```

<div dir="rtl">

#### 4. خطأ Sentry:
</div>

```bash
# تحقق من DSN
echo $SENTRY_DSN

# اختبر يدوياً
curl -X POST "https://your-app/api/trpc/system.testSentryError"
```

---

## 📞 الدعم والمساعدة | Support

### الموارد:

| المورد | الرابط |
|--------|-------|
| 📚 التوثيق الكامل | `/docs/INDEX.md` |
| 🚀 دليل النشر | `/docs/RAILWAY_DEPLOYMENT.md` |
| 🔧 دليل المطورين | `/docs/DEVELOPER_GUIDE.md` |
| 🐛 تتبع الأخطاء | https://rabithr.sentry.io |

### روابط الخدمات:

| الخدمة | لوحة التحكم |
|--------|-------------|
| Railway | https://railway.app/dashboard |
| Sentry | https://rabithr.sentry.io |
| Resend | https://resend.com/emails |
| Cloudinary | https://console.cloudinary.com |
| DeepSeek | https://platform.deepseek.com |

---

<div align="center">

**آخر تحديث:** يناير 2025  
**الحالة:** ✅ جاهز للإنتاج

</div>
