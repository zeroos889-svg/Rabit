# Sentry Configuration Guide

## 🎯 Overview

Sentry is now fully integrated into both frontend and backend for comprehensive error tracking and performance monitoring.

## 📦 Installation Status

- ✅ Frontend: `@sentry/react` v10.27.0
- ✅ Backend: `@sentry/node` v10.27.0
- ✅ Integration complete

## 🔧 Configuration

### 1. Get Your Sentry DSN

1. Go to [sentry.io](https://sentry.io/)
2. Create a new project (Node.js for backend, React for frontend)
3. Copy the DSN from project settings

### 2. Environment Variables

Add to `.env.production`:

```bash
# Backend Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Frontend Sentry
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Optional: Enable Sentry in development
SENTRY_DEBUG=true
```

### 3. Backend Integration

**File**: `server/sentry.ts`

Features:
- ✅ Error tracking
- ✅ Performance monitoring (10% sampling in production)
- ✅ Profiling (10% sampling in production)
- ✅ HTTP request tracing
- ✅ Express middleware tracing
- ✅ User context tracking
- ✅ Breadcrumbs for user actions
- ✅ Health check filtering

**Middleware Order** (in `server/_core/index.ts`):
1. Request handler (first)
2. Tracing handler
3. ... your app middleware ...
4. Error handler (before global error handler)

### 4. Frontend Integration

**File**: `client/src/main.tsx`

Features:
- ✅ Browser error tracking
- ✅ Performance monitoring (10% sampling in production)
- ✅ Session replay (10% sample rate, 100% on errors)
- ✅ Browser tracing integration
- ✅ Automatic breadcrumbs
- ✅ Development filtering

## 📊 Usage Examples

### Backend

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '../sentry';

// Capture exception
try {
  // risky operation
} catch (error) {
  captureException(error, {
    custom: { context: 'payment-processing', orderId: '123' }
  });
}

// Capture message
captureMessage('Payment processed successfully', 'info');

// Set user context
setUser({
  id: user.id,
  email: user.email,
  username: user.username
});

// Add breadcrumb
addBreadcrumb('User clicked checkout', 'user-action', {
  cartTotal: 150.00
});
```

### Frontend

```typescript
import * as Sentry from '@sentry/react';

// Manual error capture
Sentry.captureException(new Error('Something went wrong'));

// Set user
Sentry.setUser({ id: '123', email: 'user@example.com' });

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'ui.click',
  message: 'User clicked submit button',
  level: 'info'
});
```

## 🔍 What Gets Tracked

### Automatically:
- ✅ Unhandled exceptions
- ✅ Unhandled promise rejections
- ✅ HTTP requests (timing, status, errors)
- ✅ Console errors
- ✅ User interactions (clicks, navigation)
- ✅ Performance metrics

### Filtered Out:
- ❌ Health check requests (`/health`)
- ❌ Development errors (unless `SENTRY_DEBUG=true`)
- ❌ Console.log messages (too noisy)

## 📈 Performance Monitoring

### Sample Rates:

**Production**:
- Traces: 10% (1 in 10 requests)
- Profiles: 10%
- Session Replay: 10% normal, 100% on errors

**Development**:
- Traces: 100% (all requests)
- Profiles: 100%
- Session Replay: disabled (unless `SENTRY_DEBUG=true`)

## 🚨 Error Context

Each error includes:
- ✅ Request details (method, URL, headers)
- ✅ User information (if authenticated)
- ✅ Environment (production, development)
- ✅ Release version (`npm_package_version`)
- ✅ Breadcrumbs (last 100 events)
- ✅ Stack trace
- ✅ Device/browser info (frontend)

## 🔐 Security & Privacy

### Sensitive Data Protection:
- ✅ Session Replay masks all text by default
- ✅ Session Replay blocks all media by default
- ✅ Request headers filtered
- ✅ Passwords never sent
- ✅ Credit cards never sent

### Configuration:
```typescript
Sentry.init({
  // ...
  beforeSend(event) {
    // Filter sensitive data here
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    return event;
  }
});
```

## 📊 Sentry Dashboard

After deployment, monitor your application at:
- **Errors**: https://sentry.io/organizations/YOUR_ORG/issues/
- **Performance**: https://sentry.io/organizations/YOUR_ORG/performance/
- **Releases**: https://sentry.io/organizations/YOUR_ORG/releases/

## ✅ Verification

### Test Error Tracking:

**Backend**:
```bash
curl -X POST http://localhost:3000/api/test-sentry \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Frontend**:
Open browser console:
```javascript
throw new Error('Test Sentry Error');
```

Check Sentry dashboard for the error.

## 🎯 Best Practices

1. **Use Breadcrumbs**: Add context before errors occur
2. **Set User Context**: Helps identify affected users
3. **Tag Releases**: Track errors by version
4. **Monitor Performance**: Use transaction names consistently
5. **Filter Noise**: Don't send expected errors (404s, etc.)
6. **Test Locally**: Use `SENTRY_DEBUG=true` to verify
7. **Review Regularly**: Check Sentry dashboard daily

## 📚 Resources

- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

---

**Status**: ✅ **Sentry Integration Complete**

Ready for production error tracking and performance monitoring!
