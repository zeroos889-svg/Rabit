# دليل إعداد بيئة الإنتاج في GitHub
## Production Environment Setup Guide

**الأولوية**: 🔴 عالية جداً  
**الوقت المتوقع**: 10-15 دقيقة  
**المسؤول**: مدير المشروع

---

## 📋 نظرة عامة

GitHub Environments توفر طبقة إضافية من الأمان والتحكم في عمليات النشر، خاصة لبيئة الإنتاج.

---

## 🎯 لماذا نحتاج Production Environment؟

### ✅ الفوائد:
- **تحكم في النشر**: يتطلب موافقة يدوية قبل النشر
- **حماية الـ Secrets**: secrets خاصة ببيئة الإنتاج فقط
- **تتبع النشر**: سجل كامل لجميع عمليات النشر
- **قيود الفروع**: النشر فقط من `main` أو فروع محددة
- **تأخير النشر**: إضافة فترة انتظار قبل النشر
- **حماية إضافية**: منع النشر العرضي

### ❌ بدون Environment:
- أي workflow يمكنه النشر
- لا يوجد تحكم في عمليات النشر
- صعوبة تتبع متى وكيف تم النشر
- احتمالية نشر كود غير مختبر

---

## 🔧 خطوات إنشاء Production Environment

### 1. الانتقال إلى Environments

```
Repository → Settings → Environments → New environment
```

أو مباشرة:
```
https://github.com/zeroos889-svg/Rabit/settings/environments
```

---

### 2. إنشاء Environment جديد

#### اسم Environment:
```
production
```

**ملاحظة**: يجب أن يطابق الاسم المستخدم في `.github/workflows/deploy.yml`

---

### 3. إعدادات Environment الأساسية

#### أ) Deployment Protection Rules ✅

##### 1. Required Reviewers

**تفعيل**: ☑ إلزامي

```yaml
Required reviewers:
  - اختر على الأقل 1-2 مراجعين
  - يُفضل أن يكونوا senior developers أو tech leads
```

**الفائدة**:
- يمنع النشر التلقائي
- يتطلب موافقة يدوية
- يعطي فرصة للمراجعة النهائية

**مثال**:
```
Reviewers:
  ✓ @zeroos889-svg (Owner)
  ✓ @senior-dev (Senior Developer)
```

---

##### 2. Wait Timer

**تفعيل**: ⚠️ اختياري (موصى به)

```yaml
Wait timer: 5 minutes
```

**الفائدة**:
- يعطي فترة للتراجع عن النشر
- يسمح بالتحقق من آخر لحظة
- يمنع النشر السريع المتهور

**القيم الموصى بها**:
- المشاريع الصغيرة: 2-5 دقائق
- المشاريع المتوسطة: 5-10 دقائق
- المشاريع الكبيرة: 10-30 دقيقة

---

##### 3. Deployment branches

**تفعيل**: ☑ إلزامي

```yaml
Selected branches and tags
Branches:
  ✓ main
```

**الفائدة**:
- النشر فقط من الفرع الرئيسي
- يمنع النشر من فروع التطوير
- ضمان استقرار الكود المنشور

**خيارات أخرى**:
```yaml
# للسماح بـ hotfix branches أيضاً:
Branches:
  ✓ main
  ✓ hotfix/*
  
# أو للسماح بـ release branches:
Branches:
  ✓ main
  ✓ release/*
```

---

##### 4. Prevent self-review

**تفعيل**: ☑ موصى به

```yaml
☑ Prevent self-review
```

**الفائدة**:
- الشخص الذي يطلب النشر لا يمكنه الموافقة عليه
- يضمن مراجعة مستقلة

---

##### 5. Required deployment approvals

**القيمة الموصى بها**:
```yaml
Number of required approvals: 1
```

**للمشاريع الحرجة**:
```yaml
Number of required approvals: 2
```

---

#### ب) Environment Secrets ✅

أضف الـ secrets الخاصة بـ production فقط:

##### 1. RAILWAY_TOKEN (للنشر)
```
Name: RAILWAY_TOKEN
Value: [Railway production token]
```

##### 2. DATABASE_URL (Production)
```
Name: DATABASE_URL
Value: [Production database URL]
```

##### 3. REDIS_URL (Production)
```
Name: REDIS_URL
Value: [Production Redis URL]
```

##### 4. SENTRY_DSN (Production)
```
Name: SENTRY_DSN
Value: [Production Sentry DSN]
```

**ملاحظة**: استخدم قيم production مختلفة عن development

---

#### ج) Environment Variables

أضف متغيرات خاصة بـ production:

```yaml
NODE_ENV: production
APP_ENV: production
LOG_LEVEL: error
ENABLE_DEBUG: false
```

---

## 📝 إعدادات إضافية (اختيارية)

### 1. Custom Deployment Protection Rules

يمكنك إضافة قواعد مخصصة باستخدام GitHub Apps:

**أمثلة**:
- **Datadog**: التحقق من عدم وجود incidents
- **PagerDuty**: التحقق من عدم وجود alerts
- **ServiceNow**: التحقق من موافقات التغيير

---

### 2. Deployment History

GitHub يحفظ تلقائياً:
- تاريخ كل deployment
- من قام بالموافقة
- من طلب الـ deployment
- حالة الـ deployment (نجح/فشل)
- logs كاملة

---

## 🎯 إعدادات موصى بها لـ Rabit

```yaml
Environment Name: production

Protection Rules:
  ✅ Required reviewers: 1
    - @zeroos889-svg
  
  ⚠️ Wait timer: 5 minutes
  
  ✅ Deployment branches:
    - main
  
  ✅ Prevent self-review: Enabled

Environment Secrets:
  - RAILWAY_TOKEN
  - DATABASE_URL (Production)
  - REDIS_URL (Production)
  - SENTRY_DSN (Production)

Environment Variables:
  - NODE_ENV=production
  - APP_ENV=production
  - LOG_LEVEL=error
```

---

## 🔄 إنشاء Environments إضافية

### Staging Environment

```yaml
Name: staging

Protection Rules:
  ✅ Required reviewers: 1 (optional)
  ⚠️ Wait timer: 2 minutes
  ✅ Deployment branches: develop

Secrets:
  - DATABASE_URL (Staging)
  - REDIS_URL (Staging)
  - SENTRY_DSN (Staging)

Variables:
  - NODE_ENV=staging
  - APP_ENV=staging
  - LOG_LEVEL=debug
```

---

### Preview Environment

```yaml
Name: preview

Protection Rules:
  ❌ Required reviewers: None
  ❌ Wait timer: None
  ✅ Deployment branches: feature/*

Secrets:
  - DATABASE_URL (Preview)
  - REDIS_URL (Preview)

Variables:
  - NODE_ENV=preview
  - APP_ENV=preview
  - LOG_LEVEL=debug
```

---

## ✅ التحقق من الإعداد

### 1. مراجعة Environment

```
Settings → Environments → production
```

تأكد من:
```
✓ Required reviewers: Configured
✓ Wait timer: 5 minutes
✓ Deployment branches: main only
✓ Prevent self-review: Enabled
✓ Environment secrets: Added
```

---

### 2. اختبار Deployment Approval Flow

```bash
# 1. قم بتعديل بسيط
git checkout main
git pull
echo "# Deployment Test" >> README.md
git add .
git commit -m "test: deployment approval flow"
git push origin main

# 2. سيتم تشغيل الـ workflow تلقائياً
# 3. سيتوقف عند خطوة النشر
# 4. ستصلك رسالة طلب موافقة
# 5. راجع التغييرات
# 6. وافق على النشر
# 7. انتظر اكتمال النشر
```

---

### 3. مراجعة Deployment History

```
Repository → Environments → production → View deployment history
```

ستجد:
- تاريخ ووقت كل deployment
- الـ commit الذي تم نشره
- من طلب النشر
- من وافق على النشر
- حالة النشر
- المدة الزمنية

---

## 🔗 ربط Environment مع Workflow

تأكد من وجود هذا في `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://rabit.sa
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service production
```

**المهم**:
```yaml
environment:
  name: production  # يجب أن يطابق اسم الـ environment
  url: https://rabit.sa  # رابط الموقع بعد النشر
```

---

## 🆘 استكشاف الأخطاء

### المشكلة: Workflow لا يطلب موافقة

**الحل**:
1. تأكد من إضافة `environment: production` في الـ workflow
2. تأكد من تفعيل Required reviewers
3. تأكد من أن الفرع مسموح به

---

### المشكلة: لا أرى خيار الموافقة

**الحل**:
1. تأكد من أنك ضمن قائمة Required reviewers
2. تحقق من البريد الإلكتروني
3. انتقل إلى Actions → اختر الـ workflow → Review deployments

---

### المشكلة: Environment secrets لا تعمل

**الحل**:
1. تأكد من صحة اسم الـ secret
2. تأكد من إضافته في Environment وليس Repository
3. تأكد من استخدام `${{ secrets.SECRET_NAME }}`

---

## 📊 قائمة التحقق

- [ ] تم إنشاء `production` environment
- [ ] تم إضافة Required reviewers (1+)
- [ ] تم تعيين Wait timer (5 دقائق)
- [ ] تم تحديد Deployment branches (main)
- [ ] تم تفعيل Prevent self-review
- [ ] تم إضافة Environment secrets
- [ ] تم إضافة Environment variables
- [ ] تم تحديث deploy.yml workflow
- [ ] تم اختبار deployment approval flow
- [ ] تم التحقق من deployment history

---

## 📞 الخطوة التالية

بعد إكمال Production Environment، انتقل إلى:
- [دليل اختبار CI/CD](./CI_CD_TESTING_GUIDE.md)
- [دليل استكشاف أخطاء CI/CD](./CI_CD_TROUBLESHOOTING.md)

---

## 📚 موارد إضافية

- [GitHub Docs: Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Best Practices for Production Deployments](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments)

---

## 🎉 مبروك!

الآن لديك:
- ✅ حماية كاملة لعمليات النشر
- ✅ تحكم في من يمكنه النشر
- ✅ تتبع كامل لجميع عمليات النشر
- ✅ إمكانية التراجع عن النشر
- ✅ فصل كامل بين البيئات

---

**✨ تاريخ الإنشاء**: 5 ديسمبر 2024  
**📝 آخر تحديث**: 5 ديسمبر 2024  
**👤 المسؤول**: فريق رابِط
