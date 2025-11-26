/**
 * tRPC Endpoint Rate Limiting Wrapper
 * Applies endpoint-specific rate limiting to tRPC routes
 */

import type { Request, Response, NextFunction } from "express";
import {
  paymentRateLimiter,
  notificationRateLimiter,
  uploadRateLimiter,
  reportRateLimiter,
  searchRateLimiter,
  exportRateLimiter,
  emailRateLimiter,
} from "./endpointRateLimit";

/**
 * Map tRPC procedure paths to their rate limiters
 */
const TRPC_RATE_LIMIT_MAP: Record<string, any> = {
  // Payment endpoints
  "payment.createMoyasarPayment": paymentRateLimiter,
  "payment.createTapPayment": paymentRateLimiter,
  "payment.processRefund": paymentRateLimiter,

  // Notification endpoints
  "notification.dispatch": notificationRateLimiter,
  "notification.getAll": notificationRateLimiter,
  "notification.markRead": notificationRateLimiter,
  "notification.markAllRead": notificationRateLimiter,
  "notification.delete": notificationRateLimiter,

  // Upload endpoints
  "upload.file": uploadRateLimiter,
  "upload.image": uploadRateLimiter,
  "upload.document": uploadRateLimiter,

  // Report endpoints
  "report.generate": reportRateLimiter,
  "report.getEmployeeReport": reportRateLimiter,
  "report.getAttendanceReport": reportRateLimiter,

  // Search endpoints
  "employee.search": searchRateLimiter,
  "package.search": searchRateLimiter,
  "consultation.search": searchRateLimiter,

  // Export endpoints
  "export.employees": exportRateLimiter,
  "export.attendance": exportRateLimiter,
  "export.report": exportRateLimiter,

  // Email endpoints
  "email.send": emailRateLimiter,
  "email.sendBulk": emailRateLimiter,
};

/**
 * Extract tRPC procedure path from request
 * Supports both batch and single requests
 */
function extractTrpcProcedure(req: Request): string | null {
  // For GET requests (queries), procedure is in the path
  // Example: /api/trpc/employee.list
  const pathMatch = req.path.match(/\/api\/trpc\/([^?]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // For POST requests (mutations), check the body
  // tRPC batch requests: { "0": { "procedure": "..." } }
  // tRPC single requests: procedure is in query param
  if (req.method === "POST" && req.body) {
    // Check if it's a batch request
    if (typeof req.body === "object" && "0" in req.body) {
      const firstOperation = req.body["0"];
      if (firstOperation && typeof firstOperation === "object" && "procedure" in firstOperation) {
        return firstOperation.procedure as string;
      }
    }
  }

  // Check query parameter for procedure name
  if (req.query.procedure && typeof req.query.procedure === "string") {
    return req.query.procedure;
  }

  return null;
}

/**
 * tRPC rate limiting middleware
 * Applies endpoint-specific rate limits based on procedure name
 */
export function trpcRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only apply to tRPC routes
  if (!req.path.startsWith("/api/trpc")) {
    return next();
  }

  const procedure = extractTrpcProcedure(req);

  // If we can't determine the procedure, skip rate limiting
  if (!procedure) {
    return next();
  }

  // Check if this procedure has a specific rate limiter
  const rateLimiter = TRPC_RATE_LIMIT_MAP[procedure];

  if (rateLimiter) {
    // Apply the specific rate limiter
    return rateLimiter(req, res, next);
  }

  // No specific rate limiter, continue
  next();
}

/**
 * Get list of all rate-limited tRPC procedures
 */
export function getRateLimitedProcedures(): string[] {
  return Object.keys(TRPC_RATE_LIMIT_MAP);
}

/**
 * Add custom tRPC procedure rate limiter
 */
export function addTrpcRateLimit(procedure: string, rateLimiter: any): void {
  TRPC_RATE_LIMIT_MAP[procedure] = rateLimiter;
}
