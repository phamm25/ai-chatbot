import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import styles from './ChatMessageList.module.css';

export const ChatMessageList = () => {
  const { messages, loading } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className={styles.container}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {loading && <div className={styles.typing}>Copilot is thinking…</div>}
      <div ref={endRef} />
    </div>
  );
};
