import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // PostgreSQL errors
  if (err.name === 'QueryFailedError' || (err as any).code) {
    const pgError = err as any;
    
    if (pgError.code === '23505') { // Unique violation
      res.status(409).json({
        status: 'error',
        message: 'Duplicate entry',
      });
      return;
    }

    if (pgError.code === '23503') { // Foreign key violation
      res.status(400).json({
        status: 'error',
        message: 'Referenced record does not exist',
      });
      return;
    }
  }

  // Zod validation errors are handled in validation middleware
  // Log error for debugging
  console.error('Unhandled error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};