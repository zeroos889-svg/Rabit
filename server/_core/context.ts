import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";
import { verifySessionToken } from "./jwt";
import { verifyToken } from "../utils/jwt";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: any | null;
};

export type Context = TrpcContext;

async function resolveUser(userId?: number | null) {
  if (!userId) return null;
  try {
    const fetchedUser = await db.getUserById(userId);
    return fetchedUser || null;
  } catch {
    return null;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const { req, res } = opts;
  let user: any | null = null;

  try {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    if (cookieToken) {
      const payload = await verifySessionToken(cookieToken);
      user = await resolveUser(payload?.userId);
    }

    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const bearer = authHeader.substring(7);
        const payload = verifyToken(bearer);
        user = await resolveUser(payload?.userId);
      }
    }
  } catch {
    user = null;
  }

  return {
    req,
    res,
    user,
  };
}
