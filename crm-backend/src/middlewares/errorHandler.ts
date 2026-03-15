import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AppError } from '../utils/response';
import logger from '../utils/logger';

// Re-export AppError for convenience
export { AppError } from '../utils/response';

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    ...(error instanceof AppError && {
      code: error.code,
      details: error.details,
    }),
  });

  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: error.details,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const response: ApiResponse = {
      success: false,
      message: 'Database operation failed',
      error: {
        code: 'DATABASE_ERROR',
      },
    };
    res.status(500).json(response);
    return;
  }

  // Handle validation errors
  if (error.name === 'ZodError') {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: JSON.parse(error.message),
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    error: {
      code: 'INTERNAL_ERROR',
    },
  };
  res.status(500).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: {
      code: 'NOT_FOUND',
    },
  };
  res.status(404).json(response);
};