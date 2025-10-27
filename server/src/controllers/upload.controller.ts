import { Request, Response } from 'express';
import { respond } from '../utils/responseBuilder';
import { catchAsync } from '../utils/catchAsync';
import { imageService } from '../services/image.service';
import { environment } from '../config/environment';
import { datasetService } from '../services/dataset.service';
import { sessionService } from '../services/session.service';
import { ApiError } from '../utils/ApiError';

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const { sessionId } = req.body;
  if (!file) {
    throw new ApiError(400, 'Image file is required');
  }
  if (!sessionId) {
    throw new ApiError(400, 'sessionId is required');
  }
  const session = sessionService.getById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  imageService.validateSize(file.size, environment.maxUploadSizeMb * 1024 * 1024);
  const record = imageService.saveImage(file.originalname, file.buffer, file.mimetype, file.size);
  respond(res, { data: record }, 201);
});

export const uploadCsvFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const { sessionId } = req.body;
  if (!file) {
    throw new ApiError(400, 'CSV file is required');
  }
  if (!sessionId) {
    throw new ApiError(400, 'sessionId is required');
  }
  const session = sessionService.getById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  datasetService.validateFileSize(file.size);
  const parsed = await datasetService.parseCsvFromBuffer(file.originalname, file.buffer);
  sessionService.attachDataset(sessionId, parsed.summary);
  respond(res, { data: parsed.summary }, 201);
});

export const uploadCsvFromUrl = catchAsync(async (req: Request, res: Response) => {
  const { url, sessionId } = req.body;
  if (!url) {
    throw new ApiError(400, 'url is required');
  }
  if (!sessionId) {
    throw new ApiError(400, 'sessionId is required');
  }
  const session = sessionService.getById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  const parsed = await datasetService.parseCsvFromUrl(url);
  sessionService.attachDataset(sessionId, parsed.summary);
  respond(res, { data: parsed.summary }, 201);
});
