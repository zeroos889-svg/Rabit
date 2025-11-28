# 🚀 Quick Start - CI/CD Setup

دليل سريع لتفعيل CI/CD في 5 دقائق.

## ⚡ الخطوات السريعة

### 1️⃣ إضافة GitHub Secrets (2 دقيقة)

```bash
# اذهب إلى:
Settings → Secrets and variables → Actions → New repository secret
```

**الأساسية (مطلوبة للنشر)**:
```
RAILWAY_TOKEN=your_railway_token
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
DATABASE_URL=your_database_url
```

**الاختيارية**:
```
CODECOV_TOKEN=your_codecov_token
```

### 2️⃣ تفعيل Branch Protection (1 دقيقة)

```bash
Settings → Branches → Add rule

Branch: main

☑ Require status checks before merging
☑ Require branches to be up to date

Status checks:
☑ lint-and-typecheck
☑ unit-tests
☑ e2e-tests
☑ security-audit
☑ build-test
```

### 3️⃣ إنشاء Environment (1 دقيقة)

```bash
Settings → Environments → New environment

Name: production

☑ Required reviewers: 1
☑ Deployment branches: main only
```

### 4️⃣ اختبار أول Workflow (1 دقيقة)

```bash
# إنشاء فرع اختبار
git checkout -b test/ci-setup
echo "# CI Test" >> test.md
git add test.md
git commit -m "test: CI setup"
git push origin test/ci-setup

# إنشاء PR على GitHub
# مراقبة Actions tab
```

## ✅ التحقق من النجاح

### يجب أن ترى:

1. **في Actions tab**:
   - ✅ CI/CD Pipeline running
   - ✅ PR Quality Check running

2. **في PR**:
   - ✅ Status checks passing
   - ✅ Auto-labels applied
   - ✅ Size check completed

3. **بعد الدمج في main**:
   - ✅ Docker image built
   - ✅ Deployed to Railway/Vercel

## 🎯 الخطوات التالية

### للاستخدام اليومي:

```bash
# 1. إنشاء فرع للميزة
git checkout -b feature/my-feature

# 2. التطوير والاختبار
npm test
npm run build

# 3. Commit & Push
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature

# 4. إنشاء PR
# CI/CD سيعمل تلقائياً

# 5. بعد الموافقة والدمج
# النشر سيحدث تلقائياً على main
```

### للإصدارات:

```bash
# 1. تحديث الإصدار
npm version patch  # أو minor أو major

# 2. Push tag
git push origin v1.0.0

# 3. Release workflow سيعمل تلقائياً
```

### للنشر اليدوي:

```bash
# اذهب إلى:
Actions → Deploy → Run workflow

# اختر:
- Environment: production
- Skip tests: false

# اضغط: Run workflow
```

## 📚 الموارد

- **الوثائق الكاملة**: `.github/README.md`
- **دليل الاختبار**: `docs/CI_CD_TESTING_GUIDE.md`
- **التقرير الشامل**: `CI_CD_IMPLEMENTATION_REPORT.md`

## 🆘 المساعدة

### مشكلة شائعة: Workflow لا يعمل

```bash
# تحقق من:
1. Secrets مضافة بشكل صحيح
2. Branch protection مفعلة
3. YAML syntax صحيح
4. Permissions صحيحة
```

### مشكلة: Tests تفشل

```bash
# جرب:
1. تشغيل Tests محلياً: npm test
2. تحقق من environment variables
3. راجع logs في Actions
```

### مشكلة: Deployment يفشل

```bash
# تحقق من:
1. RAILWAY_TOKEN صحيح
2. VERCEL_TOKEN صحيح
3. Database accessible
4. Health check endpoint يعمل
```

## 🎉 تم!

CI/CD الآن جاهز! كل push/PR سيتم اختباره تلقائياً، وكل دمج في main سينشر تلقائياً.

---

**الوقت الإجمالي**: ~5 دقائق
**الحالة**: ✅ جاهز للاستخدام
