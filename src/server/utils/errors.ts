export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  code = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = 'CONFLICT';
}

export class InternalError extends AppError {
  statusCode = 500;
  code = 'INTERNAL_ERROR';
}
