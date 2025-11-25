# 🚀 Deployment Checklist
# دليل نشر التطبيق للإنتاج

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration ⚙️
- [ ] نسخ `.env.production.example` إلى `.env.production`
- [ ] تكوين `DATABASE_URL` مع بيانات قاعدة البيانات الحقيقية
- [ ] تكوين `REDIS_URL` (مطلوب للإنتاج)
- [ ] توليد `JWT_SECRET` قوي: `openssl rand -base64 32`
- [ ] توليد `SESSION_SECRET` قوي: `openssl rand -base64 32`
- [ ] توليد `COOKIE_SECRET` قوي: `openssl rand -base64 32`
- [ ] تحديث `APP_URL` بعنوان التطبيق الفعلي
- [ ] إضافة `VITE_GA_MEASUREMENT_ID` (Google Analytics 4)
- [ ] تكوين `CORS_ORIGIN` و `ALLOWED_ORIGINS`
- [ ] تأكيد `NODE_ENV=production`

### 2. Database Setup 🗄️
- [ ] إعداد PostgreSQL database (Railway/Supabase/AWS RDS)
- [ ] إعداد Redis instance (Railway/Upstash)
- [ ] اختبار الاتصال بقاعدة البيانات
- [ ] عمل backup لقاعدة البيانات الحالية (إن وجدت)
- [ ] تشغيل migrations: `npm run db:push`

### 3. Code Quality ✅
- [ ] تشغيل TypeScript type check: `npm run type-check`
- [ ] إصلاح جميع TypeScript errors
- [ ] تشغيل linter: `npm run lint`
- [ ] تشغيل tests (إن وجدت): `npm test`
- [ ] بناء production build: `npm run build`
- [ ] التأكد من عدم وجود build errors

### 4. Security 🔒
- [ ] تغيير جميع الأسرار الافتراضية
- [ ] تفعيل HTTPS في production
- [ ] تكوين CORS بشكل صحيح
- [ ] تفعيل rate limiting
- [ ] مراجعة security headers في Nginx
- [ ] تفعيل CSRF protection
- [ ] إزالة أي hardcoded credentials

### 5. Performance ⚡
- [ ] تفعيل Redis caching
- [ ] تكوين CDN للـ static assets (اختياري)
- [ ] تفعيل Gzip compression في Nginx
- [ ] تحسين database indexes
- [ ] اختبار page load speed
- [ ] تفعيل PWA Service Worker

### 6. Monitoring & Logging 📊
- [ ] إعداد Sentry للـ error tracking (اختياري)
- [ ] تكوين Google Analytics 4
- [ ] إعداد log rotation
- [ ] تكوين health check endpoint
- [ ] إعداد uptime monitoring

### 7. Backup Strategy 💾
- [ ] إعداد automated database backups
- [ ] اختبار عملية backup/restore
- [ ] تحديد retention policy للـ backups
- [ ] تخزين backups في مكان آمن منفصل

---

## 🐳 Docker Deployment

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Build and start services
docker-compose -f docker-compose.production.yml up -d --build

# 2. Check status
docker-compose -f docker-compose.production.yml ps

# 3. View logs
docker-compose -f docker-compose.production.yml logs -f

# 4. Run migrations
docker-compose -f docker-compose.production.yml exec app npm run db:push
```

### Option 2: Using Deployment Script

```bash
# Make script executable (first time only)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production
```

---

## ☁️ Cloud Platform Deployment

### Railway Deployment 🚂

1. **Create New Project**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init

   # Link to existing project (optional)
   railway link
   ```

2. **Add PostgreSQL Database**
   - Go to Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL` from connection string

3. **Add Redis**
   - Click "New" → "Database" → "Redis"
   - Copy `REDIS_URL` from connection string

4. **Configure Environment Variables**
   - Go to project settings
   - Add all variables from `.env.production`
   - Ensure `DATABASE_URL` and `REDIS_URL` are set

5. **Deploy**
   ```bash
   railway up
   ```

### Vercel Deployment (Frontend + Serverless)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure `vercel.json`**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/public",
     "devCommand": "npm run dev",
     "installCommand": "npm install"
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Environment Variables**
   - Add via Vercel dashboard: Settings → Environment Variables
   - Add all `VITE_*` variables

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - t2.medium or better
   - Configure security groups (ports: 22, 80, 443, 3000)

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   # Clone repository
   git clone https://github.com/your-username/rabit.git
   cd rabit

   # Configure environment
   cp .env.production.example .env.production
   nano .env.production
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.production.yml up -d --build
   ```

4. **Setup Nginx (with SSL)**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## 🔄 Post-Deployment Tasks

### Immediate Checks ✓
- [ ] زيارة التطبيق والتأكد من أنه يعمل
- [ ] اختبار تسجيل الدخول/التسجيل
- [ ] اختبار جميع الصفحات الرئيسية
- [ ] التحقق من `/health` endpoint
- [ ] فحص browser console للأخطاء
- [ ] اختبار PWA features
- [ ] التحقق من Analytics tracking

### Performance Tests 📈
- [ ] تشغيل Lighthouse audit
- [ ] قياس Core Web Vitals
- [ ] اختبار page load speed
- [ ] اختبار mobile responsiveness
- [ ] فحص API response times

### Security Scan 🔍
- [ ] فحص SSL certificate
- [ ] اختبار CORS configuration
- [ ] التحقق من security headers
- [ ] اختبار rate limiting
- [ ] فحص exposed endpoints

---

## 🆘 Troubleshooting

### Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs app

# Check environment variables
docker-compose -f docker-compose.production.yml exec app env | grep DATABASE

# Restart services
docker-compose -f docker-compose.production.yml restart
```

### Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.production.yml exec app npm run db:studio

# Check database logs
docker-compose -f docker-compose.production.yml logs db
```

### Redis Connection Issues
```bash
# Check Redis logs
docker-compose -f docker-compose.production.yml logs redis

# Test Redis connection
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Test certificate
sudo certbot certificates
```

---

## 📱 Rollback Procedure

If something goes wrong:

```bash
# 1. Stop current deployment
docker-compose -f docker-compose.production.yml down

# 2. Restore database from backup
docker-compose -f docker-compose.production.yml exec -T db psql -U rabit rabit_db < backups/TIMESTAMP/database_backup.sql

# 3. Checkout previous version
git checkout <previous-commit-hash>

# 4. Redeploy
./scripts/deploy.sh production
```

---

## 📞 Support Contacts

- **Technical Issues**: [your-tech-email@domain.com]
- **Database Issues**: [your-db-admin@domain.com]
- **Security Issues**: [your-security@domain.com]

---

## 📝 Deployment Log Template

```
Date: YYYY-MM-DD
Time: HH:MM
Deployed By: [Name]
Git Commit: [hash]
Environment: [production/staging]

Changes:
- [List major changes]

Tests Performed:
- [ ] Smoke tests passed
- [ ] Performance tests passed
- [ ] Security scan passed

Issues Encountered:
- [None / List issues]

Rollback Plan:
- [Steps if needed]

Sign-off: [Name]
```

---

**✅ Remember: Always test in staging before deploying to production!**
