import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatResponse, Conversation, Message, createConversation, getConversation, sendMessage } from '../api/chat';

export type ComposerMode = 'text' | 'image' | 'csv-file' | 'csv-url';

interface UseChatSessionResult {
  conversation?: Conversation;
  messages: Message[];
  composerMode: ComposerMode;
  setComposerMode: (mode: ComposerMode) => void;
  isLoading: boolean;
  isSending: boolean;
  error?: string;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  submitMessage: (payload: { content: string; type?: 'text' | 'image' | 'csv'; metadata?: Record<string, any> }) => Promise<ChatResponse>;
  appendMessages: (messages: Message[]) => void;
}

export const useChatSession = (): UseChatSessionResult => {
  const [conversation, setConversation] = useState<Conversation>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [composerMode, setComposerMode] = useState<ComposerMode>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>();

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const created = await createConversation({ model: 'chatgpt' });
      setConversation(created);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || 'Unable to start conversation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!conversation?.id) {
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      const detail = await getConversation(conversation.id);
      setConversation(detail);
      setMessages(detail.messages ?? []);
    } catch (err: any) {
      setError(err.message || 'Unable to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [conversation?.id]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const submitMessage = useCallback(
    async (payload: { content: string; type?: 'text' | 'image' | 'csv'; metadata?: Record<string, any> }) => {
      if (!conversation?.id) {
        throw new Error('Conversation is not ready');
      }
      setIsSending(true);
      setError(undefined);
      try {
        const response = await sendMessage(conversation.id, payload);
        setMessages((prev) => [...prev, response.userMessage, response.assistantMessage]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversation?.id],
  );

  const appendMessages = useCallback((newMessages: Message[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  return useMemo(
    () => ({
      conversation,
      messages,
      composerMode,
      setComposerMode,
      isLoading,
      isSending,
      error,
      initialize,
      refresh,
      submitMessage,
      appendMessages,
    }),
    [appendMessages, composerMode, conversation, error, initialize, isLoading, isSending, messages, refresh, submitMessage],
  );
};
