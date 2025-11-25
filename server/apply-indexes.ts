import "dotenv/config";
import { getDb } from "./_core/db.js";
import { sql } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyIndexes() {
  try {
    console.log("🔄 Applying database indexes...");
    
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
        console.log("✅ Executed:", statement.substring(0, 50) + "...");
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message && error.message.includes("already exists")) {
          console.log("⚠️  Index already exists, skipping");
        } else {
          console.error("❌ Error:", error.message);
        }
      }
    }
    
    console.log("✅ Database indexes applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to apply indexes:", error);
    process.exit(1);
  }
}

await applyIndexes();
