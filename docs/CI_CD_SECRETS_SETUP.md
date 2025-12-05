# دليل إعداد GitHub Secrets
## GitHub Secrets Setup Guide

**الأولوية**: 🔴 عالية جداً  
**الوقت المتوقع**: 15-30 دقيقة  
**المسؤول**: مدير المشروع

---

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إضافة جميع الـ Secrets المطلوبة لتشغيل CI/CD workflows بشكل صحيح.

---

## 🔑 الـ Secrets المطلوبة

### 1. DATABASE_URL (إلزامي) 🔴
**الوصف**: رابط الاتصال بقاعدة البيانات PostgreSQL

**الصيغة**:
```
postgresql://username:password@host:port/database?sslmode=require
```

**مثال**:
```
postgresql://rabit_user:mySecurePass123@db.example.com:5432/rabit_production?sslmode=require
```

**كيفية الحصول عليه**:
- من Railway: Dashboard → Database → Connect → Connection String
- من Supabase: Settings → Database → Connection String
- من Neon: Dashboard → Connection Details

**الاستخدام**: 
- اختبارات قاعدة البيانات
- Migrations
- عمليات النشر

---

### 2. JWT_SECRET (إلزامي) 🔴
**الوصف**: مفتاح سري لتوقيع JWT tokens

**التوليد**:
```bash
# طريقة 1: استخدام OpenSSL
openssl rand -base64 32

# طريقة 2: استخدام Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# طريقة 3: استخدام Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**مثال الناتج**:
```
Kx9mP2vN8qR4tW6yZ1aB3cD5eF7gH9jL0mN2oP4qR6sT8u
```

**⚠️ مهم جداً**:
- يجب أن يكون فريداً
- لا تشاركه أبداً
- استخدم مفتاح مختلف لكل بيئة

**الاستخدام**:
- توقيع JWT tokens
- التحقق من صحة الـ tokens
- الجلسات الآمنة

---

### 3. SESSION_SECRET (إلزامي) 🔴
**الوصف**: مفتاح سري لتشفير الجلسات

**التوليد**: (نفس طريقة JWT_SECRET)
```bash
openssl rand -base64 32
```

**مثال الناتج**:
```
Y8zB4xC2vN6mQ9pR1sT3uW5aD7fG0hJ2kL4nM6oP8qR1sT
```

**⚠️ ملاحظة**: يجب أن يكون مختلفاً عن JWT_SECRET

**الاستخدام**:
- تشفير session cookies
- حماية CSRF tokens
- إدارة الجلسات

---

### 4. REDIS_URL (اختياري) 🟡
**الوصف**: رابط الاتصال بـ Redis للتخزين المؤقت

**الصيغة**:
```
redis://username:password@host:port
```

**مثال**:
```
redis://default:myRedisPass@redis-12345.upstash.io:6379
```

**كيفية الحصول عليه**:
- من Upstash: Console → Database → Details → Connection String
- من Railway: Dashboard → Redis → Connect
- من Redis Cloud: Database → Configuration → Public endpoint

**الاستخدام**:
- Rate limiting
- Session storage
- Caching
- Queue management

**⚠️ إذا لم يتوفر**:
- سيستخدم النظام in-memory caching
- قد يؤثر على الأداء في Production

---

### 5. DEEPSEEK_API_KEY (إلزامي) 🔴
**الوصف**: مفتاح API لخدمة DeepSeek AI

**كيفية الحصول عليه**:
1. سجل في https://platform.deepseek.com
2. انتقل إلى API Keys
3. أنشئ مفتاح جديد

**الصيغة**:
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**الاستخدام**:
- ميزات الذكاء الاصطناعي
- معالجة اللغة الطبيعية
- التحليلات الذكية

---

### 6. RESEND_API_KEY (إلزامي) 🔴
**الوصف**: مفتاح API لخدمة Resend لإرسال البريد الإلكتروني

**كيفية الحصول عليه**:
1. سجل في https://resend.com
2. انتقل إلى API Keys
3. أنشئ مفتاح جديد

**الصيغة**:
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**الاستخدام**:
- إرسال رسائل التحقق
- إعادة تعيين كلمة المرور
- الإشعارات البريدية
- التقارير الدورية

---

### 7. CLOUDINARY_URL (إلزامي) 🔴
**الوصف**: رابط API لخدمة Cloudinary لإدارة الوسائط

**كيفية الحصول عليه**:
1. سجل في https://cloudinary.com
2. انتقل إلى Dashboard
3. انسخ API Environment variable

**الصيغة**:
```
cloudinary://api_key:api_secret@cloud_name
```

**مثال**:
```
cloudinary://123456789012345:abcdefghijklmnopqrst@rabit-cloud
```

**الاستخدام**:
- رفع الصور
- معالجة الوسائط
- التخزين السحابي
- CDN للوسائط

---

### 8. SENTRY_DSN (اختياري) 🟡
**الوصف**: رابط Sentry لتتبع الأخطاء

**كيفية الحصول عليه**:
1. سجل في https://sentry.io
2. أنشئ مشروع جديد
3. انسخ DSN من Settings

**الصيغة**:
```
https://xxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567
```

**الاستخدام**:
- تتبع الأخطاء
- مراقبة الأداء
- تحليل الـ crashes
- الإشعارات الفورية

**⚠️ إذا لم يتوفر**:
- سيتم تسجيل الأخطاء محلياً فقط
- لن يتم إرسال تنبيهات

---

### 9. RAILWAY_TOKEN (للنشر) 🔴
**الوصف**: Token للنشر التلقائي على Railway

**كيفية الحصول عليه**:
1. سجل دخول إلى Railway
2. انتقل إلى Account Settings → Tokens
3. أنشئ token جديد

**الصيغة**:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**الاستخدام**:
- النشر التلقائي
- إدارة البيئات
- تحديثات Production

**⚠️ مهم**:
- أعطه صلاحيات محدودة
- استخدمه للنشر فقط

---

## 📝 خطوات إضافة الـ Secrets

### الطريقة 1: من واجهة GitHub

1. **افتح المستودع**:
   ```
   https://github.com/zeroos889-svg/Rabit
   ```

2. **انتقل إلى Settings**:
   ```
   Repository → Settings → Secrets and variables → Actions
   ```

3. **أضف Secret جديد**:
   - اضغط على "New repository secret"
   - اكتب الاسم (مثل: `DATABASE_URL`)
   - الصق القيمة
   - اضغط "Add secret"

4. **كرر العملية** لجميع الـ Secrets

---

### الطريقة 2: من GitHub CLI

```bash
# تثبيت GitHub CLI
brew install gh  # macOS
# أو
sudo apt install gh  # Linux

# تسجيل الدخول
gh auth login

# إضافة الـ Secrets
gh secret set DATABASE_URL -b "postgresql://..."
gh secret set JWT_SECRET -b "$(openssl rand -base64 32)"
gh secret set SESSION_SECRET -b "$(openssl rand -base64 32)"
gh secret set REDIS_URL -b "redis://..."
gh secret set DEEPSEEK_API_KEY -b "sk-..."
gh secret set RESEND_API_KEY -b "re_..."
gh secret set CLOUDINARY_URL -b "cloudinary://..."
gh secret set SENTRY_DSN -b "https://..."
gh secret set RAILWAY_TOKEN -b "xxxx-xxxx-xxxx"
```

---

## ✅ التحقق من الإعداد

### 1. التحقق من قائمة الـ Secrets:

```bash
# باستخدام GitHub CLI
gh secret list
```

**الناتج المتوقع**:
```
DATABASE_URL        Updated 2024-12-05
JWT_SECRET          Updated 2024-12-05
SESSION_SECRET      Updated 2024-12-05
REDIS_URL           Updated 2024-12-05
DEEPSEEK_API_KEY    Updated 2024-12-05
RESEND_API_KEY      Updated 2024-12-05
CLOUDINARY_URL      Updated 2024-12-05
SENTRY_DSN          Updated 2024-12-05
RAILWAY_TOKEN       Updated 2024-12-05
```

### 2. اختبار Workflow:

```bash
# أنشئ فرع تجريبي
git checkout -b test/secrets-verification

# عدل ملف بسيط
echo "# Secrets Test" >> .github/test.md

# ارفع التغييرات
git add .
git commit -m "test: verify secrets configuration"
git push origin test/secrets-verification
```

### 3. راقب الـ Workflow:
- افتح GitHub Actions
- تحقق من نجاح جميع الخطوات
- تأكد من عدم وجود أخطاء متعلقة بالـ Secrets

---

## 🔒 أفضل الممارسات

### ✅ افعل:
- استخدم مفاتيح قوية (32 حرف على الأقل)
- راجع الـ Secrets كل 90 يوم
- استخدم secrets مختلفة لكل بيئة
- احفظ نسخة احتياطية آمنة (في password manager)
- أضف فقط الـ Secrets الضرورية

### ❌ لا تفعل:
- لا تشارك الـ Secrets أبداً
- لا تكتبها في الكود
- لا تضعها في `.env` و ترفعها لـ Git
- لا تستخدم قيم ضعيفة أو تجريبية
- لا تعطي صلاحيات زائدة

---

## 🆘 استكشاف الأخطاء

### المشكلة: Workflow يفشل بسبب Secret مفقود

**الحل**:
1. تحقق من اسم الـ Secret (حساس لحالة الأحرف)
2. تأكد من إضافة الـ Secret بشكل صحيح
3. راجع logs الـ Workflow

---

### المشكلة: Database connection يفشل

**الحل**:
1. تحقق من صحة `DATABASE_URL`
2. تأكد من السماح بالاتصال من GitHub IPs
3. تحقق من صحة username/password

---

### المشكلة: JWT tokens غير صالحة

**الحل**:
1. تحقق من `JWT_SECRET`
2. تأكد من عدم وجود مسافات إضافية
3. تأكد من استخدام نفس الـ secret في جميع البيئات

---

## 📊 قائمة التحقق

- [ ] تم إضافة `DATABASE_URL`
- [ ] تم إضافة `JWT_SECRET`
- [ ] تم إضافة `SESSION_SECRET`
- [ ] تم إضافة `REDIS_URL` (اختياري)
- [ ] تم إضافة `DEEPSEEK_API_KEY`
- [ ] تم إضافة `RESEND_API_KEY`
- [ ] تم إضافة `CLOUDINARY_URL`
- [ ] تم إضافة `SENTRY_DSN` (اختياري)
- [ ] تم إضافة `RAILWAY_TOKEN`
- [ ] تم التحقق من قائمة الـ Secrets
- [ ] تم اختبار Workflow بنجاح
- [ ] تم حفظ نسخة احتياطية آمنة

---

## 📞 الخطوة التالية

بعد إكمال إعداد الـ Secrets، انتقل إلى:
- [دليل Branch Protection Rules](./CI_CD_BRANCH_PROTECTION.md)
- [دليل Production Environment Setup](./CI_CD_PRODUCTION_ENV.md)

---

**✨ تاريخ الإنشاء**: 5 ديسمبر 2024  
**📝 آخر تحديث**: 5 ديسمبر 2024  
**👤 المسؤول**: فريق رابِط
