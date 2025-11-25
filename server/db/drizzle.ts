import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../drizzle/schema";

let pool: any = null;
let db: NodePgDatabase<typeof schema> | null = null;

function parseDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Please set it in your environment variables."
    );
  }

  const parsed = new URL(url);
  const sslMode =
    parsed.searchParams.get("sslmode") || parsed.searchParams.get("ssl-mode");
  const shouldUseSsl =
    (sslMode && ["require", "required", "verify-full", "verify-ca"].includes((sslMode || "").toLowerCase())) ||
    parsed.searchParams.get("ssl") === "true" ||
    parsed.hostname.includes("railway");

  return {
    connectionString: url,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  };
}

export async function getDrizzleDb() {
  if (db) {
    return db;
  }

  const config = parseDatabaseUrl();
  pool = new (Pool as any)({
    connectionString: config.connectionString,
    ssl: config.ssl,
  });

  db = drizzle(pool as any, { schema });
  return db;
}

export async function closeDrizzleDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
