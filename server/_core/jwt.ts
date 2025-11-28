/**
 * JWT Token Management
 * Handles creation and verification of JWT tokens
 */

import * as jose from "jose";
import { ENV } from "./env";
import { logger } from "./logger";

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  name?: string;
  openId?: string;
  userType?: string;
}

/**
 * Create a session token
 */
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  const secret = new TextEncoder().encode(ENV.jwtSecret);

  return await new jose.SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    openId: payload.openId,
    userType: payload.userType,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify a session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(ENV.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);

    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string | undefined,
      openId: payload.openId as string | undefined,
    };
  } catch (error) {
    logger.error("Token verification failed", {
      context: "JWT",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Refresh a session token
 */
export async function refreshSessionToken(
  token: string
): Promise<string | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  
  return createSessionToken(payload);
}
