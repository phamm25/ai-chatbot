import { Request, Response } from 'express';
import { respond } from '../utils/responseBuilder';
import { catchAsync } from '../utils/catchAsync';
import { chatService } from '../services/chat.service';

export const postMessage = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { content, datasetIds, imageIds, model } = req.body;
  const result = await chatService.sendMessage(sessionId, {
    content,
    datasetIds,
    imageIds,
    model,
  });
  respond(res, { data: result }, 201);
});
