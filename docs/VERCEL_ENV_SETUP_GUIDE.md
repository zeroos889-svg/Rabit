# Vercel Environment Variables Setup Guide
# دليل إعداد متغيرات البيئة على Vercel

This guide provides a comprehensive list of all environment variables required for the Rabit HR platform deployment on Vercel.

## 📋 Quick Setup Checklist

- [ ] Core Required Variables (CRITICAL)
- [ ] Database Configuration
- [ ] Authentication & Security
- [ ] Optional Services (Recommended)
- [ ] Test deployment after configuration

---

## 🔴 CRITICAL - Core Required Variables

These variables MUST be configured for the application to function:

### 1. DATABASE_URL
- **Description**: PostgreSQL database connection string
- **Environment**: Production, Preview, Development
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Example**: `postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway`
- **How to get**: 
  - Railway: Dashboard → Your Database → Connect → Copy Connection String
  - Supabase: Project Settings → Database → Connection String (Direct)
  - Neon: Dashboard → Connection String
- **Required**: ✅ YES

### 2. JWT_SECRET
- **Description**: Secret key for JWT token generation and verification
- **Environment**: Production, Preview, Development
- **Format**: Minimum 32 characters random string
- **Generate**: `openssl rand -base64 32`
- **Example**: `8f3d2e1c9b0a7f4e6d5c3b2a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e`
- **Required**: ✅ YES
- **Security**: Never share or commit this value

### 3. SESSION_SECRET
- **Description**: Secret key for session management
- **Environment**: Production, Preview, Development
- **Format**: Minimum 32 characters random string (different from JWT_SECRET)
- **Generate**: `openssl rand -base64 32`
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`
- **Required**: ✅ YES
- **Security**: Use different value than JWT_SECRET

### 4. NODE_ENV
- **Description**: Node.js environment mode
- **Environment**: 
  - Production: `production`
  - Preview: `production` or `preview`
  - Development: `development`
- **Value**: `production`
- **Required**: ✅ YES

---

## 🔵 Database & Caching

### 5. REDIS_URL (Highly Recommended)
- **Description**: Redis connection string for caching and session storage
- **Environment**: Production, Preview (optional for Development)
- **Format**: `redis://default:PASSWORD@HOST:PORT`
- **Examples**:
  - Railway: `redis://default:xxxxx@containers-us-west-xxx.railway.app:6379`
  - Upstash: `redis://default:xxxxx@your-redis.upstash.io:6379`
  - Vercel KV: Auto-configured via Vercel integration
- **How to get**:
  - Upstash: Create Redis instance → Copy connection URL
  - Railway: Add Redis service → Copy connection string
  - Vercel KV: Project → Storage → Create KV Database → Auto-integrated
- **Required**: 🟡 Recommended for production
- **Note**: App will function without Redis but with degraded performance

---

## 🔒 Authentication & Security

### 6. SESSION_MAX_AGE
- **Description**: Session expiration time in milliseconds
- **Environment**: Production, Preview, Development
- **Default**: `604800000` (7 days)
- **Format**: Number in milliseconds
- **Examples**:
  - 1 hour: `3600000`
  - 1 day: `86400000`
  - 7 days: `604800000`
  - 30 days: `2592000000`
- **Required**: ❌ Optional (uses default if not set)

---

## 🌐 Application Configuration

### 7. VITE_APP_URL / APP_URL
- **Description**: Frontend application URL for CORS and redirects
- **Environment**: 
  - Production: Your production domain
  - Preview: Vercel preview URL (auto-generated)
  - Development: `http://localhost:5173`
- **Format**: Full URL with protocol
- **Example**: `https://rabit-hr.vercel.app`
- **Required**: 🟡 Recommended

### 8. VITE_APP_TITLE
- **Description**: Application title shown in browser tab and meta tags
- **Environment**: Production, Preview, Development
- **Default**: `رابِط - منصة إدارة الموارد البشرية`
- **Format**: Text string (supports Arabic and English)
- **Example**: `رابِط | Rabit - نظام إدارة الموارد البشرية`
- **Required**: ❌ Optional (uses default)

### 9. VITE_APP_LOGO
- **Description**: Path to application logo
- **Environment**: Production, Preview, Development
- **Default**: `/LOGO.svg`
- **Format**: Path relative to public directory
- **Example**: `/LOGO.svg` or `/images/logo.png`
- **Required**: ❌ Optional (uses default)

### 10. PORT
- **Description**: Server port (Vercel automatically sets this)
- **Environment**: Usually auto-configured by Vercel
- **Default**: `3000`
- **Required**: ❌ Optional (Vercel manages this)

---

## 📊 Analytics (Recommended)

### 11. VITE_GA_MEASUREMENT_ID
- **Description**: Google Analytics 4 measurement ID
- **Environment**: Production (optional for Preview/Development)
- **Format**: `G-XXXXXXXXXX`
- **Example**: `G-12ABC34DEF`
- **How to get**: 
  1. Go to https://analytics.google.com/
  2. Create new property
  3. Copy Measurement ID from Admin → Data Streams
- **Required**: 🟡 Recommended for production tracking

### 12. VITE_ANALYTICS_ENDPOINT
- **Description**: Self-hosted analytics endpoint (if using Umami/Plausible)
- **Environment**: Production, Preview
- **Format**: Full URL
- **Example**: `https://analytics.yourdomain.com`
- **Required**: ❌ Optional (alternative to Google Analytics)

### 13. VITE_ANALYTICS_WEBSITE_ID
- **Description**: Website ID for self-hosted analytics
- **Environment**: Production, Preview
- **Format**: UUID or unique identifier
- **Example**: `abc123def-456g-789h-012i-345jkl678mno`
- **Required**: ❌ Optional (required if using VITE_ANALYTICS_ENDPOINT)

---

## 📧 Email Service (Optional)

### 14. SMTP_HOST
- **Description**: SMTP server hostname
- **Environment**: Production, Preview
- **Examples**:
  - Gmail: `smtp.gmail.com`
  - SendGrid: `smtp.sendgrid.net`
  - AWS SES: `email-smtp.us-east-1.amazonaws.com`
- **Required**: ❌ Optional (needed for email features)

### 15. SMTP_PORT
- **Description**: SMTP server port
- **Environment**: Production, Preview
- **Common Values**:
  - TLS: `587`
  - SSL: `465`
  - Non-encrypted: `25`
- **Default**: `587`
- **Required**: ❌ Optional

### 16. SMTP_USER
- **Description**: SMTP authentication username (usually email address)
- **Environment**: Production, Preview
- **Example**: `noreply@yourdomain.com`
- **Required**: ❌ Optional

### 17. SMTP_PASSWORD
- **Description**: SMTP authentication password
- **Environment**: Production, Preview
- **Note**: For Gmail, use App Password not account password
- **How to get**: 
  - Gmail: Account → Security → 2-Step Verification → App passwords
  - SendGrid: Settings → API Keys
- **Required**: ❌ Optional
- **Security**: Never share or expose

### 18. SMTP_FROM / EMAIL_FROM
- **Description**: Default sender email address
- **Environment**: Production, Preview
- **Format**: Email address or `Name <email@domain.com>`
- **Example**: `Rabit HR <noreply@rabit.sa>`
- **Required**: ❌ Optional

---

## 🎨 Media & File Storage (Optional)

### 19. CLOUDINARY_URL
- **Description**: Cloudinary full connection URL
- **Environment**: Production, Preview
- **Format**: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- **Example**: `cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@your-cloud`
- **How to get**: Cloudinary Dashboard → Account Details → API Environment variable
- **Required**: ❌ Optional (for image optimization)

### 20. CLOUDINARY_CLOUD_NAME
- **Description**: Cloudinary cloud name (alternative to full URL)
- **Environment**: Production, Preview
- **Example**: `your-cloud-name`
- **Required**: ❌ Optional

### 21. CLOUDINARY_API_KEY
- **Description**: Cloudinary API key
- **Environment**: Production, Preview
- **Example**: `123456789012345`
- **Required**: ❌ Optional

### 22. CLOUDINARY_API_SECRET
- **Description**: Cloudinary API secret
- **Environment**: Production, Preview
- **Example**: `abcdefghijklmnopqrstuvwxyz`
- **Required**: ❌ Optional
- **Security**: Keep confidential

### 23. VITE_IMAGE_CDN_URL
- **Description**: CDN URL for serving optimized images
- **Environment**: Production, Preview
- **Example**: `https://images.yourdomain.com`
- **Required**: ❌ Optional

---

## 🔍 Error Tracking (Recommended)

### 24. SENTRY_DSN
- **Description**: Sentry DSN for server-side error tracking
- **Environment**: Production, Preview
- **Format**: `https://xxxxx@o12345.ingest.sentry.io/12345`
- **How to get**: 
  1. Create project at https://sentry.io/
  2. Settings → Client Keys (DSN)
- **Required**: 🟡 Recommended for production monitoring

### 25. VITE_SENTRY_DSN
- **Description**: Sentry DSN for client-side error tracking
- **Environment**: Production, Preview
- **Format**: Same as SENTRY_DSN (can use same or separate project)
- **Required**: 🟡 Recommended

### 26. VITE_SENTRY_DEBUG
- **Description**: Enable Sentry debug mode
- **Environment**: Development only
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional

---

## 💳 Payment Gateways (Optional)

### Moyasar (Saudi Arabia)

#### 27. MOYASAR_API_KEY
- **Description**: Moyasar public API key
- **Environment**: Production, Preview, Development
- **How to get**: Moyasar Dashboard → API Keys
- **Required**: ❌ Optional (if using Moyasar payments)

#### 28. MOYASAR_SECRET_KEY
- **Description**: Moyasar secret key
- **Environment**: Production, Preview
- **Required**: ❌ Optional
- **Security**: Never expose in frontend

#### 29. MOYASAR_WEBHOOK_SECRET
- **Description**: Webhook signature verification secret
- **Environment**: Production, Preview
- **Required**: ❌ Optional (if using webhooks)

### Tap Payments

#### 30. TAP_API_KEY
- **Description**: Tap Payments API key
- **Environment**: Production, Preview, Development
- **How to get**: Tap Dashboard → API Keys
- **Required**: ❌ Optional (if using Tap payments)

#### 31. TAP_SECRET_KEY
- **Description**: Tap Payments secret key
- **Environment**: Production, Preview
- **Required**: ❌ Optional
- **Security**: Server-side only

#### 32. TAP_WEBHOOK_SECRET
- **Description**: Tap webhook signature secret
- **Environment**: Production, Preview
- **Required**: ❌ Optional

---

## 🤖 AI Services (Optional)

### OpenAI

#### 33. OPENAI_API_KEY
- **Description**: OpenAI API key for AI features
- **Environment**: Production, Preview
- **How to get**: https://platform.openai.com/api-keys
- **Required**: ❌ Optional (if using AI features)
- **Security**: High cost risk - monitor usage

#### 34. OPENAI_MODEL
- **Description**: OpenAI model to use
- **Environment**: Production, Preview, Development
- **Default**: `gpt-4o-mini`
- **Options**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **Required**: ❌ Optional

### DeepSeek

#### 35. DEEPSEEK_API_KEY
- **Description**: DeepSeek AI API key (alternative to OpenAI)
- **Environment**: Production, Preview
- **Required**: ❌ Optional

#### 36. DEEPSEEK_API_URL
- **Description**: DeepSeek API endpoint
- **Environment**: Production, Preview, Development
- **Default**: `https://api.deepseek.com`
- **Required**: ❌ Optional

#### 37. DEEPSEEK_MODEL
- **Description**: DeepSeek model name
- **Environment**: Production, Preview, Development
- **Default**: `deepseek-chat`
- **Required**: ❌ Optional

---

## 📱 SMS & Notifications (Optional)

#### 38. SMS_API_KEY
- **Description**: SMS provider API key (Twilio/Unifonic/etc)
- **Environment**: Production, Preview
- **Required**: ❌ Optional (if using SMS features)

#### 39. SMS_SENDER_ID
- **Description**: SMS sender name/number
- **Environment**: Production, Preview
- **Default**: `Rabit`
- **Example**: `RABIT-HR`
- **Required**: ❌ Optional

#### 40. ENABLE_SMS_2FA
- **Description**: Enable SMS two-factor authentication
- **Environment**: Production, Preview
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional

#### 41. ENABLE_SMS_LOGIN_ALERT
- **Description**: Send SMS alerts on login
- **Environment**: Production, Preview
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional

#### 42. ENABLE_SMS_BOOKING_ALERTS
- **Description**: Send SMS for booking notifications
- **Environment**: Production, Preview
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional

---

## 🗺️ External APIs (Optional)

#### 43. GOOGLE_MAPS_API_KEY
- **Description**: Google Maps API key for location features
- **Environment**: Production, Preview
- **How to get**: Google Cloud Console → APIs & Services → Credentials
- **Required**: ❌ Optional (if using map features)

#### 44. VITE_FRONTEND_FORGE_API_KEY
- **Description**: Frontend Forge API key
- **Environment**: Production, Preview, Development
- **Required**: ❌ Optional

#### 45. VITE_FRONTEND_FORGE_API_URL
- **Description**: Frontend Forge API endpoint
- **Environment**: Production, Preview, Development
- **Required**: ❌ Optional

#### 46. BUILT_IN_FORGE_API_URL
- **Description**: Built-in Forge storage API URL
- **Environment**: Production, Preview
- **Required**: ❌ Optional

#### 47. BUILT_IN_FORGE_API_KEY
- **Description**: Built-in Forge API key
- **Environment**: Production, Preview
- **Required**: ❌ Optional

---

## 🔐 Advanced Security (Optional)

#### 48. ENABLE_2FA
- **Description**: Enable two-factor authentication feature
- **Environment**: Production, Preview
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional

#### 49. RATE_LIMIT_WINDOW_MS
- **Description**: Rate limiting time window in milliseconds
- **Environment**: Production, Preview
- **Default**: `900000` (15 minutes)
- **Format**: Number in milliseconds
- **Required**: ❌ Optional

#### 50. RATE_LIMIT_MAX_REQUESTS
- **Description**: Maximum requests allowed per window
- **Environment**: Production, Preview
- **Default**: `100`
- **Format**: Number
- **Required**: ❌ Optional

#### 51. LOG_LEVEL
- **Description**: Logging verbosity level
- **Environment**: Production, Preview, Development
- **Options**: `error`, `warn`, `info`, `debug`, `trace`
- **Production Recommended**: `info`
- **Development**: `debug`
- **Required**: ❌ Optional

#### 52. CORS_ORIGIN / ALLOWED_ORIGINS
- **Description**: Allowed CORS origins (comma-separated)
- **Environment**: Production, Preview
- **Format**: `https://domain1.com,https://domain2.com`
- **Example**: `https://rabit-hr.vercel.app,https://www.rabit.sa`
- **Required**: ❌ Optional (auto-configured in many cases)

---

## 👨‍💼 Admin Configuration (Optional)

#### 53. ADMIN_EMAIL
- **Description**: Default admin user email
- **Environment**: Production (first-time setup only)
- **Example**: `admin@rabit.sa`
- **Required**: ❌ Optional (for initial admin creation)

#### 54. ADMIN_PASSWORD
- **Description**: Default admin password
- **Environment**: Production (first-time setup only)
- **Security**: Should be changed immediately after first login
- **Required**: ❌ Optional

#### 55. ALLOW_ADMIN_SEED
- **Description**: Allow database seeding with test data
- **Environment**: Development only
- **Values**: `true` or `false`
- **Default**: `false`
- **Required**: ❌ Optional
- **Security**: NEVER enable in production

---

## 🚀 Quick Start: Minimum Configuration

For a basic working deployment, you need AT MINIMUM:

```bash
# Core Requirements (3 variables)
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=<32-character-random-string>
SESSION_SECRET=<32-character-random-string>

# Environment
NODE_ENV=production
```

**Generate secrets:**
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET (use different value)
openssl rand -base64 32
```

---

## 📝 How to Add Variables to Vercel

### Method 1: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`rabit` or similar)
3. Go to **Settings** tab
4. Click **Environment Variables** in left sidebar
5. For each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select where to use:
     - ✅ Production (live site)
     - ✅ Preview (pull request previews)
     - ⬜ Development (local development - usually not needed)
6. Click **Add** or **Save**
7. Repeat for all required variables

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add single variable
vercel env add DATABASE_URL production

# Bulk add from file (create .env.vercel first)
vercel env pull .env.vercel
```

### Method 3: Bulk Import via API

Create a file `env-setup.sh`:

```bash
#!/bin/bash
# Add your variables here
vercel env add DATABASE_URL "your-database-url" production preview
vercel env add JWT_SECRET "$(openssl rand -base64 32)" production preview
vercel env add SESSION_SECRET "$(openssl rand -base64 32)" production preview
vercel env add NODE_ENV "production" production
# ... add more as needed
```

Run:
```bash
chmod +x env-setup.sh
./env-setup.sh
```

---

## ✅ Verification Steps

After adding environment variables:

### 1. Check Configuration
```bash
# List all environment variables
vercel env ls

# Pull environment variables to verify
vercel env pull .env.production.local
```

### 2. Trigger Deployment
```bash
# Option 1: Via CLI
vercel --prod

# Option 2: Via Git
git commit --allow-empty -m "Trigger deployment for env vars"
git push origin main

# Option 3: Via Dashboard
# Go to Deployments → Click "Redeploy" on latest deployment
```

### 3. Verify Deployment
1. Wait for deployment to complete
2. Check deployment logs for errors
3. Visit your production URL
4. Test critical features:
   - [ ] Database connection (try login)
   - [ ] Authentication (JWT tokens)
   - [ ] Session management
   - [ ] Any integrated services (payments, email, etc.)

### 4. Monitor for Issues
```bash
# View real-time logs
vercel logs --follow

# Check specific deployment
vercel logs [deployment-url]
```

---

## 🐛 Troubleshooting

### Issue: "Missing required environment variables"
**Solution**: Ensure DATABASE_URL, JWT_SECRET, and SESSION_SECRET are added to Production and Preview environments

### Issue: "Database connection failed"
**Solution**: 
- Verify DATABASE_URL format is correct
- Check database is publicly accessible
- Ensure IP whitelist includes `0.0.0.0/0` for Vercel (or use Vercel's outbound IP ranges)

### Issue: "JWT token verification failed"
**Solution**:
- Verify JWT_SECRET is at least 32 characters
- Ensure same JWT_SECRET in all environments you're testing
- Check JWT_SECRET doesn't have spaces or special characters that need escaping

### Issue: "Session expired immediately"
**Solution**:
- Add SESSION_SECRET
- Ensure SESSION_SECRET is different from JWT_SECRET
- Check SESSION_MAX_AGE if sessions need longer duration

### Issue: "CORS errors"
**Solution**:
- Add VITE_APP_URL with your actual Vercel URL
- Add ALLOWED_ORIGINS if using multiple domains
- Ensure CORS_ORIGIN includes your frontend domain

### Issue: "Changes not reflected after adding env vars"
**Solution**:
- Environment variables only apply to NEW deployments
- Trigger a new deployment (redeploy or push new commit)
- Clear browser cache and Vercel cache

---

## 📚 Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway PostgreSQL Setup](https://docs.railway.app/databases/postgresql)
- [Upstash Redis for Vercel](https://upstash.com/docs/redis/tutorials/vercel)
- [Sentry Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)

---

## 🔒 Security Best Practices

1. **Never commit secrets**: Keep `.env` files in `.gitignore`
2. **Use strong secrets**: Minimum 32 characters for JWT_SECRET and SESSION_SECRET
3. **Rotate secrets regularly**: Change secrets every 90 days in production
4. **Separate environments**: Use different secrets for Production/Preview/Development
5. **Least privilege**: Only add variables needed for each environment
6. **Monitor access**: Review who has access to environment variables
7. **Audit logs**: Check Vercel audit logs for env var changes
8. **Backup configuration**: Keep encrypted backup of production env vars

---

## ✨ Recommended Production Setup

For optimal production deployment:

```bash
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-32-chars>
SESSION_SECRET=<strong-random-32-chars-different>
NODE_ENV=production

# Highly Recommended
REDIS_URL=redis://...
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
SENTRY_DSN=https://...
VITE_SENTRY_DSN=https://...
VITE_APP_URL=https://your-domain.com

# Optional but Useful
VITE_APP_TITLE=Your App Title
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=<app-password>
EMAIL_FROM=Your App <noreply@yourdomain.com>
```

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this guide for proper configuration
3. Consult [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)
4. Check [ENVIRONMENT_VARIABLES_FINAL_REPORT.md](./ENVIRONMENT_VARIABLES_FINAL_REPORT.md)

---

**Last Updated**: November 26, 2025  
**Document Version**: 1.0.0  
**Rabit HR Platform**: Production Deployment Guide
