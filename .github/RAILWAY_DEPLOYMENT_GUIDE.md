# 🚂 دليل نشر Railway الشامل

## ✅ المتطلبات الأساسية

### 1. الملفات الموجودة
- ✅ `railway.json` - إعدادات Railway
- ✅ `nixpacks.toml` - تحسين البناء
- ✅ `package.json` - التبعيات والسكريبتات
- ✅ Health check endpoints في `/health`

### 2. Environment Variables المطلوبة
```bash
# Database (مطلوب)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth (مطلوب)
JWT_SECRET=your-secret-min-32-chars
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret

# App (مطلوب)
NODE_ENV=production
PORT=3000

# Redis (اختياري - للـ caching)
REDIS_URL=redis://host:6379

# Email (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# Monitoring (اختياري)
SENTRY_DSN=your-sentry-dsn
```

---

## 🚀 خطوات النشر

### الطريقة 1: من Railway Dashboard (موصى بها)

#### 1. إنشاء Project جديد
```bash
1. اذهب إلى: https://railway.app
2. اضغط "New Project"
3. اختر "Deploy from GitHub repo"
4. اختر repository: Rabit
5. اضغط "Deploy Now"
```

#### 2. إضافة Database
```bash
1. في Project Dashboard
2. اضغط "+ New"
3. اختر "Database" → "PostgreSQL"
4. انتظر حتى يتم الإنشاء
5. انسخ DATABASE_URL
```

#### 3. إضافة Redis (اختياري)
```bash
1. في Project Dashboard
2. اضغط "+ New"
3. اختر "Database" → "Redis"
4. انتظر حتى يتم الإنشاء
5. انسخ REDIS_URL
```

#### 4. إضافة Environment Variables
```bash
1. اذهب إلى Service → Variables
2. اضغط "+ New Variable"
3. أضف كل variable من القائمة أعلاه
4. اضغط "Add" لكل واحد
```

#### 5. إعادة Deploy
```bash
1. اذهب إلى Deployments
2. اضغط "Redeploy"
3. انتظر حتى ينتهي البناء
4. تحقق من Logs
```

---

### الطريقة 2: من Railway CLI

#### 1. تثبيت Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# أو باستخدام npm
npm install -g @railway/cli
```

#### 2. تسجيل الدخول
```bash
railway login
```

#### 3. ربط Project
```bash
# في مجلد المشروع
cd /Users/saleh/Desktop/RabtHR/Rabit

# ربط مع Railway
railway link

# أو إنشاء project جديد
railway init
```

#### 4. إضافة Services
```bash
# إضافة PostgreSQL
railway add --database postgres

# إضافة Redis (اختياري)
railway add --database redis
```

#### 5. إضافة Variables
```bash
# طريقة 1: من CLI
railway variables set JWT_SECRET=your-secret
railway variables set SESSION_SECRET=your-session-secret
railway variables set COOKIE_SECRET=your-cookie-secret

# طريقة 2: من ملف
railway variables set --from-file .env.production
```

#### 6. Deploy
```bash
railway up
```

---

## 🔍 التحقق من النشر

### 1. فحص Build Logs
```bash
# في Dashboard
Deployments → Latest → Build Logs

# أو من CLI
railway logs --build
```

### 2. فحص Deploy Logs
```bash
# في Dashboard
Deployments → Latest → Deploy Logs

# أو من CLI
railway logs
```

### 3. اختبار Health Check
```bash
# احصل على URL
railway domain

# اختبر
curl https://your-app.railway.app/health

# يجب أن يرجع:
{
  "status": "ok",
  "timestamp": "2025-11-29T...",
  "uptime": 123.45,
  "database": "connected",
  "redis": "connected"
}
```

---

## 🐛 حل المشاكل الشائعة

### مشكلة 1: Build يفشل

#### الأعراض:
```
npm ERR! code ELIFECYCLE
Build failed with exit code 1
```

#### الحلول:

##### أ. تحقق من TypeScript Errors
```bash
# محلياً
npm run type-check

# إصلاح الأخطاء
npm run lint
```

##### ب. تحقق من Dependencies
```bash
# محلياً
npm ci --legacy-peer-deps
npm run build

# إذا نجح، push التغييرات
```

##### ج. زيادة Memory
```bash
# في railway.json
{
  "build": {
    "buildCommand": "NODE_OPTIONS='--max-old-space-size=4096' npm run build"
  }
}
```

---

### مشكلة 2: Database Connection يفشل

#### الأعراض:
```
Error: connect ECONNREFUSED
ENOTFOUND database host
```

#### الحلول:

##### أ. تحقق من DATABASE_URL
```bash
# في Railway Dashboard
Variables → DATABASE_URL

# يجب أن يكون بصيغة:
postgresql://user:pass@host.railway.internal:5432/railway
```

##### ب. تحقق من Database Service
```bash
# في Dashboard
Database Service → Status: Active
```

##### ج. اختبار الاتصال
```bash
# من CLI
railway run node scripts/test-db-connection.mjs
```

---

### مشكلة 3: Application Crashes

#### الأعراض:
```
Application exited with code 1
Restarting... (attempt 1/10)
```

#### الحلول:

##### أ. فحص Logs
```bash
railway logs --tail 100
```

##### ب. تحقق من Environment Variables
```bash
# يجب أن تكون موجودة:
railway variables

# إذا مفقودة، أضفها:
railway variables set JWT_SECRET=your-secret
```

##### ج. تحقق من Health Check
```bash
# في railway.json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

---

### مشكلة 4: Static Files لا تعمل

#### الأعراض:
```
404 Not Found for /assets/*
Cannot GET /index.html
```

#### الحلول:

##### أ. تحقق من Build Output
```bash
# يجب أن يحتوي على:
dist/
├── public/
│   ├── index.html
│   └── assets/
└── server/
```

##### ب. تحقق من Express Static
```typescript
// في server/_core/index.ts
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../dist/public');

app.use(express.static(distPath));
```

---

### مشكلة 5: Redis Connection يفشل

#### الأعراض:
```
Error: Redis connection failed
ECONNREFUSED redis:6379
```

#### الحلول:

##### أ. جعل Redis اختياري
```typescript
// في server/_core/redisClient.ts
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
} catch (error) {
  console.warn('Redis not available');
  redisClient = null;
}
```

##### ب. إضافة Redis Service
```bash
# في Dashboard
+ New → Database → Redis

# أو من CLI
railway add --database redis
```

---

## 📊 Monitoring

### 1. فحص Metrics
```bash
# في Dashboard
Service → Metrics

# راقب:
- CPU Usage
- Memory Usage
- Network Traffic
- Request Rate
```

### 2. فحص Logs
```bash
# Real-time logs
railway logs --tail

# Filter logs
railway logs --filter "error"
```

### 3. Health Checks
```bash
# Simple check
curl https://your-app.railway.app/health

# Detailed check
curl https://your-app.railway.app/health/detailed

# Redis check
curl https://your-app.railway.app/health/redis
```

---

## 🔄 CI/CD Integration

### GitHub Actions مع Railway

الـ workflows الموجودة في `.github/workflows/` تدعم Railway:

#### في ci.yml:
```yaml
deploy-production:
  name: 🚀 Deploy to Production
  runs-on: ubuntu-latest
  needs: [docker-build]
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: 🚂 Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway up --service backend
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

#### للتفعيل:
```bash
1. احصل على Railway Token:
   railway login
   railway whoami --token

2. أضف إلى GitHub Secrets:
   Settings → Secrets → RAILWAY_TOKEN

3. Push إلى main:
   git push origin main
```

---

## 📝 Best Practices

### 1. Environment Variables
- ✅ لا تضع secrets في الكود
- ✅ استخدم Railway Variables
- ✅ استخدم .env.example للتوثيق

### 2. Database
- ✅ استخدم PostgreSQL من Railway
- ✅ فعّل Backups
- ✅ راقب Connection Pool

### 3. Monitoring
- ✅ راقب Logs بانتظام
- ✅ فعّل Health Checks
- ✅ استخدم Sentry للأخطاء

### 4. Performance
- ✅ استخدم Redis للـ caching
- ✅ فعّل Compression
- ✅ راقب Memory Usage

---

## 🆘 الحصول على المساعدة

### Railway Support
- 📧 Email: team@railway.app
- 💬 Discord: https://discord.gg/railway
- 📚 Docs: https://docs.railway.app

### Project Support
- 📖 راجع: `RAILWAY_TROUBLESHOOTING.md`
- 🐛 افتح Issue على GitHub
- 💬 اسأل الفريق

---

## ✅ Checklist النشر

### قبل النشر:
- [ ] `npm run build` يعمل محلياً
- [ ] `npm start` يعمل محلياً
- [ ] جميع Tests تنجح
- [ ] TypeScript errors محلولة
- [ ] Environment Variables جاهزة

### أثناء النشر:
- [ ] Build logs نظيفة
- [ ] Deploy logs نظيفة
- [ ] Health check يعمل
- [ ] Database متصل
- [ ] Redis متصل (إذا مُفعّل)

### بعد النشر:
- [ ] Application يعمل
- [ ] Static files تُحمّل
- [ ] API endpoints تعمل
- [ ] Database queries تعمل
- [ ] Logs نظيفة

---

**تم التحديث**: 2025
**الحالة**: ✅ جاهز للاستخدام
