import { drizzle } from "drizzle-orm/node-postgres";
import { users, passwords } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

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

const pool = new Pool(buildPoolConfig(process.env.DATABASE_URL));
const db = drizzle(pool);

async function seedTestUsers() {
  console.log("🌱 Seeding test users...");

  const defaultPassword = process.env.DEFAULT_TEST_PASSWORD || "AdminPass123!";
  const allowAdminSeeds =
    process.env.ALLOW_ADMIN_SEED === "true" || process.env.NODE_ENV !== "production";

  let testUsers = [
    {
      name: "مدير النظام",
      email: "admin@admin.com",
      password: defaultPassword,
      role: "admin",
      userType: "company", // admin doesn't have userType enum
      phoneNumber: "+966500000001",
      emailVerified: true,
      profileCompleted: true,
    },
    {
      name: "شركة تجريبية",
      email: "company@test.com",
      password: defaultPassword,
      role: "user",
      userType: "company",
      phoneNumber: "+966500000002",
      emailVerified: true,
      profileCompleted: true,
    },
    {
      name: "مستشار تجريبي",
      email: "consultant@test.com",
      password: defaultPassword,
      role: "user",
      userType: "individual", // consultant = individual in schema
      phoneNumber: "+966500000003",
      emailVerified: true,
      profileCompleted: true,
    },
    {
      name: "موظف تجريبي",
      email: "employee@test.com",
      password: defaultPassword,
      role: "user",
      userType: "employee",
      phoneNumber: "+966500000004",
      emailVerified: true,
      profileCompleted: true,
    },
  ];

  if (!allowAdminSeeds) {
    console.log("ℹ️  Skipping admin test users (ALLOW_ADMIN_SEED not enabled)");
    testUsers = testUsers.filter(user => user.role !== "admin");
  }

  for (const userData of testUsers) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert user
      const [insertedUser] = await db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          userType: userData.userType,
          phoneNumber: userData.phoneNumber,
          emailVerified: userData.emailVerified,
          profileCompleted: userData.profileCompleted,
          loginMethod: "email",
        })
        .returning({ id: users.id });

      // Insert password
      await db.insert(passwords).values({
        userId: insertedUser.id,
        passwordHash: hashedPassword,
      });

      console.log(`✅ Created user: ${userData.email} (${userData.userType})`);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`⚠️  User already exists: ${userData.email}`);
      } else {
        console.error(
          `❌ Error creating user ${userData.email}:`,
          error.message
        );
      }
    }
  }

  console.log("✅ Test users seeding completed!");
  await pool.end();
  process.exit(0);
}

seedTestUsers().catch(error => {
  console.error("❌ Seeding failed:", error);
  pool.end();
  process.exit(1);
});
