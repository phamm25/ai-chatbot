import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';
import clsx from 'clsx';
import {
  uploadCsv,
  uploadImage,
  summarizeCsvUrl,
} from '../api/chat';
import { ComposerMode } from '../hooks/useChatSession';

interface ChatComposerProps {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  onSend: (payload: { content: string; type?: 'text' | 'image' | 'csv'; metadata?: Record<string, any> }) => Promise<void>;
  isSending: boolean;
}

interface UploadState {
  isUploading: boolean;
  error?: string;
}

const composerModes: { key: ComposerMode; label: string; description: string }[] = [
  { key: 'text', label: 'Chat', description: 'Ask general questions' },
  { key: 'image', label: 'Image', description: 'Talk about an image' },
  { key: 'csv-file', label: 'CSV Upload', description: 'Analyze a CSV file' },
  { key: 'csv-url', label: 'CSV URL', description: 'Fetch CSV from a link' },
];

export const ChatComposer = ({ mode, onModeChange, onSend, isSending }: ChatComposerProps) => {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageUpload, setImageUpload] = useState<any>();
  const [csvPreview, setCsvPreview] = useState<any>();
  const [csvUpload, setCsvUpload] = useState<any>();
  const [csvUrl, setCsvUrl] = useState('');
  const [status, setStatus] = useState<UploadState>({ isUploading: false });

  const resetAttachments = () => {
    setImagePreview(undefined);
    setImageUpload(undefined);
    setCsvPreview(undefined);
    setCsvUpload(undefined);
    setCsvUrl('');
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus({ isUploading: true });
    setImagePreview(URL.createObjectURL(file));
    try {
      const upload = await uploadImage(file);
      setImageUpload(upload);
      setStatus({ isUploading: false });
    } catch (error: any) {
      setStatus({ isUploading: false, error: error.message || 'Image upload failed' });
    }
  };

  const handleCsvSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus({ isUploading: true });
    try {
      const result = await uploadCsv(file);
      setCsvUpload(result.upload);
      setCsvPreview(result.summary);
      setStatus({ isUploading: false });
    } catch (error: any) {
      setStatus({ isUploading: false, error: error.message || 'CSV upload failed' });
    }
  };

  const handleCsvUrlFetch = async () => {
    if (!csvUrl) return;
    setStatus({ isUploading: true });
    try {
      const result = await summarizeCsvUrl(csvUrl);
      setCsvPreview(result.summary);
      setStatus({ isUploading: false });
    } catch (error: any) {
      setStatus({ isUploading: false, error: error.message || 'Unable to load CSV' });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setStatus({ isUploading: false, error: 'Please enter a prompt before sending.' });
      return;
    }

    try {
      if (mode === 'image') {
        if (!imageUpload) {
          setStatus({ isUploading: false, error: 'Please upload an image before asking.' });
          return;
        }
        await onSend({
          content: message,
          type: 'image',
          metadata: { uploadId: imageUpload.id },
        });
      } else if (mode === 'csv-file') {
        if (!csvUpload) {
          setStatus({ isUploading: false, error: 'Please upload a CSV file before asking.' });
          return;
        }
        await onSend({
          content: message,
          type: 'csv',
          metadata: { uploadId: csvUpload.id },
        });
      } else if (mode === 'csv-url') {
        if (!csvUrl) {
          setStatus({ isUploading: false, error: 'Provide a CSV URL first.' });
          return;
        }
        await onSend({
          content: message,
          type: 'csv',
          metadata: { url: csvUrl },
        });
      } else {
        await onSend({ content: message, type: 'text' });
      }
      setMessage('');
      resetAttachments();
      setStatus({ isUploading: false });
    } catch (error: any) {
      setStatus({ isUploading: false, error: error.message || 'Failed to send message' });
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/70 md:px-10">
      <div className="flex flex-wrap gap-2 pb-3">
        {composerModes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              resetAttachments();
              onModeChange(item.key);
              setStatus({ isUploading: false });
            }}
            className={clsx(
              'rounded-full border px-4 py-2 text-sm font-medium transition',
              item.key === mode
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'image' && (
          <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <label className="flex cursor-pointer flex-col items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span>Upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelection} />
              <span className="rounded-full bg-indigo-500/10 px-4 py-2 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                Choose file
              </span>
            </label>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="preview"
                width={80}
                height={80}
                className="h-20 w-20 rounded-xl object-cover"
                unoptimized
              />
            )}
          </div>
        )}

        {mode === 'csv-file' && (
          <div className="space-y-3 rounded-2xl border border-dashed border-gray-300 p-4 text-sm dark:border-gray-600">
            <div className="flex items-center justify-between">
              <label className="cursor-pointer font-medium text-gray-600 dark:text-gray-300">
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvSelection} />
                <span className="ml-3 rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                  Choose file
                </span>
              </label>
              {csvUpload && <span className="text-xs text-gray-500">{csvUpload.originalName}</span>}
            </div>
            {csvPreview && (
              <pre className="max-h-56 overflow-y-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">{JSON.stringify(csvPreview, null, 2)}</pre>
            )}
          </div>
        )}

        {mode === 'csv-url' && (
          <div className="space-y-3 rounded-2xl border border-dashed border-gray-300 p-4 text-sm dark:border-gray-600">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="url"
                value={csvUrl}
                onChange={(event) => setCsvUrl(event.target.value)}
                placeholder="https://example.com/data.csv"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={handleCsvUrlFetch}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                disabled={!csvUrl}
              >
                Load preview
              </button>
            </div>
            {csvPreview && (
              <pre className="max-h-56 overflow-y-auto rounded-lg bg-gray-100 p-3 text-xs dark:bg-gray-800">{JSON.stringify(csvPreview, null, 2)}</pre>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask something..."
            rows={3}
            className="w-full rounded-3xl border border-gray-300 bg-white px-5 py-4 text-base shadow focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="absolute bottom-3 right-4 flex gap-2 text-xs text-gray-400">
            {status.isUploading && <span>Uploading…</span>}
            {isSending && <span>Thinking…</span>}
          </div>
        </div>

        {status.error && <p className="text-sm text-rose-500">{status.error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSending || status.isUploading}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
