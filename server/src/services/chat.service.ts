import dayjs from 'dayjs';
import { ApiError } from '../utils/ApiError';
import { sessionService } from './session.service';
import { datasetService } from './dataset.service';
import { imageService, StoredImage } from './image.service';
import { openAiService } from './openai.service';
import { Attachment, ChatMessage } from '../types/chat';
import { generateId } from '../utils/id';

interface UserPromptPayload {
  content: string;
  datasetIds?: string[];
  imageIds?: string[];
  model?: string;
}

class ChatService {
  async sendMessage(sessionId: string, payload: UserPromptPayload) {
    const session = sessionService.getById(sessionId);
    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    const datasetIds = payload.datasetIds ?? [];
    const imageIds = payload.imageIds ?? [];
    const targetModel = payload.model ?? session.model;

    if (payload.model && payload.model !== session.model) {
      sessionService.updateModel(sessionId, payload.model);
    }

    const datasetSummaries = datasetIds
      .map((id) => datasetService.getDataset(id))
      .filter((dataset): dataset is NonNullable<ReturnType<typeof datasetService.getDataset>> => Boolean(dataset));

    const images = imageIds
      .map((id) => imageService.get(id))
      .filter((image): image is StoredImage => Boolean(image));

    if (!payload.content && !images.length) {
      throw new ApiError(400, 'Message content or image is required');
    }

    const attachments: Attachment[] = [
      ...datasetSummaries.map((dataset) => ({
        id: dataset!.id,
        type: 'dataset' as const,
        name: dataset!.name,
        url: '',
        metadata: dataset,
      })),
      ...images.map((image) => ({
        id: image!.id,
        type: 'image' as const,
        name: image!.name,
        url: image!.url,
        metadata: {
          mimeType: image!.mimeType,
          size: image!.size,
        },
      })),
    ];

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: payload.content,
      createdAt: dayjs().toISOString(),
      attachments: attachments.length ? attachments : undefined,
      model: targetModel,
    };

    sessionService.appendMessage(sessionId, userMessage);

    const assistantText = await openAiService.generate({
      model: targetModel,
      history: session.messages,
      prompt: payload.content,
      datasetContexts: datasetSummaries
        .map((dataset) => datasetService.buildDatasetContext(dataset))
        .filter((value): value is string => Boolean(value)),
      images,
    });

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: assistantText,
      createdAt: dayjs().toISOString(),
      attachments: undefined,
      model: targetModel,
    };

    sessionService.appendMessage(sessionId, assistantMessage);

    return {
      userMessage,
      assistantMessage,
    };
  }
}

export const chatService = new ChatService();
