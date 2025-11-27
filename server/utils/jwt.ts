import jwt from "jsonwebtoken";
import { env } from "./env";

const JWT_EXPIRES_IN = "7d"; // Token valid for 7 days

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
