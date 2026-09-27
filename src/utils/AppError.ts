export type AppErrorDetails = {
  retryAfter?: number;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly details: AppErrorDetails;

  constructor(statusCode: number, message: string, details: AppErrorDetails = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
  }
}
