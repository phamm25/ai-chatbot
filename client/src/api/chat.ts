import { apiClient } from './client';

export interface Conversation {
  id: string;
  title?: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'csv';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ChatResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export const createConversation = async (payload: Partial<Conversation>) => {
  const response = await apiClient.post('/conversations', payload);
  return response.data.data as Conversation;
};

export const getConversation = async (conversationId: string) => {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return response.data.data as Conversation & { messages: Message[] };
};

export const listConversations = async () => {
  const response = await apiClient.get('/conversations');
  return response.data.data as Conversation[];
};

export const sendMessage = async (
  conversationId: string,
  payload: { content: string; type?: 'text' | 'image' | 'csv'; metadata?: Record<string, any> },
) => {
  const response = await apiClient.post(`/conversations/${conversationId}/messages`, payload);
  return response.data.data as ChatResponse;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/uploads/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const summarizeCsvUrl = async (url: string) => {
  const response = await apiClient.post('/data/csv/url', { url });
  return response.data.data;
};
