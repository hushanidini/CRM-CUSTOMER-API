import { Pool } from 'pg';
import { createDatabasePool } from './config';

export const seedCustomers = async (pool: Pool): Promise<void> => {
  console.log('🌱 Starting database seeding...');

  const sampleCustomers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1-555-0101',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1-555-0102',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phoneNumber: '+1-555-0103',
      address: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      phoneNumber: '+1-555-0104',
      address: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      country: 'USA',
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      phoneNumber: '+1-555-0105',
      address: '654 Maple Ave',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
    },
  ];

  try {
    let insertedCount = 0;
    let skippedCount = 0;

    for (const customer of sampleCustomers) {
      const result = await pool.query(
        `
        INSERT INTO customers (first_name, last_name, email, phone_number, address, city, state, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
        RETURNING customer_id
        `,
        [
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phoneNumber,
          customer.address,
          customer.city,
          customer.state,
          customer.country,
        ]
      );

      if (result.rows.length > 0) {
        console.log(`  ✅ Inserted: ${customer.firstName} ${customer.lastName}`);
        insertedCount++;
      } else {
        console.log(`  ⏭️  Skipped (exists): ${customer.firstName} ${customer.lastName}`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`   📊 Inserted: ${insertedCount} customers`);
    console.log(`   ⏭️  Skipped: ${skippedCount} customers\n`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

export const clearCustomers = async (pool: Pool): Promise<void> => {
  console.log('🗑️  Clearing customers table...');

  try {
    const result = await pool.query('DELETE FROM customers');
    console.log(`✅ Deleted ${result.rowCount} customers\n`);
  } catch (error) {
    console.error('❌ Clear failed:', error);
    throw error;
  }
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  const execute = async () => {
    const pool = createDatabasePool();

    try {
      if (command === 'seed') {
        await seedCustomers(pool);
      } else if (command === 'clear') {
        await clearCustomers(pool);
      } else {
        console.log('Usage: npm run seed or npm run seed:clear');
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