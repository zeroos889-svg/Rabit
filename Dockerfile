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

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ libc6-compat

# Install dependencies only when needed
# Copy scripts first for postinstall hook
COPY scripts ./scripts
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps --no-audit --no-fund && \
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

# Set build environment
ENV NODE_ENV=production

# Type check and build
RUN npm run build

# ===========================================
# Stage 3: Production Runner
# ===========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libc6-compat

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 rabitapp

# Copy package files
COPY --from=deps /app/package.json ./package.json

# Copy node_modules (production deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy server source (needed for tsx)
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle ./drizzle

# Copy config files
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json

# Copy scripts for runtime
COPY --from=builder /app/scripts ./scripts

# Set ownership to non-root user
RUN chown -R rabitapp:nodejs /app

# Switch to non-root user
USER rabitapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start application
CMD ["npx", "tsx", "server/_core/index.ts"]
