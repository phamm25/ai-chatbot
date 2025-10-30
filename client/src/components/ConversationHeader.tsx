import { Conversation } from '../api/chat';
import { formatTimestamp } from '../utils/datetime';

interface ConversationHeaderProps {
  conversation?: Conversation;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const ConversationHeader = ({ conversation, isLoading, onRefresh }: ConversationHeaderProps) => {
  return (
    <header className="flex flex-col gap-3 border-b border-gray-200 bg-white/70 px-6 py-5 backdrop-blur dark:border-gray-700 dark:bg-gray-900/60 md:flex-row md:items-center md:justify-between md:px-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Pam's AI Chatbot</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {conversation ? `Started ${formatTimestamp(conversation.createdAt)}` : 'Initializing conversation…'}
        </p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Model</span>
          <select
            value={conversation?.model ?? 'chatgpt'}
            disabled
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-600 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  );
};
