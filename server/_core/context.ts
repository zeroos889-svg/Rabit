import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyToken } from "../utils/jwt";

/**
 * Creates context for tRPC requests.
 * This runs for every request and provides shared context to all procedures.
 */
export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  let user: { id: number; email: string; role: string } | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);
    
    if (payload) {
      user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
