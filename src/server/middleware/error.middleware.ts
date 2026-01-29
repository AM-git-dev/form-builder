import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(err.message, {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      data: null,
      error: {
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  res.status(500).json({
    data: null,
    error: {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: config.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue'
        : err.message,
    },
  });
}
