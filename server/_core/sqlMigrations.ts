import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

/**
 * Run SQL migrations directly without drizzle-kit CLI (compatible مع MySQL)
 */
export async function runSQLMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[SQL Migrations] DATABASE_URL not set, skipping migrations");
    return false;
  }

  const url = new URL(process.env.DATABASE_URL);
  const shouldUseSsl = url.hostname.includes("railway") || url.searchParams.get("ssl") === "true";

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  });

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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const [rows] = await connection.query("SELECT name FROM __drizzle_migrations");
    const executedNames = new Set((rows as any[]).map((r: { name: string }) => r.name));

    let executedCount = 0;
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`[SQL Migrations] ✓ Already executed: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      try {
        await connection.query("START TRANSACTION");
        await connection.query(sql);
        await connection.query(
          "INSERT INTO __drizzle_migrations (name) VALUES (?)",
          [file]
        );
        await connection.query("COMMIT");
        console.log(`[SQL Migrations] ✓ Executed: ${file}`);
        executedCount++;
      } catch (error) {
        await connection.query("ROLLBACK");
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
    await connection.end();
  }
}
