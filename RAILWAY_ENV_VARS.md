# متغيرات البيئة لـ Railway
# Railway Environment Variables

## المتغيرات المطلوبة (Required Variables)

```env
# قاعدة البيانات (MySQL on Railway)
DATABASE_URL=mysql://root:CMMyDTJYozRfFgTcccnMfcEpwRbqqWMz@shortline.proxy.rlwy.net:18829/railway

# مفاتيح الأمان (Security Keys)
JWT_SECRET=a8f2d1e9c7b4a3f6e8d2c1b5a9f4e7d3c6b8a2e5f1d9c4b7a3e6f8d2c1b5a9f4
SESSION_SECRET=b7c4d2e8f1a9c6b3e5d8f2a4c7b1e9d3f6a8c2b5e4d7f1a3c6b9e2d5f8a1c4

# البيئة
NODE_ENV=production
```

## متغيرات Redis (إذا أردت استخدام Redis)

```env
# استخدم Reference في Railway لربط REDIS_URL من خدمة Redis
REDIS_URL=${REDIS_URL}

# أو انسخ الرابط مباشرة من خدمة Redis:
# REDIS_URL=redis://default:bSqhXjdDmfLpHTdUrfmdhToMuPWdCxhQ@redis.railway.internal:6379
```

## متغيرات اختيارية (Optional)

```env
# Sentry للتتبع
SENTRY_DSN=

# OpenAI/DeepSeek للذكاء الاصطناعي
DEEPSEEK_API_KEY=
OPENAI_API_KEY=

# البريد الإلكتروني (SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@rabit.sa
```

## خطوات الإعداد

1. **افتح Railway Dashboard**
   https://railway.app/project/94c734a8-69d4-421a-829c-67f0ff34d8b5

2. **أنشئ خدمة جديدة**
   - اضغط "+ New"
   - اختر "GitHub Repo"
   - اختر "zeroos889-svg/Rabit"

3. **أضف متغيرات البيئة**
   - اضغط على الخدمة الجديدة
   - اذهب لـ "Variables"
   - اضغط "Raw Editor"
   - الصق المتغيرات أعلاه

4. **اربط Redis (اختياري)**
   - في Variables، أضف REDIS_URL
   - اضغط "Add Reference"
   - اختر "Redis RABIT" → "REDIS_URL"

5. **أنشئ Domain**
   - اذهب لـ "Settings"
   - ضمن "Networking" اضغط "Generate Domain"
   - أو أضف domain مخصص

## ملاحظات مهمة

- تأكد من ترقية حساب Railway إلى Hobby أو أعلى
- Railway يكتشف تلقائياً `railway.json` للإعدادات
- البناء يستخدم: `npm install && npm run build`
- التشغيل يستخدم: `npm run start`
