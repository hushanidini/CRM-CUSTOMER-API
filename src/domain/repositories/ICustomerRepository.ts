import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../entities/Customer';

export interface ICustomerRepository {
  create(data: CreateCustomerDTO): Promise<Customer>;
  findById(customerId: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(limit?: number, offset?: number): Promise<Customer[]>;
  update(customerId: string, data: UpdateCustomerDTO): Promise<Customer | null>;
  delete(customerId: string): Promise<boolean>;
}
