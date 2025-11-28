# Rabit API Documentation / توثيق واجهات برمجة التطبيقات

<div align="center">

![API](https://img.shields.io/badge/API-tRPC-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

</div>

> **Version:** 2.0.0  
> **Last Updated:** January 2025  
> **Production URL:** `https://rabit-app-production.up.railway.app/api`  
> **Development URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents / جدول المحتويات

1. [Overview / نظرة عامة](#overview)
2. [Authentication / المصادقة](#authentication)
3. [Endpoints Reference / مرجع النقاط النهائية](#endpoints)
   - [Auth / المصادقة](#auth-endpoints)
   - [Profile / الملف الشخصي](#profile-endpoints)
   - [Documents / المستندات](#documents-endpoints)
   - [Calculations / الحسابات](#calculations-endpoints)
   - [Consulting / الاستشارات](#consulting-endpoints)
   - [Chat / المحادثات](#chat-endpoints)
   - [Notifications / الإشعارات](#notifications-endpoints)
   - [Admin / لوحة التحكم](#admin-endpoints)
   - [Reports / التقارير](#reports-endpoints)
   - [AI Tools / أدوات الذكاء الاصطناعي](#ai-tools-endpoints)
   - [Knowledge Base / قاعدة المعرفة](#knowledge-base-endpoints)
4. [Error Handling / معالجة الأخطاء](#error-handling)
5. [Rate Limiting / حدود الاستخدام](#rate-limiting)
6. [WebSocket Events / أحداث الاتصال الفوري](#websocket-events)

---

## Overview / نظرة عامة {#overview}

Rabit uses **tRPC** for type-safe API calls. All endpoints are accessible through the `/api/trpc/*` path.

### Request Format / صيغة الطلب

```typescript
// Query (GET)
POST /api/trpc/[router].[procedure]?input={encodedInput}

// Mutation (POST)
POST /api/trpc/[router].[procedure]
Content-Type: application/json
{
  "json": { /* input data */ }
}
```

### Response Format / صيغة الاستجابة

```typescript
{
  "result": {
    "data": {
      "json": { /* response data */ }
    }
  }
}
```

---

## Authentication / المصادقة {#authentication}

### Cookie-Based Sessions

All authenticated requests use HTTP-only cookies. After login, a `session` cookie is set automatically.

### Headers Required

```http
Cookie: session=<jwt_token>
Content-Type: application/json
```

---

## Endpoints Reference / مرجع النقاط النهائية {#endpoints}

### Auth Endpoints / نقاط المصادقة {#auth-endpoints}

#### `auth.register` - تسجيل مستخدم جديد

**Method:** `mutation`

**Input:**
```typescript
{
  name: string;          // الاسم الكامل (حد أدنى 2 حرف)
  email: string;         // البريد الإلكتروني
  password: string;      // كلمة المرور (حد أدنى 8 أحرف)
  phoneNumber?: string;  // رقم الجوال
  userType?: "employee" | "individual" | "company" | "consultant";
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    userType: string;
  };
  message: string;
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/trpc/auth.register" \
  -H "Content-Type: application/json" \
  -d '{"json": {"name": "أحمد محمد", "email": "ahmed@example.com", "password": "SecurePass123!", "userType": "employee"}}'
```

---

#### `auth.login` - تسجيل الدخول

**Method:** `mutation`

**Input:**
```typescript
{
  email: string;         // البريد الإلكتروني
  password: string;      // كلمة المرور
  rememberMe?: boolean;  // تذكرني
  otp?: string;          // رمز التحقق (6 أرقام) - مطلوب إذا كانت 2FA مفعلة
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    userType: string;
  };
  message: string;
  // إذا كانت 2FA مفعلة ولم يتم إرسال OTP:
  requiresOtp?: boolean;
  otpSent?: boolean;
}
```

---

#### `auth.logout` - تسجيل الخروج

**Method:** `mutation`

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `auth.requestPasswordReset` - طلب إعادة تعيين كلمة المرور

**Method:** `mutation`

**Input:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `auth.resetPassword` - إعادة تعيين كلمة المرور

**Method:** `mutation`

**Input:**
```typescript
{
  token: string;        // رمز إعادة التعيين
  newPassword: string;  // كلمة المرور الجديدة
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

#### `auth.me` - الحصول على المستخدم الحالي

**Method:** `query`

**Response:**
```typescript
{
  id: number;
  email: string;
  name: string;
  role: string;
  userType?: string;
  profilePicture?: string;
} | null
```

---

### Profile Endpoints / نقاط الملف الشخصي {#profile-endpoints}

#### `profile.getProfile` - الحصول على الملف الشخصي

**Method:** `query`  
**Auth:** Required ✓

**Response:**
```typescript
{
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    bio?: string;
    city?: string;
    profilePicture?: string;
    linkedIn?: string;
    twitter?: string;
    userType: string;
    profileCompleted: boolean;
    createdAt: string;
  };
}
```

---

#### `profile.updateProfile` - تحديث الملف الشخصي

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  name?: string;
  email?: string;
  bio?: string;
  city?: string;
  profilePicture?: string;
  linkedIn?: string;
  twitter?: string;
  metadata?: string;  // JSON string
}
```

---

### Documents Endpoints / نقاط المستندات {#documents-endpoints}

#### `documentGenerator.getTemplates` - الحصول على القوالب

**Method:** `query`

**Response:**
```typescript
{
  templates: Array<{
    id: number;
    code: string;
    titleAr: string;
    titleEn: string;
    category: string;
    description?: string;
    isActive: boolean;
  }>;
}
```

---

#### `documentGenerator.generateDocument` - توليد مستند

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  templateCode: string;
  inputData: Record<string, any>;
  lang?: "ar" | "en" | "both";
  style?: "formal" | "semi-formal" | "friendly";
  companyLogo?: string;
  companyName?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  outputHtml: string;
  outputText: string;
  documentId: number;
}
```

---

#### `documentGenerator.getMyDocuments` - مستنداتي

**Method:** `query`  
**Auth:** Required ✓

**Input:**
```typescript
{
  limit?: number;  // 1-500
}
```

---

### Calculations Endpoints / نقاط الحسابات {#calculations-endpoints}

#### `eosb.saveCalculation` - حفظ حساب نهاية الخدمة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  calculationType: "end-of-service" | "vacation" | "overtime" | "deduction";
  salary?: number;
  contractType?: string;
  terminationReason?: string;
  startDate?: string;
  endDate?: string;
  duration?: {
    years: number;
    months: number;
    days: number;
  };
  inputData?: Record<string, any>;
  result?: Record<string, any>;
  notes?: string;
}
```

---

#### `eosb.getCalculationHistory` - سجل الحسابات

**Method:** `query`  
**Auth:** Required ✓

**Input:**
```typescript
{
  calculationType: "end-of-service" | "vacation" | "overtime" | "deduction";
  limit?: number;
}
```

---

#### `eosb.generatePDF` - توليد PDF لنهاية الخدمة

**Method:** `mutation`

**Input:**
```typescript
{
  salary: number;
  startDate: string;
  endDate: string;
  contractType: string;
  terminationReason: string;
  result: {
    totalAmount: number;
    firstFiveYears: number;
    afterFiveYears: number;
    percentage: number;
    yearsCount: number;
    monthsCount: number;
    daysCount: number;
  };
}
```

**Response:**
```typescript
{
  pdfContent: string;  // HTML content for PDF generation
}
```

---

### Consulting Endpoints / نقاط الاستشارات {#consulting-endpoints}

#### `consulting.getPackages` - الحصول على الباقات

**Method:** `query`

**Response:**
```typescript
{
  packages: Array<{
    id: number;
    nameAr: string;
    nameEn: string;
    price: number;
    currency: string;
    features: string[];
    durationMinutes: number;
    isActive: boolean;
  }>;
}
```

---

#### `consulting.createTicket` - إنشاء تذكرة استشارة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  packageId: number;
  subject: string;
  description: string;
  submittedFormJson?: string;
  attachments?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}
```

**Response:**
```typescript
{
  success: boolean;
  ticketId: number;
  ticketNumber: string;
}
```

---

#### `consulting.getMyTickets` - تذاكري

**Method:** `query`  
**Auth:** Required ✓

**Response:**
```typescript
{
  tickets: Array<{
    id: number;
    ticketNumber: string;
    subject: string;
    status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
    createdAt: string;
    updatedAt: string;
    priority: string;
  }>;
}
```

---

#### `consulting.addResponse` - إضافة رد على التذكرة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  ticketId: number;
  message: string;
  attachments?: any;
  isInternal?: boolean;
}
```

---

#### `consultant.createBooking` - حجز استشارة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  consultationTypeId: number;
  consultantId: number;
  scheduledDate: string;    // YYYY-MM-DD
  scheduledTime: string;    // HH:MM
  description: string;
  subject?: string;
  requiredInfo?: string;
  attachments?: string;
  packageName?: string;
  packagePrice?: number;
  packageSlaHours?: number;
}
```

---

### Chat Endpoints / نقاط المحادثات {#chat-endpoints}

#### `chat.createConversation` - إنشاء محادثة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  recipientId?: number;
  consultantId?: number;
  bookingId?: number;
  title?: string;
}
```

---

#### `chat.getConversations` - محادثاتي

**Method:** `query`  
**Auth:** Required ✓

**Response:**
```typescript
{
  conversations: Array<{
    id: number;
    title: string;
    lastMessageAt: string;
    unreadCount: number;
    participants: Array<{
      id: number;
      name: string;
      profilePicture?: string;
    }>;
  }>;
}
```

---

#### `chat.sendMessage` - إرسال رسالة

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  conversationId: number;
  content: string;
  messageType?: "text" | "file" | "image" | "system";
  attachmentUrl?: string;
}
```

---

### Notifications Endpoints / نقاط الإشعارات {#notifications-endpoints}

#### `notifications.list` - قائمة الإشعارات

**Method:** `query`  
**Auth:** Required ✓

**Input:**
```typescript
{
  limit?: number;   // default: 50
  offset?: number;
  unreadOnly?: boolean;
}
```

**Response:**
```typescript
{
  notifications: Array<{
    id: number;
    title: string;
    body: string;
    type: "system" | "ticket" | "booking" | "chat" | "payment" | "promo";
    read: boolean;
    createdAt: string;
    metadata?: Record<string, any>;
  }>;
  unreadCount: number;
}
```

---

#### `notifications.markAsRead` - تعليم كمقروء

**Method:** `mutation`  
**Auth:** Required ✓

**Input:**
```typescript
{
  notificationId: number;
}
```

---

#### `notifications.markAllAsRead` - تعليم الكل كمقروء

**Method:** `mutation`  
**Auth:** Required ✓

---

### Admin Endpoints / نقاط لوحة التحكم {#admin-endpoints}

> **Note:** All admin endpoints require admin role.

#### `admin.users.list` - قائمة المستخدمين

**Method:** `query`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
  status?: "active" | "pending" | "suspended";
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}
```

**Response:**
```typescript
{
  users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

---

#### `admin.users.getById` - تفاصيل المستخدم

**Method:** `query`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  id: number;
}
```

---

#### `admin.users.updateStatus` - تحديث حالة المستخدم

**Method:** `mutation`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  id: number;
  status: "active" | "pending" | "suspended";
  reason?: string;
}
```

---

#### `admin.users.delete` - حذف المستخدم

**Method:** `mutation`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  id: number;
}
```

---

#### `admin.bookings.list` - قائمة الحجوزات

**Method:** `query`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  status?: string;
  consultantId?: number;
  dateFrom?: string;
  dateTo?: string;
}
```

---

#### `admin.bookings.updateStatus` - تحديث حالة الحجز

**Method:** `mutation`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  id: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes?: string;
}
```

---

#### `admin.subscriptions.list` - قائمة الاشتراكات

**Method:** `query`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  status?: "active" | "trial" | "expired" | "cancelled";
  planId?: number;
}
```

---

#### `admin.dataRequests.list` - قائمة طلبات البيانات

**Method:** `query`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  status?: "pending" | "in_progress" | "approved" | "rejected" | "completed";
  type?: "access" | "rectification" | "erasure" | "portability" | "restriction";
}
```

---

#### `admin.dataRequests.process` - معالجة طلب بيانات

**Method:** `mutation`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  id: number;
  status: "approved" | "rejected";
  notes?: string;
  responseData?: string;  // JSON for data export
}
```

---

### Reports Endpoints / نقاط التقارير {#reports-endpoints}

#### `reports.getOverview` - نظرة عامة

**Method:** `query`  
**Auth:** Required ✓

**Response:**
```typescript
{
  usersCount: number;
  bookingsCount: number;
  revenueThisMonth: number;
  ticketsCount: number;
  trends: {
    usersGrowth: number;
    bookingsGrowth: number;
    revenueGrowth: number;
  };
}
```

---

#### `reports.export` - تصدير تقرير

**Method:** `mutation`  
**Auth:** Admin ✓

**Input:**
```typescript
{
  type: "users" | "bookings" | "revenue" | "compliance";
  format: "csv" | "excel" | "pdf";
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, any>;
}
```

---

## Error Handling / معالجة الأخطاء {#error-handling}

### AI Tools Endpoints / نقاط أدوات الذكاء الاصطناعي {#ai-tools-endpoints}

#### Financial Calculators / الآلات الحاسبة المالية

##### `financialCalculator.calculateGOSI` - حساب التأمينات الاجتماعية

**Method:** `mutation`

**Input:**
```typescript
{
  basicSalary: number;          // الراتب الأساسي
  housingAllowance: number;     // بدل السكن
  isNonSaudi: boolean;          // غير سعودي
  employerContributionRate?: number;  // نسبة صاحب العمل (default: 0.1175)
  employeeContributionRate?: number;  // نسبة الموظف (default: 0.0975)
}
```

**Response:**
```typescript
{
  employeeContribution: number;   // اشتراك الموظف
  employerContribution: number;   // اشتراك صاحب العمل
  totalContribution: number;      // الإجمالي
  totalInsurableSalary: number;   // الراتب الخاضع للتأمين
  breakdown: {
    pension: { employee: number; employer: number };
    annuities: { employer: number };
    saned?: { employee: number; employer: number };
  };
}
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/trpc/financialCalculator.calculateGOSI" \
  -H "Content-Type: application/json" \
  -d '{"json": {"basicSalary": 10000, "housingAllowance": 2500, "isNonSaudi": false}}'
```

---

##### `financialCalculator.calculateEOSB` - حساب نهاية الخدمة

**Method:** `mutation`

**Input:**
```typescript
{
  basicSalary: number;          // الراتب الأساسي
  allowances: number;           // البدلات
  yearsOfService: number;       // سنوات الخدمة
  terminationReason: "resignation" | "termination" | "contract_end" | "retirement";
  contractType: "unlimited" | "limited";
}
```

**Response:**
```typescript
{
  totalAmount: number;           // المبلغ الإجمالي
  yearsCalculation: string;      // تفصيل السنوات
  eligibilityPercentage: number; // نسبة الاستحقاق
  breakdown: {
    firstFiveYears: number;      // أول 5 سنوات
    afterFiveYears: number;      // بعد 5 سنوات
    adjustedTotal: number;       // الإجمالي المعدل
  };
  warnings: string[];            // التنبيهات
}
```

---

##### `financialCalculator.calculateLeave` - حساب الإجازات

**Method:** `mutation`

**Input:**
```typescript
{
  yearsOfService: number;    // سنوات الخدمة
  usedDays: number;          // الأيام المستخدمة
  carryOverDays: number;     // الأيام المرحلة
  dailySalary: number;       // الراتب اليومي
}
```

**Response:**
```typescript
{
  annualEntitlement: number;  // الاستحقاق السنوي (21 أو 30)
  remainingDays: number;      // الأيام المتبقية
  totalAccrued: number;       // إجمالي المستحق
  cashValue: number;          // القيمة النقدية
  expiryDate: string;         // تاريخ انتهاء الصلاحية
}
```

---

#### Compliance Checker / فحص الامتثال

##### `complianceChecker.checkCompliance` - فحص الامتثال الشامل

**Method:** `mutation`

**Input:**
```typescript
{
  employeeData: {
    name: string;
    nationality: string;
    salary: number;
    contractType: string;
    workingHours: number;
  };
  companyData: {
    sector: string;
    size: "small" | "medium" | "large";
    totalEmployees: number;
    saudiEmployees: number;
  };
}
```

**Response:**
```typescript
{
  overallStatus: "compliant" | "non-compliant" | "warning";
  score: number;
  checks: Array<{
    category: string;
    status: "pass" | "fail" | "warning";
    message: string;
    regulation: string;
  }>;
  recommendations: string[];
}
```

---

##### `complianceChecker.checkSaudization` - فحص نسبة السعودة

**Method:** `mutation`

**Input:**
```typescript
{
  sector: string;                // القطاع
  companySize: "small" | "medium" | "large";
  totalEmployees: number;        // إجمالي الموظفين
  saudiEmployees: number;        // الموظفين السعوديين
}
```

**Response:**
```typescript
{
  currentPercentage: number;     // النسبة الحالية
  requiredPercentage: number;    // النسبة المطلوبة
  band: "platinum" | "green" | "yellow" | "red";
  isCompliant: boolean;
  shortfall: number;             // العجز (عدد الموظفين)
  recommendations: string[];
}
```

---

##### `complianceChecker.checkWageProtection` - فحص حماية الأجور

**Method:** `mutation`

**Input:**
```typescript
{
  employeeSalary: number;       // راتب الموظف
  paymentDate: string;          // تاريخ الدفع
  paymentMethod: "bank_transfer" | "cash" | "check";
  contractSalary: number;       // الراتب في العقد
}
```

**Response:**
```typescript
{
  isCompliant: boolean;
  issues: Array<{
    type: string;
    severity: "critical" | "warning";
    message: string;
  }>;
  recommendations: string[];
}
```

---

#### Contract Generator / مولد العقود

##### `contractGenerator.generate` - توليد عقد عمل

**Method:** `mutation`

**Input:**
```typescript
{
  type: "unlimited" | "limited" | "part-time" | "remote" | "training";
  employeeInfo: {
    name: string;
    nationalId: string;
    nationality: string;
  };
  jobInfo: {
    title: string;
    department: string;
    salary: number;
  };
  companyInfo: {
    name: string;
    crNumber: string;
  };
  terms: {
    probationPeriod: number;    // أيام
    noticePeriod: number;       // أيام
    workingHours: number;       // ساعات
  };
}
```

**Response:**
```typescript
{
  contractHtml: string;         // العقد بصيغة HTML
  contractText: string;         // العقد نص عادي
  clauses: Array<{
    number: number;
    title: string;
    content: string;
  }>;
}
```

---

#### Employee Analyzer / محلل الموظفين

##### `employeeAnalyzer.analyzePerformance` - تحليل الأداء

**Method:** `mutation`

**Input:**
```typescript
{
  employeeId: string;
  metrics: {
    attendance: number;         // 0-100
    tasksCompleted: number;
    qualityScore: number;       // 0-100
  };
  period: string;              // مثل: "2024-Q1"
}
```

**Response:**
```typescript
{
  overallScore: number;
  rating: "excellent" | "good" | "satisfactory" | "needs_improvement";
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
}
```

---

##### `employeeAnalyzer.predictAttrition` - التنبؤ بالاستقالة

**Method:** `mutation`

**Input:**
```typescript
{
  employeeId: string;
  factors: {
    tenure: number;             // سنوات
    salaryGrowth: number;       // نسبة مئوية
    promotions: number;
    satisfactionScore: number;  // 1-5
  };
}
```

**Response:**
```typescript
{
  riskLevel: "low" | "medium" | "high";
  probability: number;          // 0-100
  riskFactors: string[];
  retentionStrategies: string[];
}
```

---

### Knowledge Base Endpoints / نقاط قاعدة المعرفة {#knowledge-base-endpoints}

##### `knowledgeBase.getAllRegulations` - جميع الأنظمة

**Method:** `query`

**Response:**
```typescript
{
  regulations: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    categoryAr: string;
    categoryEn: string;
    description: string;
    lastUpdated: string;
    articles: Array<{
      number: string;
      titleAr: string;
      titleEn: string;
      contentAr: string;
      contentEn: string;
    }>;
  }>;
}
```

---

##### `knowledgeBase.getRegulation` - نظام محدد

**Method:** `query`

**Input:**
```typescript
{
  id: string;   // مثل: "saudi-labor-law", "gosi", "nitaqat"
}
```

**Response:**
```typescript
{
  regulation: {
    id: string;
    nameAr: string;
    nameEn: string;
    // ... full regulation details
  };
}
```

---

##### `knowledgeBase.searchRegulations` - البحث في الأنظمة

**Method:** `query`

**Input:**
```typescript
{
  query: string;              // نص البحث
  language?: "ar" | "en";     // لغة البحث
  regulationIds?: string[];   // تحديد الأنظمة للبحث فيها
}
```

**Response:**
```typescript
{
  results: Array<{
    regulationId: string;
    regulationName: string;
    articleNumber: string;
    articleTitle: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  totalResults: number;
}
```

---

##### `knowledgeBase.getArticle` - مادة محددة

**Method:** `query`

**Input:**
```typescript
{
  regulationId: string;       // معرف النظام
  articleNumber: string;      // رقم المادة
}
```

**Response:**
```typescript
{
  article: {
    number: string;
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    notes?: string[];
    relatedArticles?: string[];
  };
}
```

---

##### `knowledgeBase.getSummary` - ملخص النظام

**Method:** `query`

**Input:**
```typescript
{
  regulationId: string;
}
```

**Response:**
```typescript
{
  summary: {
    totalArticles: number;
    categories: string[];
    keyTopics: string[];
    lastUpdated: string;
  };
}
```

---

### Error Response Format

```typescript
{
  error: {
    message: string;
    code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR" | "TIMEOUT";
    data?: {
      field?: string;
      validation?: string[];
    };
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description (EN) | Description (AR) |
|------|-------------|------------------|------------------|
| `BAD_REQUEST` | 400 | Invalid input data | بيانات الإدخال غير صالحة |
| `UNAUTHORIZED` | 401 | Not authenticated | غير مصادق |
| `FORBIDDEN` | 403 | Not authorized | غير مصرح |
| `NOT_FOUND` | 404 | Resource not found | المورد غير موجود |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded | تجاوز حد الاستخدام |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | خطأ في الخادم |

---

## Rate Limiting / حدود الاستخدام {#rate-limiting}

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 10 requests | 15 minutes |
| AI Generation | 30 requests | 1 hour |
| File Upload | 50 requests | 1 hour |
| General API | 100 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

---

## WebSocket Events / أحداث الاتصال الفوري {#websocket-events}

### Connection

```typescript
import { io } from "socket.io-client";

const socket = io("wss://rabit.sa", {
  auth: {
    token: "<session_token>"
  }
});
```

### Events

#### `notification` - إشعار جديد

```typescript
socket.on("notification", (data: {
  id: number;
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, any>;
}) => {
  // Handle notification
});
```

---

#### `chat:message` - رسالة جديدة

```typescript
socket.on("chat:message", (data: {
  conversationId: number;
  message: {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
  };
}) => {
  // Handle message
});
```

---

#### `booking:update` - تحديث الحجز

```typescript
socket.on("booking:update", (data: {
  bookingId: number;
  status: string;
  updatedAt: string;
}) => {
  // Handle booking update
});
```

---

## SDK Examples / أمثلة SDK

### JavaScript/TypeScript (tRPC Client)

```typescript
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server/routers";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:5000/api/trpc",
      headers: () => ({
        "Content-Type": "application/json",
      }),
    }),
  ],
});

// Usage
const user = await trpc.auth.me.query();
const result = await trpc.documentGenerator.generateDocument.mutate({
  templateCode: "employment-letter",
  inputData: {
    employeeName: "أحمد محمد",
    position: "مدير الموارد البشرية",
  },
});
```

### React Query Integration

```typescript
import { trpc } from "@/lib/trpc";

function MyComponent() {
  const { data, isLoading } = trpc.profile.getProfile.useQuery();
  
  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      // Handle success
    },
  });

  return (
    // ...
  );
}
```

---

## Contact / التواصل

- **Technical Support:** dev@rabit.sa
- **API Issues:** https://github.com/rabit/api/issues
- **Documentation:** https://docs.rabit.sa

---

*This documentation is auto-generated and may be updated. Last update: January 2025.*

---

## 🔗 Quick Links / روابط سريعة

| Resource | URL |
|----------|-----|
| 🌐 Production API | `https://rabit-app-production.up.railway.app/api/trpc` |
| 🔍 Health Check | `https://rabit-app-production.up.railway.app/api/health` |
| 📊 Sentry Dashboard | `https://rabithr.sentry.io` |
| 📚 Full Documentation | `/docs/INDEX.md` |

---

<div align="center">

**RabitHR API Documentation**  
**آخر تحديث:** يناير 2025

</div>
