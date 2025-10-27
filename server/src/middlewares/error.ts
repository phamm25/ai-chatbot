import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response) => {
  const status = err instanceof ApiError ? err.statusCode : 500;
  if (status >= 500) {
    logger.error({ err, url: req.url }, 'Unhandled error');
  } else {
    logger.warn({ err, url: req.url }, 'Handled error');
  }
  res.status(status).json({
    success: false,
    error: err.message,
    details: err instanceof ApiError ? err.details : undefined,
  });
};
