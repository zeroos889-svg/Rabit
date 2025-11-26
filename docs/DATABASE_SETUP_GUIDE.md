# 🗄️ دليل إعداد قاعدة البيانات | Database Setup Guide

## 📊 خيارات قواعد البيانات PostgreSQL للإنتاج

### ⭐ الخيارات الموصى بها

---

## 1️⃣ **Supabase** (الأسهل - مُوصى به للمبتدئين)

### ✅ المميزات:
- **مجاني تماماً** للمشاريع الصغيرة والمتوسطة
- واجهة سهلة الاستخدام
- قاعدة بيانات PostgreSQL كاملة المواصفات
- 500 MB تخزين مجاناً
- Backups تلقائية يومية
- دعم Real-time subscriptions
- Authentication مدمج (اختياري)
- REST API تلقائي
- Dashboard مرئي لإدارة البيانات

### 💰 التسعير:
- **Free tier**: 500 MB storage, 2 GB bandwidth
- **Pro**: $25/month - 8 GB storage, 50 GB bandwidth
- **Team**: $599/month

### 📝 خطوات الإعداد:

#### الطريقة 1: من Dashboard
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجّل دخول بحساب GitHub
3. اضغط **"New Project"**
4. املأ المعلومات:
   - **Name**: `rabit-hr-production`
   - **Database Password**: اختر كلمة مرور قوية (احفظها!)
   - **Region**: `ap-southeast-1` (Singapore - الأقرب للسعودية)
   - **Pricing Plan**: Free
5. اضغط **"Create new project"**
6. انتظر 2-3 دقائق للإعداد
7. انسخ **Connection String** من:
   - Settings → Database → Connection string → URI

#### الحصول على DATABASE_URL:
```
Settings → Database → Connection String → URI
```

ستحصل على شيء مثل:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **مهم**: استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها!

#### ✅ اختبار الاتصال:
```bash
# من Terminal
psql "postgresql://postgres.xxxxx:your-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# إذا نجح، اكتب:
\dt  # عرض الجداول
\q   # خروج
```

---

## 2️⃣ **Railway** (الأسرع - مُوصى به للنشر السريع)

### ✅ المميزات:
- إعداد بنقرة واحدة
- تكامل ممتاز مع GitHub
- سرعة عالية
- دعم فني سريع
- Backups تلقائية
- Metrics مدمج

### 💰 التسعير:
- **Trial**: $5 رصيد مجاني (يكفي لأسبوع تقريباً)
- **Developer**: $5/month minimum (Pay as you go)
- **Team**: $20/month per seat
- **السعر الفعلي**: حوالي $5-10/month لقاعدة بيانات صغيرة

### 📝 خطوات الإعداد:

1. اذهب إلى [railway.app](https://railway.app)
2. سجّل دخول بحساب GitHub
3. اضغط **"New Project"**
4. اختر **"Provision PostgreSQL"**
5. انتظر 30 ثانية
6. اضغط على PostgreSQL database
7. اذهب إلى **"Connect"** tab
8. انسخ **"Postgres Connection URL"**

#### الحصول على DATABASE_URL:
```
Project → PostgreSQL → Connect → Postgres Connection URL
```

ستحصل على:
```
postgresql://postgres:password@region.railway.app:5432/railway
```

#### ✅ اختبار الاتصال:
```bash
# من Terminal
psql "postgresql://postgres:password@region.railway.app:5432/railway"
```

---

## 3️⃣ **Neon** (الأحدث - Serverless)

### ✅ المميزات:
- **مجاني تماماً** للمشاريع الصغيرة
- Serverless - تدفع فقط للاستخدام
- سرعة فائقة (cold start < 100ms)
- Branching للبيانات (مثل Git)
- 0.5 GB تخزين مجاناً
- Autoscaling تلقائي

### 💰 التسعير:
- **Free tier**: 0.5 GB storage, 10 branches
- **Pro**: $19/month - 10 GB storage, unlimited branches
- **Custom**: حسب الطلب

### 📝 خطوات الإعداد:

1. اذهب إلى [neon.tech](https://neon.tech)
2. سجّل دخول بحساب GitHub
3. اضغط **"Create a project"**
4. املأ المعلومات:
   - **Project name**: `rabit-hr`
   - **Region**: `AWS ap-southeast-1` (Singapore)
   - **Postgres version**: 16 (الأحدث)
5. اضغط **"Create project"**
6. انسخ **Connection string**

#### الحصول على DATABASE_URL:
```
Dashboard → Connection Details → Connection string
```

ستحصل على:
```
postgresql://username:password@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🎯 أيهم تختار؟

| الخدمة | الأفضل لـ | السعر | السرعة |
|--------|----------|-------|--------|
| **Supabase** | المبتدئين + ميزات إضافية | مجاني | ⭐⭐⭐⭐ |
| **Railway** | النشر السريع + سهولة الاستخدام | $5-10/شهر | ⭐⭐⭐⭐⭐ |
| **Neon** | Serverless + تكلفة منخفضة | مجاني | ⭐⭐⭐⭐⭐ |

### 💡 توصيتي الشخصية:
**ابدأ بـ Supabase** لأنه:
- مجاني 100%
- سهل الاستخدام
- Dashboard مرئي لإدارة البيانات
- يمكنك الانتقال لاحقاً إذا احتجت

---

## 🚀 بعد الحصول على DATABASE_URL

### 1. اختبر الاتصال محلياً:
```bash
# أضف DATABASE_URL مؤقتاً
export DATABASE_URL="postgresql://your-connection-string"

# شغّل migrations
npm run db:push
# أو
npx drizzle-kit push
```

### 2. تأكد من إنشاء الجداول:
```bash
# افتح قاعدة البيانات
psql "$DATABASE_URL"

# عرض الجداول
\dt

# يجب أن ترى جداول مثل:
# - users
# - employees
# - companies
# - sessions
# - etc.
```

### 3. شغّل setup script:
```bash
./vercel-env-setup.sh
```

عند السؤال عن DATABASE_URL، الصق الرابط الذي حصلت عليه.

---

## 🔒 نصائح أمان مهمة

### ✅ افعل:
- احفظ DATABASE_URL في مكان آمن (مدير كلمات المرور)
- استخدم كلمات مرور قوية (20+ حرف)
- فعّل IP Allowlist إذا كان متاحاً
- فعّل SSL/TLS (معظم الخدمات تفعّله تلقائياً)
- خذ backups دورية

### ❌ لا تفعل:
- لا ترفع DATABASE_URL إلى GitHub
- لا تشارك الرابط علناً
- لا تستخدم نفس قاعدة البيانات للـ development والـ production

---

## 🔄 Migration للبيانات

إذا كان لديك بيانات موجودة:

```bash
# Export من قاعدة البيانات القديمة
pg_dump "OLD_DATABASE_URL" > backup.sql

# Import إلى قاعدة البيانات الجديدة
psql "NEW_DATABASE_URL" < backup.sql
```

---

## 📊 Monitoring & Backups

### Supabase:
- Dashboard → Database → Backups
- Automated daily backups (Free tier: 7 days retention)

### Railway:
- Automatic daily backups
- Manual backups: Dashboard → Backups → Create Backup

### Neon:
- Point-in-time restore
- Branch-based backups

---

## ❓ استكشاف الأخطاء

### خطأ: "connection refused"
```bash
# تأكد من:
1. الرابط صحيح 100%
2. كلمة المرور صحيحة
3. IP address مسموح (تحقق من Firewall settings)
```

### خطأ: "SSL required"
```bash
# أضف ?sslmode=require في نهاية الرابط:
postgresql://user:pass@host:5432/db?sslmode=require
```

### خطأ: "too many connections"
```bash
# استخدم connection pooler:
# Supabase: استخدم "pooler" URL بدلاً من "direct"
# Railway: تلقائي
# Neon: تلقائي
```

---

## 📞 الدعم الفني

### Supabase:
- Discord: [discord.supabase.com](https://discord.supabase.com)
- Docs: [supabase.com/docs](https://supabase.com/docs)

### Railway:
- Discord: [discord.gg/railway](https://discord.gg/railway)
- Docs: [docs.railway.app](https://docs.railway.app)

### Neon:
- Discord: [discord.gg/neon](https://discord.gg/neon)
- Docs: [neon.tech/docs](https://neon.tech/docs)

---

## ✅ Checklist النهائي

- [ ] اخترت خدمة قاعدة البيانات
- [ ] أنشأت المشروع/القاعدة
- [ ] حصلت على DATABASE_URL
- [ ] اختبرت الاتصال محلياً
- [ ] شغّلت migrations (db:push)
- [ ] تأكدت من إنشاء الجداول
- [ ] أضفت DATABASE_URL إلى Vercel
- [ ] أطلقت deployment جديد
- [ ] اختبرت التطبيق في production

---

## 🎉 جاهز؟

بعد الحصول على DATABASE_URL، شغّل:

```bash
./vercel-env-setup.sh
```

أو أخبرني وسأساعدك في باقي الخطوات! 🚀
