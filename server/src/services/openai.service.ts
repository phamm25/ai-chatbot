import fs from 'fs';
import { openAiClient } from '../config/openai';
import { logger } from '../config/logger';
import { ChatMessage } from '../types/chat';
import { StoredImage } from './image.service';

interface GenerateOptions {
  model: string;
  history: ChatMessage[];
  prompt: string;
  datasetContexts: string[];
  images: StoredImage[];
}

const systemPrompt = `You are a multimodal AI assistant embedded in a restaurant platform. 
You can interpret images and CSV dataset summaries provided in the prompt. 
Always cite when you rely on dataset statistics or image observations.
Explain reasoning clearly and keep answers concise but thorough.`;

const buildImageContent = (image: StoredImage) => {
  const buffer = fs.readFileSync(image.filePath);
  const base64 = buffer.toString('base64');
  return {
    type: 'input_image' as const,
    image_base64: base64,
    media_type: image.mimeType,
  };
};

const buildHistory = (messages: ChatMessage[]) => {
  return messages.slice(-10).map((message) => ({
    role: message.role,
    content: [
      {
        type: 'text' as const,
        text: message.content,
      },
    ],
  }));
};

class OpenAIService {
  async generate({ model, history, prompt, datasetContexts, images }: GenerateOptions) {
    const contextPieces = datasetContexts.length
      ? [`Dataset context:\n${datasetContexts.join('\n\n')}`]
      : [];
    const fullPrompt = [prompt, ...contextPieces].join('\n\n');

    const response = await openAiClient.responses.create({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        },
        ...buildHistory(history),
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: fullPrompt,
            },
            ...images.map((image) => buildImageContent(image)),
          ],
        },
      ],
    });

    const text = response.output?.[0]?.content?.[0]?.text ?? response.output_text;
    logger.debug({ text }, 'OpenAI response received');
    return text ?? 'I could not generate a response at this time.';
  }

}

export const openAiService = new OpenAIService();
