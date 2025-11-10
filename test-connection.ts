// test-connection.ts
// Place this file in your project root to test database connection

import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testConnection = async () => {
  console.log("🔍 Testing PostgreSQL Connection...\n");

  // Display connection parameters (hide password)
  console.log("Connection Parameters:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Host:     ", process.env.DB_HOST || "NOT SET");
  console.log("Port:     ", process.env.DB_PORT || "NOT SET");
  console.log("Database: ", process.env.DB_NAME || "NOT SET");
  console.log("User:     ", process.env.DB_USER || "NOT SET");
  console.log(
    "Password: ",
    process.env.DB_PASSWORD ? "******* (SET)" : "❌ NOT SET"
  );
  console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD);
  console.log("DB_PASSWORD set:", !!process.env.DB_PASSWORD);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Check if required env vars are set
  if (!process.env.DB_PASSWORD) {
    console.error("❌ DB_PASSWORD is not set in .env file!");
    console.log("\n💡 Create a .env file with:");
    console.log("DB_PASSWORD=your_password_here\n");
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "cms-db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log("⏳ Attempting to connect...\n");

    // Test query
    const result = await pool.query(
      "SELECT version(), current_database(), current_user, NOW()"
    );

    console.log("✅ CONNECTION SUCCESSFUL!\n");
    console.log("Database Information:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("PostgreSQL Version:", result.rows[0].version.split(",")[0]);
    console.log("Current Database:  ", result.rows[0].current_database);
    console.log("Connected as:      ", result.rows[0].current_user);
    console.log("Server Time:       ", result.rows[0].now);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check if customers table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("📊 customers table: ✅ EXISTS");

      // Count records
      const countResult = await pool.query("SELECT COUNT(*) FROM customers");
      console.log("📈 Customer records:", countResult.rows[0].count);
    } else {
      console.log("📊 customers table: ❌ NOT FOUND");
      console.log("💡 Run: npm run migrate:up");
    }

    console.log("\n🎉 Database is ready to use!\n");
  } catch (error: any) {
    console.error("❌ CONNECTION FAILED!\n");
    console.error("Error Details:");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Message:", error.message);
    console.error("Code:   ", error.code || "N/A");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Provide specific solutions based on error
    if (error.code === "28P01") {
      console.log("🔧 SOLUTION: Password Authentication Failed");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("1. Reset PostgreSQL password:");
      console.log("   sudo -u postgres psql");
      console.log("   ALTER USER postgres PASSWORD 'newpassword';");
      console.log("   \\q");
      console.log("\n2. Update your .env file:");
      console.log("   DB_PASSWORD=newpassword\n");
    } else if (error.code === "3D000") {
      console.log("🔧 SOLUTION: Database Does Not Exist");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Create the database:");
      console.log("   createdb cms_db");
      console.log("OR:");
      console.log("   psql -U postgres");
      console.log("   CREATE DATABASE cms_db;");
      console.log("   \\q\n");
    } else if (error.code === "ECONNREFUSED") {
      console.log("🔧 SOLUTION: Cannot Connect to PostgreSQL");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("PostgreSQL might not be running. Start it:");
      console.log("   Linux:  sudo systemctl start postgresql");
      console.log("   macOS:  brew services start postgresql");
      console.log("   Windows: Start PostgreSQL service\n");
    } else if (error.code === "ETIMEDOUT") {
      console.log("🔧 SOLUTION: Connection Timeout");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Check if host and port are correct in .env");
      console.log("   DB_HOST=localhost");
      console.log("   DB_PORT=5432\n");
    } else {
      console.log("🔧 GENERAL TROUBLESHOOTING:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("1. Verify PostgreSQL is running");
      console.log("2. Check credentials in .env file");
      console.log("3. Ensure database exists");
      console.log("4. Check PostgreSQL logs for details\n");
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the test
testConnection();
