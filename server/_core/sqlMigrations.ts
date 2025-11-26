import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { logger } from "./logger";

/**
 * Run SQL migrations directly without drizzle-kit CLI (compatible مع MySQL)
 */
export async function runSQLMigrations() {
  if (!process.env.DATABASE_URL) {
    logger.info("DATABASE_URL not set, skipping migrations", {
      context: "SQL Migrations",
    });
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
      logger.info("No migration files found, skipping", {
        context: "SQL Migrations",
      });
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
        logger.info("Already executed migration", {
          context: "SQL Migrations",
          file,
        });
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
        logger.info("Successfully executed migration", {
          context: "SQL Migrations",
          file,
        });
        executedCount++;
      } catch (error) {
        await connection.query("ROLLBACK");
        logger.error("Failed to execute migration", {
          context: "SQL Migrations",
          file,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }

    logger.info("Successfully executed migrations", {
      context: "SQL Migrations",
      executedCount,
      totalFiles: files.length,
    });
    return true;
  } catch (error) {
    logger.error("Failed to run migrations", {
      context: "SQL Migrations",
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  } finally {
    await connection.end();
  }
}
