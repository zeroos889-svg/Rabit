import "dotenv/config";
import mysql from "mysql2/promise";
import type { Pool, PoolOptions } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";
import { env } from "../utils/env";

let pool: Pool | null = null;
let db: MySql2Database<typeof schema> | null = null;

function buildPoolOptions(): PoolOptions {
  const url = env.getDatabaseUrl();
  
  const parsed = new URL(url);
  const shouldUseSslParam = parsed.searchParams.get("ssl") ?? parsed.searchParams.get("sslmode");
  const shouldUseSsl =
    (shouldUseSslParam &&
      ["true", "1", "require", "required", "verify-full", "verify-ca"].includes(
        (shouldUseSslParam || "").toLowerCase()
      )) || parsed.hostname.includes("tidb") || parsed.hostname.includes("planetscale");

  const database = parsed.pathname.replace(/^\//, "");

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username || ""),
    password: decodeURIComponent(parsed.password || ""),
    database,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  } satisfies PoolOptions;
}

export async function getDrizzleDb() {
  if (db) {
    return db;
  }

  const options = buildPoolOptions();
  pool = mysql.createPool(options);
  db = drizzle(pool, { schema, mode: "default" });
  return db;
}

export async function closeDrizzleDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
