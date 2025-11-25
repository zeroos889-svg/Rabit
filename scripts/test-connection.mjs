import mysql from 'mysql2/promise';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function maskUrl(urlString) {
  return urlString?.replace(/:[^:@/]+@/, ':****@');
}

function shouldUseSsl(parsed) {
  const sslMode =
    parsed.searchParams.get('sslmode') || parsed.searchParams.get('ssl-mode');
  const sslParam = parsed.searchParams.get('ssl');
  const sslModeLower = sslMode?.toLowerCase();
  const disable =
    sslParam === 'false' ||
    sslParam === '0' ||
    sslModeLower === 'disable' ||
    sslModeLower === 'disabled';
  if (disable) return false;

  const requireSsl =
    sslParam === 'true' ||
    sslParam === '1' ||
    ['require', 'required', 'verify-ca', 'verify-full'].includes(
      sslModeLower || ''
    ) ||
    parsed.hostname.includes('tidbcloud.com') ||
    parsed.hostname.includes('railway');

  return requireSsl;
}

function buildMySqlConfig(urlString) {
  const parsed = new URL(urlString);
  const useSsl = shouldUseSsl(parsed);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    ssl: useSsl
      ? { minVersion: 'TLSv1.2', rejectUnauthorized: false }
      : undefined,
  };
}

function buildPostgresConfig(urlString) {
  const parsed = new URL(urlString);
  const useSsl = shouldUseSsl(parsed);

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  };
}

async function testMySql(urlString) {
  const connection = await mysql.createConnection(buildMySqlConfig(urlString));
  await connection.ping();
  console.log('✅ MySQL connection successful');
  await connection.end();
}

async function testPostgres(urlString) {
  const client = new Client(buildPostgresConfig(urlString));
  await client.connect();
  await client.query('SELECT 1 AS ok');
  console.log('✅ PostgreSQL connection successful');
  await client.end();
}

async function testConnection() {
  const urlString = process.argv[2] || process.env.DATABASE_URL;
  if (!urlString) {
    console.error('يرجى توفير DATABASE_URL كمتغير بيئة أو وسيط للأمر');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (error) {
    console.error('صيغة DATABASE_URL غير صحيحة:', error.message);
    process.exit(1);
  }

  console.log('🔗 Testing connection...');
  console.log('URL:', maskUrl(urlString));

  try {
    const protocol = parsed.protocol.replace(':', '');
    if (protocol === 'mysql' || protocol === 'mysql2') {
      await testMySql(urlString);
    } else if (protocol === 'postgres' || protocol === 'postgresql') {
      await testPostgres(urlString);
    } else {
      console.error(
        `بروتوكول غير مدعوم (${protocol}). الرجاء استخدام mysql أو postgresql`
      );
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.cause) console.error('Cause:', error.cause);
    process.exit(1);
  }
}

testConnection();
