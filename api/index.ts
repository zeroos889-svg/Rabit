/**
 * Vercel Serverless Function Entry Point
 * This file serves as the main API handler for Vercel deployment
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// ============================================================================
// Types
// ============================================================================

interface HealthResponse {
  status: "ok" | "error";
  message: string;
  timestamp: string;
  environment: string;
  version: string;
  uptime?: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requestId?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract client IP from request
 */
function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Set CORS headers
 */
function setCorsHeaders(res: VercelResponse): void {
  // Allowed origins for reference (not used currently as we allow all)
  // const allowedOrigins = [
  //   "http://localhost:3000",
  //   "http://localhost:5173",
  //   "https://rabit.sa",
  //   "https://www.rabit.sa",
  //   "https://rabit.vercel.app",
  // ];
  
  // In production, you might want to check the origin header
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
  res.setHeader("Access-Control-Max-Age", "86400");
}

/**
 * Set security headers
 */
function setSecurityHeaders(res: VercelResponse): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

/**
 * Send JSON response
 */
function sendJson<T>(res: VercelResponse, statusCode: number, data: ApiResponse<T>): VercelResponse {
  return res.status(statusCode).json(data);
}

// ============================================================================
// Rate Limiting (Simple in-memory for serverless)
// ============================================================================

const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  
  if (!entry || entry.resetTime < now) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Cleanup old entries periodically (best effort in serverless)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (value.resetTime < now) {
      rateLimit.delete(key);
    }
  }
}, 60000);

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * Health check endpoint
 */
function handleHealth(req: VercelRequest, res: VercelResponse): VercelResponse {
  const response: HealthResponse = {
    status: "ok",
    message: "Rabit API is running on Vercel",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
  };
  
  return res.status(200).json(response);
}

/**
 * API info endpoint
 */
function handleApiInfo(req: VercelRequest, res: VercelResponse): VercelResponse {
  return sendJson(res, 200, {
    success: true,
    data: {
      name: "Rabit HR Platform API",
      version: "1.0.0",
      documentation: "https://docs.rabit.sa/api",
      endpoints: {
        health: "/api/health",
        info: "/api",
        trpc: "/api/trpc/*",
      },
      features: [
        "HR Management",
        "Employee Portal",
        "Consulting System",
        "Document Generation",
        "Leave Calculator",
        "End of Service Calculator",
      ],
    },
  });
}

/**
 * Handle TRPC requests (proxy to main server)
 */
async function handleTrpc(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  // In production, this would initialize and call the tRPC handler
  // For now, return a helpful message
  return sendJson(res, 200, {
    success: true,
    message: "tRPC endpoint - use the appropriate client library to make requests",
    data: {
      endpoint: req.url,
      method: req.method,
      hint: "Use @trpc/client to interact with this API",
    },
  });
}

// ============================================================================
// Main Handler
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  const requestId = generateRequestId();
  const clientIp = getClientIp(req);
  const startTime = Date.now();
  
  // Set common headers
  setCorsHeaders(res);
  setSecurityHeaders(res);
  res.setHeader("X-Request-ID", requestId);
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  
  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    return sendJson(res, 429, {
      success: false,
      error: "Too Many Requests",
      message: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً",
      requestId,
    });
  }
  
  try {
    const url = req.url || "";
    const path = url.split("?")[0] || "";
    
    // Route handling
    switch (true) {
      // Health check
      case path === "/api/health" || path === "/api/healthz":
        return handleHealth(req, res);
      
      // API info
      case path === "/api" || path === "/api/":
        return handleApiInfo(req, res);
      
      // TRPC endpoints
      case path.startsWith("/api/trpc"):
        return await handleTrpc(req, res);
      
      // Version endpoint
      case path === "/api/version":
        return sendJson(res, 200, {
          success: true,
          data: {
            version: process.env.npm_package_version || "1.0.0",
            commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "unknown",
            environment: process.env.NODE_ENV || "production",
            region: process.env.VERCEL_REGION || "unknown",
          },
        });
      
      // Ping endpoint
      case path === "/api/ping":
        return sendJson(res, 200, {
          success: true,
          data: { pong: Date.now() },
        });
      
      // Webhook endpoints (placeholder for future implementation)
      case path.startsWith("/api/webhooks"):
        return sendJson(res, 200, {
          success: true,
          message: "Webhook endpoint ready",
          requestId,
        });
      
      // OAuth callback endpoints (placeholder)
      case path.startsWith("/api/auth/callback"):
        return sendJson(res, 200, {
          success: true,
          message: "OAuth callback endpoint",
          requestId,
        });
      
      // Catch-all for unknown routes
      default:
        // Log unknown routes for monitoring
        console.log(`[${requestId}] Unknown route: ${req.method} ${path}`);
        
        return sendJson(res, 404, {
          success: false,
          error: "Not Found",
          message: `المسار ${path} غير موجود`,
          requestId,
        });
    }
  } catch (error) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[${requestId}] API Error:`, errorMessage);
    
    // Don't expose internal errors in production
    const isProduction = process.env.NODE_ENV === "production";
    
    return sendJson(res, 500, {
      success: false,
      error: "Internal Server Error",
      message: isProduction ? "حدث خطأ غير متوقع" : errorMessage,
      requestId,
    });
  } finally {
    // Log request duration
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${req.method} ${req.url} - ${duration}ms`);
  }
}
