import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { validateRequest } from '../middleware/validateRequest';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerSchema,
  getAllCustomersSchema,
  deleteCustomerSchema,
} from '../validators/customerValidators';

export const createCustomerRoutes = (customerController: CustomerController): Router => {
  const router = Router();

  router.post(
    '/',
    validateRequest(createCustomerSchema),
    asyncHandler(customerController.createCustomer)
  );

  router.get(
    '/',
    validateRequest(getAllCustomersSchema),
    asyncHandler(customerController.getAllCustomers)
  );

  router.get(
    '/:id',
    validateRequest(getCustomerSchema),
    asyncHandler(customerController.getCustomerById)
  );

  router.put(
    '/:id',
    validateRequest(updateCustomerSchema),
    asyncHandler(customerController.updateCustomer)
  );

  router.delete(
    '/:id',
    validateRequest(deleteCustomerSchema),
    asyncHandler(customerController.deleteCustomer)
  );

  return router;
};