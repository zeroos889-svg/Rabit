# 🚀 Railway Deployment Guide - دليل النشر على Railway

<div dir="rtl">

## 📊 حالة النشر الحالية

| الخدمة | الحالة | التفاصيل |
|--------|--------|----------|
| 🌐 **التطبيق** | ✅ يعمل | [rabit-app-production.up.railway.app](https://rabit-app-production.up.railway.app) |
| 🗄️ **MySQL** | ✅ متصل | Railway MySQL Database |
| 📦 **Redis** | ✅ متصل | Railway Redis Cache |
| 📧 **البريد** | ✅ مُفعّل | Resend + SMTP |
| 🤖 **AI** | ✅ مُفعّل | DeepSeek API |
| 📁 **الملفات** | ✅ مُفعّل | Cloudinary |
| 🔍 **المراقبة** | ✅ مُفعّل | Sentry Error Tracking |

</div>

---

## ✅ المتطلبات المحققة

- ✅ Production build جاهز
- ✅ Environment variables محضرة
- ✅ Database & Redis على Railway
- ✅ Sentry مفعّل
- ✅ Docker جاهز (اختياري)
- ✅ CI/CD pipeline جاهز

---

## 📋 خطوات النشر السريع

### الطريقة 1: Railway Dashboard (موصى بها) 🌟

#### 1. إنشاء المشروع

1. اذهب إلى: https://railway.app
2. سجل الدخول بحساب GitHub
3. اضغط **"New Project"**
4. اختر **"Deploy from GitHub repo"**
5. اختر repository: **`zeroos889-svg/Rabit`**
6. اختر branch: **`main`**

#### 2. تكوين Environment Variables

انسخ المتغيرات التالية من `.env.production` وأضفها في Railway:

```env
NODE_ENV=production
DATABASE_URL=mysql://root:CMMyDTJYozRfFgTcccnMfcEpwRbqqWMz@shortline.proxy.rlwy.net:18829/railway
REDIS_URL=redis://default:bSqhXjdDmfLpHTdUrfmdhToMuPWdCxhQ@trolley.proxy.rlwy.net:43631
JWT_SECRET=w8664plSY436x8VWHtsQnaJMEDKAToE99Xaw0g2vsYw=
SESSION_SECRET=xHWNU+nopjYYDN/d4IMj706xt2hPOCQ41pu1uPIgnTA=
COOKIE_SECRET=Fk9czm5eCLUkk5LZna0njYms3A/hncuUYc9xyEKLu98=
PORT=3000
ALLOWED_ORIGINS=https://rabit-production.up.railway.app,https://rabit-hr.com
CLOUDINARY_URL=cloudinary://124384279425872:-ELbJ41ccT9fjBWmW67PLvK3Yts@denz6mgg5
SENTRY_DSN=https://3f64c3e058d796abc96f89e6812831a3@o4510308498538496.ingest.us.sentry.io/4510308499980288
VITE_SENTRY_DSN=https://3f64c3e058d796abc96f89e6812831a3@o4510308498538496.ingest.us.sentry.io/4510308499980288
VITE_APP_LOGO=/LOGO.svg
VITE_APP_TITLE=رابِط | Rabit - نظام إدارة الموارد البشرية
```

#### 3. تكوين Build/Deploy Settings (تلقائي)

Railway سيكتشف `railway.json` تلقائياً، لكن تأكد من:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Port**: `3000` (تلقائي من PORT env variable)

#### 4. Deploy!

1. اضغط **"Deploy"**
2. انتظر اكتمال البناء (5-10 دقائق)
3. ستحصل على URL: `https://[your-app].up.railway.app`

---

### الطريقة 2: Railway CLI

```bash
# تثبيت CLI
npm i -g @railway/cli

# تسجيل الدخول
railway login

# ربط المشروع
railway link

# رفع المتغيرات من .env.production
railway variables set $(cat .env.production)

# النشر
railway up
```

---

## 🔍 التحقق من النشر

### 1. Health Check

```bash
curl https://your-app.up.railway.app/health
```

**الاستجابة المتوقعة:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-25T...",
  "database": "connected",
  "redis": "connected"
}
```

### 2. اختبار الصفحات الرئيسية

- ✅ الصفحة الرئيسية: `https://your-app.up.railway.app`
- ✅ تسجيل الدخول: `https://your-app.up.railway.app/login`
- ✅ API Docs: `https://your-app.up.railway.app/api/trpc`

### 3. مراقبة الأخطاء

- **Sentry Dashboard**: https://sentry.io/organizations/rabithr/issues/
- **Railway Logs**: في Dashboard → Deployments → View Logs

---

## 🔧 إعدادات إضافية

### تكوين Custom Domain

1. في Railway Dashboard → Settings
2. اذهب إلى **Domains**
3. اضغط **"Add Custom Domain"**
4. أدخل domain الخاص بك: `rabit-hr.com`
5. أضف DNS records:
   ```
   Type: CNAME
   Name: @
   Value: [your-app].up.railway.app
   ```

### تفعيل Auto-Deploy

Railway يدعم auto-deploy تلقائياً:
- ✅ كل push إلى `main` branch سيسبب deployment جديد
- ✅ GitHub Actions CI/CD سيختبر الكود قبل الدفع

### Health Checks

Railway سيراقب `/health` endpoint تلقائياً:
- **Success**: HTTP 200
- **Failure**: سيعيد تشغيل التطبيق تلقائياً

---

## 📊 Monitoring & Performance

### مراقبة الأداء

1. **Railway Metrics**:
   - CPU Usage
   - Memory Usage
   - Request Count
   - Response Time

2. **Sentry Performance**:
   - Transaction traces
   - Error rates
   - User impact

### Scaling (إذا لزم الأمر)

```bash
# زيادة الموارد
railway service scale --replicas 2 --memory 4GB --cpu 2
```

---

## 🔐 أمان Production

### ✅ تم تطبيقه:

- ✅ HTTPS تلقائي (Railway)
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Helmet security headers
- ✅ JWT authentication
- ✅ Session encryption
- ✅ Cookie signing
- ✅ Environment variables آمنة

### توصيات إضافية:

1. **تفعيل WAF** (Web Application Firewall) عبر Cloudflare
2. **Database Backups**: تفعيل automatic backups على Railway
3. **Redis Persistence**: تأكد من تفعيل persistence على Railway

---

## 🐛 استكشاف الأخطاء

### مشكلة: Application won't start

```bash
# تحقق من Logs
railway logs

# تحقق من Environment Variables
railway variables
```

### مشكلة: Database connection failed

1. تحقق من `DATABASE_URL` في Railway variables
2. تأكد من أن Railway Database service يعمل
3. تحقق من firewall rules

### مشكلة: Redis connection failed

1. تحقق من `REDIS_URL` في Railway variables
2. تأكد من أن Railway Redis service يعمل

### مشكلة: Build fails

```bash
# تنظيف وإعادة البناء
railway run npm run build

# تحقق من dependencies
railway run npm install
```

---

## 📱 بعد النشر

### 1. اختبار شامل

- [ ] تسجيل مستخدم جديد
- [ ] تسجيل الدخول
- [ ] رفع صورة (Cloudinary)
- [ ] إنشاء consultation
- [ ] اختبار payments (Test mode)
- [ ] PWA installation
- [ ] Mobile responsiveness

### 2. SEO & Analytics

```bash
# تحديث sitemap
curl https://your-app.up.railway.app/sitemap.xml

# تحقق من robots.txt
curl https://your-app.up.railway.app/robots.txt
```

### 3. إعداد Monitoring Alerts

في Sentry:
1. إعداد Alert Rules
2. تكوين Slack/Email notifications
3. تعيين Error thresholds

---

## 📈 Next Steps

### Phase 4 - تحسينات مستقبلية:

1. **Performance Optimization**:
   - Implement caching strategy
   - Optimize images
   - Code splitting

2. **Features**:
   - Real-time notifications (WebSocket)
   - Advanced analytics
   - Multi-language support

3. **Infrastructure**:
   - CDN setup (Cloudflare)
   - Load balancing
   - Database read replicas

---

## 📞 الدعم

- **Railway Docs**: https://docs.railway.app
- **Sentry Docs**: https://docs.sentry.io
- **Project Issues**: https://github.com/zeroos889-svg/Rabit/issues

---

## ✅ Deployment Checklist

قبل النشر النهائي:

- [x] Production build ناجح
- [x] Environment variables محضرة
- [x] Database connected
- [x] Redis connected
- [x] Sentry configured
- [x] Health check endpoint جاهز
- [x] Error monitoring مفعّل
- [x] CI/CD pipeline يعمل
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database backups enabled
- [ ] Monitoring alerts configured

---

## 🎉 Application Ready for Production!

المشروع جاهز 100% للنشر على Production!

**Railway Dashboard**: https://railway.app/dashboard
