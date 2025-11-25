# 🚀 إضافة المتغيرات البيئية إلى Vercel يدوياً

## 🔴 الطريقة 1: من Dashboard (الأسهل)

### الخطوات:
1. اذهب إلى: https://vercel.com/zeroos889-svg/rabit/settings/environment-variables
2. أضف المتغيرات التالية واحداً تلو الآخر:

---

## ⚡ المتغيرات الأساسية (CRITICAL - يجب إضافتها)

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: mysql://root:CMMyDTJYozRfFgTcccnMfcEpwRbqqWMz@shortline.proxy.rlwy.net:18829/railway
Environments: ✅ Production ✅ Preview ✅ Development
```

### 2. JWT_SECRET
```
Key: JWT_SECRET
Value: 3R2hsLN6302/VtGessDItlQCZN9lxHwHLctkO3hnomY=
Environments: ✅ Production ✅ Preview ✅ Development
```

### 3. SESSION_SECRET
```
Key: SESSION_SECRET
Value: H9JzN1JUXQgQRPt6I17uU8pkYE+NZUdrrNiGfCyyBZU=
Environments: ✅ Production ✅ Preview ✅ Development
```

### 4. NODE_ENV
```
Key: NODE_ENV
Value: production
Environments: ✅ Production only
```

---

## 🟡 المتغيرات الموصى بها (RECOMMENDED)

### 5. VITE_APP_URL
```
Key: VITE_APP_URL
Value: https://rabit-omega.vercel.app
Environments: ✅ Production ✅ Preview
```

### 6. APP_URL
```
Key: APP_URL
Value: https://rabit-omega.vercel.app
Environments: ✅ Production ✅ Preview
```

### 7. VITE_APP_TITLE
```
Key: VITE_APP_TITLE
Value: رابِط | Rabit - نظام إدارة الموارد البشرية
Environments: ✅ Production ✅ Preview ✅ Development
```

### 8. VITE_APP_LOGO
```
Key: VITE_APP_LOGO
Value: /LOGO.svg
Environments: ✅ Production ✅ Preview ✅ Development
```

### 9. SESSION_MAX_AGE
```
Key: SESSION_MAX_AGE
Value: 604800000
Environments: ✅ Production ✅ Preview
```

### 10. LOG_LEVEL
```
Key: LOG_LEVEL
Value: info
Environments: ✅ Production ✅ Preview
```

### 11. RATE_LIMIT_WINDOW_MS
```
Key: RATE_LIMIT_WINDOW_MS
Value: 900000
Environments: ✅ Production ✅ Preview
```

### 12. RATE_LIMIT_MAX_REQUESTS
```
Key: RATE_LIMIT_MAX_REQUESTS
Value: 100
Environments: ✅ Production ✅ Preview
```

---

## ⚪ المتغيرات الاختيارية (إذا كنت تستخدم هذه الخدمات)

### Redis (للأداء)
```
Key: REDIS_URL
Value: [احصل عليه من Upstash.com - مجاني]
Environments: ✅ Production ✅ Preview
```

### Google Analytics
```
Key: VITE_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
Environments: ✅ Production
```

### Sentry (مراقبة الأخطاء)
```
Key: SENTRY_DSN
Value: https://xxxxx@sentry.io/xxxxx
Environments: ✅ Production ✅ Preview

Key: VITE_SENTRY_DSN
Value: https://xxxxx@sentry.io/xxxxx
Environments: ✅ Production ✅ Preview
```

### SMTP Email
```
Key: SMTP_HOST
Value: smtp.gmail.com
Environments: ✅ Production ✅ Preview

Key: SMTP_PORT
Value: 587
Environments: ✅ Production ✅ Preview

Key: SMTP_USER
Value: your-email@gmail.com
Environments: ✅ Production ✅ Preview

Key: SMTP_PASSWORD
Value: your-app-password
Environments: ✅ Production ✅ Preview

Key: SMTP_FROM
Value: Rabit <noreply@rabit.sa>
Environments: ✅ Production ✅ Preview
```

### Cloudinary (تخزين الصور)
```
Key: CLOUDINARY_URL
Value: cloudinary://api_key:api_secret@cloud_name
Environments: ✅ Production ✅ Preview
```

---

## 🔴 الطريقة 2: Bulk Import (أسرع!)

1. اذهب إلى: https://vercel.com/zeroos889-svg/rabit/settings/environment-variables
2. اضغط **"Add Another"** → **"Import from .env"**
3. الصق المحتوى التالي:

```env
# Critical Variables
DATABASE_URL=mysql://root:CMMyDTJYozRfFgTcccnMfcEpwRbqqWMz@shortline.proxy.rlwy.net:18829/railway
JWT_SECRET=3R2hsLN6302/VtGessDItlQCZN9lxHwHLctkO3hnomY=
SESSION_SECRET=H9JzN1JUXQgQRPt6I17uU8pkYE+NZUdrrNiGfCyyBZU=
NODE_ENV=production

# Application Config
VITE_APP_URL=https://rabit-omega.vercel.app
APP_URL=https://rabit-omega.vercel.app
VITE_APP_TITLE=رابِط | Rabit - نظام إدارة الموارد البشرية
VITE_APP_LOGO=/LOGO.svg

# Session & Security
SESSION_MAX_AGE=604800000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. اختر Environments: **Production + Preview + Development**
5. اضغط **"Import"**

---

## ✅ بعد إضافة المتغيرات

### خيار 1: Redeploy من Dashboard
1. اذهب إلى: https://vercel.com/zeroos889-svg/rabit
2. اضغط على آخر Deployment
3. اضغط **"⋮"** (three dots) → **"Redeploy"**
4. اختر **"Use existing Build Cache"** ✅
5. اضغط **"Redeploy"**

### خيار 2: Push إلى GitHub
```bash
git add .
git commit -m "docs: Add environment variables setup guides"
git push origin main
```

الـ deployment سيبدأ تلقائياً!

---

## 🔍 التحقق من النجاح

### 1. انتظر 2-3 دقائق للـ deployment

### 2. افتح التطبيق:
```
https://rabit-omega.vercel.app
```

### 3. اختبر تسجيل الدخول:
- يجب أن تظهر صفحة Login
- حاول إنشاء حساب جديد
- إذا نجح = كل شيء يعمل! ✅

### 4. تحقق من الـ Logs:
```
https://vercel.com/zeroos889-svg/rabit/logs
```

ابحث عن:
- ✅ Database connected
- ✅ Server started
- ❌ لا توجد أخطاء "Environment variable missing"

---

## ⚠️ استكشاف الأخطاء

### خطأ: "DATABASE_URL is not defined"
➡️ تأكد أنك أضفت DATABASE_URL وأعدت الـ deployment

### خطأ: "JWT_SECRET must be at least 16 characters"
➡️ تأكد من نسخ JWT_SECRET كاملاً (مع علامة = في النهاية)

### خطأ: "Can't reach database"
➡️ تأكد من DATABASE_URL صحيح 100% (بدون مسافات)

### التطبيق بطيء جداً
➡️ أضف Redis (Upstash مجاني): https://upstash.com

---

## 📞 هل تحتاج مساعدة؟

إذا واجهت أي مشكلة:
1. افتح: https://vercel.com/zeroos889-svg/rabit/logs
2. انسخ الخطأ
3. أخبرني وسأساعدك! 🚀

---

## 🎉 تهانينا!

بعد إضافة المتغيرات والـ redeploy، تطبيقك جاهز للاستخدام! 

🔗 **رابط التطبيق**: https://rabit-omega.vercel.app

✨ **الخطوات التالية**:
- [ ] اختبر تسجيل الدخول
- [ ] أضف بيانات الموظفين
- [ ] دعوة الفريق
- [ ] استمتع! 🎊
