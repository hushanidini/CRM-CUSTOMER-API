
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Pool } from 'pg';
import { CustomerRepository } from '../../../infrastructure/repositories/CustomerRepository';
import { mockCustomer, mockCustomer2, mockCreateCustomerDTO } from '../../helpers/mockData';

describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let mockPool: Pool;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQuery = vi.fn();
    mockPool = {
      query: mockQuery,
    } as any;
    repository = new CustomerRepository(mockPool);
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await repository.create(mockCreateCustomerDTO);

      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        [
          mockCreateCustomerDTO.firstName,
          mockCreateCustomerDTO.lastName,
          mockCreateCustomerDTO.email,
          mockCreateCustomerDTO.phoneNumber,
          mockCreateCustomerDTO.address,
          mockCreateCustomerDTO.city,
          mockCreateCustomerDTO.state,
          mockCreateCustomerDTO.country,
        ]
      );
    });

    it('should handle optional fields as null', async () => {
      const minimalData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      mockQuery.mockResolvedValueOnce({
        rows: [{ ...mockCustomer, phoneNumber: null, address: null }],
      });

      await repository.create(minimalData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null, null, null, null, null])
      );
    });
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await repository.findById(mockCustomer.customerId);

      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockCustomer.customerId]
      );
    });

    it('should return null when customer not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a customer when found by email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await repository.findByEmail(mockCustomer.email);

      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE email = $1'),
        [mockCustomer.email]
      );
    });

    it('should return null when email not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all customers with default pagination', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer, mockCustomer2] });

      const result = await repository.findAll();

      expect(result).toEqual([mockCustomer, mockCustomer2]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $1 OFFSET $2'),
        [50, 0]
      );
    });

    it('should return customers with custom pagination', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await repository.findAll(10, 5);

      expect(result).toEqual([mockCustomer]);
      expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [10, 5]);
    });

    it('should return empty array when no customers exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update customer successfully', async () => {
      const updateData = { firstName: 'Jane', city: 'San Francisco' };
      const updatedCustomer = { ...mockCustomer, ...updateData };

      mockQuery.mockResolvedValueOnce({ rows: [updatedCustomer] });

      const result = await repository.update(mockCustomer.customerId, updateData);

      expect(result).toEqual(updatedCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE customers'),
        expect.arrayContaining([updateData.firstName, updateData.city, mockCustomer.customerId])
      );
    });

    it('should return null when customer not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await repository.update('non-existent-id', { firstName: 'Jane' });

      expect(result).toBeNull();
    });

    it('should return existing customer when no fields to update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockCustomer] });

      const result = await repository.update(mockCustomer.customerId, {});

      expect(result).toEqual(mockCustomer);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockCustomer.customerId]
      );
    });

    it('should handle partial updates', async () => {
      const updateData = { email: 'newemail@example.com' };
      mockQuery.mockResolvedValueOnce({
        rows: [{ ...mockCustomer, email: updateData.email }],
      });

      const result = await repository.update(mockCustomer.customerId, updateData);

      expect(result?.email).toBe(updateData.email);
    });
  });

  describe('delete', () => {
    it('should delete customer successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await repository.delete(mockCustomer.customerId);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM customers'),
        [mockCustomer.customerId]
      );
    });

    it('should return false when customer not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should handle null rowCount', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: null });

      const result = await repository.delete(mockCustomer.customerId);

      expect(result).toBe(false);
    });
  });
});