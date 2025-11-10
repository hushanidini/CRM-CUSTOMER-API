import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../../domain/entities/Customer';
import { AppError } from '../../shared/errors/AppError';

export class CustomerService {
  constructor(private customerRepository: ICustomerRepository) {}

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.customerRepository.findByEmail(data.email);
    if (existingCustomer) {
      throw new AppError('Email already exists', 409);
    }

    // Business logic validations
    this.validateName(data.firstName, 'First name');
    this.validateName(data.lastName, 'Last name');

    if (data.phoneNumber) {
      this.validatePhoneNumber(data.phoneNumber);
    }

    try {
      return await this.customerRepository.create(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<Customer> {
    this.validateUUID(customerId);

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  async getAllCustomers(limit: number = 50, offset: number = 0): Promise<Customer[]> {
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }

    if (offset < 0) {
      throw new AppError('Offset must be non-negative', 400);
    }

    return await this.customerRepository.findAll(limit, offset);
  }

  async updateCustomer(customerId: string, data: UpdateCustomerDTO): Promise<Customer> {
    this.validateUUID(customerId);

    // Check if customer exists
    const existingCustomer = await this.customerRepository.findById(customerId);
    if (!existingCustomer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await this.customerRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('Email already exists', 409);
      }
    }

    // Business logic validations
    if (data.firstName) {
      this.validateName(data.firstName, 'First name');
    }

    if (data.lastName) {
      this.validateName(data.lastName, 'Last name');
    }

    if (data.phoneNumber) {
      this.validatePhoneNumber(data.phoneNumber);
    }

    try {
      const updatedCustomer = await this.customerRepository.update(customerId, data);
      if (!updatedCustomer) {
        throw new AppError('Failed to update customer', 500);
      }
      return updatedCustomer;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new AppError('Email already exists', 409);
      }
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    this.validateUUID(customerId);

    const exists = await this.customerRepository.findById(customerId);
    if (!exists) {
      throw new AppError('Customer not found', 404);
    }

    const deleted = await this.customerRepository.delete(customerId);
    if (!deleted) {
      throw new AppError('Failed to delete customer', 500);
    }
  }

  // Validation helpers
  private validateName(name: string, fieldName: string): void {
    if (name.trim().length < 2) {
      throw new AppError(`${fieldName} must be at least 2 characters long`, 400);
    }

    if (name.trim().length > 50) {
      throw new AppError(`${fieldName} must not exceed 50 characters`, 400);
    }

    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      throw new AppError(`${fieldName} contains invalid characters`, 400);
    }
  }

  private validatePhoneNumber(phoneNumber: string): void {
    // Basic phone number validation (can be enhanced based on requirements)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new AppError('Invalid phone number format', 400);
    }

    if (phoneNumber.replace(/\D/g, '').length < 10) {
      throw new AppError('Phone number must contain at least 10 digits', 400);
    }
  }

  private validateUUID(uuid: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new AppError('Invalid customer ID format', 400);
    }
  }
}