# Authentication System Testing Guide
# دليل اختبار نظام المصادقة

## 🧪 Manual Testing Checklist

### Prerequisites
- [x] Development server running (`npm run dev`)
- [x] Database connected (Railway MySQL)
- [x] Browser with DevTools open

---

## Test 1: Registration Flow ✅

### Steps:
1. **Navigate to Register Page**
   ```
   URL: http://localhost:5173/register
   ```

2. **Fill Registration Form**
   - Name: "أحمد محمد السعودي"
   - Email: "test@example.com"
   - Phone: "+966501234567" (optional)
   - Password: "Test@123456"
   - User Type: "employee"

3. **Submit Form**
   - Click "إنشاء حساب"

4. **Verify Success**
   - [ ] Toast notification: "تم إنشاء الحساب بنجاح"
   - [ ] Redirect to: `/employee/dashboard`
   - [ ] Check localStorage:
     ```javascript
     localStorage.getItem("authToken") // Should have JWT
     localStorage.getItem("user")      // Should have user JSON
     ```

5. **Verify Database**
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   SELECT * FROM passwords WHERE userId = <user_id>;
   ```

---

## Test 2: Login Flow ✅

### Steps:
1. **Navigate to Login Page**
   ```
   URL: http://localhost:5173/login
   ```

2. **Enter Credentials**
   - Email: "test@example.com"
   - Password: "Test@123456"

3. **Submit Form**
   - Click "تسجيل الدخول"

4. **Verify Success**
   - [ ] Toast notification: "تم تسجيل الدخول بنجاح"
   - [ ] Redirect to appropriate dashboard based on userType
   - [ ] Check localStorage for updated token
   - [ ] Header shows user name and avatar

---

## Test 3: Protected Routes ✅

### Test 3A: Access Protected Route While Logged In
1. **Navigate to Protected Page**
   ```
   URL: http://localhost:5173/dashboard
   ```

2. **Verify Access**
   - [ ] Page loads successfully
   - [ ] User data is available
   - [ ] No redirect to login

### Test 3B: Access Protected Route While Logged Out
1. **Clear localStorage**
   ```javascript
   localStorage.clear()
   ```

2. **Try to Access Protected Page**
   ```
   URL: http://localhost:5173/dashboard
   ```

3. **Verify Redirect**
   - [ ] Automatically redirects to `/login`
   - [ ] ProtectedRoute is working

---

## Test 4: Header User Info ✅

### When Logged In:
- [ ] Avatar shows user initials
- [ ] Dropdown menu appears on click
- [ ] Shows user name
- [ ] Shows user email
- [ ] Has "الملف الشخصي" link
- [ ] Has "لوحة التحكم" link
- [ ] Has "الإعدادات" link
- [ ] Has "تسجيل الخروج" button (red)

### When Logged Out:
- [ ] Shows "تسجيل الدخول" button
- [ ] Shows "إنشاء حساب" button
- [ ] No user avatar

---

## Test 5: Logout Flow ✅

### Steps:
1. **Click User Avatar**
   - In header

2. **Click Logout Button**
   - "تسجيل الخروج" (red button)

3. **Verify Logout**
   - [ ] Toast notification: "تم تسجيل الخروج بنجاح"
   - [ ] Redirect to `/login`
   - [ ] localStorage cleared:
     ```javascript
     localStorage.getItem("authToken") // null
     localStorage.getItem("user")      // null
     ```
   - [ ] Header shows login/signup buttons

4. **Try Accessing Protected Route**
   - [ ] Redirects to login page

---

## Test 6: JWT Token Validation ✅

### Test 6A: Valid Token
1. **Make API Request**
   ```javascript
   // In browser console
   const response = await fetch('/api/trpc/auth.me', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('authToken')
     }
   });
   console.log(await response.json());
   ```

2. **Verify Response**
   - [ ] Returns user data
   - [ ] No UNAUTHORIZED error

### Test 6B: Invalid Token
1. **Set Invalid Token**
   ```javascript
   localStorage.setItem('authToken', 'invalid-token-123');
   ```

2. **Make API Request**
   ```javascript
   const response = await fetch('/api/trpc/auth.me', {
     headers: {
       'Authorization': 'Bearer invalid-token-123'
     }
   });
   console.log(await response.json());
   ```

3. **Verify Response**
   - [ ] Returns UNAUTHORIZED error
   - [ ] Does not return user data

---

## Test 7: Password Security ✅

### Test 7A: Weak Password Validation
1. **Try Registering with Weak Password**
   - Password: "123"

2. **Verify Validation**
   - [ ] Error message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
   - [ ] Form does not submit

### Test 7B: Password Hashing
1. **Check Database**
   ```sql
   SELECT hashedPassword FROM passwords WHERE userId = <user_id>;
   ```

2. **Verify Hashing**
   - [ ] Password is NOT stored in plain text
   - [ ] Hash starts with "$2a$" (bcrypt format)
   - [ ] Hash length is 60 characters

---

## Test 8: User Types & Redirects ✅

### Test Each User Type:

#### Individual
- Register with userType: "individual"
- [ ] Redirects to: `/` or `/dashboard`

#### Employee
- Register with userType: "employee"
- [ ] Redirects to: `/employee/dashboard`

#### Company
- Register with userType: "company"
- [ ] Redirects to: `/company/dashboard`

#### Consultant
- Register with userType: "consultant"
- [ ] Redirects to: `/consultant/dashboard`

---

## Test 9: Error Handling ✅

### Test 9A: Duplicate Email
1. **Register with Existing Email**
   - Use email from Test 1

2. **Verify Error**
   - [ ] Toast error message
   - [ ] Does not create duplicate user

### Test 9B: Wrong Password
1. **Login with Wrong Password**
   - Email: "test@example.com"
   - Password: "WrongPassword123"

2. **Verify Error**
   - [ ] Toast error: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
   - [ ] Does not log in

### Test 9C: Non-existent User
1. **Login with Non-existent Email**
   - Email: "nonexistent@example.com"
   - Password: "anything"

2. **Verify Error**
   - [ ] Toast error message
   - [ ] Does not log in

---

## Test 10: Session Persistence ✅

### Steps:
1. **Login Successfully**
   - Follow Test 2

2. **Refresh Page**
   - Press F5 or Cmd+R

3. **Verify Persistence**
   - [ ] User still logged in
   - [ ] Header shows user info
   - [ ] Can access protected routes

4. **Close & Reopen Browser**
   - Close browser completely
   - Reopen and navigate to site

5. **Verify Persistence**
   - [ ] User still logged in (localStorage persists)
   - [ ] Token still valid

---

## 🔧 Debugging Tools

### Check localStorage
```javascript
// In browser console
console.log("Token:", localStorage.getItem("authToken"));
console.log("User:", JSON.parse(localStorage.getItem("user")));
```

### Check JWT Token
```javascript
// Decode JWT (without verification)
const token = localStorage.getItem("authToken");
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));
console.log("JWT Payload:", JSON.parse(jsonPayload));
```

### Check Database
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- View recent users
SELECT id, name, email, userType, createdAt 
FROM users 
ORDER BY createdAt DESC 
LIMIT 10;

-- Check passwords table
SELECT userId, LEFT(hashedPassword, 20) as passwordHash 
FROM passwords 
ORDER BY createdAt DESC 
LIMIT 10;
```

---

## ✅ Expected Results Summary

All tests should pass with:
- ✅ Registration works and creates user in DB
- ✅ Login works and returns JWT token
- ✅ Token is saved to localStorage
- ✅ Protected routes redirect to login when not authenticated
- ✅ Protected routes work when authenticated
- ✅ Header shows user info when logged in
- ✅ Logout clears tokens and redirects
- ✅ Password is hashed in database
- ✅ JWT token is validated on requests
- ✅ User types redirect correctly
- ✅ Error handling works properly

---

## 🐛 Common Issues & Solutions

### Issue: "UNAUTHORIZED" error
**Solution:** Check JWT_SECRET in .env file

### Issue: Redirect loop
**Solution:** Clear localStorage and try again

### Issue: Token not saved
**Solution:** Check browser console for errors

### Issue: Database error
**Solution:** Verify DATABASE_URL and connection

### Issue: Password validation not working
**Solution:** Check Register.tsx validation logic

---

## 📊 Testing Report Template

```
Date: _______________
Tester: _______________

Test 1 - Registration: [ ] Pass [ ] Fail
Test 2 - Login: [ ] Pass [ ] Fail
Test 3 - Protected Routes: [ ] Pass [ ] Fail
Test 4 - Header User Info: [ ] Pass [ ] Fail
Test 5 - Logout: [ ] Pass [ ] Fail
Test 6 - JWT Validation: [ ] Pass [ ] Fail
Test 7 - Password Security: [ ] Pass [ ] Fail
Test 8 - User Types: [ ] Pass [ ] Fail
Test 9 - Error Handling: [ ] Pass [ ] Fail
Test 10 - Session Persistence: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________

Overall Status: [ ] All Tests Pass [ ] Some Tests Fail
```

---

**Next Step:** Run all tests and mark each as Pass/Fail.
**Recommendation:** Automate these tests with Vitest + Testing Library.
