#!/usr/bin/env node
/* eslint-env node */
/* global console, process */
// Alter userType enum to include consultant and admin if missing
import mysql from 'mysql2/promise';
import { URL } from 'node:url';

async function main() {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) { console.error('DATABASE_URL required'); process.exit(1); }
  const u = new URL(urlString);
  if (u.protocol.startsWith('postgres')) {
    console.log('ℹ️  لا حاجة لتعديل userType في PostgreSQL (العمود نصي وليس ENUM).');
    process.exit(0);
  }
  const useSsl = u.searchParams.get('ssl') !== 'false';
  const conn = await mysql.createConnection({
    host: u.hostname,
    port: parseInt(u.port || '3306', 10),
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  try {
    const [columns] = await conn.query("SHOW COLUMNS FROM users LIKE 'userType'");
    const col = columns[0];
  if (!col) { console.error('userType column not found'); process.exit(1); }
    const typeDef = col.Type; // e.g. enum('employee','individual','company')
    if (typeDef.includes("consultant") && typeDef.includes("admin")) {
      console.log('✅ enum already updated:', typeDef);
    } else {
  console.log('🔧 Updating enum... current:', typeDef);
      await conn.query("ALTER TABLE users MODIFY COLUMN userType ENUM('employee','individual','company','consultant','admin') NULL");
  console.log('✅ enum updated');
    }
  } finally {
    await conn.end();
  }
}

main().catch(e => { console.error('❌ alter failed', e); process.exit(1); });
