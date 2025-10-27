import { ChatMessage, DatasetSummary, SessionResponse } from '../types/chat';

export interface ChatState {
  sessionId?: string;
  model?: string;
  messages: ChatMessage[];
  datasets: Record<string, DatasetSummary>;
  loading: boolean;
}

export type ChatAction =
  | { type: 'SET_SESSION'; payload: SessionResponse }
  | { type: 'APPEND_MESSAGE'; payload: ChatMessage }
  | { type: 'UPSERT_DATASET'; payload: DatasetSummary }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'RESET' };

export const initialState: ChatState = {
  messages: [],
  datasets: {},
  loading: false,
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        sessionId: action.payload.id,
        model: action.payload.model,
        messages: action.payload.messages,
        datasets: action.payload.datasets ?? {},
        loading: false,
      };
    case 'APPEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'UPSERT_DATASET':
      return {
        ...state,
        datasets: {
          ...state.datasets,
          [action.payload.id]: action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_MODEL':
      return {
        ...state,
        model: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};
