import { Session } from '../types/chat';

class SessionStore {
  private sessions = new Map<string, Session>();

  upsert(session: Session) {
    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, updater: (session: Session) => Session) {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      return undefined;
    }
    const updated = updater(existing);
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

export const sessionStore = new SessionStore();
