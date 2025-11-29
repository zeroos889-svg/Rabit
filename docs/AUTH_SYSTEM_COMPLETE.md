# نظام المصادقة - دليل كامل
## Authentication System - Complete Guide

## 📋 نظرة عامة | Overview

تم تطوير نظام مصادقة كامل يتضمن:
- ✅ تسجيل المستخدمين مع تشفير كلمات المرور (bcryptjs)
- ✅ تسجيل الدخول مع JWT tokens
- ✅ حماية المسارات والصفحات (Route Guards)
- ✅ تسجيل الخروج مع حذف الـ tokens
- ✅ عرض معلومات المستخدم في Header
- ✅ التوجيه التلقائي حسب نوع المستخدم

---

## 🏗️ البنية التحتية | Infrastructure

### Backend Files

#### 1. `server/utils/password.ts`
```typescript
import bcrypt from "bcryptjs";

// Hash password with bcrypt (10 salt rounds)
export async function hashPassword(password: string): Promise<string>

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean>
```

#### 2. `server/utils/jwt.ts`
```typescript
import jwt from "jsonwebtoken";

// Generate JWT token (7-day expiry)
export function generateToken(payload: { userId: number; email: string; role: string }): string

// Verify JWT token
export function verifyToken(token: string): { userId: number; email: string; role: string } | null

// Decode JWT token without verification
export function decodeToken(token: string): any
```

#### 3. `server/routers.ts` - Authentication Endpoints
```typescript
// Register new user
auth.register.mutation({
  input: { name, email, phone?, password, userType }
  returns: { message, token, user }
})

// Login user
auth.login.mutation({
  input: { email, password }
  returns: { message, token, user }
})

// Logout user (client-side token removal)
auth.logout.mutation({
  returns: { message: "تم تسجيل الخروج بنجاح" }
})

// Get current user
auth.me.query({
  returns: user | null
})
```

#### 4. `server/_core/context.ts` - JWT Extraction
```typescript
// Extracts JWT from Authorization header
// Populates ctx.user = { id, email, role }
export async function createContext(opts: CreateHTTPContextOptions)
```

### Frontend Files

#### 1. `client/src/main.tsx` - tRPC Client Configuration
```typescript
// Adds Authorization header with JWT token
httpLink({
  headers() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
})
```

#### 2. `client/src/_core/hooks/useAuth.ts`
```typescript
// Custom hook for authentication
export function useAuth(options?: UseAuthOptions) {
  return {
    user,           // Current user data
    loading,        // Loading state
    error,          // Error state
    isAuthenticated, // Boolean
    refresh,        // Refetch user data
    logout          // Logout function (clears tokens + redirects)
  }
}
```

#### 3. `client/src/components/ProtectedRoute.tsx`
```typescript
// Protects routes requiring authentication
export function ProtectedRoute({ 
  children, 
  roles?, 
  requiredRole? 
})

// Higher-order component
export function withAuth(Component, options?)
```

#### 4. `client/src/components/Header.tsx`
```typescript
// Displays user info and logout button
// Uses useAuth() hook
// Shows avatar, name, email
// Dropdown menu: Profile, Dashboard, Settings, Logout
```

#### 5. `client/src/pages/LoginRedesigned.tsx`
```typescript
// Login page with:
// - Email + Password form
// - JWT token storage
// - User profile storage
// - Redirect based on userType
// - OAuth placeholders (Google, Microsoft, LinkedIn)
```

#### 6. `client/src/pages/Register.tsx`
```typescript
// Registration page with:
// - Name, Email, Phone, Password fields
// - User type selection (individual, employee, company, consultant)
// - Password validation (≥8 characters)
// - JWT token storage
// - Redirect based on userType
```

---

## 🔐 تدفق المصادقة | Authentication Flow

### 1. التسجيل | Registration
```
User fills form (name, email, password, userType)
  ↓
Frontend: trpc.auth.register.mutate()
  ↓
Backend: 
  - Hash password (bcryptjs)
  - Create user in DB
  - Create password record
  - Generate JWT token
  ↓
Frontend:
  - Save token to localStorage ("authToken")
  - Save user to localStorage ("user")
  - Redirect to dashboard
```

### 2. تسجيل الدخول | Login
```
User enters email + password
  ↓
Frontend: trpc.auth.login.mutate()
  ↓
Backend:
  - Find user by email
  - Verify password against hash
  - Update lastSignedIn
  - Generate JWT token
  ↓
Frontend:
  - Save token to localStorage
  - Save user to localStorage
  - Redirect to dashboard
```

### 3. الطلبات المحمية | Protected Requests
```
Frontend makes API request
  ↓
tRPC client adds Authorization header:
  Authorization: Bearer {token}
  ↓
Backend context.ts:
  - Extracts token
  - Verifies JWT
  - Populates ctx.user
  ↓
Protected procedures check ctx.user:
  - If exists → Allow request
  - If null → Throw UNAUTHORIZED error
```

### 4. تسجيل الخروج | Logout
```
User clicks logout button
  ↓
Frontend: useAuth().logout()
  ↓
Backend: auth.logout.mutate() (placeholder)
  ↓
Frontend:
  - Clear localStorage ("authToken", "user")
  - Clear tRPC cache
  - Redirect to /login
```

---

## 🛡️ حماية المسارات | Route Protection

### استخدام ProtectedRoute | Using ProtectedRoute
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Protect single route
<Route path="/dashboard" component={() => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
)} />

// Protect with role restriction
<Route path="/admin" component={() => (
  <ProtectedRoute requiredRole="admin">
    <AdminPanel />
  </ProtectedRoute>
)} />

// Protect with multiple allowed roles
<Route path="/console" component={() => (
  <ProtectedRoute roles={["admin", "consultant"]}>
    <ConsultantConsole />
  </ProtectedRoute>
)} />
```

### استخدام withAuth HOC
```tsx
import { withAuth } from "@/components/ProtectedRoute";

const Dashboard = withAuth(DashboardComponent);

<Route path="/dashboard" component={Dashboard} />
```

### منع المستخدمين المسجلين | Public Only Routes
```tsx
import { withPublicOnly } from "@/components/ProtectedRoute";

// Redirects authenticated users to dashboard
<Route path="/login" component={withPublicOnly(Login)} />
<Route path="/register" component={withPublicOnly(Register)} />
```

---

## 🎯 أنواع المستخدمين | User Types

| User Type | Arabic | Dashboard Route | Description |
|-----------|--------|-----------------|-------------|
| `individual` | فرد | `/dashboard` | Individual user |
| `employee` | موظف | `/employee/dashboard` | Employee of a company |
| `company` | شركة | `/company/dashboard` | Company account |
| `consultant` | مستشار | `/consultant/dashboard` | Legal consultant |
| `admin` | مسؤول | `/admin/dashboard` | System administrator |

---

## 📦 التخزين المحلي | Local Storage

### المفاتيح المستخدمة | Storage Keys
```typescript
// JWT token
localStorage.setItem("authToken", token);
localStorage.getItem("authToken");
localStorage.removeItem("authToken");

// User profile
localStorage.setItem("user", JSON.stringify(user));
const user = JSON.parse(localStorage.getItem("user"));
localStorage.removeItem("user");

// Runtime user info (used by useAuth)
localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
localStorage.removeItem("manus-runtime-user-info");
```

---

## 🚀 الاستخدام | Usage Examples

### في المكونات | In Components
```tsx
import { useAuth } from "@/_core/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### في tRPC Procedures
```typescript
// Protected procedure
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Usage
myRouter = router({
  getProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.user is guaranteed to exist
    return db.query.users.findFirst({
      where: eq(users.id, ctx.user.id)
    });
  })
});
```

---

## ⚙️ متغيرات البيئة | Environment Variables

### Backend (.env)
```bash
# JWT Secret (required)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# JWT Expiry (optional, defaults to 7d)
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=mysql://user:password@host:port/database
```

---

## 🔧 التطويرات المستقبلية | Future Enhancements

### 1. التحقق من البريد الإلكتروني | Email Verification
```typescript
// TODO: Implement email verification
auth.verifyEmail.mutation({
  input: { token: string }
})

// Send verification email on registration
// User must verify before full access
```

### 2. إعادة تعيين كلمة المرور | Password Reset
```typescript
// TODO: Implement password reset
auth.forgotPassword.mutation({
  input: { email: string }
})

auth.resetPassword.mutation({
  input: { token: string, newPassword: string }
})
```

### 3. OAuth Integration
```typescript
// TODO: Implement OAuth providers
auth.google.query()      // Google login
auth.microsoft.query()   // Microsoft login
auth.linkedin.query()    // LinkedIn login
auth.apple.query()       // Apple login
```

### 4. Two-Factor Authentication (2FA)
```typescript
// TODO: Implement 2FA
auth.enable2FA.mutation()
auth.verify2FA.mutation({ code: string })
auth.disable2FA.mutation()
```

### 5. Session Management
```typescript
// TODO: Implement session management
auth.getSessions.query()        // List active sessions
auth.revokeSession.mutation()   // Revoke specific session
auth.revokeAllSessions.mutation() // Logout from all devices
```

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### Problem: "UNAUTHORIZED" error
**Solution:**
1. Check if JWT_SECRET is set in .env
2. Verify token exists in localStorage
3. Check token expiry (default 7 days)
4. Ensure Authorization header is sent

### Problem: Redirect loop
**Solution:**
1. Check ProtectedRoute logic
2. Verify user data in localStorage
3. Ensure withPublicOnly is used on login/register routes

### Problem: Token not saved
**Solution:**
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check if mutation returns token
4. Ensure onSuccess callback saves token

### Problem: User data not loading
**Solution:**
1. Check trpc.auth.me.useQuery()
2. Verify token is sent in Authorization header
3. Check backend context.ts token extraction
4. Verify database connection

---

## ✅ قائمة التحقق | Checklist

- [x] Password hashing (bcryptjs)
- [x] JWT token generation (jsonwebtoken)
- [x] Register endpoint
- [x] Login endpoint
- [x] Logout endpoint
- [x] Get current user endpoint
- [x] JWT extraction in context
- [x] Protected procedures middleware
- [x] Admin-only procedures middleware
- [x] tRPC client Authorization header
- [x] useAuth hook
- [x] ProtectedRoute component
- [x] PublicOnlyRoute component
- [x] Login page
- [x] Register page
- [x] Header with user info
- [x] Logout button
- [x] Token storage in localStorage
- [x] User profile storage
- [x] Redirect based on userType
- [ ] Email verification
- [ ] Password reset
- [ ] OAuth integration
- [ ] Two-factor authentication
- [ ] Session management

---

## 📞 الدعم | Support

للمساعدة أو الإبلاغ عن مشاكل:
- GitHub Issues: [repository]/issues
- Email: support@example.com
- Documentation: /docs/AUTH_GUIDE.md

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** Production Ready ✅
