import { Pool } from "pg";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
export const createDatabasePool = (): Pool => {
  console.log("=== Database Config Debug ===");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);
  console.log("DB_PASSWORD set:", !!process.env.DB_PASSWORD);
  console.log("============================");

  // If no password, try peer authentication
  const config: any = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "cms-db",
    user: process.env.DB_USER || "postgres",

    // Connection pool settings for optimal performance
    max: 20, // Maximum number of clients in the pool
    min: 5, // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 2000, // Return error after 2s if unable to connect

    // Keep-alive settings for long-running connections
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,

    // Statement timeout (30 seconds)
    statement_timeout: 30000,

    // Query timeout
    query_timeout: 10000,
  };

  // Only add password if it exists
  if (process.env.DB_PASSWORD) {
    config.password = process.env.DB_PASSWORD;
  }

  const pool = new Pool(config);

  // Log pool errors
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });

  // Log new connections in development
  if (process.env.NODE_ENV === "development") {
    pool.on("connect", () => {
      console.log("New database connection established");
    });
  }

  return pool;
};
