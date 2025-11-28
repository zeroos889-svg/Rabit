# 🚀 GitHub Actions CI/CD Workflows

هذا المجلد يحتوي على جميع workflows الخاصة بـ CI/CD للمشروع.

## 📋 قائمة Workflows

### 1. 🔄 CI/CD Pipeline (`ci.yml`)
**الوصف**: Pipeline رئيسي للتكامل المستمر والنشر التلقائي

**المراحل**:
- ✅ Lint & Type Check
- ✅ Unit Tests
- ✅ E2E Tests
- ✅ Security Audit
- ✅ Build & Bundle Analysis
- ✅ Docker Build & Push
- ✅ Deploy to Production

**التشغيل**:
- تلقائي عند Push/PR على `main` أو `develop`
- النشر يحدث فقط على `main`

**المدة المتوقعة**: 20-25 دقيقة

---

### 2. 🔍 PR Quality Check (`pr-check.yml`)
**الوصف**: فحص سريع لجودة Pull Requests

**المراحل**:
- ✅ PR Validation
- ✅ PR Size Check
- ✅ Dependency Review
- ✅ Auto-label

**التشغيل**:
- تلقائي عند فتح/تحديث PR

**المدة المتوقعة**: 5-10 دقائق

---

### 3. 🔒 Security Audit (`security.yml`)
**الوصف**: فحص أمني شامل للمشروع

**المراحل**:
- ✅ npm audit
- ✅ Trivy Vulnerability Scan
- ✅ Docker Image Scan
- ✅ CodeQL Analysis
- ✅ License Compliance Check

**التشغيل**:
- تلقائي كل يوم اثنين الساعة 9 صباحاً
- يدوي عبر GitHub UI
- تلقائي عند تغيير `package.json`

**المدة المتوقعة**: 15-20 دقيقة

---

### 4. 📦 Release & Changelog (`release.yml`)
**الوصف**: إنشاء إصدارات تلقائية مع changelog

**المراحل**:
- ✅ Create Release
- ✅ Build & Push Docker Image
- ✅ Deploy Release
- ✅ Notify Release

**التشغيل**:
- تلقائي عند إنشاء tag بصيغة `v*.*.*`
- يدوي عبر GitHub UI

**المدة المتوقعة**: 15-20 دقيقة

---

### 5. 🚀 Deploy (`deploy.yml`)
**الوصف**: نشر يدوي على بيئات مختلفة

**المراحل**:
- ✅ Pre-deployment Tests (اختياري)
- ✅ Build Docker Image
- ✅ Deploy to Railway
- ✅ Deploy to Vercel
- ✅ Run Database Migrations
- ✅ Post-deployment Tests

**التشغيل**:
- يدوي فقط عبر GitHub UI
- يدعم بيئات: development, staging, production

**المدة المتوقعة**: 10-15 دقيقة

---

### 6. 🚀 Performance Monitoring (`performance.yml`)
**الوصف**: مراقبة أداء التطبيق

**المراحل**:
- ✅ Lighthouse Audit
- ✅ Bundle Size Analysis
- ✅ Load Testing
- ✅ Memory Leak Detection

**التشغيل**:
- تلقائي يومياً الساعة 2 صباحاً
- تلقائي عند Push/PR
- يدوي عبر GitHub UI

**المدة المتوقعة**: 20-30 دقيقة

---

## 🔐 GitHub Secrets المطلوبة

### للنشر على Railway:
```
RAILWAY_TOKEN
```

### للنشر على Vercel:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### للتقارير (اختياري):
```
CODECOV_TOKEN
```

### للقاعدة البيانات:
```
DATABASE_URL
```

---

## 📊 إعداد Secrets

1. اذهب إلى: `Settings` → `Secrets and variables` → `Actions`
2. اضغط على `New repository secret`
3. أضف كل secret بقيمته

### الحصول على Railway Token:
```bash
railway login
railway whoami --token
```

### الحصول على Vercel Tokens:
1. اذهب إلى: https://vercel.com/account/tokens
2. أنشئ token جديد
3. احصل على `VERCEL_ORG_ID` و `VERCEL_PROJECT_ID` من إعدادات المشروع

---

## 🏷️ Auto-labeling

الـ PRs يتم تصنيفها تلقائياً بناءً على الملفات المتغيرة:

- `documentation` - ملفات الوثائق
- `frontend` - ملفات Frontend
- `backend` - ملفات Backend
- `database` - ملفات Database
- `tests` - ملفات الاختبارات
- `ci/cd` - ملفات CI/CD
- `dependencies` - تحديثات الحزم
- `configuration` - ملفات الإعدادات
- `security` - ملفات الأمان
- `ui/ux` - ملفات UI/UX
- `api` - ملفات API
- `scripts` - السكريبتات
- `monitoring` - ملفات المراقبة

---

## 🔄 Workflow Triggers

### Push Events:
```yaml
on:
  push:
    branches: [main, develop]
```

### Pull Request Events:
```yaml
on:
  pull_request:
    branches: [main, develop]
```

### Schedule Events:
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # كل يوم اثنين 9 صباحاً
```

### Manual Trigger:
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [development, staging, production]
```

---

## 📈 Monitoring & Artifacts

### عرض Workflow Runs:
https://github.com/YOUR_USERNAME/Rabit/actions

### تحميل Artifacts:
1. اذهب إلى workflow run
2. انزل إلى قسم "Artifacts"
3. حمل:
   - Coverage reports
   - Test results
   - Security audits
   - Performance reports

### مدة الاحتفاظ بـ Artifacts:
- Coverage Reports: 30 يوم
- Test Results: 30 يوم
- Security Audits: 30 يوم
- Build Artifacts: 7 أيام

---

## 🎯 Best Practices

### 1. ✅ استخدم Caching
جميع workflows تستخدم npm caching لتسريع التثبيت

### 2. ✅ Concurrency Control
يتم إلغاء runs السابقة تلقائياً على نفس الفرع

### 3. ✅ Timeouts
كل job له timeout محدد لتجنب استهلاك الموارد

### 4. ✅ Continue on Error
بعض الخطوات تستمر حتى عند الفشل (مثل النشر الاختياري)

### 5. ✅ Environment Protection
بيئة Production محمية وتتطلب موافقة

---

## 🔍 Troubleshooting

### المشكلة: Workflow يفشل في npm ci
**الحل**:
```yaml
- run: npm ci --legacy-peer-deps
```

### المشكلة: Tests تفشل في CI
**الحل**:
1. تحقق من environment variables
2. تأكد من وجود Redis service
3. راجع logs بالتفصيل

### المشكلة: Docker build يفشل
**الحل**:
1. تحقق من Dockerfile
2. راجع build logs
3. تأكد من cache

### المشكلة: Deployment يفشل
**الحل**:
1. تحقق من Secrets
2. راجع permissions
3. تحقق من deployment logs

---

## 📚 الموارد

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## 📊 Status Badges

أضف إلى README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/Rabit/workflows/CI/CD%20Pipeline/badge.svg)
![Security Audit](https://github.com/YOUR_USERNAME/Rabit/workflows/Security%20&%20Dependency%20Audit/badge.svg)
![Performance](https://github.com/YOUR_USERNAME/Rabit/workflows/Performance%20Monitoring/badge.svg)
```

---

## ✅ Checklist قبل أول نشر

- [ ] جميع Secrets مضافة في GitHub
- [ ] Environment protection معدة
- [ ] Branch protection مفعلة
- [ ] `.env.production` معدة
- [ ] Database migrations مختبرة
- [ ] Health check endpoint يعمل
- [ ] جميع الاختبارات تنجح محلياً

---

**تم الإنشاء**: 2025
**الحالة**: ✅ جاهز للاستخدام
