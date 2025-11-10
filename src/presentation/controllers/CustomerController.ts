import { Request, Response } from "express";
import { CustomerService } from "../../application/services/CustomerService";

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  createCustomer = async (req: Request, res: Response): Promise<void> => {
    const customer = await this.customerService.createCustomer(req.body);

    res.status(201).json({
      status: "success",
      data: customer,
    });
  };

  getCustomerById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        status: "error",
        message: "Customer ID is required",
      });
      return;
    }

    const customer = await this.customerService.getCustomerById(id);

    res.status(200).json({
      status: "success",
      data: customer,
    });
  };

  getAllCustomers = async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 50;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;

    const customers = await this.customerService.getAllCustomers(limit, offset);

    res.status(200).json({
      status: "success",
      data: customers,
      pagination: {
        limit,
        offset,
        count: customers.length,
      },
    });
  };

  updateCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        status: "error",
        message: "Customer ID is required",
      });
      return;
    }
    const customer = await this.customerService.updateCustomer(id, req.body);

    res.status(200).json({
      status: "success",
      data: customer,
    });
  };

  deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        status: "error",
        message: "Customer ID is required",
      });
      return;
    }
    await this.customerService.deleteCustomer(id);

    res.status(200).send();
  };
}
