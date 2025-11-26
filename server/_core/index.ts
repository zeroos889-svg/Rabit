import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { checkEnv } from "./env";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { apiLimiter, authLimiter } from "./rateLimit";
import { doubleSubmitCsrfProtection } from "./csrf";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { simpleHealthCheck, performHealthCheck } from "./healthCheck";
import { errorHandler, initializeErrorHandling } from "./errorHandler";
import { connectRedis, testRedisConnection } from "./redisClient";
import { logger } from "./logger";
import type { Request, Response, NextFunction } from "express";
import { verifyMoyasarWebhook, verifyTapWebhook } from "./payment";
import { initializeSentry, setupSentryErrorHandler } from "../sentry";
import {
  requestIdMiddleware,
  performanceMiddleware,
  errorContextMiddleware,
} from "./requestTracking";
import { smartTimeoutMiddleware } from "./requestTimeout";
import {
  requestLoggingMiddleware,
  errorResponseLoggingMiddleware,
  slowRequestLoggingMiddleware,
  largePayloadLoggingMiddleware,
  logMiddlewareConfig,
} from "./requestResponseLogger";
import {
  apiVersioningMiddleware,
  versionTransformMiddleware,
  logApiVersioningConfig,
} from "./apiVersioning";
import {
  webhookRateLimiter,
  logRateLimitConfig,
} from "./endpointRateLimit";
import {
  trpcRedisRateLimitMiddleware,
  logTrpcRedisRateLimitConfig,
} from "./trpcRedisRateLimit";
import { redisWebhookRateLimiter } from "./redisRateLimit";
import {
  initializeTracing,
  shutdownTracing,
  tracingMiddleware,
  logTracingConfig,
} from "./openTelemetry";

logger.info("🚀 Starting server initialization...", { context: "Server" });

// Initialize OpenTelemetry tracing as early as possible (before other instrumentation)
await initializeTracing();

// Initialize Sentry as early as possible
initializeSentry();

/**
 * Get port from environment or use default
 * Railway and other cloud platforms set PORT environment variable
 */
function getPort(): number {
  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

  if (Number.isNaN(port) || port < 1 || port > 65535) {
    logger.warn(`Invalid PORT value: ${process.env.PORT}, using default 3000`, { context: "Server" });
    return 3000;
  }

  return port;
}

async function startServer() {
  logger.info("📝 Checking environment variables...", { context: "Server" });
  // Check environment variables
  checkEnv();

  // Initialize Redis connection
  try {
    if (process.env.REDIS_URL) {
      await connectRedis();
      await testRedisConnection();
    } else {
      logger.warn(
        "⚠️  REDIS_URL not configured, skipping Redis initialization",
        { context: "Server" }
      );
    }
  } catch (error) {
    logger.error("[Server] Failed to connect to Redis:", { context: "Server", error: error as Error });
    logger.warn("⚠️  Server will continue without Redis caching", { context: "Server" });
  }

  // Run database migrations on startup
  // Disabled: Schema already pushed via db:push
  // try {
  //   if (process.env.DATABASE_URL) {
  //     console.log("🔄 Running SQL Migrations...");
  //     await runSQLMigrations();
  //   }
  // } catch (error) {
  //   logger.error("[Server] Failed to run migrations:", { context: "Server", error: error as Error });
  // }

  const app = express();
  const server = createServer(app);

  // Trust reverse proxy headers for secure cookies/CSRF
  app.set("trust proxy", 1);

  // Minimal CORS allowlist based on ALLOWED_ORIGINS (comma separated)
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv
        .split(",")
        .map(o => o.trim())
        .filter(Boolean)
    : [];

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token, X-XSRF-Token"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Initialize error handling (uncaught exceptions, unhandled rejections, graceful shutdown)
  initializeErrorHandling(server, [shutdownTracing]);

  // Request ID and Performance Tracking Middleware (must be early)
  app.use(requestIdMiddleware);
  app.use(performanceMiddleware);
  app.use(errorContextMiddleware);

  // OpenTelemetry Tracing Middleware (after Request ID for correlation)
  app.use(tracingMiddleware);

  // API Versioning Middleware (attach version to request)
  app.use(apiVersioningMiddleware);
  app.use(versionTransformMiddleware);

  // Request/Response Logging Middleware
  app.use(requestLoggingMiddleware);
  app.use(slowRequestLoggingMiddleware);
  app.use(largePayloadLoggingMiddleware);

  // Request Timeout Middleware (smart timeout based on path)
  app.use(smartTimeoutMiddleware);

  // Request Logging with Morgan
  const logFormat =
    process.env.NODE_ENV === "production"
      ? "combined" // Apache combined log format for production
      : "dev"; // Colorful and concise for development

  app.use(morgan(logFormat));

  // Security Headers - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Response Compression
  app.use(
    compression({
      level: 6, // Compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
    })
  );

  // Rate Limiting - General API
  app.use("/api/", apiLimiter);

  // Webhook endpoints (use raw body for signature verification)
  const activeWebhookRateLimiter =
    process.env.USE_REDIS_RATE_LIMIT === "true"
      ? redisWebhookRateLimiter
      : webhookRateLimiter;

  app.post(
    "/api/webhooks/moyasar",
    activeWebhookRateLimiter, // Rate limit webhook endpoints
    express.raw({ type: "*/*" }),
    async (req, res) => {
      let raw: string;
      if (Buffer.isBuffer(req.body) && req.body.length) {
        raw = req.body.toString("utf8");
      } else if (typeof req.body === "string") {
        raw = req.body;
      } else {
        raw = JSON.stringify(req.body || {});
      }
      
      const signature =
        (req.headers["x-moyasar-signature"] as string | undefined) ||
        (req.headers["x-signature"] as string | undefined);

      if (!signature || !verifyMoyasarWebhook(raw, signature)) {
        logger.warn("[Webhook] Moyasar signature failed", {
          path: req.originalUrl,
          ip: req.ip,
        });
        return res.status(400).json({ success: false, message: "invalid signature" });
      }

      try {
        const event = JSON.parse(raw);
        logger.info("[Webhook] Moyasar event received", {
          id: event?.id,
          status: event?.status,
          amount: event?.amount,
        });
      } catch (error) {
        logger.error("[Webhook] Moyasar parse error", { error });
        return res.status(400).json({ success: false, message: "invalid payload" });
      }

      return res.status(200).json({ success: true });
    }
  );

  app.post(
    "/api/webhooks/tap",
    activeWebhookRateLimiter, // Rate limit webhook endpoints
    express.raw({ type: "*/*" }),
    async (req, res) => {
      let raw: string;
      if (Buffer.isBuffer(req.body) && req.body.length) {
        raw = req.body.toString("utf8");
      } else if (typeof req.body === "string") {
        raw = req.body;
      } else {
        raw = JSON.stringify(req.body || {});
      }
      
      const signature =
        (req.headers["tap-signature"] as string | undefined) ||
        (req.headers["x-tap-signature"] as string | undefined);

      if (!signature || !verifyTapWebhook(raw, signature)) {
        logger.warn("[Webhook] Tap signature failed", {
          path: req.originalUrl,
          ip: req.ip,
        });
        return res.status(400).json({ success: false, message: "invalid signature" });
      }

      try {
        const event = JSON.parse(raw);
        logger.info("[Webhook] Tap event received", {
          id: event?.id,
          status: event?.status,
          amount: event?.amount,
        });
      } catch (error) {
        logger.error("[Webhook] Tap parse error", { error });
        return res.status(400).json({ success: false, message: "invalid payload" });
      }

      return res.status(200).json({ success: true });
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // Health Check Endpoints
  
  // Simple health check (for load balancers - fast response)
  app.get("/health", async (req, res) => {
    try {
      const isHealthy = await simpleHealthCheck();
      if (isHealthy) {
        res
          .status(200)
          .json({ status: "ok", timestamp: new Date().toISOString() });
      } else {
        res
          .status(503)
          .json({ status: "error", message: "Database connection failed" });
      }
    } catch {
      res.status(503).json({ status: "error", message: "Health check failed" });
    }
  });

  // Detailed health check (comprehensive monitoring)
  app.get("/health/detailed", async (req, res) => {
    try {
      const healthResult = await performHealthCheck();
      const statusCode = healthResult.status === "unhealthy" ? 503 : 200;
      res.status(statusCode).json(healthResult);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      });
    }
  });

  // Redis Health Check Endpoint
  app.get("/health/redis", async (req, res) => {
    try {
      const isRedisHealthy = await testRedisConnection();
      if (isRedisHealthy) {
        res.status(200).json({
          status: "ok",
          message: "Redis is healthy",
          timestamp: new Date().toISOString(),
        });
      } else {
        res
          .status(503)
          .json({ status: "error", message: "Redis connection failed" });
      }
    } catch (error) {
      res.status(503).json({
        status: "error",
        message: "Redis health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Readiness probe (Kubernetes/Docker)
  app.get("/health/ready", async (req, res) => {
    try {
      const isReady = await simpleHealthCheck();
      res.status(isReady ? 200 : 503).json({
        ready: isReady,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness probe (Kubernetes/Docker)
  app.get("/health/live", (req, res) => {
    res.status(200).json({
      alive: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // CSRF Protection for all routes
  app.use(doubleSubmitCsrfProtection);

  // Authentication routes with strict rate limiting
  registerAuthRoutes(app, authLimiter);

  // tRPC API
  logger.info("🔌 Setting up tRPC middleware...", { context: "Server" });
  app.use(
    "/api/trpc",
    trpcRedisRateLimitMiddleware, // Apply Redis or in-memory rate limiting
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  logger.info("✅ tRPC middleware set up successfully", { context: "Server" });
  
  // development mode uses Vite, production mode uses static files
  logger.info("🎨 Setting up Vite/Static serving...", { context: "Server" });
  try {
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  logger.info("✅ Vite/Static serving set up successfully", { context: "Server" });
  } catch (error) {
  logger.error("❌ Error setting up Vite/Static:", { context: "Server", error: error as Error });
    throw error;
  }

  // Register Sentry error middleware before the global error handler
  setupSentryErrorHandler(app);

  // Error response logging middleware (before global error handler)
  app.use(errorResponseLoggingMiddleware);

  // Global Error Handler Middleware (must be last)
  app.use(errorHandler);

  // Log middleware configurations
  logMiddlewareConfig();
  logApiVersioningConfig();
  logRateLimitConfig();
  logTrpcRedisRateLimitConfig();
  logTracingConfig();

  // Get port from environment (Railway sets this automatically)
  const port = getPort();

  server.listen(port, "0.0.0.0", () => {
    const env = process.env.NODE_ENV || "development";
    logger.info(`[${env}] Server running on http://0.0.0.0:${port}/`, { context: "Server" });
    logger.info(
      `[${env}] Health check available at http://0.0.0.0:${port}/health`,
      { context: "Server" }
    );
  });

  return app;
}

// Start server for local development or Docker
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  await startServer();
}

// Export for Vercel serverless
export default startServer;
