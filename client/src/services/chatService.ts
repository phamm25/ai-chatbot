import { apiClient } from './apiClient';
import { ChatMessage, DatasetSummary, SessionResponse } from '../types/chat';

interface SendMessagePayload {
  content: string;
  datasetIds?: string[];
  imageIds?: string[];
  model?: string;
}

interface UploadResult {
  id: string;
  name: string;
  url: string;
}

export const createSession = async (model?: string): Promise<SessionResponse> => {
  const { data } = await apiClient.post('/sessions', { model });
  return data.data;
};

export const fetchSession = async (sessionId: string): Promise<SessionResponse> => {
  const { data } = await apiClient.get(`/sessions/${sessionId}`);
  return data.data;
};

export const sendMessage = async (sessionId: string, payload: SendMessagePayload) => {
  const { data } = await apiClient.post(`/sessions/${sessionId}/messages`, payload);
  return data.data as { userMessage: ChatMessage; assistantMessage: ChatMessage };
};

export const uploadImage = async (sessionId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);

  const { data } = await apiClient.post('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data as UploadResult;
};

export const uploadCsvFile = async (sessionId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);
  const { data } = await apiClient.post('/uploads/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data as DatasetSummary;
};

export const uploadCsvFromUrl = async (sessionId: string, url: string) => {
  const { data } = await apiClient.post('/uploads/csv-url', { sessionId, url });
  return data.data as DatasetSummary;
};
