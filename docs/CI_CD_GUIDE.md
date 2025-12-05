# 🚀 دليل CI/CD الشامل - منصة رابِط HR

## 📋 نظرة عامة

نظام CI/CD متكامل باستخدام GitHub Actions للتكامل المستمر والنشر التلقائي.

![CI Pipeline](https://github.com/zeroos889-svg/Rabit/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/zeroos889-svg/Rabit/workflows/Security%20&%20Dependency%20Audit/badge.svg)

---

## 🎯 أدلة الإعداد السريع

**ابدأ هنا للإعداد الكامل**:

1. **[دليل إعداد GitHub Secrets](./CI_CD_SECRETS_SETUP.md)** 🔑
   - جميع الـ Secrets المطلوبة
   - كيفية توليد المفاتيح
   - إضافة الـ Secrets لـ GitHub

2. **[دليل Branch Protection Rules](./CI_CD_BRANCH_PROTECTION.md)** 🛡️
   - حماية الفرع الرئيسي
   - إعدادات الموافقات
   - Status checks المطلوبة

3. **[دليل Production Environment](./CI_CD_PRODUCTION_ENV.md)** 🚀
   - إنشاء بيئة الإنتاج
   - Required reviewers
   - Deployment protection

4. **[دليل اختبار CI/CD](./CI_CD_TESTING_GUIDE.md)** ✅
   - كيفية اختبار الـ workflows
   - التحقق من الإعداد
   - استكشاف الأخطاء

---

## ⏱️ الوقت المطلوب للإعداد

| المرحلة | الوقت المتوقع |
|---------|---------------|
| إضافة GitHub Secrets | 15-30 دقيقة |
| تفعيل Branch Protection | 10-15 دقيقة |
| إعداد Production Environment | 10-15 دقيقة |
| اختبار الـ Workflows | 30-45 دقيقة |
| **المجموع** | **1-2 ساعة** |

---

## 📊 بنية Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                         Main Branch Push                          │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      1. Code Quality                              │
│   • ESLint Check                                                  │
│   • TypeScript Type Check                                         │
└──────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│  2. Unit Tests     │ │  3. E2E Tests      │ │  4. Security Audit │
│  • Vitest          │ │  • Playwright      │ │  • npm audit       │
│  • Coverage Report │ │  • Multi-browser   │ │  • Trivy Scan      │
└────────────────────┘ └────────────────────┘ └────────────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      5. Build & Bundle Analysis                   │
│   • Production Build                                              │
│   • Bundle Size Check                                             │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      6. Docker Build & Push                       │
│   • Multi-stage Build                                             │
│   • Push to GHCR                                                  │
│   • Cache Optimization                                            │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      7. Deploy to Production                      │
│   • Railway (if configured)                                       │
│   • Vercel (if configured)                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 ملفات Workflow

| الملف | الوصف |
|-------|-------|
| `.github/workflows/ci.yml` | الـ Pipeline الرئيسي للبناء والاختبار والنشر |
| `.github/workflows/pr-check.yml` | فحص سريع لطلبات الدمج |
| `.github/workflows/security.yml` | فحص أمني أسبوعي تلقائي |
| `.github/workflows/release.yml` | إصدارات تلقائية عند إنشاء tags |
| `.github/workflows/deploy.yml` | إنشاء artifacts للنشر |
| `.github/dependabot.yml` | تحديث تلقائي للحزم |

---

## 🔄 مراحل Pipeline الرئيسي (`ci.yml`)

### الـ Jobs:

| Job | الوصف | المدة المتوقعة |
|-----|-------|---------------|
| `lint-and-typecheck` | فحص ESLint و TypeScript | 2-3 دقائق |
| `unit-tests` | اختبارات Vitest مع Coverage | 3-5 دقائق |
| `e2e-tests` | اختبارات Playwright | 5-8 دقائق |
| `security-audit` | npm audit + Trivy | 1-2 دقيقة |
| `build-test` | بناء Production + تحليل Bundle | 3-4 دقائق |
| `docker-build` | بناء Docker image (main فقط) | 4-6 دقائق |
| `deploy-production` | النشر (main فقط) | 2-3 دقائق |

---

## ⚙️ إعداد GitHub Secrets

### الانتقال إلى الإعدادات:
`Settings` → `Secrets and variables` → `Actions`

### المتغيرات المطلوبة:

| Secret | الوصف | مطلوب |
|--------|-------|------|
| `CODECOV_TOKEN` | رمز Codecov لتقارير التغطية | اختياري |
| `RAILWAY_TOKEN` | رمز Railway للنشر | للنشر على Railway |
| `VERCEL_TOKEN` | رمز Vercel للنشر | للنشر على Vercel |

### الحصول على الرموز:

**لـ Docker Hub** (اختياري):
```bash
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

**لـ Railway:**
```bash
railway login
railway whoami --token
```

**لـ Vercel:**
اذهب إلى: https://vercel.com/account/tokens

---

## 🔒 حماية الفروع والبيئات

### 2. Environment Protection

**Production Environment**:
1. Go to `Settings` → `Environments`
2. Create `production` environment
3. Add protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer (optional)
   - ✅ Deployment branches: `main` only

### 3. Branch Protection

**Protect `main` branch**:
1. Go to `Settings` → `Branches`
2. Add rule for `main`
3. Enable:
   - ✅ Require status checks before merging
   - ✅ Require branches to be up to date
   - ✅ Status checks: `lint-and-typecheck`, `unit-tests`, `e2e-tests`, `security-audit`, `build-test`

---

## 📊 Workflow Triggers

### Push to `main` or `develop`:
```
✅ lint-and-typecheck
✅ unit-tests
✅ e2e-tests  
✅ security-audit
✅ build-test
✅ docker-build (main only)
✅ deploy-production (main only)
```

### Pull Request to `main` or `develop`:
```
✅ lint-and-typecheck
✅ unit-tests
✅ e2e-tests
✅ security-audit
✅ build-test
❌ docker-build (skipped)
❌ deploy-production (skipped)
```

---

## 🎯 Workflow Features

### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
- Cancels previous runs on the same branch
- Saves compute time and costs

### Artifact Retention
- **Coverage Reports**: 30 days
- **Playwright Reports**: 30 days
- **Security Audits**: 30 days
- **Build Artifacts**: 7 days

### Caching
- ✅ npm packages cached (speeds up by ~60%)
- ✅ Docker layers cached (speeds up by ~70%)
- ✅ Playwright browsers cached

---

## 📈 Monitoring & Debugging

### View Workflow Runs
https://github.com/YOUR_USERNAME/Rabit/actions

### Download Artifacts
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download:
   - Coverage report
   - Playwright report
   - Security audit
   - Build artifacts

### Check Logs
Click on any job → Expand steps → View detailed logs

### Re-run Failed Jobs
1. Go to failed workflow run
2. Click "Re-run jobs"
3. Select specific job or all jobs

---

## 🔍 Common Issues

### Issue: `npm ci` fails
**Solution**: Clear cache
```yaml
- name: Clear npm cache
  run: npm cache clean --force
```

### Issue: Playwright tests timeout
**Solution**: Increase timeout in `playwright.config.ts`
```typescript
timeout: 120000, // 2 minutes
```

### Issue: Docker build fails
**Solution**: Check Dockerfile and docker-compose files
```bash
docker build -t rabit-hr .
```

### Issue: Deployment fails
**Solution**: 
1. Check secrets are configured
2. Verify token permissions
3. Check deployment logs

---

## 📚 Best Practices

### 1. Keep Workflows Fast
- ✅ Use caching
- ✅ Run jobs in parallel
- ✅ Use `--frozen-lockfile`
- ✅ Skip unnecessary steps with `if` conditions

### 2. Use Secrets Safely
- ❌ Never commit secrets to repo
- ✅ Use GitHub Secrets
- ✅ Use environment variables
- ✅ Rotate secrets regularly

### 3. Monitor Status
- ✅ Add status badges to README
- ✅ Enable GitHub notifications
- ✅ Review failed runs promptly

### 4. Version Control
- ✅ Pin action versions (`@v4` instead of `@latest`)
- ✅ Review action updates regularly
- ✅ Test workflow changes on feature branches

---

## 🎨 Status Badges

Add to README.md:

```markdown
![CI Pipeline](https://github.com/YOUR_USERNAME/Rabit/workflows/CI/CD%20Pipeline/badge.svg)
```

Shows current status of the pipeline.

---

## 📊 Pipeline Metrics

**Total Duration** (full pipeline):
- Development: ~15-20 minutes
- Production (with deploy): ~20-25 minutes

**Success Rate Target**: > 95%

**Cost**: Free (GitHub Actions free tier: 2,000 minutes/month)

---

## 🚀 Deployment Process

### Automatic Deployment (main branch):
```
1. Push to main
2. CI pipeline runs
3. All tests pass
4. Docker image built
5. Deployment triggered
6. App deployed to Railway/Vercel
7. Notification sent
```

### Manual Deployment:
```bash
# Option 1: GitHub UI
Actions → CI/CD Pipeline → Run workflow → main

# Option 2: Local script
./scripts/deploy.sh production
```

---

## ✅ Checklist Before First Deployment

- [ ] All secrets configured in GitHub
- [ ] Environment protection set up
- [ ] Branch protection enabled
- [ ] `.env.production` configured
- [ ] Database migrations tested
- [ ] Health check endpoint working
- [ ] Sentry DSN configured
- [ ] All tests passing locally

---

**Status**: ✅ **CI/CD Pipeline Ready**

Your application now has enterprise-grade continuous integration and deployment!
