import { useEffect, useState } from 'react';
import Head from 'next/head';
import { AppLayout } from '../layouts/AppLayout';
import { ChatHeader } from '../components/ChatHeader';
import { ChatMessageList } from '../components/ChatMessageList';
import { MessageComposer } from '../components/MessageComposer';
import { useChat } from '../context/ChatContext';
import { createSession } from '../services/chatService';
import { SUPPORTED_MODELS } from '../constants/models';
import styles from '../styles/Home.module.css';

const HomePage = () => {
  const { sessionId, dispatch, model } = useChat();
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (sessionId || initializing) {
        return;
      }
      setInitializing(true);
      setError(null);
      try {
        const session = await createSession(model ?? SUPPORTED_MODELS[0].id);
        dispatch({ type: 'SET_SESSION', payload: session });
      } catch (err) {
        setError('Unable to start a chat session.');
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [sessionId, dispatch, model, initializing]);

  return (
    <>
      <Head>
        <title>Insights Copilot</title>
      </Head>
      <AppLayout
        header={<ChatHeader />}
        footer={<MessageComposer />}
      >
        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          {initializing && <div className={styles.initializing}>Starting your workspace…</div>}
          {!initializing && <ChatMessageList />}
        </div>
      </AppLayout>
    </>
  );
};

export default HomePage;
