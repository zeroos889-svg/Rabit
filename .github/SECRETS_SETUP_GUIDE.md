# 🔐 دليل إعداد GitHub Secrets

## نظرة عامة
هذا الدليل يشرح كيفية إضافة جميع الـ Secrets المطلوبة لتشغيل CI/CD workflows بنجاح.

---

## 📋 Secrets المطلوبة

### 1. Database Secrets

#### `DATABASE_URL`
**الوصف**: رابط الاتصال بقاعدة البيانات  
**التنسيق**: `mysql://username:password@host:port/database`  
**مثال**: `mysql://rabit_user:SecurePass123@db.example.com:3306/rabit_production`  
**ملاحظات**:
- استخدم قاعدة بيانات منفصلة للـ production
- تأكد من أن المستخدم لديه صلاحيات كاملة
- استخدم SSL إذا كان متاحاً

---

### 2. Security Secrets

#### `JWT_SECRET`
**الوصف**: مفتاح سري لتوقيع JWT tokens  
**التنسيق**: نص عشوائي (32+ حرف)  
**كيفية التوليد**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**مثال**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### `SESSION_SECRET`
**الوصف**: مفتاح سري لتشفير الجلسات  
**التنسيق**: نص عشوائي (32+ حرف)  
**كيفية التوليد**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**ملاحظات**: يجب أن يكون مختلفاً عن JWT_SECRET

#### `CSRF_SECRET`
**الوصف**: مفتاح سري لحماية CSRF  
**التنسيق**: نص عشوائي (32+ حرف)  
**كيفية التوليد**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Redis (اختياري لكن موصى به)

#### `REDIS_URL`
**الوصف**: رابط الاتصال بـ Redis  
**التنسيق**: `redis://default:password@host:port`  
**مثال**: `redis://default:SecureRedisPass@redis.example.com:6379`  
**ملاحظات**:
- Redis يُستخدم للـ caching و rate limiting
- إذا لم يتوفر، سيعمل النظام بدونه لكن بأداء أقل

---

### 4. AI Services

#### `DEEPSEEK_API_KEY`
**الوصف**: مفتاح API لخدمة DeepSeek AI  
**التنسيق**: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`  
**كيفية الحصول عليه**:
1. سجل في https://platform.deepseek.com
2. اذهب إلى API Keys
3. أنشئ مفتاح جديد
**ملاحظات**: مطلوب لميزة المساعد الذكي

---

### 5. Email Services

#### `RESEND_API_KEY`
**الوصف**: مفتاح API لخدمة Resend  
**التنسيق**: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`  
**كيفية الحصول عليه**:
1. سجل في https://resend.com
2. اذهب إلى API Keys
3. أنشئ مفتاح جديد
**ملاحظات**: مطلوب لإرسال البريد الإلكتروني

---

### 6. File Storage

#### `CLOUDINARY_URL`
**الوصف**: رابط Cloudinary للتخزين السحابي  
**التنسيق**: `cloudinary://api_key:api_secret@cloud_name`  
**مثال**: `cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@your-cloud-name`  
**كيفية الحصول عليه**:
1. سجل في https://cloudinary.com
2. اذهب إلى Dashboard
3. انسخ الـ API Environment variable
**ملاحظات**: مطلوب لرفع الصور والملفات

---

### 7. Error Tracking

#### `SENTRY_DSN`
**الوصف**: رابط Sentry لتتبع الأخطاء  
**التنسيق**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`  
**كيفية الحصول عليه**:
1. سجل في https://sentry.io
2. أنشئ مشروع جديد
3. انسخ الـ DSN من Project Settings
**ملاحظات**: مطلوب لمراقبة الأخطاء في production

#### `SENTRY_AUTH_TOKEN`
**الوصف**: توكن للمصادقة مع Sentry  
**كيفية الحصول عليه**:
1. اذهب إلى Settings → Auth Tokens
2. أنشئ توكن جديد مع صلاحيات: `project:releases`
**ملاحظات**: مطلوب لرفع source maps

---

### 8. Deployment

#### `RAILWAY_TOKEN`
**الوصف**: توكن للنشر على Railway  
**كيفية الحصول عليه**:
1. سجل في https://railway.app
2. اذهب إلى Account Settings → Tokens
3. أنشئ توكن جديد
**ملاحظات**: مطلوب للنشر التلقائي

---

## 🔧 كيفية إضافة Secrets

### طريقة 1: عبر واجهة GitHub (موصى بها)

1. اذهب إلى repository على GitHub
2. اضغط على **Settings**
3. في القائمة الجانبية، اضغط على **Secrets and variables** → **Actions**
4. اضغط على **New repository secret**
5. أدخل الاسم والقيمة
6. اضغط على **Add secret**

### طريقة 2: عبر GitHub CLI

```bash
# تثبيت GitHub CLI إذا لم يكن مثبتاً
brew install gh  # macOS
# أو
sudo apt install gh  # Linux

# تسجيل الدخول
gh auth login

# إضافة secret
gh secret set DATABASE_URL -b "mysql://user:pass@host:port/db"
gh secret set JWT_SECRET -b "your-jwt-secret-here"
# ... وهكذا لباقي الـ secrets
```

### طريقة 3: باستخدام Script

```bash
# إنشاء ملف .env.production (لا ترفعه إلى Git!)
cat > .env.production << EOF
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
REDIS_URL=redis://default:pass@host:port
DEEPSEEK_API_KEY=sk-xxx
RESEND_API_KEY=re-xxx
CLOUDINARY_URL=cloudinary://xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
RAILWAY_TOKEN=xxx
EOF

# تشغيل script لإضافة جميع الـ secrets
while IFS='=' read -r key value; do
  gh secret set "$key" -b "$value"
done < .env.production

# حذف الملف بعد الانتهاء
rm .env.production
```

---

## 🌍 Environment-Specific Secrets

### Production Environment

1. اذهب إلى **Settings** → **Environments**
2. اضغط على **New environment**
3. اسم البيئة: `production`
4. أضف الـ secrets الخاصة بـ production
5. فعّل **Required reviewers** (اختياري)
6. فعّل **Wait timer** (اختياري)

### Staging Environment (اختياري)

كرر نفس الخطوات لبيئة `staging` مع قيم مختلفة.

---

## ✅ التحقق من الإعداد

### 1. التحقق من وجود جميع الـ Secrets

```bash
# عرض قائمة بجميع الـ secrets
gh secret list
```

يجب أن ترى:
```
DATABASE_URL          Updated 2024-XX-XX
JWT_SECRET            Updated 2024-XX-XX
SESSION_SECRET        Updated 2024-XX-XX
REDIS_URL             Updated 2024-XX-XX
DEEPSEEK_API_KEY      Updated 2024-XX-XX
RESEND_API_KEY        Updated 2024-XX-XX
CLOUDINARY_URL        Updated 2024-XX-XX
SENTRY_DSN            Updated 2024-XX-XX
SENTRY_AUTH_TOKEN     Updated 2024-XX-XX
RAILWAY_TOKEN         Updated 2024-XX-XX
```

### 2. اختبار الـ Workflow

```bash
# إنشاء PR تجريبي
git checkout -b test/secrets-setup
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify secrets setup"
git push origin test/secrets-setup

# افتح PR على GitHub وراقب الـ workflow
```

### 3. التحقق من Logs

1. اذهب إلى **Actions** tab
2. اضغط على آخر workflow run
3. تحقق من عدم وجود أخطاء متعلقة بالـ secrets

---

## 🔒 أفضل الممارسات الأمنية

### 1. تدوير الـ Secrets بانتظام
- غيّر الـ secrets كل 90 يوم
- غيّرها فوراً إذا تم تسريبها
- استخدم secrets مختلفة لكل بيئة

### 2. الحد الأدنى من الصلاحيات
- أعطِ كل secret الصلاحيات المطلوبة فقط
- لا تستخدم admin tokens إلا عند الضرورة

### 3. المراقبة
- راقب استخدام الـ API keys
- فعّل التنبيهات للاستخدام غير المعتاد
- راجع access logs بانتظام

### 4. النسخ الاحتياطي
- احتفظ بنسخة آمنة من الـ secrets
- استخدم password manager (مثل 1Password, LastPass)
- لا تحفظها في ملفات نصية عادية

---

## 🚨 استكشاف الأخطاء

### خطأ: "Secret not found"
**الحل**: تأكد من أن اسم الـ secret مطابق تماماً (case-sensitive)

### خطأ: "Invalid secret format"
**الحل**: تحقق من تنسيق الـ secret (لا مسافات زائدة، لا أسطر جديدة)

### خطأ: "Permission denied"
**الحل**: تأكد من أن لديك صلاحيات admin على الـ repository

### خطأ: "Secret too large"
**الحل**: الحد الأقصى 64KB. قسّم الـ secret إلى أجزاء أصغر إذا لزم الأمر

---

## 📞 الدعم

إذا واجهت مشاكل:
1. راجع [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
2. افتح Issue في الـ repository
3. تواصل مع فريق DevOps

---

**آخر تحديث**: ديسمبر 2024  
**الحالة**: ✅ جاهز للاستخدام
