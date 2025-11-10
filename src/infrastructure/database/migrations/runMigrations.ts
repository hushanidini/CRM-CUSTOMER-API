import { Pool } from 'pg';
import { createDatabasePool } from '../config';

const migrations = [
  {
    name: '001_create_customers_table',
    up: `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create customers table
      CREATE TABLE IF NOT EXISTS customers (
        customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone_number VARCHAR(20),
        address VARCHAR(200),
        city VARCHAR(50),
        state VARCHAR(50),
        country VARCHAR(50),
        date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_date_created ON customers(date_created DESC);
      CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);

      -- Create migrations tracking table
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `,
    down: `
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
    `,
  },
];

export const runMigrations = async (pool: Pool): Promise<void> => {
  console.log('🔄 Starting database migrations...');

  try {
    // Create migrations table if it doesn't exist (first migration includes this)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    for (const migration of migrations) {
      // Check if migration has already been run
      const result = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`  ⏳ Running migration: ${migration.name}`);
        
        // Run migration
        await pool.query(migration.up);
        
        // Record migration
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        
        console.log(`  ✅ Completed: ${migration.name}`);
      } else {
        console.log(`  ⏭️  Skipped (already run): ${migration.name}`);
      }
    }

    console.log('✅ All migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const rollbackMigrations = async (pool: Pool): Promise<void> => {
  console.log('🔄 Rolling back migrations...');

  try {
    // Get all executed migrations in reverse order
    const result = await pool.query(
      'SELECT name FROM migrations ORDER BY id DESC'
    );

    for (const row of result.rows) {
      const migration = migrations.find((m) => m.name === row.name);
      
      if (migration) {
        console.log(`  ⏳ Rolling back: ${migration.name}`);
        
        // Run rollback
        await pool.query(migration.down);
        
        // Remove migration record
        await pool.query('DELETE FROM migrations WHERE name = $1', [
          migration.name,
        ]);
        
        console.log(`  ✅ Rolled back: ${migration.name}`);
      }
    }

    console.log('✅ All migrations rolled back successfully!\n');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  const execute = async () => {
    const pool = createDatabasePool();

    try {
      if (command === 'up') {
        await runMigrations(pool);
      } else if (command === 'down') {
        await rollbackMigrations(pool);
      } else {
        console.log('Usage: npm run migrate:up or npm run migrate:down');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await pool.end();
      process.exit(0);
    }
  };

  execute();
}