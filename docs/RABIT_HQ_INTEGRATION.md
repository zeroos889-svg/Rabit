# دليل التكامل مع Rabit HQ 🏢

## نظرة عامة
تم ربط **Rabit HQ** (مركز القيادة) مع لوحة التحكم الإدارية الرئيسية، مما يوفر وصولاً سلساً لمركز القيادة الداخلي + بوابة المستثمرين.

---

## 📋 ما هو Rabit HQ؟

**Rabit HQ** هو تطبيق Next.js 13 منفصل يوفر:
- 📊 **Dashboard مالي**: متابعة Burn Rate, Monthly Trends
- 👥 **Investor Portal**: Timeline, Financial Snapshots
- 💰 **إدارة رأس المال**: Capital & Expense Management
- 🤖 **AI Insights**: رؤى ذكية مدعومة بالذكاء الاصطناعي (OpenAI)

---

## 🔗 نقاط الوصول

### 1️⃣ القائمة الجانبية (Sidebar)
- **الموقع**: بين "سجل النشاطات" و "الإعدادات"
- **الأيقونة**: 🏢 Building2
- **المؤشر**: 🔗 ExternalLink (يفتح في تبويب جديد)
- **الرابط**: `http://localhost:3001`

### 2️⃣ بطاقة Dashboard المميزة
- **الموقع**: في أعلى صفحة Dashboard الإدارية
- **التصميم**: بطاقة كبيرة بتدرج بنفسجي (Purple Gradient)
- **المزايا**:
  - زر "فتح مركز القيادة" (يفتح في تبويب جديد)
  - زر "نسخ الرابط" (مع Toast Notification)
  - قائمة بالميزات الرئيسية

---

## 🚀 التشغيل

### تشغيل التطبيق الرئيسي (Rabit HR)
```bash
npm run dev
# Port: 3000
```

### تشغيل Rabit HQ
```bash
cd rabit-hq
npm install  # أول مرة فقط
npm run dev
# Port: 3001
```

### الوصول
- **Rabit HR**: http://localhost:3000
- **Rabit HQ**: http://localhost:3001

---

## 🛠️ التعديلات التقنية

### 1. AdminLayout.tsx
```typescript
// إضافة الأيقونات
import { Building2, ExternalLink } from "lucide-react";

// إضافة عنصر القائمة
menuItems = [
  // ...
  { 
    icon: Building2, 
    label: "مركز القيادة HQ", 
    href: "http://localhost:3001", 
    external: true 
  },
  // ...
];

// دعم الروابط الخارجية
if (isExternal) {
  return (
    <a 
      href={item.href} 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <Icon /> {item.label} <ExternalLink />
    </a>
  );
}
```

### 2. admin/Dashboard.tsx
```typescript
// بطاقة مميزة مع تصميم بنفسجي
<Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
  <CardHeader>
    <Building2 />
    مركز القيادة - Rabit HQ
  </CardHeader>
  <CardContent>
    {/* قائمة الميزات */}
    <Button onClick={() => window.open('http://localhost:3001', '_blank')}>
      فتح مركز القيادة
    </Button>
    <Button onClick={copyLink}>
      نسخ الرابط
    </Button>
  </CardContent>
</Card>
```

---

## 🔒 الأمان

### External Links
- ✅ `target="_blank"` (يفتح في تبويب جديد)
- ✅ `rel="noopener noreferrer"` (حماية من Tabnabbing)

### Authentication
- 🔄 **حالياً**: تطبيقان منفصلان (Auth منفصل)
- 🚀 **مستقبلاً**: إمكانية إضافة:
  - SSO (Single Sign-On)
  - Token Forwarding
  - Shared Session

---

## 📦 البنية التقنية

### المشروع الرئيسي (Rabit)
```
Stack: Express + tRPC + Vite/React
Port: 3000
Auth: JWT + tRPC Context
DB: PostgreSQL + Drizzle ORM
```

### Rabit HQ
```
Stack: Next.js 13 + App Router
Port: 3001
Auth: NextAuth.js
DB: Prisma ORM
Features: Server Components, i18n
```

---

## ⚙️ متغيرات البيئة

### إضافة إلى .env (مستقبلاً)
```bash
# Rabit HQ Configuration
RABIT_HQ_URL=http://localhost:3001
RABIT_HQ_ENABLED=true
```

### استخدام في الكود
```typescript
const HQ_URL = import.meta.env.VITE_RABIT_HQ_URL || 'http://localhost:3001';
```

---

## 🎨 التصميم

### الألوان
- **Primary**: بنفسجي (#8B5CF6)
- **Gradient**: من Purple-50 إلى Blue-50
- **Border**: Purple-200

### الأيقونات
- **Building2**: مركز القيادة
- **ExternalLink**: مؤشر الرابط الخارجي
- حجم: 16px (h-4 w-4) للمؤشرات

---

## 🧪 الاختبار

### Checklist
- [ ] تسجيل الدخول كمسؤول (Admin)
- [ ] فتح Dashboard
- [ ] التحقق من ظهور البطاقة البنفسجية
- [ ] النقر على "فتح مركز القيادة"
- [ ] التحقق من فتح HQ في تبويب جديد
- [ ] النقر على "نسخ الرابط"
- [ ] التحقق من Toast Notification
- [ ] التحقق من رابط القائمة الجانبية
- [ ] اختبار على الموبايل (Responsive)

---

## 🔧 Troubleshooting

### المشكلة: "Cannot reach Rabit HQ"
```bash
# تأكد من تشغيل rabit-hq
cd rabit-hq
npm run dev
```

### المشكلة: "Port 3001 already in use"
```bash
# إيقاف العملية على Port 3001
lsof -ti:3001 | xargs kill -9

# أو تغيير Port في rabit-hq/package.json
"dev": "next dev -p 3002"
```

### المشكلة: "Link not appearing"
- تأكد من تسجيل الدخول كـ **Admin**
- افحص `user.role === "admin"`
- راجع Console للأخطاء

---

## 🚢 الإنتاج (Production)

### الخيارات

#### 1️⃣ استضافة منفصلة (Recommended)
```bash
# Rabit HR على Vercel
vercel deploy

# Rabit HQ على Vercel أيضاً
cd rabit-hq
vercel deploy
```

#### 2️⃣ Docker Compose
```yaml
services:
  rabit-hr:
    build: .
    ports:
      - "3000:3000"
  
  rabit-hq:
    build: ./rabit-hq
    ports:
      - "3001:3001"
```

#### 3️⃣ Subdomain
```
https://app.rabit.com      → Rabit HR
https://hq.rabit.com       → Rabit HQ
```

---

## 📈 تحسينات مستقبلية

### High Priority
- [ ] متغير بيئة `RABIT_HQ_URL`
- [ ] Health Check (Online/Offline Status)
- [ ] Mobile Responsive Testing

### Medium Priority
- [ ] SSO Integration
- [ ] Deep Linking (sections داخل HQ)
- [ ] Analytics Tracking

### Low Priority
- [ ] Iframe Preview Option
- [ ] Permission-based Access (Super Admin only)
- [ ] Real-time Status Badge

---

## 📚 الموارد

### الملفات المعدلة
```
client/src/components/AdminLayout.tsx
client/src/pages/admin/Dashboard.tsx
```

### Commit
```
feat: ربط Rabit HQ بلوحة التحكم الإدارية
```

### Related Docs
- [EMPLOYEE_DASHBOARD_GUIDE.md](./EMPLOYEE_DASHBOARD_GUIDE.md)
- [AUTH_GUIDE.md](./AUTH_GUIDE.md)
- [DEPLOYMENT_GUIDE_FULL.md](./DEPLOYMENT_GUIDE_FULL.md)

---

## 💡 نصائح

1. **تطوير محلي**: شغّل التطبيقين معاً أثناء التطوير
2. **استضافة**: استخدم استضافة منفصلة للإنتاج
3. **أمان**: لا تنسَ تفعيل CORS في الإنتاج
4. **Monitoring**: راقب استخدام HQ عبر Analytics
5. **Backup**: احتفظ بنسخة احتياطية من بيانات HQ

---

## ✅ Status

- ✅ **Sidebar Link**: Completed
- ✅ **Dashboard Card**: Completed
- ✅ **External Link Handling**: Completed
- ✅ **Toast Notifications**: Completed
- ✅ **ESLint Fixes**: Completed
- 🔄 **Environment Variables**: Pending
- 🔄 **Health Check**: Pending
- 🔄 **Mobile Testing**: Pending

---

**Last Updated**: November 26, 2025
**Version**: 1.0.0
**Author**: Rabit Development Team
