# CI/CD Pipeline Documentation

## 🚀 Overview

Automated CI/CD pipeline using GitHub Actions for continuous integration, testing, and deployment.

## 📋 Pipeline Jobs

### 1. Code Quality ✅
**Job**: `lint-and-typecheck`

Runs on every push and pull request to `main` and `develop` branches.

**Steps**:
- ESLint code linting
- TypeScript type checking

**Duration**: ~2-3 minutes

---

### 2. Unit Tests ✅
**Job**: `unit-tests`

Runs after code quality checks pass.

**Steps**:
- Run Vitest unit tests
- Generate coverage report
- Upload coverage artifacts (30 days retention)

**Duration**: ~3-5 minutes

---

### 3. E2E Tests ✅
**Job**: `e2e-tests`

Runs in parallel with unit tests.

**Steps**:
- Install Playwright browsers
- Run E2E tests across 5 browsers:
  - Desktop: Chrome, Firefox, Safari
  - Mobile: Chrome (Pixel 5), Safari (iPhone 12)
- Upload Playwright HTML report (30 days retention)

**Duration**: ~5-8 minutes

---

### 4. Security Audit ✅
**Job**: `security-audit`

Runs in parallel with tests.

**Steps**:
- npm audit (moderate level)
- Generate JSON audit report
- Upload audit artifacts (30 days retention)

**Duration**: ~1-2 minutes

---

### 5. Build Test ✅
**Job**: `build-test`

Runs after all tests pass.

**Steps**:
- Production build
- Upload build artifacts (7 days retention)

**Duration**: ~3-4 minutes

---

### 6. Docker Build 🐳
**Job**: `docker-build`

**Trigger**: Only on push to `main` branch

**Steps**:
- Set up Docker Buildx
- Login to Docker Hub (if credentials provided)
- Build Docker image
- Use GitHub Actions cache for faster builds

**Duration**: ~4-6 minutes

---

### 7. Deploy to Production 🚀
**Job**: `deploy-production`

**Trigger**: Only on push to `main` branch after all jobs pass

**Targets**:
- Railway (if `RAILWAY_TOKEN` configured)
- Vercel (if `VERCEL_TOKEN` configured)

**Duration**: ~2-3 minutes

---

## 🔧 Setup Instructions

### 1. GitHub Repository Secrets

Go to: `Settings` → `Secrets and variables` → `Actions`

#### Required Secrets:

**For Docker Hub** (optional):
```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password
```

**For Railway Deployment**:
```
RAILWAY_TOKEN=your-railway-token
```

Get token from:
```bash
railway login
railway whoami --token
```

**For Vercel Deployment**:
```
VERCEL_TOKEN=your-vercel-token
```

Get token from: https://vercel.com/account/tokens

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
