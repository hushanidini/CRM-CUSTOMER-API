import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { CustomerController } from '../../../presentation/controllers/CustomerController';
import { CustomerService } from '../../../application/services/CustomerService';
import { AppError } from '../../../shared/errors/AppError';
import { mockCustomer, mockCustomer2, mockCreateCustomerDTO } from '../../helpers/mockData';

describe('CustomerController', () => {
   let controller: CustomerController;
  let mockService: CustomerService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: any;
  let statusMock: any;

  beforeEach(() => {
    mockService = {
      createCustomer: vi.fn(),
      getCustomerById: vi.fn(),
      getAllCustomers: vi.fn(),
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
    } as any;

    controller = new CustomerController(mockService);

    jsonMock = vi.fn();
    statusMock = vi.fn();

    // Create a mock that returns an object with json method when status is called
    statusMock.mockReturnValue({ json: jsonMock });
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: vi.fn(),
    };

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
  });

  describe('createCustomer', () => {
     it('should create customer and return 201', async () => {
      mockRequest.body = mockCreateCustomerDTO;
      vi.mocked(mockService.createCustomer).mockResolvedValueOnce(mockCustomer);

      await controller.createCustomer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.createCustomer).toHaveBeenCalledWith(mockCreateCustomerDTO);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCustomer,
      });
    });

    it('should handle service errors', async () => {
      mockRequest.body = mockCreateCustomerDTO;
      const error = new AppError('Email already exists', 409);
      vi.mocked(mockService.createCustomer).mockRejectedValueOnce(error);

      await expect(
        controller.createCustomer(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });
  });

  describe('getCustomerById', () => {
    it('should return customer by id with 200', async () => {
      mockRequest.params = { id: mockCustomer.customerId };
      vi.mocked(mockService.getCustomerById).mockResolvedValueOnce(mockCustomer);

      await controller.getCustomerById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getCustomerById).toHaveBeenCalledWith(mockCustomer.customerId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCustomer,
      });
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      const error = new AppError('Customer not found', 404);
      vi.mocked(mockService.getCustomerById).mockRejectedValueOnce(error);

      await expect(
        controller.getCustomerById(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });
  });

  describe('getAllCustomers', () => {
    it('should return all customers with default pagination', async () => {
      const customers = [mockCustomer, mockCustomer2];
      mockRequest.query = {};
      vi.mocked(mockService.getAllCustomers).mockResolvedValueOnce(customers);

      await controller.getAllCustomers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getAllCustomers).toHaveBeenCalledWith(50, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: customers,
        pagination: {
          limit: 50,
          offset: 0,
          count: 2,
        },
      });
    });

    it('should return customers with custom pagination', async () => {
      const customers = [mockCustomer];
      mockRequest.query = { limit: '10', offset: '5' };
      vi.mocked(mockService.getAllCustomers).mockResolvedValueOnce(customers);

      await controller.getAllCustomers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getAllCustomers).toHaveBeenCalledWith(10, 5);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: customers,
        pagination: {
          limit: 10,
          offset: 5,
          count: 1,
        },
      });
    });

    it('should handle invalid query parameters gracefully', async () => {
      mockRequest.query = { limit: 'abc', offset: 'xyz' };
      vi.mocked(mockService.getAllCustomers).mockResolvedValueOnce([]);

      await controller.getAllCustomers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getAllCustomers).toHaveBeenCalledWith(NaN, NaN);
    });

    it('should return empty array when no customers exist', async () => {
      mockRequest.query = {};
      vi.mocked(mockService.getAllCustomers).mockResolvedValueOnce([]);

      await controller.getAllCustomers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: [],
        pagination: {
          limit: 50,
          offset: 0,
          count: 0,
        },
      });
    });
  });

  describe('updateCustomer', () => {
    it('should update customer and return 200', async () => {
      const updateData = { firstName: 'Jane', city: 'San Francisco' };
      const updatedCustomer = { ...mockCustomer, ...updateData };

      mockRequest.params = { id: mockCustomer.customerId };
      mockRequest.body = updateData;
      vi.mocked(mockService.updateCustomer).mockResolvedValueOnce(updatedCustomer);

      await controller.updateCustomer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.updateCustomer).toHaveBeenCalledWith(
        mockCustomer.customerId,
        updateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedCustomer,
      });
    });

    it('should handle partial updates', async () => {
      const updateData = { email: 'newemail@example.com' };
      mockRequest.params = { id: mockCustomer.customerId };
      mockRequest.body = updateData;
      vi.mocked(mockService.updateCustomer).mockResolvedValueOnce({
        ...mockCustomer,
        ...updateData,
      });

      await controller.updateCustomer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.updateCustomer).toHaveBeenCalledWith(
        mockCustomer.customerId,
        updateData
      );
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { firstName: 'Jane' };
      const error = new AppError('Customer not found', 404);
      vi.mocked(mockService.updateCustomer).mockRejectedValueOnce(error);

      await expect(
        controller.updateCustomer(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });

    it('should handle duplicate email error', async () => {
      mockRequest.params = { id: mockCustomer.customerId };
      mockRequest.body = { email: 'existing@example.com' };
      const error = new AppError('Email already exists', 409);
      vi.mocked(mockService.updateCustomer).mockRejectedValueOnce(error);

      await expect(
        controller.updateCustomer(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer and return 204', async () => {
      mockRequest.params = { id: mockCustomer.customerId };
      vi.mocked(mockService.deleteCustomer).mockResolvedValueOnce();

      await controller.deleteCustomer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.deleteCustomer).toHaveBeenCalledWith(mockCustomer.customerId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle not found error', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      const error = new AppError('Customer not found', 404);
      vi.mocked(mockService.deleteCustomer).mockRejectedValueOnce(error);

      await expect(
        controller.deleteCustomer(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });
  });
});