# 🚀 CI/CD - دليل البدء السريع
## CI/CD Quick Start Guide

**الوقت الإجمالي**: 1-2 ساعة  
**التاريخ**: 5 ديسمبر 2024

---

## 📝 الملخص التنفيذي

هذا دليل سريع لإعداد CI/CD كاملاً لمشروع رابِط. اتبع الخطوات بالترتيب.

---

## ✅ ما تم إنجازه مسبقاً

- [x] إنشاء 6 workflows كاملة
- [x] إضافة 13 auto-labels للـ PRs
- [x] تكوين Dependabot
- [x] إنشاء جميع ملفات التوثيق

---

## 🎯 المتبقي (4 خطوات رئيسية)

### **الخطوة 1: إضافة GitHub Secrets** ⏱️ 15-30 دقيقة

**الدليل الكامل**: [CI_CD_SECRETS_SETUP.md](./CI_CD_SECRETS_SETUP.md)

#### الطريقة السريعة:

```bash
# 1. تثبيت GitHub CLI
brew install gh  # macOS
# أو
sudo apt install gh  # Linux

# 2. تسجيل الدخول
gh auth login

# 3. إضافة الـ Secrets (استبدل القيم بالقيم الحقيقية)
gh secret set DATABASE_URL
gh secret set JWT_SECRET -b "$(openssl rand -base64 32)"
gh secret set SESSION_SECRET -b "$(openssl rand -base64 32)"
gh secret set REDIS_URL
gh secret set DEEPSEEK_API_KEY
gh secret set RESEND_API_KEY
gh secret set CLOUDINARY_URL
gh secret set SENTRY_DSN
gh secret set RAILWAY_TOKEN

# 4. التحقق
gh secret list
```

#### الـ Secrets المطلوبة:

| Secret | كيفية الحصول عليه | أولوية |
|--------|-------------------|---------|
| `DATABASE_URL` | من Railway/Supabase/Neon | 🔴 إلزامي |
| `JWT_SECRET` | `openssl rand -base64 32` | 🔴 إلزامي |
| `SESSION_SECRET` | `openssl rand -base64 32` | 🔴 إلزامي |
| `REDIS_URL` | من Upstash/Railway | 🟡 اختياري |
| `DEEPSEEK_API_KEY` | من platform.deepseek.com | 🔴 إلزامي |
| `RESEND_API_KEY` | من resend.com | 🔴 إلزامي |
| `CLOUDINARY_URL` | من cloudinary.com | 🔴 إلزامي |
| `SENTRY_DSN` | من sentry.io | 🟡 اختياري |
| `RAILWAY_TOKEN` | من Railway Account Settings | 🔴 إلزامي للنشر |

---

### **الخطوة 2: تفعيل Branch Protection Rules** ⏱️ 10-15 دقيقة

**الدليل الكامل**: [CI_CD_BRANCH_PROTECTION.md](./CI_CD_BRANCH_PROTECTION.md)

#### الطريقة السريعة:

1. **اذهب إلى**:
   ```
   https://github.com/zeroos889-svg/Rabit/settings/branches
   ```

2. **اضغط "Add rule"**

3. **املأ الإعدادات**:
   ```yaml
   Branch name pattern: main
   
   ☑ Require a pull request before merging
     ☑ Require approvals: 1
     ☑ Dismiss stale pull request approvals
   
   ☑ Require status checks to pass before merging
     ☑ Require branches to be up to date before merging
     Status checks (اختر بعد أول run):
       ☑ ci / lint
       ☑ ci / type-check
       ☑ ci / test-unit
       ☑ ci / test-integration
       ☑ ci / build
   
   ☑ Require conversation resolution before merging
   ☑ Include administrators
   ❌ Allow force pushes
   ❌ Allow deletions
   ```

4. **احفظ التغييرات**

---

### **الخطوة 3: إنشاء Production Environment** ⏱️ 10-15 دقيقة

**الدليل الكامل**: [CI_CD_PRODUCTION_ENV.md](./CI_CD_PRODUCTION_ENV.md)

#### الطريقة السريعة:

1. **اذهب إلى**:
   ```
   https://github.com/zeroos889-svg/Rabit/settings/environments
   ```

2. **اضغط "New environment"**

3. **اسم Environment**: `production`

4. **إعدادات الحماية**:
   ```yaml
   ☑ Required reviewers: 1
     - اختر @zeroos889-svg
   
   ⚠️ Wait timer: 5 minutes
   
   ☑ Deployment branches: Selected branches
     Branches: main
   
   ☑ Prevent self-review
   ```

5. **أضف Environment Secrets**:
   - `RAILWAY_TOKEN` (للنشر)
   - `DATABASE_URL` (Production)
   - `REDIS_URL` (Production)
   - `SENTRY_DSN` (Production)

6. **احفظ**

---

### **الخطوة 4: اختبار الإعداد** ⏱️ 30-45 دقيقة

**الدليل الكامل**: [CI_CD_TESTING_GUIDE.md](./CI_CD_TESTING_GUIDE.md)

#### اختبار سريع:

```bash
# 1. اختبار CI Workflow
git checkout -b test/ci-setup
echo "# CI Setup Test" >> README.md
git add .
git commit -m "test: verify CI/CD setup"
git push origin test/ci-setup

# 2. أنشئ PR من GitHub
# 3. راقب Actions - يجب أن تنجح جميع الـ checks
# 4. تحقق من auto-labels
# 5. اطلب review
# 6. وافق وادمج

# 7. تحقق من deployment approval
# (سيظهر في Actions بعد merge إلى main)
```

#### التحقق من النجاح:

```bash
# يجب أن ترى:
✓ CI workflow نجح
✓ Auto-labels أضيفت للـ PR
✓ Branch protection يمنع الـ push المباشر
✓ Deployment يطلب موافقة
```

---

## 🎯 قائمة التحقق النهائية

### GitHub Secrets:
- [ ] `DATABASE_URL` ✅
- [ ] `JWT_SECRET` ✅
- [ ] `SESSION_SECRET` ✅
- [ ] `REDIS_URL` (اختياري)
- [ ] `DEEPSEEK_API_KEY` ✅
- [ ] `RESEND_API_KEY` ✅
- [ ] `CLOUDINARY_URL` ✅
- [ ] `SENTRY_DSN` (اختياري)
- [ ] `RAILWAY_TOKEN` ✅

### Branch Protection:
- [ ] تم إنشاء rule لـ `main`
- [ ] Require PR reviews (1+)
- [ ] Require status checks
- [ ] Require conversation resolution
- [ ] Include administrators
- [ ] تم اختبار عدم إمكانية Push مباشر

### Production Environment:
- [ ] تم إنشاء `production` environment
- [ ] Required reviewers (1+)
- [ ] Wait timer (5 دقائق)
- [ ] Deployment branches (main فقط)
- [ ] Environment secrets مضافة

### Testing:
- [ ] CI workflow يعمل
- [ ] PR workflow يعمل
- [ ] Auto-labels تعمل
- [ ] Security workflow يعمل
- [ ] Deployment workflow يعمل

---

## 🆘 استكشاف أخطاء سريع

### المشكلة: Workflow يفشل - "Secret not found"
```bash
# الحل: تحقق من الـ secrets
gh secret list
# أضف المفقود
gh secret set SECRET_NAME
```

### المشكلة: لا أستطيع Push لـ main
```
✅ هذا صحيح! Branch protection يعمل
استخدم PR بدلاً من ذلك
```

### المشكلة: Status checks لا تظهر
```
1. قم بـ run للـ workflow مرة واحدة
2. انتظر اكتماله
3. ارجع لـ Branch protection settings
4. ستظهر الـ checks تلقائياً
```

### المشكلة: Deployment لا يطلب موافقة
```
1. تأكد من `environment: production` في deploy.yml
2. تأكد من Required reviewers في Environment settings
3. تأكد من الـ push لـ main وليس فرع آخر
```

---

## 📞 الروابط السريعة

| الصفحة | الرابط |
|--------|--------|
| GitHub Actions | https://github.com/zeroos889-svg/Rabit/actions |
| Repository Settings | https://github.com/zeroos889-svg/Rabit/settings |
| Secrets | https://github.com/zeroos889-svg/Rabit/settings/secrets/actions |
| Branches | https://github.com/zeroos889-svg/Rabit/settings/branches |
| Environments | https://github.com/zeroos889-svg/Rabit/settings/environments |

---

## 📚 المراجع الكاملة

- [CI/CD Guide الرئيسي](./CI_CD_GUIDE.md)
- [دليل GitHub Secrets](./CI_CD_SECRETS_SETUP.md)
- [دليل Branch Protection](./CI_CD_BRANCH_PROTECTION.md)
- [دليل Production Environment](./CI_CD_PRODUCTION_ENV.md)
- [دليل الاختبار](./CI_CD_TESTING_GUIDE.md)
- [دليل الـ Workflows](./CI_WORKFLOW_README.md)

---

## 🎉 بعد الانتهاء

بمجرد إكمال جميع الخطوات، لديك الآن:

✅ **CI/CD Pipeline كامل ومؤتمت**  
✅ **حماية كاملة للفرع الرئيسي**  
✅ **عملية مراجعة إلزامية للكود**  
✅ **نشر آمن مع موافقات**  
✅ **فحص أمني تلقائي**  
✅ **اختبارات تلقائية**

### الخطوات التالية:

1. **ابدأ بتحسينات الأمان**:
   - Rate Limiting
   - Session Management
   - Password Policies

2. **راجع**: [TODO.md](../TODO.md) للأولويات القادمة

---

**✨ تاريخ الإنشاء**: 5 ديسمبر 2024  
**🎯 الحالة**: جاهز للتنفيذ  
**⏱️ الوقت المتوقع**: 1-2 ساعة  
**👤 المسؤول**: فريق رابِط

---

## 💡 نصيحة أخيرة

**اعمل خطوة بخطوة**. لا تتعجل. تأكد من نجاح كل خطوة قبل الانتقال للتالية.

**🚀 حظ موفق!**
