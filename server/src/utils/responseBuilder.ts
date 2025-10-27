import { Response } from 'express';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const respond = <T>(res: Response, payload: ApiResponse<T>, status = 200) => {
  res.status(status).json({
    success: true,
    ...payload,
  });
};
