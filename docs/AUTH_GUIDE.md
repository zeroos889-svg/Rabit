# 🔐 Authentication System - دليل الاستخدام

## ✅ النظام المُنفذ

تم تنفيذ نظام مصادقة كامل باستخدام:
- **bcryptjs** - تشفير كلمات المرور
- **jsonwebtoken** - JWT tokens للجلسات
- **tRPC** - Type-safe API endpoints

---

## 📋 API Endpoints

### 1. التسجيل - Register
```typescript
authRouter.register({
  email: string,      // البريد الإلكتروني
  password: string,   // كلمة المرور (8 أحرف على الأقل)
  name: string,       // الاسم (حرفان على الأقل)
  phoneNumber?: string,
  userType?: "employee" | "individual" | "company" | "consultant"
})

// Response
{
  success: true,
  message: "تم إنشاء الحساب بنجاح",
  token: "jwt-token-here",
  user: {
    id: number,
    email: string,
    name: string,
    role: "user"
  }
}
```

### 2. تسجيل الدخول - Login
```typescript
authRouter.login({
  email: string,
  password: string
})

// Response
{
  success: true,
  message: "تم تسجيل الدخول بنجاح",
  token: "jwt-token-here",
  user: {
    id: number,
    email: string,
    name: string,
    role: string,
    userType: string
  }
}
```

### 3. المستخدم الحالي - Me
```typescript
authRouter.me()

// Response (إذا مسجل دخول)
{
  id: number,
  email: string,
  role: string
}

// Response (إذا غير مسجل)
null
```

### 4. تسجيل الخروج - Logout
```typescript
authRouter.logout()

// Response
{
  success: true,
  message: "تم تسجيل الخروج بنجاح"
}
```

---

## 🔑 استخدام JWT Token

### في Frontend:

```typescript
// بعد Login أو Register
const { token, user } = await trpc.auth.login.mutate({ 
  email: "user@example.com",
  password: "password123"
});

// حفظ Token
localStorage.setItem('authToken', token);

// إضافة Token للـ requests
const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: () => {
        const token = localStorage.getItem('authToken');
        return token ? {
          Authorization: `Bearer ${token}`
        } : {};
      }
    })
  ]
});
```

### في Backend:

Token يتم استخراجه تلقائياً في `context.ts` ويصبح متاح في `ctx.user`

---

## 🛡️ Protected Routes

### استخدام `protectedProcedure`:

```typescript
import { protectedProcedure } from "./_core/trpc";

const myRouter = router({
  // متاح للجميع
  publicData: publicProcedure.query(() => {
    return { data: "public" };
  }),

  // يتطلب تسجيل دخول
  privateData: protectedProcedure.query(({ ctx }) => {
    // ctx.user متاح ومضمون (non-null)
    return { 
      data: "private",
      userId: ctx.user.id 
    };
  }),

  // للمدراء فقط
  adminData: adminProcedure.query(({ ctx }) => {
    return { data: "admin only" };
  })
});
```

---

## 🔒 Security Features

### ✅ Password Security
- تشفير bcrypt مع salt rounds = 10
- Hashing آمن قبل التخزين
- Never store plain passwords

### ✅ JWT Security
- Token expiry: 7 days
- Secret key من environment variables
- Verification على كل request

### ✅ Input Validation
- Zod schemas للتحقق
- Email validation
- Password minimum 8 characters
- SQL injection protection (Drizzle ORM)

### ✅ Error Handling
- رسائل خطأ واضحة بالعربي
- No sensitive data in errors
- Proper HTTP status codes

---

## 📝 Database Schema

```sql
-- users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(320) UNIQUE,
  name TEXT,
  phoneNumber VARCHAR(20),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  userType ENUM('employee', 'individual', 'company', 'consultant'),
  emailVerified BOOLEAN DEFAULT FALSE,
  profileCompleted BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);

-- passwords table
CREATE TABLE passwords (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  resetToken VARCHAR(255),
  resetTokenExpiry TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Test Registration:
```bash
curl -X POST http://localhost:3000/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:3000/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route:
```bash
curl -X GET http://localhost:3000/trpc/auth.me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚀 Next Steps

1. ✅ **Frontend Integration** - ربط مع UI
2. ✅ **Email Verification** - تفعيل البريد
3. ✅ **Password Reset** - استرجاع كلمة المرور
4. ✅ **OAuth** - Google/Apple login
5. ✅ **2FA** - Two-factor authentication

---

## 📚 Files Created/Modified

**Created:**
- `server/utils/password.ts` - Password hashing utilities
- `server/utils/jwt.ts` - JWT token utilities
- `docs/AUTH_GUIDE.md` - This documentation

**Modified:**
- `server/routers.ts` - Added register/login/logout
- `server/_core/context.ts` - JWT token extraction
- `server/_core/trpc.ts` - Protected procedures (already existed)

---

**تاريخ الإنشاء**: نوفمبر 2025  
**الحالة**: ✅ Production Ready
