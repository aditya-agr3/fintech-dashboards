import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/index.js';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  public status: number;
  public details?: string;
  
  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * Global error handling middleware
 * 
 * Catches all errors and returns a consistent JSON response.
 * In production, sensitive error details are hidden.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err instanceof AppError) {
    const response: ApiError = {
      status: err.status,
      message: err.message,
      details: isProduction ? undefined : err.details,
    };
    res.status(err.status).json(response);
    return;
  }
  
  // Handle unknown errors
  const response: ApiError = {
    status: 500,
    message: 'Internal server error',
    details: isProduction ? undefined : err.message,
  };
  res.status(500).json(response);
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiError = {
    status: 404,
    message: `Route not found: ${req.method} ${req.path}`,
  };
  res.status(404).json(response);
}
