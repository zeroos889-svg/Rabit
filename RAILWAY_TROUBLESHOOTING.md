# 🚂 Railway Deployment - تشخيص وحل المشاكل

## 🔍 المشاكل المحتملة والحلول

### 1. مشكلة: Build يفشل

#### الأعراض:
```
Error: Build failed
npm ERR! code ELIFECYCLE
```

#### الأسباب المحتملة:
1. **TypeScript errors** في الكود
2. **Missing dependencies** في package.json
3. **Environment variables** مفقودة
4. **Memory limit** تم تجاوزه

#### الحلول:

##### أ. تحديث railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --legacy-peer-deps && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

##### ب. إضافة nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "python3"]

[phases.install]
cmds = ["npm ci --legacy-peer-deps"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

---

### 2. مشكلة: Database Connection يفشل

#### الأعراض:
```
Error: connect ECONNREFUSED
ENOTFOUND database host
```

#### الحلول:

##### أ. التحقق من Environment Variables
في Railway Dashboard:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
PORT=3000
```

##### ب. تحديث server/_core/env.ts
```typescript
// إضافة fallback للـ DATABASE_URL
export const DATABASE_URL = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL ||
  'postgresql://localhost:5432/rabit_db';
```

---

### 3. مشكلة: Redis Connection يفشل

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
  console.warn('Redis not available, continuing without cache');
  redisClient = null;
}

export { redisClient };
```

##### ب. إضافة Redis في Railway
```bash
# في Railway Dashboard:
1. Add Service → Redis
2. Copy REDIS_URL
3. Add to environment variables
```

---

### 4. مشكلة: Build Timeout

#### الأعراض:
```
Build exceeded time limit
Timeout after 15 minutes
```

#### الحلول:

##### أ. تحسين Build Process
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --mode production",
    "build:server": "tsc -p server/tsconfig.json --skipLibCheck"
  }
}
```

##### ب. استخدام Build Cache
```toml
# في nixpacks.toml
[phases.install]
cacheDirectories = ["node_modules", ".npm"]
```

---

### 5. مشكلة: Memory Limit

#### الأعراض:
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

#### الحلول:

##### أ. زيادة Memory في package.json
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' npm run build:all"
  }
}
```

##### ب. Upgrade Railway Plan
```
Starter: 512MB RAM
Developer: 8GB RAM
Team: 32GB RAM
```

---

### 6. مشكلة: Port Binding

#### الأعراض:
```
Error: listen EADDRINUSE: address already in use
Port 3000 is already in use
```

#### الحلول:

##### أ. استخدام PORT من Environment
```typescript
// في server/_core/index.ts
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
```

---

### 7. مشكلة: Static Files لا تعمل

#### الأعراض:
```
404 Not Found for /assets/*
Cannot GET /index.html
```

#### الحلول:

##### أ. تحديث Express Static
```typescript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../dist/public');

app.use(express.static(distPath));

// Fallback لـ SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
```

---

### 8. مشكلة: Environment Variables

#### الأعراض:
```
Error: JWT_SECRET is not defined
Missing required environment variable
```

#### الحلول:

##### أ. قائمة Environment Variables المطلوبة
```bash
# في Railway Dashboard → Variables

# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Redis (optional)
REDIS_URL=redis://...

# Auth
JWT_SECRET=your-secret-key-min-32-chars
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret

# App
NODE_ENV=production
PORT=3000
APP_URL=https://your-app.railway.app

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

---

### 9. مشكلة: Health Check يفشل

#### الأعراض:
```
Health check failed
Service marked as unhealthy
```

#### الحلول:

##### أ. إضافة Health Check Endpoint
```typescript
// في server/_core/index.ts
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.execute(sql`SELECT 1`);
    
    // Check Redis (if available)
    if (redisClient) {
      await redisClient.ping();
    }
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      redis: redisClient ? 'connected' : 'not configured'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message
    });
  }
});
```

---

### 10. مشكلة: Migrations لا تعمل

#### الأعراض:
```
Error: relation "users" does not exist
Table not found
```

#### الحلول:

##### أ. إضافة Migration Script
```json
{
  "scripts": {
    "start": "npm run db:push && npm run start:server",
    "start:server": "NODE_ENV=production tsx server/_core/index.ts"
  }
}
```

##### ب. أو استخدام Railway Deploy Hook
```bash
# في Railway Dashboard → Settings → Deploy
Build Command: npm ci && npm run build && npm run db:push
Start Command: npm run start:server
```

---

## 🔧 ملف railway.json المحسّن

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --legacy-peer-deps && npm run build && npm run db:push"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "sleepApplication": false
  }
}
```

---

## 🔍 خطوات التشخيص

### 1. فحص Logs
```bash
# في Railway Dashboard
View Logs → Filter by:
- Build logs
- Deploy logs
- Application logs
```

### 2. فحص Environment Variables
```bash
# تحقق من:
✓ DATABASE_URL موجود
✓ JWT_SECRET موجود (32+ chars)
✓ NODE_ENV=production
✓ PORT محدد
```

### 3. فحص Build Output
```bash
# يجب أن ترى:
✓ dist/public/ folder
✓ dist/server/ folder
✓ node_modules/ installed
```

### 4. اختبار محلي
```bash
# قبل Deploy
npm run build
NODE_ENV=production npm start

# تحقق من:
curl http://localhost:3000/health
```

---

## 📊 Checklist قبل Deploy

- [ ] `npm run build` يعمل محلياً
- [ ] `npm start` يعمل محلياً
- [ ] جميع Environment Variables مضافة
- [ ] Database متاح ويمكن الوصول إليه
- [ ] Health check endpoint يعمل
- [ ] Static files تُبنى بشكل صحيح
- [ ] TypeScript errors محلولة
- [ ] Tests تنجح

---

## 🆘 الحصول على المساعدة

### 1. Railway Logs
```bash
# في Dashboard
Deployments → Latest → View Logs
```

### 2. Railway Support
```bash
# في Dashboard
Help → Contact Support
```

### 3. Community
```bash
Railway Discord: https://discord.gg/railway
Railway Forum: https://help.railway.app
```

---

## 📝 ملاحظات مهمة

### للإنتاج:
1. ✅ استخدم PostgreSQL من Railway (لا SQLite)
2. ✅ أضف Redis للـ caching
3. ✅ فعّل Health checks
4. ✅ راقب Logs بانتظام
5. ✅ استخدم Environment Variables للـ secrets

### للتطوير:
1. ✅ اختبر Build محلياً أولاً
2. ✅ استخدم Railway CLI للـ debugging
3. ✅ راجع Logs فوراً عند الفشل
4. ✅ احتفظ بنسخة احتياطية من Database

---

**تم التحديث**: 2025
**الحالة**: ✅ جاهز للاستخدام
