import "dotenv/config";
import express from "express";
import { createServer } from "http";
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
import { simpleHealthCheck } from "./healthCheck";
import { errorHandler, initializeErrorHandling } from "./errorHandler";
import { runSQLMigrations } from "./sqlMigrations";
import { connectRedis, testRedisConnection } from "./redisClient";
import { logger } from "./logger";
import type { Request, Response, NextFunction } from "express";
import { verifyMoyasarWebhook, verifyTapWebhook } from "./payment";

/**
 * Get port from environment or use default
 * Railway and other cloud platforms set PORT environment variable
 */
function getPort(): number {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (isNaN(port) || port < 1 || port > 65535) {
    logger.warn(`Invalid PORT value: ${process.env.PORT}, using default 3000`, { context: "Server" });
    return 3000;
  }

  return port;
}

async function startServer() {
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
  try {
    if (process.env.DATABASE_URL) {
      await runSQLMigrations();
    }
  } catch (error) {
    logger.error("[Server] Failed to run migrations:", { context: "Server", error: error as Error });
  }

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
  initializeErrorHandling(server);

  // Simple performance logging for slow requests
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (duration > 2000) {
        logger.warn("Slow request detected", {
          context: "Server",
          path: req.originalUrl,
          method: req.method,
          duration,
          status: res.statusCode,
        });
      }
    });
    next();
  });

  // Request Logging
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
  app.post(
    "/api/webhooks/moyasar",
    express.raw({ type: "*/*" }),
    async (req, res) => {
      const raw =
        Buffer.isBuffer(req.body) && req.body.length
          ? req.body.toString("utf8")
          : typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body || {});
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
    express.raw({ type: "*/*" }),
    async (req, res) => {
      const raw =
        Buffer.isBuffer(req.body) && req.body.length
          ? req.body.toString("utf8")
          : typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body || {});
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

  // Health Check Endpoint (for Railway and load balancers)
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
    } catch (error) {
      res.status(503).json({ status: "error", message: "Health check failed" });
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

  // CSRF Protection for all routes
  app.use(doubleSubmitCsrfProtection);

  // Authentication routes with strict rate limiting
  registerAuthRoutes(app, authLimiter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global Error Handler Middleware (must be last)
  app.use(errorHandler);

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
  startServer().catch((err) => logger.error("Server startup failed", { context: "Server", error: err }));
}

// Export for Vercel serverless
export default startServer;
