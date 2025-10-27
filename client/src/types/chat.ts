export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  type: 'image' | 'dataset';
  name: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
  model?: string;
}

export interface DatasetColumn {
  name: string;
  type: string;
  uniqueValues: number;
  missingValues: number;
  sampleValues: string[];
  stats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    standardDeviation: number;
  };
}

export interface DatasetSummary {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  columns: DatasetColumn[];
  sampleRows: Record<string, string>[];
}

export interface SessionResponse {
  id: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  datasets: Record<string, DatasetSummary>;
}
