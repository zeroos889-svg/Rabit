# 🧪 دليل اختبار CI/CD

هذا الدليل يشرح كيفية اختبار جميع workflows الخاصة بـ CI/CD.

## 📋 جدول المحتويات

1. [اختبار CI/CD Pipeline](#1-اختبار-cicd-pipeline)
2. [اختبار PR Quality Check](#2-اختبار-pr-quality-check)
3. [اختبار Security Audit](#3-اختبار-security-audit)
4. [اختبار Release Workflow](#4-اختبار-release-workflow)
5. [اختبار Deploy Workflow](#5-اختبار-deploy-workflow)
6. [اختبار Performance Monitoring](#6-اختبار-performance-monitoring)

---

## 1. اختبار CI/CD Pipeline

### الهدف
التحقق من أن Pipeline الرئيسي يعمل بشكل صحيح على Push/PR.

### الخطوات

#### أ. اختبار على فرع جديد:

```bash
# 1. إنشاء فرع جديد
git checkout -b test/ci-pipeline

# 2. إجراء تغيير بسيط
echo "# Test CI" >> test-ci.md
git add test-ci.md
git commit -m "test: CI pipeline"

# 3. Push الفرع
git push origin test/ci-pipeline

# 4. إنشاء PR
# اذهب إلى GitHub وأنشئ PR من test/ci-pipeline إلى develop
```

#### ب. التحقق من النتائج:

1. اذهب إلى: `Actions` → `CI/CD Pipeline`
2. تحقق من تشغيل جميع Jobs:
   - ✅ Lint & Type Check
   - ✅ Unit Tests
   - ✅ E2E Tests
   - ✅ Security Audit
   - ✅ Build Test

#### ج. النتائج المتوقعة:

```
✅ lint-and-typecheck: success
✅ unit-tests: success
✅ e2e-tests: success
✅ security-audit: success
✅ build-test: success
❌ docker-build: skipped (PR only)
❌ deploy-production: skipped (PR only)
```

#### د. اختبار النشر (main branch):

```bash
# 1. دمج PR في develop
git checkout develop
git merge test/ci-pipeline

# 2. دمج في main
git checkout main
git merge develop
git push origin main

# 3. مراقبة Pipeline
# يجب أن يتم تشغيل docker-build و deploy-production
```

### المدة المتوقعة
- PR: 15-20 دقيقة
- Main branch: 20-25 دقيقة

---

## 2. اختبار PR Quality Check

### الهدف
التحقق من فحص جودة PRs التلقائي.

### الخطوات

#### أ. إنشاء PR اختباري:

```bash
# 1. إنشاء فرع
git checkout -b test/pr-quality

# 2. إجراء تغييرات متعددة
# تعديل ملفات frontend
echo "// Test" >> client/src/App.tsx

# تعديل ملفات backend
echo "// Test" >> server/index.ts

# تعديل dependencies
npm install lodash

# 3. Commit & Push
git add .
git commit -m "test: PR quality checks"
git push origin test/pr-quality

# 4. إنشاء PR
```

#### ب. التحقق من:

1. **PR Validation**:
   - ✅ Lint يعمل على الملفات المتغيرة فقط
   - ✅ TypeScript check يعمل
   - ✅ Tests تعمل

2. **PR Size Check**:
   - ✅ يظهر عدد الملفات المتغيرة
   - ✅ يظهر عدد الأسطر المتغيرة
   - ⚠️ تحذير إذا كان PR كبير جداً

3. **Dependency Review**:
   - ✅ يفحص التبعيات الجديدة
   - ✅ يتحقق من الترخيص
   - ⚠️ تحذير من ثغرات أمنية

4. **Auto-label**:
   - ✅ Labels تلقائية بناءً على الملفات:
     - `frontend` (لملفات client/)
     - `backend` (لملفات server/)
     - `dependencies` (لـ package.json)

### النتائج المتوقعة

```
✅ pr-validation: success
✅ pr-size-check: success
✅ dependency-review: success
✅ auto-label: success
```

---

## 3. اختبار Security Audit

### الهدف
التحقق من الفحص الأمني الشامل.

### الخطوات

#### أ. تشغيل يدوي:

1. اذهب إلى: `Actions` → `Security & Dependency Audit`
2. اضغط على `Run workflow`
3. اختر `main` branch
4. اضغط `Run workflow`

#### ب. التحقق من Jobs:

1. **Security Audit**:
   ```bash
   # يجب أن يظهر:
   - npm audit results
   - عدد الثغرات (critical, high, moderate, low)
   ```

2. **Trivy Scan**:
   ```bash
   # يجب أن يظهر:
   - Filesystem vulnerabilities
   - SARIF report uploaded to GitHub Security
   ```

3. **Docker Scan**:
   ```bash
   # يجب أن يظهر:
   - Docker image vulnerabilities
   - Security issues in base image
   ```

4. **CodeQL Analysis**:
   ```bash
   # يجب أن يظهر:
   - JavaScript/TypeScript analysis
   - Security and quality issues
   ```

5. **License Check**:
   ```bash
   # يجب أن يظهر:
   - قائمة بجميع الترخيصات
   - تحذير من ترخيصات غير متوافقة
   ```

#### ج. مراجعة النتائج:

1. اذهب إلى: `Security` → `Code scanning alerts`
2. راجع جميع التنبيهات
3. تحقق من Artifacts:
   - npm-audit-results
   - trivy-scan-results
   - license-report

### النتائج المتوقعة

```
✅ security-audit: success
✅ trivy-scan: success
✅ docker-scan: success
✅ codeql-analysis: success
✅ license-check: success
✅ security-summary: success
```

### المدة المتوقعة
15-20 دقيقة

---

## 4. اختبار Release Workflow

### الهدف
التحقق من إنشاء الإصدارات التلقائية.

### الخطوات

#### أ. إنشاء tag:

```bash
# 1. تأكد من أنك على main
git checkout main
git pull origin main

# 2. إنشاء tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Push tag
git push origin v1.0.0
```

#### ب. مراقبة Workflow:

1. اذهب إلى: `Actions` → `Release & Changelog`
2. تحقق من تشغيل جميع Jobs:
   - ✅ Create Release
   - ✅ Docker Release
   - ✅ Deploy Release
   - ✅ Notify Release

#### ج. التحقق من النتائج:

1. **GitHub Release**:
   - اذهب إلى: `Releases`
   - تحقق من وجود Release جديد
   - تحقق من Changelog
   - تحقق من Assets (tar.gz, zip)

2. **Docker Image**:
   - اذهب إلى: `Packages`
   - تحقق من وجود image جديد
   - تحقق من Tags:
     - `v1.0.0`
     - `1.0`
     - `1`
     - `latest`

3. **Deployment**:
   - تحقق من النشر على Railway
   - تحقق من Health check

### النتائج المتوقعة

```
✅ create-release: success
✅ docker-release: success
✅ deploy-release: success
✅ notify-release: success
```

### المدة المتوقعة
15-20 دقيقة

---

## 5. اختبار Deploy Workflow

### الهدف
التحقق من النشر اليدوي على بيئات مختلفة.

### الخطوات

#### أ. نشر على Development:

1. اذهب إلى: `Actions` → `Deploy`
2. اضغط `Run workflow`
3. اختر:
   - Branch: `develop`
   - Environment: `development`
   - Skip tests: `false`
4. اضغط `Run workflow`

#### ب. مراقبة Jobs:

```
✅ pre-deploy-tests: running
✅ build-image: waiting
✅ deploy-railway: waiting
✅ deploy-vercel: waiting
✅ run-migrations: waiting
✅ post-deploy-tests: waiting
✅ deployment-summary: waiting
```

#### ج. التحقق من النشر:

1. **Railway**:
   ```bash
   curl https://rabit-hr-development.railway.app/health
   # يجب أن يرجع: {"status": "ok"}
   ```

2. **Vercel**:
   ```bash
   curl https://rabit-hr-development.vercel.app
   # يجب أن يرجع: HTML page
   ```

3. **Database**:
   ```bash
   # تحقق من تشغيل migrations
   # راجع logs في Railway
   ```

#### د. اختبار بيئات أخرى:

```bash
# Staging
Environment: staging
Skip tests: false

# Production
Environment: production
Skip tests: false
```

### النتائج المتوقعة

```
✅ pre-deploy-tests: success
✅ build-image: success
✅ deploy-railway: success
✅ deploy-vercel: success
✅ run-migrations: success
✅ post-deploy-tests: success
✅ deployment-summary: success
```

### المدة المتوقعة
10-15 دقيقة

---

## 6. اختبار Performance Monitoring

### الهدف
التحقق من مراقبة الأداء.

### الخطوات

#### أ. تشغيل يدوي:

1. اذهب إلى: `Actions` → `Performance Monitoring`
2. اضغط `Run workflow`
3. اختر `main` branch
4. اضغط `Run workflow`

#### ب. مراقبة Jobs:

1. **Lighthouse Audit**:
   ```bash
   # يجب أن يظهر:
   - Performance score
   - Accessibility score
   - Best practices score
   - SEO score
   ```

2. **Bundle Size Analysis**:
   ```bash
   # يجب أن يظهر:
   - Total bundle size
   - Breakdown by file
   - Warning if > 50MB
   ```

3. **Load Testing**:
   ```bash
   # يجب أن يظهر:
   - Request rate
   - Response time (p95)
   - Error rate
   - Throughput
   ```

4. **Memory Leak Detection**:
   ```bash
   # يجب أن يظهر:
   - Memory usage over time
   - Potential leaks
   - CPU usage
   ```

#### ج. مراجعة Artifacts:

1. `lighthouse-results` - تقارير Lighthouse
2. `load-test-results` - نتائج Load testing
3. `memory-analysis` - تحليل الذاكرة

### النتائج المتوقعة

```
✅ lighthouse: success
✅ bundle-size: success
✅ load-test: success (scheduled only)
✅ memory-leak: success (scheduled only)
✅ performance-summary: success
```

### المدة المتوقعة
- Basic (Push/PR): 10-15 دقيقة
- Full (Scheduled): 20-30 دقيقة

---

## 📊 جدول اختبار شامل

| Workflow | Trigger | المدة | الأولوية |
|----------|---------|-------|----------|
| CI/CD Pipeline | Push/PR | 20-25 دقيقة | 🔴 عالية |
| PR Quality Check | PR | 5-10 دقائق | 🟡 متوسطة |
| Security Audit | Weekly/Manual | 15-20 دقيقة | 🔴 عالية |
| Release | Tag | 15-20 دقيقة | 🟡 متوسطة |
| Deploy | Manual | 10-15 دقيقة | 🔴 عالية |
| Performance | Daily/Manual | 20-30 دقيقة | 🟢 منخفضة |

---

## ✅ Checklist اختبار كامل

### قبل الاختبار:
- [ ] جميع Secrets مضافة
- [ ] Branch protection مفعلة
- [ ] Environment protection معدة
- [ ] `.env` files جاهزة

### اختبارات أساسية:
- [ ] CI/CD Pipeline على PR
- [ ] CI/CD Pipeline على main
- [ ] PR Quality Check
- [ ] Security Audit (يدوي)
- [ ] Deploy (development)

### اختبارات متقدمة:
- [ ] Release workflow
- [ ] Deploy (staging)
- [ ] Deploy (production)
- [ ] Performance monitoring
- [ ] Dependabot PRs

### بعد الاختبار:
- [ ] مراجعة جميع Artifacts
- [ ] مراجعة Security alerts
- [ ] مراجعة Performance reports
- [ ] توثيق أي مشاكل

---

## 🐛 مشاكل شائعة وحلولها

### 1. Workflow لا يعمل

**المشكلة**: Workflow لا يظهر في Actions

**الحل**:
```bash
# تحقق من صحة YAML
yamllint .github/workflows/*.yml

# تحقق من permissions
ls -la .github/workflows/
```

### 2. Tests تفشل

**المشكلة**: Tests تفشل في CI لكن تعمل محلياً

**الحل**:
```bash
# تحقق من environment variables
# تحقق من Redis service
# راجع logs بالتفصيل
```

### 3. Docker build يفشل

**المشكلة**: Docker build timeout أو يفشل

**الحل**:
```bash
# زيادة timeout
timeout-minutes: 30

# استخدام cache
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 4. Deployment يفشل

**المشكلة**: Deployment يفشل بسبب secrets

**الحل**:
```bash
# تحقق من Secrets في GitHub
# تحقق من permissions
# استخدم continue-on-error: true للاختبار
```

---

## 📚 الموارد

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Testing Workflows](https://docs.github.com/en/actions/guides/about-continuous-integration)

---

**تم التحديث**: 2025
**الحالة**: ✅ جاهز للاستخدام
