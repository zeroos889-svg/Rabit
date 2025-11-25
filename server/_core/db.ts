import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema";

const DATABASE_URL = process.env.DATABASE_URL || "";

let connection: ReturnType<typeof drizzle> | undefined;

/**
 * Get or create database connection
 */
export async function getDb() {
  if (connection) return connection;

  try {
    const poolConnection = mysql.createPool(DATABASE_URL);
    connection = drizzle(poolConnection, { schema, mode: "default" });
    // Database connected successfully
    return connection;
  } catch {
    // Database connection failed
    throw new Error("Failed to connect to database");
  }
}

export const db = connection;
