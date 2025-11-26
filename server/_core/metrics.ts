/**
 * Prometheus Metrics Collection System
 * 
 * يوفر نظام شامل لجمع وتتبع المقاييس باستخدام Prometheus
 * Provides comprehensive metrics collection and tracking using Prometheus
 * 
 * Features / المميزات:
 * - HTTP request metrics (count, duration, status)
 * - Rate limiting metrics (blocked/allowed requests)
 * - API version distribution tracking
 * - Error tracking by type and endpoint
 * - Business metrics (payments, notifications, etc.)
 * - Cache performance metrics
 * - Database query metrics
 * - WebSocket connection metrics (when available)
 * 
 * Architecture / البنية:
 * - Registry: Central metric storage
 * - Collectors: Individual metric types (Counter, Histogram, Gauge)
 * - Middleware: Automatic HTTP metric collection
 * - Custom Metrics: Business logic tracking
 * 
 * @module Metrics
 */

import { Request, Response, NextFunction } from 'express';
import * as promClient from 'prom-client';
import { logger } from './logger';

// ============================================================================
// Types and Interfaces / الأنواع والواجهات
// ============================================================================

interface MetricsConfig {
  enabled: boolean;
  includeDefaultMetrics: boolean;
  prefix: string;
}

interface RequestMetricsLabels {
  method: string;
  route: string;
  status_code: string;
  api_version?: string;
}

interface RateLimitMetricsLabels {
  limiter_type: 'endpoint' | 'user' | 'ip' | 'custom';
  endpoint?: string;
  action: 'allowed' | 'blocked';
}

interface ErrorMetricsLabels {
  error_type: string;
  endpoint: string;
  method: string;
}

interface BusinessMetricsLabels {
  operation: string;
  status: 'success' | 'failure';
}

// ============================================================================
// Configuration / الإعدادات
// ============================================================================

const config: MetricsConfig = {
  enabled: process.env.METRICS_ENABLED === 'true',
  includeDefaultMetrics: true,
  prefix: 'rabit_hr_',
};

// ============================================================================
// Prometheus Registry / سجل Prometheus
// ============================================================================

const register = new promClient.Registry();

// Add default labels to all metrics
register.setDefaultLabels({
  service: 'rabit-hr',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
});

// ============================================================================
// HTTP Request Metrics / مقاييس طلبات HTTP
// ============================================================================

/**
 * Counter: Total HTTP requests
 * عداد: إجمالي طلبات HTTP
 */
const httpRequestsTotal = new promClient.Counter({
  name: `${config.prefix}http_requests_total`,
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'api_version'] as const,
  registers: [register],
});

/**
 * Histogram: HTTP request duration in seconds
 * مدرج تكراري: مدة طلب HTTP بالثواني
 * 
 * Buckets: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10 seconds
 */
const httpRequestDuration = new promClient.Histogram({
  name: `${config.prefix}http_request_duration_seconds`,
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'api_version'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * Gauge: Active HTTP requests
 * مقياس: طلبات HTTP النشطة
 */
const httpRequestsActive = new promClient.Gauge({
  name: `${config.prefix}http_requests_active`,
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method', 'route'] as const,
  registers: [register],
});

/**
 * Counter: HTTP requests by API version
 * عداد: طلبات HTTP حسب إصدار API
 */
const httpRequestsByVersion = new promClient.Counter({
  name: `${config.prefix}http_requests_by_version_total`,
  help: 'Total HTTP requests grouped by API version',
  labelNames: ['api_version', 'route'] as const,
  registers: [register],
});

// ============================================================================
// Rate Limiting Metrics / مقاييس تحديد معدل الطلبات
// ============================================================================

/**
 * Counter: Rate limit hits (blocked requests)
 * عداد: حالات الوصول لحد المعدل (الطلبات المحظورة)
 */
const rateLimitHits = new promClient.Counter({
  name: `${config.prefix}rate_limit_hits_total`,
  help: 'Total number of requests blocked by rate limiting',
  labelNames: ['limiter_type', 'endpoint', 'action'] as const,
  registers: [register],
});

/**
 * Counter: Rate limit bypasses (allowed requests)
 * عداد: حالات تجاوز حد المعدل (الطلبات المسموحة)
 */
const rateLimitAllowed = new promClient.Counter({
  name: `${config.prefix}rate_limit_allowed_total`,
  help: 'Total number of requests allowed by rate limiting',
  labelNames: ['limiter_type', 'endpoint'] as const,
  registers: [register],
});

/**
 * Gauge: Current rate limit usage
 * مقياس: الاستخدام الحالي لحد المعدل
 */
const rateLimitUsage = new promClient.Gauge({
  name: `${config.prefix}rate_limit_usage`,
  help: 'Current rate limit usage as a percentage',
  labelNames: ['limiter_type', 'endpoint', 'identifier'] as const,
  registers: [register],
});

// ============================================================================
// Error Metrics / مقاييس الأخطاء
// ============================================================================

/**
 * Counter: Total errors
 * عداد: إجمالي الأخطاء
 */
const errorsTotal = new promClient.Counter({
  name: `${config.prefix}errors_total`,
  help: 'Total number of errors',
  labelNames: ['error_type', 'endpoint', 'method'] as const,
  registers: [register],
});

/**
 * Counter: Validation errors
 * عداد: أخطاء التحقق من الصحة
 */
const validationErrorsTotal = new promClient.Counter({
  name: `${config.prefix}validation_errors_total`,
  help: 'Total number of validation errors',
  labelNames: ['endpoint', 'field'] as const,
  registers: [register],
});

/**
 * Counter: Database errors
 * عداد: أخطاء قاعدة البيانات
 */
const databaseErrorsTotal = new promClient.Counter({
  name: `${config.prefix}database_errors_total`,
  help: 'Total number of database errors',
  labelNames: ['operation', 'table'] as const,
  registers: [register],
});

// ============================================================================
// Business Metrics / مقاييس الأعمال
// ============================================================================

/**
 * Counter: Successful operations
 * عداد: العمليات الناجحة
 */
const businessOperationsTotal = new promClient.Counter({
  name: `${config.prefix}business_operations_total`,
  help: 'Total number of business operations',
  labelNames: ['operation', 'status'] as const,
  registers: [register],
});

/**
 * Counter: Payments processed
 * عداد: المدفوعات المعالجة
 */
const paymentsTotal = new promClient.Counter({
  name: `${config.prefix}payments_total`,
  help: 'Total number of payments processed',
  labelNames: ['status', 'payment_method'] as const,
  registers: [register],
});

/**
 * Counter: Notifications sent
 * عداد: الإشعارات المرسلة
 */
const notificationsSent = new promClient.Counter({
  name: `${config.prefix}notifications_sent_total`,
  help: 'Total number of notifications sent',
  labelNames: ['type', 'channel', 'status'] as const,
  registers: [register],
});

/**
 * Counter: User authentications
 * عداد: عمليات مصادقة المستخدم
 */
const authenticationsTotal = new promClient.Counter({
  name: `${config.prefix}authentications_total`,
  help: 'Total number of authentication attempts',
  labelNames: ['status', 'method'] as const,
  registers: [register],
});

/**
 * Gauge: Active user sessions
 * مقياس: جلسات المستخدم النشطة
 */
const activeUserSessions = new promClient.Gauge({
  name: `${config.prefix}active_user_sessions`,
  help: 'Number of active user sessions',
  labelNames: ['user_role'] as const,
  registers: [register],
});

// ============================================================================
// Cache Metrics / مقاييس الذاكرة المؤقتة
// ============================================================================

/**
 * Counter: Cache hits
 * عداد: حالات إصابة الذاكرة المؤقتة
 */
const cacheHits = new promClient.Counter({
  name: `${config.prefix}cache_hits_total`,
  help: 'Total number of cache hits',
  labelNames: ['cache_key_prefix'] as const,
  registers: [register],
});

/**
 * Counter: Cache misses
 * عداد: حالات فقد الذاكرة المؤقتة
 */
const cacheMisses = new promClient.Counter({
  name: `${config.prefix}cache_misses_total`,
  help: 'Total number of cache misses',
  labelNames: ['cache_key_prefix'] as const,
  registers: [register],
});

/**
 * Gauge: Cache hit rate
 * مقياس: معدل إصابة الذاكرة المؤقتة
 */
const cacheHitRate = new promClient.Gauge({
  name: `${config.prefix}cache_hit_rate`,
  help: 'Cache hit rate as a percentage',
  labelNames: ['cache_key_prefix'] as const,
  registers: [register],
});

// ============================================================================
// Database Metrics / مقاييس قاعدة البيانات
// ============================================================================

/**
 * Histogram: Database query duration
 * مدرج تكراري: مدة استعلام قاعدة البيانات
 */
const databaseQueryDuration = new promClient.Histogram({
  name: `${config.prefix}database_query_duration_seconds`,
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'] as const,
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

/**
 * Counter: Database queries total
 * عداد: إجمالي استعلامات قاعدة البيانات
 */
const databaseQueriesTotal = new promClient.Counter({
  name: `${config.prefix}database_queries_total`,
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'] as const,
  registers: [register],
});

/**
 * Gauge: Active database connections
 * مقياس: اتصالات قاعدة البيانات النشطة
 */
const databaseConnectionsActive = new promClient.Gauge({
  name: `${config.prefix}database_connections_active`,
  help: 'Number of active database connections',
  registers: [register],
});

// ============================================================================
// WebSocket Metrics / مقاييس WebSocket
// ============================================================================

/**
 * Gauge: Active WebSocket connections
 * مقياس: اتصالات WebSocket النشطة
 */
const websocketConnectionsActive = new promClient.Gauge({
  name: `${config.prefix}websocket_connections_active`,
  help: 'Number of active WebSocket connections',
  labelNames: ['room'] as const,
  registers: [register],
});

/**
 * Counter: WebSocket messages sent
 * عداد: رسائل WebSocket المرسلة
 */
const websocketMessagesSent = new promClient.Counter({
  name: `${config.prefix}websocket_messages_sent_total`,
  help: 'Total number of WebSocket messages sent',
  labelNames: ['event_type', 'room'] as const,
  registers: [register],
});

// ============================================================================
// Initialization / التهيئة
// ============================================================================

/**
 * Initialize metrics system
 * تهيئة نظام المقاييس
 */
export function initializeMetrics(): void {
  if (!config.enabled) {
    logger.info('📊 Metrics: Disabled (set METRICS_ENABLED=true to enable)');
    return;
  }

  try {
    // Collect default metrics (CPU, memory, etc.)
    if (config.includeDefaultMetrics) {
      promClient.collectDefaultMetrics({
        register,
        prefix: config.prefix,
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
      });
    }

    logger.info('📊 Metrics: Initialized successfully');
    logger.info(`📊 Metrics: Prefix: ${config.prefix}`);
    logger.info(`📊 Metrics: Default metrics: ${config.includeDefaultMetrics ? 'Enabled' : 'Disabled'}`);
  } catch (error) {
    logger.error('📊 Metrics: Initialization failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

// ============================================================================
// Middleware / البرمجيات الوسيطة
// ============================================================================

/**
 * Express middleware to collect HTTP metrics
 * برمجية وسيطة لـ Express لجمع مقاييس HTTP
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!config.enabled) {
    return next();
  }

  const start = Date.now();
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;

  // Track active requests
  httpRequestsActive.inc({ method, route });

  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const statusCode = res.statusCode.toString();
    const apiVersion = (req as any).apiVersion || 'v1';

    // Decrement active requests
    httpRequestsActive.dec({ method, route });

    // Record metrics
    httpRequestsTotal.inc({ method, route, status_code: statusCode, api_version: apiVersion });
    httpRequestDuration.observe({ method, route, status_code: statusCode, api_version: apiVersion }, duration);
    httpRequestsByVersion.inc({ api_version: apiVersion, route });
  });

  next();
}

// ============================================================================
// Helper Functions / دوال مساعدة
// ============================================================================

/**
 * Get Prometheus registry
 * الحصول على سجل Prometheus
 */
export function getMetricsRegistry(): promClient.Registry {
  return register;
}

/**
 * Get all metrics in Prometheus format
 * الحصول على جميع المقاييس بصيغة Prometheus
 */
export async function getMetrics(): Promise<string> {
  if (!config.enabled) {
    return '# Metrics disabled\n';
  }

  return register.metrics();
}

/**
 * Track rate limit event
 * تتبع حدث حد المعدل
 */
export function trackRateLimit(
  limiterType: RateLimitMetricsLabels['limiter_type'],
  action: RateLimitMetricsLabels['action'],
  endpoint?: string
): void {
  if (!config.enabled) return;

  if (action === 'blocked') {
    rateLimitHits.inc({ limiter_type: limiterType, endpoint: endpoint || 'all', action });
  } else {
    rateLimitAllowed.inc({ limiter_type: limiterType, endpoint: endpoint || 'all' });
  }
}

/**
 * Track rate limit usage percentage
 * تتبع نسبة استخدام حد المعدل
 */
export function trackRateLimitUsage(
  limiterType: RateLimitMetricsLabels['limiter_type'],
  endpoint: string,
  identifier: string,
  usagePercentage: number
): void {
  if (!config.enabled) return;

  rateLimitUsage.set({ limiter_type: limiterType, endpoint, identifier }, usagePercentage);
}

/**
 * Track error
 * تتبع خطأ
 */
export function trackError(errorType: string, endpoint: string, method: string): void {
  if (!config.enabled) return;

  errorsTotal.inc({ error_type: errorType, endpoint, method });
}

/**
 * Track validation error
 * تتبع خطأ تحقق من الصحة
 */
export function trackValidationError(endpoint: string, field: string): void {
  if (!config.enabled) return;

  validationErrorsTotal.inc({ endpoint, field });
}

/**
 * Track database error
 * تتبع خطأ قاعدة البيانات
 */
export function trackDatabaseError(operation: string, table: string): void {
  if (!config.enabled) return;

  databaseErrorsTotal.inc({ operation, table });
}

/**
 * Track business operation
 * تتبع عملية تجارية
 */
export function trackBusinessOperation(operation: string, status: 'success' | 'failure'): void {
  if (!config.enabled) return;

  businessOperationsTotal.inc({ operation, status });
}

/**
 * Track payment
 * تتبع دفعة
 */
export function trackPayment(status: 'success' | 'failure', paymentMethod: string): void {
  if (!config.enabled) return;

  paymentsTotal.inc({ status, payment_method: paymentMethod });
}

/**
 * Track notification
 * تتبع إشعار
 */
export function trackNotification(type: string, channel: string, status: 'sent' | 'failed'): void {
  if (!config.enabled) return;

  notificationsSent.inc({ type, channel, status });
}

/**
 * Track authentication
 * تتبع مصادقة
 */
export function trackAuthentication(status: 'success' | 'failure', method: string): void {
  if (!config.enabled) return;

  authenticationsTotal.inc({ status, method });
}

/**
 * Set active user sessions
 * تعيين جلسات المستخدم النشطة
 */
export function setActiveUserSessions(count: number, userRole: string): void {
  if (!config.enabled) return;

  activeUserSessions.set({ user_role: userRole }, count);
}

/**
 * Track cache hit
 * تتبع إصابة الذاكرة المؤقتة
 */
export function trackCacheHit(keyPrefix: string): void {
  if (!config.enabled) return;

  cacheHits.inc({ cache_key_prefix: keyPrefix });
}

/**
 * Track cache miss
 * تتبع فقد الذاكرة المؤقتة
 */
export function trackCacheMiss(keyPrefix: string): void {
  if (!config.enabled) return;

  cacheMisses.inc({ cache_key_prefix: keyPrefix });
}

/**
 * Update cache hit rate
 * تحديث معدل إصابة الذاكرة المؤقتة
 */
export function updateCacheHitRate(keyPrefix: string, hitRate: number): void {
  if (!config.enabled) return;

  cacheHitRate.set({ cache_key_prefix: keyPrefix }, hitRate);
}

/**
 * Track database query
 * تتبع استعلام قاعدة البيانات
 */
export function trackDatabaseQuery(operation: string, table: string, durationMs: number): void {
  if (!config.enabled) return;

  databaseQueriesTotal.inc({ operation, table });
  databaseQueryDuration.observe({ operation, table }, durationMs / 1000);
}

/**
 * Set active database connections
 * تعيين اتصالات قاعدة البيانات النشطة
 */
export function setActiveDatabaseConnections(count: number): void {
  if (!config.enabled) return;

  databaseConnectionsActive.set(count);
}

/**
 * Set active WebSocket connections
 * تعيين اتصالات WebSocket النشطة
 */
export function setActiveWebSocketConnections(count: number, room?: string): void {
  if (!config.enabled) return;

  websocketConnectionsActive.set({ room: room || 'all' }, count);
}

/**
 * Track WebSocket message
 * تتبع رسالة WebSocket
 */
export function trackWebSocketMessage(eventType: string, room?: string): void {
  if (!config.enabled) return;

  websocketMessagesSent.inc({ event_type: eventType, room: room || 'all' });
}

/**
 * Log metrics configuration
 * تسجيل إعدادات المقاييس
 */
export function logMetricsConfig(): void {
  if (!config.enabled) {
    return;
  }

  logger.info('📊 ============================================');
  logger.info('📊 Metrics Configuration');
  logger.info('📊 ============================================');
  logger.info(`📊 Enabled: ${config.enabled}`);
  logger.info(`📊 Prefix: ${config.prefix}`);
  logger.info(`📊 Default Metrics: ${config.includeDefaultMetrics}`);
  logger.info(`📊 Endpoint: GET /metrics`);
  logger.info('📊 ============================================');
}

/**
 * Get metrics status
 * الحصول على حالة المقاييس
 */
export async function getMetricsStatus() {
  const metricsJson = await register.getMetricsAsJSON();
  return {
    enabled: config.enabled,
    prefix: config.prefix,
    includeDefaultMetrics: config.includeDefaultMetrics,
    metricsCount: metricsJson.length,
  };
}
