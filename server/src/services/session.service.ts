import dayjs from 'dayjs';
import { DEFAULT_MODEL } from '../constants/chat';
import { sessionStore } from '../sessions/sessionStore';
import { generateId } from '../utils/id';
import { Session, ChatMessage, DatasetSummary } from '../types/chat';

class SessionService {
  create(model?: string): Session {
    const now = dayjs().toISOString();
    const session: Session = {
      id: generateId(),
      model: model ?? DEFAULT_MODEL.id,
      createdAt: now,
      updatedAt: now,
      messages: [],
      datasets: {},
    };
    sessionStore.upsert(session);
    return session;
  }

  getById(sessionId: string) {
    return sessionStore.get(sessionId);
  }

  appendMessage(sessionId: string, message: ChatMessage) {
    return sessionStore.update(sessionId, (session) => {
      const messages = [...session.messages, message];
      return {
        ...session,
        updatedAt: message.createdAt,
        messages,
      };
    });
  }

  attachDataset(sessionId: string, dataset: DatasetSummary) {
    return sessionStore.update(sessionId, (session) => {
      return {
        ...session,
        datasets: {
          ...session.datasets,
          [dataset.id]: dataset,
        },
      };
    });
  }

  updateModel(sessionId: string, model: string) {
    return sessionStore.update(sessionId, (session) => ({
      ...session,
      model,
    }));
  }
}

export const sessionService = new SessionService();
