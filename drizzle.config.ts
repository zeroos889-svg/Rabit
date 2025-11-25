import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    uri: connectionString,
  },
} satisfies Config;
