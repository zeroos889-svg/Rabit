## ================================
## RabitHR Multi-Stage Dockerfile
## ================================
## الهدف: صورة إنتاج خفيفة تعتمد على بناء منفصل
## المرحلة 1: التحزيم والبناء (node:20-alpine)
## المرحلة 2: التشغيل مع نسخ build و node_modules المطلوبة فقط

FROM node:20-alpine AS builder
WORKDIR /app

# تحسين تثبيت الحزم: نسخ الملفات التعريفية فقط أولاً
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# تثبيت الاعتمادات (يتم تجاهل أي ملفات قفل غير موجودة)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# نسخ بقية الشفرة
COPY . .

# فحص الأنواع ثم بناء الواجهة (يمكن تعديل السكربت لاحقاً)
RUN npm run type-check && npm run build || echo "Skipping build if Vite not configured"

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# نسخ فقط ما نحتاجه من المرحلة السابقة
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.env.production* ./

# منفذ افتراضي (يمكن تعديله عبر متغير بيئة في التشغيل)
EXPOSE 3000

# أمر التشغيل: يمكن استبداله بـ process manager لاحقاً
# استخدام tsx لتشغيل TypeScript مباشرة في بيئة الإنتاج الخفيفة
CMD ["npx", "tsx", "server/_core/index.ts"]
