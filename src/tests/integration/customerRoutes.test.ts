import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Application } from 'express';
import request from 'supertest';
import { createCustomerRoutes } from '../../presentation/routes/customerRoutes';
import { CustomerController } from '../../presentation/controllers/CustomerController';
import { errorHandler } from '../../presentation/middleware/errorHandler';
import { mockCustomer, mockCreateCustomerDTO } from '../helpers/mockData';

describe('Customer Routes Integration', () => {
  let app: Application;
  let mockController: CustomerController;

  beforeEach(() => {
    mockController = {
      createCustomer: vi.fn(),
      getCustomerById: vi.fn(),
      getAllCustomers: vi.fn(),
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
    } as any;

    app = express();
    app.use(express.json());
    app.use('/api/customers', createCustomerRoutes(mockController));
    app.use(errorHandler);
  });

  describe('POST /api/customers', () => {
    it('should create customer with valid data', async () => {
      vi.mocked(mockController.createCustomer).mockImplementation(
        async (req, res) => {
          res.status(201).json({ status: 'success', data: mockCustomer });
        }
      );

      const response = await request(app)
        .post('/api/customers')
        .send(mockCreateCustomerDTO)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        data: mockCustomer,
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({ firstName: 'John' })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({ ...mockCreateCustomerDTO, email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringContaining('email'),
            message: expect.stringContaining('Invalid email'),
          }),
        ])
      );
    });

    it('should return 400 for name exceeding max length', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({ ...mockCreateCustomerDTO, firstName: 'A'.repeat(51) })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get customer by valid UUID', async () => {
      vi.mocked(mockController.getCustomerById).mockImplementation(
        async (req, res) => {
          res.status(200).json({ status: 'success', data: mockCustomer });
        }
      );

      const response = await request(app)
        .get(`/api/customers/${mockCustomer.customerId}`)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: mockCustomer,
      });
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/customers/invalid-uuid')
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/customers', () => {
    it('should get all customers with default pagination', async () => {
      vi.mocked(mockController.getAllCustomers).mockImplementation(
        async (req, res) => {
          res.status(200).json({
            status: 'success',
            data: [mockCustomer],
            pagination: { limit: 50, offset: 0, count: 1 },
          });
        }
      );

      const response = await request(app).get('/api/customers').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should accept valid limit and offset query params', async () => {
      vi.mocked(mockController.getAllCustomers).mockImplementation(
        async (req, res) => {
          res.status(200).json({
            status: 'success',
            data: [mockCustomer],
            pagination: { limit: 10, offset: 5, count: 1 },
          });
        }
      );

      const response = await request(app)
        .get('/api/customers?limit=10&offset=5')
        .expect(200);

      expect(response.body.pagination).toEqual({ limit: 10, offset: 5, count: 1 });
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/customers?limit=101')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for negative offset', async () => {
      const response = await request(app)
        .get('/api/customers?offset=-1')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer with valid data', async () => {
      const updateData = { firstName: 'Jane' };
      vi.mocked(mockController.updateCustomer).mockImplementation(
        async (req, res) => {
          res.status(200).json({
            status: 'success',
            data: { ...mockCustomer, ...updateData },
          });
        }
      );

      const response = await request(app)
        .put(`/api/customers/${mockCustomer.customerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .put('/api/customers/invalid-uuid')
        .send({ firstName: 'Jane' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should return 400 for empty update body', async () => {
      const response = await request(app)
        .put(`/api/customers/${mockCustomer.customerId}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('At least one field');
    });

    it('should return 400 for invalid email in update', async () => {
      const response = await request(app)
        .put(`/api/customers/${mockCustomer.customerId}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete customer successfully', async () => {
      vi.mocked(mockController.deleteCustomer).mockImplementation(
        async (req, res) => {
          res.status(204).send();
        }
      );

      await request(app)
        .delete(`/api/customers/${mockCustomer.customerId}`)
        .expect(204);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .delete('/api/customers/invalid-uuid')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });
});