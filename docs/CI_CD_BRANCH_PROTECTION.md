# دليل تفعيل Branch Protection Rules
## Branch Protection Rules Setup Guide

**الأولوية**: 🔴 عالية جداً  
**الوقت المتوقع**: 10-15 دقيقة  
**المسؤول**: مدير المشروع

---

## 📋 نظرة عامة

Branch Protection Rules تحمي الفروع المهمة من التغييرات المباشرة وتضمن مرور جميع التعديلات عبر عملية مراجعة.

---

## 🎯 لماذا نحتاج Branch Protection؟

### ✅ الفوائد:
- منع الـ push المباشر للـ `main` branch
- إلزامية مراجعة الكود (Code Review)
- التأكد من نجاح جميع الاختبارات قبل الدمج
- حماية من الأخطاء البشرية
- تتبع كامل لجميع التغييرات
- ضمان جودة الكود

### ❌ بدون Branch Protection:
- أي شخص يمكنه الـ push مباشرة
- لا يوجد ضمان لجودة الكود
- احتمالية تخريب Production
- صعوبة تتبع التغييرات

---

## 🔧 خطوات التفعيل

### 1. الانتقال إلى Settings

```
Repository → Settings → Branches → Add rule
```

أو مباشرة:
```
https://github.com/zeroos889-svg/Rabit/settings/branches
```

---

### 2. إعدادات Branch Protection الأساسية

#### أ) Branch name pattern
```
main
```

**ملاحظة**: يمكنك استخدام wildcards مثل:
- `main` - فرع واحد فقط
- `release/*` - جميع فروع الإصدارات
- `hotfix/*` - جميع فروع الإصلاحات العاجلة

---

#### ب) Require a pull request before merging ✅

**تفعيل**: ☑ إلزامي

**الإعدادات الفرعية**:

##### 1. Require approvals
```
☑ Enabled
Number of required approvals: 1
```

**الفائدة**: يضمن مراجعة شخص آخر للكود

**ملاحظة**:
- للفرق الصغيرة: 1 reviewer كافي
- للفرق الكبيرة: 2+ reviewers موصى به

---

##### 2. Dismiss stale pull request approvals
```
☑ Enabled
```

**الفائدة**: إذا تم تعديل الكود بعد الموافقة، يتم إلغاء الموافقة تلقائياً

---

##### 3. Require review from Code Owners
```
☐ Disabled (اختياري)
```

**متى تفعله**:
- عند وجود ملف `CODEOWNERS`
- عند وجود مسؤولين محددين لأجزاء معينة من الكود

---

##### 4. Require approval of the most recent reviewable push
```
☑ Enabled
```

**الفائدة**: يضمن مراجعة آخر التغييرات

---

#### ج) Require status checks to pass ✅

**تفعيل**: ☑ إلزامي

**الإعدادات**:

##### 1. Require branches to be up to date
```
☑ Enabled
```

**الفائدة**: يضمن أن الفرع محدث مع `main` قبل الدمج

---

##### 2. Status checks المطلوبة:

اختر الـ checks التالية (ستظهر بعد أول تشغيل للـ workflows):

**CI Workflow**:
```
☑ ci / lint (Node.js 20.x)
☑ ci / type-check (Node.js 20.x)
☑ ci / test-unit (Node.js 20.x)
☑ ci / test-integration (Node.js 20.x)
☑ ci / build (Node.js 20.x)
```

**Security Workflow**:
```
☑ security / security-scan
☑ security / dependency-check
```

**Performance Workflow** (اختياري):
```
☑ performance / lighthouse
```

**ملاحظة**: ستظهر هذه الخيارات تلقائياً بعد تشغيل الـ workflows لأول مرة

---

#### د) Require conversation resolution ✅

```
☑ Enabled
```

**الفائدة**: يضمن حل جميع التعليقات قبل الدمج

---

#### هـ) Require signed commits

```
☐ Disabled (اختياري)
```

**متى تفعله**:
- للمشاريع عالية الأمان
- عند الحاجة لضمان أصالة الـ commits

**كيفية الإعداد**:
```bash
# إعداد GPG key
gpg --gen-key

# الحصول على key ID
gpg --list-secret-keys --keyid-format LONG

# إضافته لـ Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# إضافة المفتاح العام لـ GitHub
gpg --armor --export YOUR_KEY_ID
# انسخ الناتج وأضفه في GitHub Settings → SSH and GPG keys
```

---

#### و) Require linear history

```
☐ Disabled
```

**متى تفعله**:
- إذا كنت تفضل rebase بدلاً من merge commits
- للحصول على تاريخ نظيف وخطي

**ملاحظة**: قد يسبب صعوبة للمبتدئين

---

#### ز) Require deployments to succeed

```
☐ Disabled
```

**متى تفعله**:
- عند الحاجة لاختبار في staging قبل الدمج
- عند وجود deployment previews

---

#### ح) Lock branch

```
☐ Disabled
```

**متى تفعله**:
- للفروع المؤرشفة
- لمنع أي تعديلات نهائياً

---

#### ط) Do not allow bypassing the above settings

```
☑ Enabled
```

**مهم جداً**: هذا يمنع المسؤولين من تجاوز القواعد

**الاستثناء**: يمكن تعطيله مؤقتاً في حالات الطوارئ

---

#### ي) Restrict who can push to matching branches

```
☐ Disabled
```

**متى تفعله**:
- للتحكم الدقيق في من يمكنه الدمج
- عند وجود فرق كبيرة

**الإعداد**:
- أضف الأشخاص أو الفرق المسموح لهم

---

#### ك) Allow force pushes

```
☐ Disabled (موصى به)
```

**⚠️ تحذير**: تفعيل هذا يسمح بـ force push مما قد يسبب فقدان البيانات

**الاستثناء**: يمكن السماح به لـ:
- Deployment branches
- Feature branches قصيرة الأمد

---

#### ل) Allow deletions

```
☐ Disabled (موصى به)
```

**الفائدة**: يمنع حذف الـ `main` branch عن طريق الخطأ

---

## 📝 الإعدادات الموصى بها

### للمشاريع الصغيرة (1-3 مطورين):

```yaml
Branch Protection Rules:
  ✅ Require pull request
    - Required approvals: 1
    - Dismiss stale approvals: Yes
  ✅ Require status checks
    - Require up to date: Yes
    - Required checks: CI, Security
  ✅ Require conversation resolution: Yes
  ✅ Include administrators: Yes
  ✅ Do not allow bypass: Yes
  ❌ Signed commits: No
  ❌ Linear history: No
  ❌ Allow force pushes: No
  ❌ Allow deletions: No
```

---

### للمشاريع المتوسطة (4-10 مطورين):

```yaml
Branch Protection Rules:
  ✅ Require pull request
    - Required approvals: 2
    - Dismiss stale approvals: Yes
    - Require review from Code Owners: Yes
  ✅ Require status checks
    - Require up to date: Yes
    - Required checks: All CI, Security, Performance
  ✅ Require conversation resolution: Yes
  ✅ Include administrators: Yes
  ✅ Do not allow bypass: Yes
  ⚠️ Signed commits: Optional
  ⚠️ Linear history: Optional
  ❌ Allow force pushes: No
  ❌ Allow deletions: No
```

---

### للمشاريع الكبيرة (10+ مطورين):

```yaml
Branch Protection Rules:
  ✅ Require pull request
    - Required approvals: 2-3
    - Dismiss stale approvals: Yes
    - Require review from Code Owners: Yes
    - Require approval of most recent push: Yes
  ✅ Require status checks
    - Require up to date: Yes
    - Required checks: All
  ✅ Require conversation resolution: Yes
  ✅ Require deployments to succeed: Yes
  ✅ Include administrators: Yes
  ✅ Do not allow bypass: Yes
  ✅ Signed commits: Yes
  ✅ Linear history: Yes
  ✅ Restrict who can push: Yes
  ❌ Allow force pushes: No
  ❌ Allow deletions: No
```

---

## 🎯 للمشروع الحالي (Rabit)

### الإعدادات الموصى بها:

```yaml
Branch: main

Protection Rules:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Dismiss stale pull request approvals
    ✅ Require approval of the most recent reviewable push

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    ✅ Status checks:
        - ci / lint
        - ci / type-check
        - ci / test-unit
        - ci / test-integration
        - ci / build
        - security / security-scan

  ✅ Require conversation resolution before merging

  ✅ Include administrators

  ❌ Require signed commits (اختياري)
  ❌ Require linear history (اختياري)
  ❌ Require deployments to succeed before merging (اختياري)
  ❌ Lock branch
  ❌ Allow force pushes
  ❌ Allow deletions
```

---

## ✅ التحقق من الإعداد

### 1. مراجعة الإعدادات

```
Settings → Branches → Branch protection rules
```

تأكد من ظهور:
```
✓ main - Active
  - Require pull request reviews
  - Require status checks to pass
  - Require conversation resolution
  - Include administrators
```

---

### 2. اختبار Protection Rules

```bash
# المحاولة 1: Push مباشر (يجب أن يفشل)
git checkout main
echo "test" >> test.txt
git add .
git commit -m "test: direct push"
git push origin main

# النتيجة المتوقعة:
# remote: error: GH006: Protected branch update failed
```

```bash
# المحاولة 2: عبر Pull Request (يجب أن ينجح)
git checkout -b test/branch-protection
echo "test" >> test.txt
git add .
git commit -m "test: branch protection"
git push origin test/branch-protection

# ثم أنشئ PR من GitHub
```

---

### 3. اختبار Status Checks

1. أنشئ PR
2. تأكد من ظهور Status Checks
3. انتظر حتى تكتمل جميع الـ checks
4. تأكد من عدم القدرة على الدمج قبل اكتمالها

---

## 🔄 فروع إضافية للحماية

### develop branch

```yaml
Branch: develop

Protection Rules:
  ✅ Require pull request (1 approval)
  ✅ Require status checks (CI only)
  ✅ Require conversation resolution
  ❌ Include administrators
```

---

### release/* branches

```yaml
Branch pattern: release/*

Protection Rules:
  ✅ Require pull request (2 approvals)
  ✅ Require status checks (All)
  ✅ Require conversation resolution
  ✅ Include administrators
  ✅ Restrict who can push
```

---

### hotfix/* branches

```yaml
Branch pattern: hotfix/*

Protection Rules:
  ✅ Require pull request (1 approval)
  ✅ Require status checks (Critical only)
  ⚠️ Allow administrators to bypass (للطوارئ)
```

---

## 🆘 استكشاف الأخطاء

### المشكلة: لا تظهر Status Checks في القائمة

**الحل**:
1. قم بتشغيل Workflow مرة واحدة على الأقل
2. انتظر اكتمال الـ workflow
3. ارجع لإعدادات Branch Protection
4. ستظهر الـ checks تلقائياً

---

### المشكلة: لا أستطيع الدمج رغم نجاح جميع الـ checks

**الحل**:
1. تأكد من وجود موافقة واحدة على الأقل
2. تأكد من حل جميع التعليقات
3. تأكد من تحديث الفرع مع `main`

---

### المشكلة: حالة طوارئ وأحتاج للـ push مباشرة

**الحل المؤقت**:
1. Settings → Branches → Edit rule
2. قم بتعطيل القاعدة مؤقتاً
3. قم بالـ push
4. أعد تفعيل القاعدة فوراً

**⚠️ تحذير**: استخدم هذا فقط في حالات الطوارئ القصوى

---

## 📊 قائمة التحقق

- [ ] تم إنشاء Branch Protection Rule لـ `main`
- [ ] تم تفعيل Require pull request
- [ ] تم تحديد عدد الموافقات المطلوبة
- [ ] تم تفعيل Require status checks
- [ ] تم تحديد الـ checks المطلوبة
- [ ] تم تفعيل Require conversation resolution
- [ ] تم تفعيل Include administrators
- [ ] تم تعطيل Allow force pushes
- [ ] تم تعطيل Allow deletions
- [ ] تم اختبار الإعدادات
- [ ] تم التحقق من عدم إمكانية الـ push المباشر

---

## 📞 الخطوة التالية

بعد إكمال Branch Protection، انتقل إلى:
- [دليل Production Environment Setup](./CI_CD_PRODUCTION_ENV.md)
- [دليل اختبار CI/CD](./CI_CD_TESTING_GUIDE.md)

---

## 📚 موارد إضافية

- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Best Practices for Branch Protection](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions)

---

**✨ تاريخ الإنشاء**: 5 ديسمبر 2024  
**📝 آخر تحديث**: 5 ديسمبر 2024  
**👤 المسؤول**: فريق رابِط
