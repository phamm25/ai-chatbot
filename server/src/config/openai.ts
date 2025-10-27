import OpenAI from 'openai';
import { environment } from './environment';

export const openAiClient = new OpenAI({
  apiKey: environment.openAiApiKey,
});
