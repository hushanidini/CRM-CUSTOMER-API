import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerService } from '../../../application/services/CustomerService';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { AppError } from '../../../shared/errors/AppError';
import { mockCustomer, mockCreateCustomerDTO, mockUpdateCustomerDTO } from '../../helpers/mockData';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: ICustomerRepository;

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new CustomerService(mockRepository);
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);
      vi.mocked(mockRepository.create).mockResolvedValueOnce(mockCustomer);

      const result = await service.createCustomer(mockCreateCustomerDTO);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(mockCreateCustomerDTO.email);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateCustomerDTO);
    });

    it('should throw error if email already exists', async () => {
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(mockCustomer);

      await expect(service.createCustomer(mockCreateCustomerDTO)).rejects.toThrow(
        new AppError('Email already exists', 409)
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should validate first name length', async () => {
      const invalidData = { ...mockCreateCustomerDTO, firstName: 'A' };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('First name must be at least 2 characters long', 400)
      );
    });

    it('should validate last name length', async () => {
      const invalidData = { ...mockCreateCustomerDTO, lastName: 'B' };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('Last name must be at least 2 characters long', 400)
      );
    });

    it('should validate name contains only valid characters', async () => {
      const invalidData = { ...mockCreateCustomerDTO, firstName: 'John123' };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('First name contains invalid characters', 400)
      );
    });

    it('should validate name max length', async () => {
      const invalidData = { 
        ...mockCreateCustomerDTO, 
        firstName: 'A'.repeat(51) 
      };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('First name must not exceed 50 characters', 400)
      );
    });

    it('should validate phone number format', async () => {
      const invalidData = { ...mockCreateCustomerDTO, phoneNumber: 'abc' };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('Invalid phone number format', 400)
      );
    });

    it('should validate phone number minimum digits', async () => {
      const invalidData = { ...mockCreateCustomerDTO, phoneNumber: '123' };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);

      await expect(service.createCustomer(invalidData)).rejects.toThrow(
        new AppError('Phone number must contain at least 10 digits', 400)
      );
    });

    it('should accept valid phone number with formatting', async () => {
      const dataWithPhone = { 
        ...mockCreateCustomerDTO, 
        phoneNumber: '+1 (555) 123-4567' 
      };
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce(null);
      vi.mocked(mockRepository.create).mockResolvedValueOnce(mockCustomer);

      await service.createCustomer(dataWithPhone);

      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('getCustomerById', () => {
    it('should return customer when found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);

      const result = await service.getCustomerById(mockCustomer.customerId);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockCustomer.customerId);
    });

    it('should throw error when customer not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      await expect(service.getCustomerById('non-existent-id')).rejects.toThrow(
        new AppError('Customer not found', 404)
      );
    });

    it('should validate UUID format', async () => {
      await expect(service.getCustomerById('invalid-uuid')).rejects.toThrow(
        new AppError('Invalid customer ID format', 400)
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers with default pagination', async () => {
      const customers = [mockCustomer];
      vi.mocked(mockRepository.findAll).mockResolvedValueOnce(customers);

      const result = await service.getAllCustomers();

      expect(result).toEqual(customers);
      expect(mockRepository.findAll).toHaveBeenCalledWith(50, 0);
    });

    it('should return customers with custom pagination', async () => {
      const customers = [mockCustomer];
      vi.mocked(mockRepository.findAll).mockResolvedValueOnce(customers);

      const result = await service.getAllCustomers(10, 5);

      expect(result).toEqual(customers);
      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 5);
    });

    it('should validate limit range', async () => {
      await expect(service.getAllCustomers(0, 0)).rejects.toThrow(
        new AppError('Limit must be between 1 and 100', 400)
      );

      await expect(service.getAllCustomers(101, 0)).rejects.toThrow(
        new AppError('Limit must be between 1 and 100', 400)
      );
    });

    it('should validate offset is non-negative', async () => {
      await expect(service.getAllCustomers(50, -1)).rejects.toThrow(
        new AppError('Offset must be non-negative', 400)
      );
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const updatedCustomer = { ...mockCustomer, ...mockUpdateCustomerDTO };
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.update).mockResolvedValueOnce(updatedCustomer);

      const result = await service.updateCustomer(
        mockCustomer.customerId,
        mockUpdateCustomerDTO
      );

      expect(result).toEqual(updatedCustomer);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCustomer.customerId,
        mockUpdateCustomerDTO
      );
    });

    it('should throw error when customer not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      await expect(
        service.updateCustomer('non-existent-id', mockUpdateCustomerDTO)
      ).rejects.toThrow(new AppError('Customer not found', 404));
    });

    it('should check for duplicate email when updating', async () => {
      const newEmail = 'newemail@example.com';
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.findByEmail).mockResolvedValueOnce({
        ...mockCustomer,
        customerId: 'different-id',
      });

      await expect(
        service.updateCustomer(mockCustomer.customerId, { email: newEmail })
      ).rejects.toThrow(new AppError('Email already exists', 409));
    });

    it('should allow updating to same email', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.update).mockResolvedValueOnce(mockCustomer);

      await service.updateCustomer(mockCustomer.customerId, {
        email: mockCustomer.email,
      });

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should validate updated first name', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);

      await expect(
        service.updateCustomer(mockCustomer.customerId, { firstName: 'A' })
      ).rejects.toThrow(
        new AppError('First name must be at least 2 characters long', 400)
      );
    });

    it('should validate updated phone number', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);

      await expect(
        service.updateCustomer(mockCustomer.customerId, { phoneNumber: '123' })
      ).rejects.toThrow(
        new AppError('Phone number must contain at least 10 digits', 400)
      );
    });

    it('should throw error if update fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.update).mockResolvedValueOnce(null);

      await expect(
        service.updateCustomer(mockCustomer.customerId, mockUpdateCustomerDTO)
      ).rejects.toThrow(new AppError('Failed to update customer', 500));
    });

    it('should validate UUID format', async () => {
      await expect(
        service.updateCustomer('invalid-uuid', mockUpdateCustomerDTO)
      ).rejects.toThrow(new AppError('Invalid customer ID format', 400));
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer successfully', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.delete).mockResolvedValueOnce(true);

      await service.deleteCustomer(mockCustomer.customerId);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockCustomer.customerId);
    });

    it('should throw error when customer not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      await expect(service.deleteCustomer('non-existent-id')).rejects.toThrow(
        new AppError('Customer not found', 404)
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if delete fails', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockCustomer);
      vi.mocked(mockRepository.delete).mockResolvedValueOnce(false);

      await expect(service.deleteCustomer(mockCustomer.customerId)).rejects.toThrow(
        new AppError('Failed to delete customer', 500)
      );
    });

    it('should validate UUID format', async () => {
      await expect(service.deleteCustomer('invalid-uuid')).rejects.toThrow(
        new AppError('Invalid customer ID format', 400)
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });
});