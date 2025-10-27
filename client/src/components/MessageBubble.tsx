import Image from 'next/image';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { Message } from '../api/chat';
import { formatTimestamp } from '../utils/datetime';

interface MessageBubbleProps {
  message: Message;
}

const renderDatasetSummary = (metadata?: Record<string, any>) => {
  if (!metadata?.dataset && !metadata?.summary) {
    return null;
  }
  const summary = metadata.summary || metadata.dataset;
  const columns = summary?.columns ?? [];

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
      <div className="mb-3 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Dataset summary</span>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Rows</p>
            <p className="text-gray-600 dark:text-gray-300">{summary?.rowCount}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Columns</p>
            <p className="text-gray-600 dark:text-gray-300">{summary?.columnCount}</p>
          </div>
          {summary?.columnWithMostMissingValues && (
            <div className="col-span-2">
              <p className="font-semibold text-gray-800 dark:text-gray-100">Most missing</p>
              <p className="text-gray-600 dark:text-gray-300">{summary.columnWithMostMissingValues}</p>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-xs text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-100 uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-3 py-2">Column</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Missing</th>
              <th className="px-3 py-2">Unique</th>
              <th className="px-3 py-2">Stats</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column: any) => (
              <tr key={column.name} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{column.name}</td>
                <td className="px-3 py-2 capitalize">{column.type}</td>
                <td className="px-3 py-2">{column.missing}</td>
                <td className="px-3 py-2">{column.uniqueValues}</td>
                <td className="px-3 py-2">
                  {column.stats ? `${column.stats.min} → ${column.stats.max} (avg ${column.stats.mean})` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const bubbleClasses = clsx('max-w-3xl rounded-3xl px-5 py-4 shadow-lg', {
    'ml-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white': isUser,
    'mr-auto bg-white/90 text-gray-900 dark:bg-gray-800/80 dark:text-gray-100': !isUser,
  });

  return (
    <div className="flex w-full flex-col gap-2">
      <div className={bubbleClasses}>
        {message.type === 'image' && message.metadata?.url && (
          <div className="mb-3 overflow-hidden rounded-2xl border border-white/20">
            <Image
              src={message.metadata.url}
              alt={message.metadata.originalName || 'Uploaded image'}
              width={768}
              height={512}
              className="max-h-64 w-full object-cover"
              unoptimized
            />
          </div>
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none dark:prose-invert">
          {message.content}
        </ReactMarkdown>
        {message.type === 'csv' && renderDatasetSummary(message.metadata)}
        {!isUser && message.metadata?.dataset && renderDatasetSummary(message.metadata)}
      </div>
      <span className={clsx('text-xs text-gray-500', { 'text-right': isUser })}>
        {isUser ? 'You' : 'Assistant'} · {formatTimestamp(message.createdAt)}
      </span>
    </div>
  );
};
