import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../../domain/entities/Customer';

export const mockCustomer: Customer = {
  customerId: '123e4567-e89b-12d3-a456-426614174000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0101',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'USA',
  dateCreated: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockCustomer2: Customer = {
  customerId: '223e4567-e89b-12d3-a456-426614174001',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phoneNumber: '+1-555-0102',
  address: '456 Oak Ave',
  city: 'Los Angeles',
  state: 'CA',
  country: 'USA',
  dateCreated: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockCreateCustomerDTO: CreateCustomerDTO = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '+1-555-0101',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'USA',
};

export const mockUpdateCustomerDTO: UpdateCustomerDTO = {
  firstName: 'Jane',
  city: 'San Francisco',
};