import { Request, Response } from 'express';
import { respond } from '../utils/responseBuilder';
import { catchAsync } from '../utils/catchAsync';
import { sessionService } from '../services/session.service';
import { ApiError } from '../utils/ApiError';

export const createSession = catchAsync(async (req: Request, res: Response) => {
  const { model } = req.body ?? {};
  const session = sessionService.create(model);
  respond(res, { data: session }, 201);
});

export const getSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = sessionService.getById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  respond(res, { data: session });
});
