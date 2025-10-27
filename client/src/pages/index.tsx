import Head from 'next/head';
import { useCallback } from 'react';
import { ChatComposer } from '../components/ChatComposer';
import { ConversationHeader } from '../components/ConversationHeader';
import { MessageList } from '../components/MessageList';
import { useChatSession } from '../hooks/useChatSession';

export default function Home() {
  const { conversation, messages, composerMode, setComposerMode, isLoading, isSending, error, refresh, submitMessage } =
    useChatSession();

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return (
    <>
      <Head>
        <title>Chatbot | Vision & Data Intelligence</title>
      </Head>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-3xl border border-gray-200/70 bg-white/60 shadow-2xl backdrop-blur dark:border-gray-700/60 dark:bg-gray-900/60">
          <ConversationHeader conversation={conversation} isLoading={isLoading} onRefresh={handleRefresh} />
          {error && <p className="px-6 pt-4 text-sm text-rose-500 md:px-10">{error}</p>}
          <MessageList messages={messages} />
          <ChatComposer mode={composerMode} onModeChange={setComposerMode} onSend={submitMessage} isSending={isSending} />
        </div>
        <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-center text-xs text-gray-500 md:px-0">
          Crafted for multimodal conversations · {new Date().getFullYear()}
        </footer>
      </main>
    </>
  );
}
