## ================================
## RabitHR Production Dockerfile
## ================================
## Multi-stage build for optimal image size
## Stage 1: Dependencies installation
## Stage 2: Build application
## Stage 3: Production runtime

# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
# Copy scripts first for postinstall hook
COPY scripts ./scripts
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund --ignore-scripts && \
    node scripts/patch-picomatch.cjs || true

# ===========================================
# Stage 2: Builder
# ===========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Type check and build
RUN npm run type-check
RUN npm run build

# ===========================================
# Stage 3: Production Runner
# ===========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rabitapp

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts

# Copy environment files (if exist)
COPY --from=builder /app/.env.production* ./ 

# Set ownership to non-root user
RUN chown -R rabitapp:nodejs /app

# Switch to non-root user
USER rabitapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npx", "tsx", "server/_core/index.ts"]
