import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

function buildPoolConfig(url) {
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

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("Connecting to database...");
  const pool = new Pool(buildPoolConfig(process.env.DATABASE_URL));
  const client = await pool.connect();

  try {
    const migrationsDir = path.join(process.cwd(), "drizzle");
    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log("Running migrations...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL UNIQUE,
        "executed_at" timestamp DEFAULT now()
      );
    `);

    const executedRes = await client.query('SELECT name FROM "__drizzle_migrations"');
    const executed = new Set(executedRes.rows.map(r => r.name));

    let executedCount = 0;
    for (const file of files) {
      if (executed.has(file)) {
        console.log(`✓ Already executed: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query('INSERT INTO "__drizzle_migrations" ("name") VALUES ($1)', [file]);
        await client.query("COMMIT");
        console.log(`✓ Executed: ${file}`);
        executedCount++;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    console.log(`Migrations completed successfully! Executed: ${executedCount}`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
