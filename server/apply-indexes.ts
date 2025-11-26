import "dotenv/config";
import { getDb } from "./_core/db.js";
import { sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./_core/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyIndexes() {
  try {
    logger.info("Applying database indexes", { context: "Indexes" });
    
    const db = await getDb();
    
    const migrationPath = path.join(__dirname, "_core", "migrations", "002_add_performance_indexes.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement));
        logger.info("Executed index statement", {
          context: "Indexes",
          preview: statement.substring(0, 50),
        });
      } catch (error: unknown) {
        // Ignore "already exists" errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage?.includes("already exists")) {
          logger.info("Index already exists, skipping", {
            context: "Indexes",
          });
        } else {
          logger.error("Failed to execute statement", {
            context: "Indexes",
            error: errorMessage,
          });
        }
      }
    }
    
    logger.info("Database indexes applied successfully", {
      context: "Indexes",
    });
    process.exit(0);
  } catch (error) {
    logger.error("Failed to apply indexes", {
      context: "Indexes",
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

await applyIndexes();
