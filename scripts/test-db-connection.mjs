#!/usr/bin/env node
/* eslint-env node */
// سكربت اختبار اتصال قاعدة البيانات (PostgreSQL)
import { Client } from "pg";

function parseConfig(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch (error) {
    console.error("صيغة DATABASE_URL غير صحيحة", error);
    process.exit(1);
  }

  const sslMode =
    url.searchParams.get("sslmode") || url.searchParams.get("ssl-mode");
  const shouldUseSsl =
    (sslMode && ["require", "required", "verify-full", "verify-ca"].includes(sslMode.toLowerCase())) ||
    url.searchParams.get("ssl") === "true" ||
    url.hostname.includes("railway");

  return {
    connectionString: urlString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  };
}

async function main() {
  const urlString = process.env.DATABASE_URL || process.argv[2];
  if (!urlString) {
    console.error("يرجى توفير DATABASE_URL كمتغير بيئة أو وسيط للأمر");
    process.exit(1);
  }

  const client = new Client(parseConfig(urlString));

  try {
    await client.connect();
    console.log("✅ اتصال PostgreSQL ناجح");

    const ping = await client.query("SELECT 1 AS ok");
    console.log("✅ Ping:", ping.rows[0]);

    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log("📦 عدد الجداول:", tables.rows.length);
    if (tables.rows.length) {
      console.log("🔍 أول 5 جداول:", tables.rows.slice(0, 5));
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", err.message);
    if (err.cause) console.error("Cause:", err.cause);
    await client.end();
    process.exit(1);
  }
}

main();
