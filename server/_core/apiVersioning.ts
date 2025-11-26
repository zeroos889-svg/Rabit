/**
 * API Versioning Middleware
 * Support for multiple API versions to maintain backward compatibility
 */

import type { Request, Response, NextFunction, Router } from "express";
import { logger } from "./logger";
import { getRequestId } from "./requestTracking";

/**
 * Supported API versions
 */
export const API_VERSIONS = ["v1", "v2"] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];

/**
 * Default API version when none is specified
 */
export const DEFAULT_API_VERSION: ApiVersion = "v1";

/**
 * Deprecated API versions that should show warnings
 */
export const DEPRECATED_VERSIONS: ApiVersion[] = [];

/**
 * Extract API version from request
 * Supports multiple strategies:
 * 1. URL path: /api/v1/users
 * 2. Header: X-API-Version: v1
 * 3. Query parameter: ?api_version=v1
 */
export function extractApiVersion(req: Request): ApiVersion {
  // Strategy 1: URL path
  const pathMatch = req.path.match(/^\/api\/(v\d+)/);
  if (pathMatch && isValidApiVersion(pathMatch[1])) {
    return pathMatch[1] as ApiVersion;
  }

  // Strategy 2: Header
  const headerVersion = req.headers["x-api-version"] as string;
  if (headerVersion && isValidApiVersion(headerVersion)) {
    return headerVersion as ApiVersion;
  }

  // Strategy 3: Query parameter
  const queryVersion = req.query.api_version as string;
  if (queryVersion && isValidApiVersion(queryVersion)) {
    return queryVersion as ApiVersion;
  }

  // Default version
  return DEFAULT_API_VERSION;
}

/**
 * Check if version string is valid
 */
export function isValidApiVersion(version: string): boolean {
  return API_VERSIONS.includes(version as ApiVersion);
}

/**
 * Check if API version is deprecated
 */
export function isDeprecatedVersion(version: ApiVersion): boolean {
  return DEPRECATED_VERSIONS.includes(version);
}

/**
 * API versioning middleware
 * Attaches version information to request and logs warnings for deprecated versions
 */
export function apiVersioningMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const version = extractApiVersion(req);
  const requestId = getRequestId(req);

  // Attach version to request for use in handlers
  (req as any).apiVersion = version;

  // Add version header to response
  res.setHeader("X-API-Version", version);

  // Log API version usage
  logger.debug("API version detected", {
    context: "ApiVersioning",
    requestId,
    version,
    path: req.path,
  });

  // Warn about deprecated versions
  if (isDeprecatedVersion(version)) {
    logger.warn("Deprecated API version used", {
      context: "ApiVersioning",
      requestId,
      version,
      path: req.path,
      userAgent: req.headers["user-agent"],
    });

    // Add deprecation warning to response
    res.setHeader(
      "X-API-Deprecation-Warning",
      `API version ${version} is deprecated. Please upgrade to ${DEFAULT_API_VERSION}.`
    );
  }

  next();
}

/**
 * Version-specific route wrapper
 * Only executes handler if API version matches
 */
export function versionedRoute(
  version: ApiVersion,
  handler: (req: Request, res: Response, next: NextFunction) => void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestVersion = (req as any).apiVersion || DEFAULT_API_VERSION;

    if (requestVersion === version) {
      return handler(req, res, next);
    }

    // Skip to next handler if version doesn't match
    next();
  };
}

/**
 * Create version-specific router
 * All routes in this router will only respond to the specified version
 */
export function createVersionedRouter(version: ApiVersion, router: Router): Router {
  // Wrap all routes with version check
  const originalUse = router.use.bind(router);
  const originalGet = router.get.bind(router);
  const originalPost = router.post.bind(router);
  const originalPut = router.put.bind(router);
  const originalPatch = router.patch.bind(router);
  const originalDelete = router.delete.bind(router);

  const wrapHandler = (handler: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestVersion = (req as any).apiVersion || DEFAULT_API_VERSION;
      if (requestVersion === version) {
        return handler(req, res, next);
      }
      next();
    };
  };

  // Override router methods
  router.get = (path: any, ...handlers: any[]) => {
    return originalGet(path, ...handlers.map(wrapHandler));
  };

  router.post = (path: any, ...handlers: any[]) => {
    return originalPost(path, ...handlers.map(wrapHandler));
  };

  router.put = (path: any, ...handlers: any[]) => {
    return originalPut(path, ...handlers.map(wrapHandler));
  };

  router.patch = (path: any, ...handlers: any[]) => {
    return originalPatch(path, ...handlers.map(wrapHandler));
  };

  router.delete = (path: any, ...handlers: any[]) => {
    return originalDelete(path, ...handlers.map(wrapHandler));
  };

  return router;
}

/**
 * Version compatibility middleware
 * Maps old API calls to new versions with transformations
 */
export interface VersionTransform {
  from: ApiVersion;
  to: ApiVersion;
  transformRequest?: (req: Request) => void;
  transformResponse?: (res: Response, data: any) => any;
}

const versionTransforms: VersionTransform[] = [];

/**
 * Register version transformation
 */
export function registerVersionTransform(transform: VersionTransform): void {
  versionTransforms.push(transform);
  logger.info("Registered API version transformation", {
    context: "ApiVersioning",
    from: transform.from,
    to: transform.to,
  });
}

/**
 * Apply version transformation middleware
 */
export function versionTransformMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestVersion = (req as any).apiVersion || DEFAULT_API_VERSION;

  // Find applicable transforms
  const transforms = versionTransforms.filter((t) => t.from === requestVersion);

  // Apply request transformations
  transforms.forEach((transform) => {
    if (transform.transformRequest) {
      transform.transformRequest(req);
      logger.debug("Applied request transformation", {
        context: "ApiVersioning",
        from: transform.from,
        to: transform.to,
        requestId: getRequestId(req),
      });
    }
  });

  // Wrap res.json to apply response transformations
  if (transforms.length > 0 && transforms.some((t) => t.transformResponse)) {
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      let transformedData = data;

      transforms.forEach((transform) => {
        if (transform.transformResponse) {
          transformedData = transform.transformResponse(res, transformedData);
          logger.debug("Applied response transformation", {
            context: "ApiVersioning",
            from: transform.from,
            to: transform.to,
            requestId: getRequestId(req),
          });
        }
      });

      return originalJson(transformedData);
    };
  }

  next();
}

/**
 * Get API version from request
 */
export function getApiVersion(req: Request): ApiVersion {
  return (req as any).apiVersion || DEFAULT_API_VERSION;
}

/**
 * Deprecate an API version
 */
export function deprecateApiVersion(version: ApiVersion): void {
  if (!DEPRECATED_VERSIONS.includes(version)) {
    DEPRECATED_VERSIONS.push(version);
    logger.warn("API version marked as deprecated", {
      context: "ApiVersioning",
      version,
    });
  }
}

/**
 * Log API versioning configuration
 */
export function logApiVersioningConfig(): void {
  logger.info("API versioning configured", {
    context: "ApiVersioning",
    config: {
      supportedVersions: API_VERSIONS,
      defaultVersion: DEFAULT_API_VERSION,
      deprecatedVersions: DEPRECATED_VERSIONS,
      transforms: versionTransforms.length,
    },
  });
}

/**
 * Version mismatch error response
 */
export function versionMismatchError(
  req: Request,
  res: Response,
  requiredVersion: ApiVersion
): void {
  const currentVersion = getApiVersion(req);
  const requestId = getRequestId(req);

  logger.warn("API version mismatch", {
    context: "ApiVersioning",
    requestId,
    currentVersion,
    requiredVersion,
    path: req.path,
  });

  res.status(400).json({
    success: false,
    error: {
      code: "VERSION_MISMATCH",
      message: `This endpoint requires API version ${requiredVersion}, but ${currentVersion} was requested.`,
      currentVersion,
      requiredVersion,
      availableVersions: API_VERSIONS,
    },
    requestId,
  });
}
