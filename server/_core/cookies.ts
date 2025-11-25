import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

function isSecureRequest(req: Request): boolean {
  if (ENV.isProduction) {
    return true;
  }

  const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
  if (typeof proto === "string") {
    return proto.includes("https");
  }

  if (Array.isArray(proto)) {
    return proto.some(value => value.includes("https"));
  }

  return false;
}

export function getSessionCookieOptions(req: Request): CookieOptions {
  const secure = isSecureRequest(req);
  const domain = process.env.COOKIE_DOMAIN;

  const options: CookieOptions = {
    httpOnly: true,
    sameSite: ENV.isProduction ? "strict" : "lax",
    secure,
    path: "/",
  };

  if (domain) {
    options.domain = domain;
  }

  if (!ENV.isProduction) {
    options.sameSite = "lax";
  }

  return options;
}
