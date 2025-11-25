#!/usr/bin/env tsx
/*
 * Script: test-register-user.ts
 * Purpose: Registers a test user using existing drizzle-aware helpers (createUserWithPassword)
 * Usage:
 *   DATABASE_URL=... npm run user:test-register -- [email] [password] [name]
 *   Or:
 *   DATABASE_URL=... tsx scripts/test-register-user.ts custom@example.com StrongPass!123 "Custom Name"
 */

/* eslint-env node */
/* eslint-disable no-console */
import { createUserWithPassword, getUserByEmail } from '../server/db/index.js';

async function main() {
  const [emailArg, passwordArg, nameArg] = process.argv.slice(2);
  const email = emailArg || `test_${Date.now()}@example.com`;
  const password = passwordArg || 'StrongPass!123';
  const name = nameArg || 'Test User';

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL must be set.');
    process.exit(1);
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    console.log('⚠️ User already exists:', { id: existing.id, email: existing.email });
    process.exit(0);
  }

  const user = await createUserWithPassword({ email, password, name });
  if (!user) {
    console.error('❌ Failed to create user');
    process.exit(1);
  }
  console.log('✅ User created:', {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    userType: user.userType,
    createdAt: user.createdAt,
  });
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
