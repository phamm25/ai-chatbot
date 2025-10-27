import clsx from 'clsx';
import { ChatMessage } from '../types/chat';
import { formatTimestamp } from '../utils/format';
import { AttachmentPreview } from './AttachmentPreview';
import styles from './MessageBubble.module.css';

interface Props {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: Props) => {
  const isUser = message.role === 'user';
  return (
    <div className={clsx(styles.wrapper, isUser ? styles.user : styles.assistant)}>
      <div className={styles.meta}>
        <span>{isUser ? 'You' : 'Copilot'}</span>
        <time>{formatTimestamp(message.createdAt)}</time>
      </div>
      <div className={styles.content}>
        <p>{message.content}</p>
        {message.attachments?.map((attachment) => (
          <AttachmentPreview key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </div>
  );
};
