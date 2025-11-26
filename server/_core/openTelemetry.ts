/**
 * OpenTelemetry Distributed Tracing Configuration
 * 
 * Provides distributed tracing across services for observability and performance monitoring.
 * Integrates with existing Request ID system for trace correlation.
 * 
 * Features:
 * - Automatic instrumentation for HTTP, Express, Database, Redis
 * - Custom span creation for business logic
 * - Trace context propagation
 * - Integration with Request ID system
 * - OTLP exporter for standard trace backends (Jaeger, Zipkin, etc.)
 * 
 * @module server/_core/openTelemetry
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { logger } from "./logger";
import type { Request, Response, NextFunction } from "express";
import { trace, context, SpanStatusCode, Span } from "@opentelemetry/api";

/**
 * Check if OpenTelemetry tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return process.env.OTEL_ENABLED === "true";
}

/**
 * Get OpenTelemetry configuration from environment
 */
function getOtelConfig() {
  return {
    enabled: isTracingEnabled(),
    serviceName: process.env.OTEL_SERVICE_NAME || "rabit-hr",
    serviceVersion: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    exporterUrl: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
  };
}

/**
 * OpenTelemetry SDK instance
 */
let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry tracing
 * 
 * Sets up automatic instrumentation and OTLP exporter.
 * Should be called early in application startup.
 * 
 * Environment Variables:
 * - OTEL_ENABLED: Enable OpenTelemetry tracing (default: false)
 * - OTEL_SERVICE_NAME: Service name for traces (default: rabit-hr)
 * - OTEL_EXPORTER_OTLP_ENDPOINT: OTLP endpoint URL
 * - NODE_ENV: Deployment environment
 * 
 * @returns Promise<void>
 */
export async function initializeTracing(): Promise<void> {
  const config = getOtelConfig();

  if (!config.enabled) {
    logger.info("OpenTelemetry tracing is disabled (OTEL_ENABLED=false)", {
      context: "OpenTelemetry",
    });
    return;
  }

  try {
    logger.info("Initializing OpenTelemetry tracing...", {
      context: "OpenTelemetry",
      serviceName: config.serviceName,
      environment: config.environment,
      exporterUrl: config.exporterUrl,
    });

    // Create OTLP trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: config.exporterUrl,
      headers: {}, // Add authentication headers if needed
    });

    // Initialize OpenTelemetry SDK
    sdk = new NodeSDK({
      serviceName: config.serviceName,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Enable automatic instrumentation for common libraries
          "@opentelemetry/instrumentation-http": {
            enabled: true,
          },
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
          "@opentelemetry/instrumentation-pg": {
            enabled: true, // PostgreSQL instrumentation
          },
          "@opentelemetry/instrumentation-dns": {
            enabled: false, // Disable DNS to reduce noise
          },
          "@opentelemetry/instrumentation-net": {
            enabled: false, // Disable net to reduce noise
          },
        }),
      ],
    });

    // Start the SDK
    await sdk.start();

    logger.info("✅ OpenTelemetry tracing initialized successfully", {
      context: "OpenTelemetry",
      serviceName: config.serviceName,
      environment: config.environment,
    });
  } catch (error) {
    logger.error("Failed to initialize OpenTelemetry tracing", {
      context: "OpenTelemetry",
      error: error as Error,
    });
    // Don't throw - allow app to continue without tracing
  }
}

/**
 * Shutdown OpenTelemetry SDK gracefully
 * 
 * Should be called during application shutdown to flush pending spans.
 * 
 * @returns Promise<void>
 */
export async function shutdownTracing(): Promise<void> {
  if (!sdk) {
    return;
  }

  try {
    logger.info("Shutting down OpenTelemetry tracing...", {
      context: "OpenTelemetry",
    });

    await sdk.shutdown();

    logger.info("✅ OpenTelemetry tracing shut down successfully", {
      context: "OpenTelemetry",
    });
  } catch (error) {
    logger.error("Error shutting down OpenTelemetry tracing", {
      context: "OpenTelemetry",
      error: error as Error,
    });
  }
}

/**
 * Get the active tracer instance
 * 
 * @returns Tracer instance
 */
export function getTracer() {
  const config = getOtelConfig();
  return trace.getTracer(config.serviceName, config.serviceVersion);
}

/**
 * Create a custom span for business logic
 * 
 * @param name - Span name
 * @param callback - Function to execute within span
 * @returns Result of callback function
 * 
 * @example
 * ```typescript
 * const result = await createSpan("processPayment", async (span) => {
 *   span.setAttribute("payment.id", paymentId);
 *   span.setAttribute("payment.amount", amount);
 *   
 *   const result = await processPayment(paymentId, amount);
 *   
 *   span.setStatus({ code: SpanStatusCode.OK });
 *   return result;
 * });
 * ```
 */
export async function createSpan<T>(
  name: string,
  callback: (span: Span) => Promise<T>
): Promise<T> {
  if (!isTracingEnabled()) {
    // If tracing is disabled, just execute callback without span
    return callback({} as Span);
  }

  const tracer = getTracer();
  const span = tracer.startSpan(name);

  try {
    const result = await context.with(trace.setSpan(context.active(), span), async () => {
      return await callback(span);
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    span.recordException(error as Error);
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Express middleware to add trace context to requests
 * 
 * Attaches trace ID to request object for logging correlation.
 * Adds custom attributes to the active span.
 * 
 * Should be used after requestIdMiddleware to correlate Request ID with Trace ID.
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isTracingEnabled()) {
    return next();
  }

  try {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      const traceId = spanContext.traceId;

      // Attach trace ID to request for logging
      (req as any).traceId = traceId;

      // Add custom attributes to span
      span.setAttribute("http.route", req.path);
      span.setAttribute("http.method", req.method);
      span.setAttribute("http.target", req.originalUrl);
      span.setAttribute("http.user_agent", req.get("user-agent") || "unknown");

      // Add user ID if available
      const userId = (req as any).user?.id;
      if (userId) {
        span.setAttribute("user.id", userId);
      }

      // Add request ID for correlation
      const requestId = (req as any).requestId;
      if (requestId) {
        span.setAttribute("request.id", requestId);
      }

      // Add API version
      const apiVersion = (req as any).apiVersion;
      if (apiVersion) {
        span.setAttribute("api.version", apiVersion);
      }

      logger.debug("Trace context attached to request", {
        context: "OpenTelemetry",
        traceId,
        requestId,
        path: req.path,
      });
    }
  } catch (error) {
    logger.error("Error in tracing middleware", {
      context: "OpenTelemetry",
      error: error as Error,
    });
  }

  next();
}

/**
 * Add custom attributes to the active span
 * 
 * Useful for adding business-specific attributes to traces.
 * 
 * @param attributes - Key-value pairs to add to span
 * 
 * @example
 * ```typescript
 * addSpanAttributes({
 *   "payment.id": "pay_123",
 *   "payment.amount": 1000,
 *   "payment.currency": "SAR",
 * });
 * ```
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>) {
  if (!isTracingEnabled()) {
    return;
  }

  try {
    const span = trace.getActiveSpan();
    if (span) {
      for (const [key, value] of Object.entries(attributes)) {
        span.setAttribute(key, value);
      }
    }
  } catch (error) {
    logger.error("Error adding span attributes", {
      context: "OpenTelemetry",
      error: error as Error,
    });
  }
}

/**
 * Record an exception in the active span
 * 
 * @param error - Error to record
 * @param attributes - Additional attributes
 * 
 * @example
 * ```typescript
 * try {
 *   await processPayment();
 * } catch (error) {
 *   recordException(error, { "payment.id": paymentId });
 *   throw error;
 * }
 * ```
 */
export function recordException(
  error: Error,
  attributes?: Record<string, string | number | boolean>
) {
  if (!isTracingEnabled()) {
    return;
  }

  try {
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      if (attributes) {
        addSpanAttributes(attributes);
      }
    }
  } catch (err) {
    logger.error("Error recording exception in span", {
      context: "OpenTelemetry",
      error: err as Error,
    });
  }
}

/**
 * Get OpenTelemetry tracing status and configuration
 * 
 * @returns Object with tracing status and configuration
 */
export function getTracingStatus() {
  const config = getOtelConfig();

  return {
    enabled: config.enabled,
    serviceName: config.serviceName,
    serviceVersion: config.serviceVersion,
    environment: config.environment,
    exporterUrl: config.exporterUrl,
    sdkInitialized: sdk !== null,
  };
}

/**
 * Log OpenTelemetry tracing configuration at startup
 */
export function logTracingConfig() {
  const status = getTracingStatus();

  logger.info("=".repeat(60), { context: "OpenTelemetry" });
  logger.info("📊 OpenTelemetry Distributed Tracing Configuration", {
    context: "OpenTelemetry",
  });
  logger.info("=".repeat(60), { context: "OpenTelemetry" });

  logger.info(`Tracing Enabled: ${status.enabled}`, { context: "OpenTelemetry" });
  logger.info(`Service Name: ${status.serviceName}`, { context: "OpenTelemetry" });
  logger.info(`Service Version: ${status.serviceVersion}`, { context: "OpenTelemetry" });
  logger.info(`Environment: ${status.environment}`, { context: "OpenTelemetry" });
  logger.info(`Exporter URL: ${status.exporterUrl}`, { context: "OpenTelemetry" });
  logger.info(`SDK Initialized: ${status.sdkInitialized}`, { context: "OpenTelemetry" });

  if (status.enabled) {
    logger.info("\nAutomatic Instrumentation:", { context: "OpenTelemetry" });
    logger.info("  - HTTP (incoming/outgoing requests)", { context: "OpenTelemetry" });
    logger.info("  - Express (middleware and routes)", { context: "OpenTelemetry" });
    logger.info("  - PostgreSQL (database queries)", { context: "OpenTelemetry" });
    logger.info("  - Redis (cache operations)", { context: "OpenTelemetry" });

    logger.info("\nCustom Features:", { context: "OpenTelemetry" });
    logger.info("  - Request ID correlation", { context: "OpenTelemetry" });
    logger.info("  - User ID tracking", { context: "OpenTelemetry" });
    logger.info("  - API version tracking", { context: "OpenTelemetry" });
    logger.info("  - Custom span creation", { context: "OpenTelemetry" });
  } else {
    logger.info("\n⚠️  Tracing is disabled. Set OTEL_ENABLED=true to enable.", {
      context: "OpenTelemetry",
    });
  }

  logger.info("=".repeat(60), { context: "OpenTelemetry" });
}
