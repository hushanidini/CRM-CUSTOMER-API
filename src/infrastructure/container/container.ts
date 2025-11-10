import { Pool } from 'pg';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { CustomerService } from '../../application/services/CustomerService';
import { CustomerController } from '../../presentation/controllers/CustomerController';

export class Container {
  private static instance: Container;
  private _dbPool: Pool;
  private _customerRepository: CustomerRepository;
  private _customerService: CustomerService;
  private _customerController: CustomerController;

  private constructor(dbPool: Pool) {
    this._dbPool = dbPool;
    this._customerRepository = new CustomerRepository(this._dbPool);
    this._customerService = new CustomerService(this._customerRepository);
    this._customerController = new CustomerController(this._customerService);
  }

  static initialize(dbPool: Pool): void {
    if (!Container.instance) {
      Container.instance = new Container(dbPool);
    }
  }

  static getInstance(): Container {
    if (!Container.instance) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return Container.instance;
  }

  get dbPool(): Pool {
    return this._dbPool;
  }

  get customerController(): CustomerController {
    return this._customerController;
  }
}
