import { Pool } from 'pg';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../../domain/entities/Customer';

export class CustomerRepository implements ICustomerRepository {
  constructor(private db: Pool) {}

  async create(data: CreateCustomerDTO): Promise<Customer> {
    const query = `
      INSERT INTO customers (
        first_name, last_name, email, phone_number, 
        address, city, state, country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        customer_id as "customerId",
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        address,
        city,
        state,
        country,
        date_created as "dateCreated"
    `;

    const values = [
      data.firstName,
      data.lastName,
      data.email,
      data.phoneNumber || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findById(customerId: string): Promise<Customer | null> {
    const query = `
      SELECT 
        customer_id as "customerId",
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        address,
        city,
        state,
        country,
        date_created as "dateCreated"
      FROM customers
      WHERE customer_id = $1
    `;

    const result = await this.db.query(query, [customerId]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const query = `
      SELECT 
        customer_id as "customerId",
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        address,
        city,
        state,
        country,
        date_created as "dateCreated"
      FROM customers
      WHERE email = $1
    `;

    const result = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Customer[]> {
    const query = `
      SELECT 
        customer_id as "customerId",
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        address,
        city,
        state,
        country,
        date_created as "dateCreated"
      FROM customers
      ORDER BY date_created DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  async update(customerId: string, data: UpdateCustomerDTO): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(data.lastName);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(data.phoneNumber);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(data.address);
    }
    if (data.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push(`state = $${paramCount++}`);
      values.push(data.state);
    }
    if (data.country !== undefined) {
      fields.push(`country = $${paramCount++}`);
      values.push(data.country);
    }

    if (fields.length === 0) {
      return this.findById(customerId);
    }

    values.push(customerId);

    const query = `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE customer_id = $${paramCount}
      RETURNING 
        customer_id as "customerId",
        first_name as "firstName",
        last_name as "lastName",
        email,
        phone_number as "phoneNumber",
        address,
        city,
        state,
        country,
        date_created as "dateCreated"
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(customerId: string): Promise<boolean> {
    const query = 'DELETE FROM customers WHERE customer_id = $1';
    const result = await this.db.query(query, [customerId]);
    return (result.rowCount ?? 0) > 0;
  }
}