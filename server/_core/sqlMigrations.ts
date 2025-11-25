import fs from "fs";
import path from "path";
import { Pool } from "pg";

/**
 * Run SQL migrations directly without drizzle-kit CLI (compatible مع PostgreSQL)
 */
export async function runSQLMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[SQL Migrations] DATABASE_URL not set, skipping migrations");
    return false;
  }

  const url = new URL(process.env.DATABASE_URL);
  const sslMode = url.searchParams.get("sslmode");
  const shouldUseSsl =
    (sslMode && ["require", "required", "verify-full", "verify-ca"].includes(sslMode.toLowerCase())) ||
    url.searchParams.get("ssl") === "true" ||
    url.hostname.includes("railway");

  const pool: any = new (Pool as any)({
    connectionString: process.env.DATABASE_URL,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    max: 1,
  });

  const client: any = await pool.connect();

  try {
    const migrationsDir = path.join(process.cwd(), "drizzle");
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("[SQL Migrations] No migration files found, skipping.");
      return false;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const executed = await client.query("SELECT name FROM __drizzle_migrations");
    const executedNames = new Set(executed.rows.map((r: { name: string }) => r.name));

    let executedCount = 0;
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`[SQL Migrations] ✓ Already executed: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO __drizzle_migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`[SQL Migrations] ✓ Executed: ${file}`);
        executedCount++;
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`[SQL Migrations] ✗ Failed to execute ${file}:`, error);
        throw error;
      }
    }

    console.log(
      `[SQL Migrations] ✓ Successfully executed ${executedCount} new migrations`
    );
    return true;
  } catch (error) {
    console.error("[SQL Migrations] ✗ Failed to run migrations:", error);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}
