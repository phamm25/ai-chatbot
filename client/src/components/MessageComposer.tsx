import { ChangeEvent, FormEvent, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { sendMessage, uploadImage, uploadCsvFile, uploadCsvFromUrl } from '../services/chatService';
import { DatasetSummary } from '../types/chat';
import styles from './MessageComposer.module.css';

interface ImageAttachment {
  id: string;
  name: string;
  url: string;
}

export const MessageComposer = () => {
  const { sessionId, model, dispatch, datasets } = useChat();
  const [content, setContent] = useState('');
  const [pendingImages, setPendingImages] = useState<ImageAttachment[]>([]);
  const [attachedDatasetIds, setAttachedDatasetIds] = useState<string[]>([]);
  const [csvUrl, setCsvUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId) {
      setError('Session not ready yet.');
      return;
    }
    if (!content && pendingImages.length === 0) {
      return;
    }

    setError(null);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { userMessage, assistantMessage } = await sendMessage(sessionId, {
        content,
        imageIds: pendingImages.map((item) => item.id),
        datasetIds: attachedDatasetIds,
        model,
      });
      dispatch({ type: 'APPEND_MESSAGE', payload: userMessage });
      dispatch({ type: 'APPEND_MESSAGE', payload: assistantMessage });
      setContent('');
      setPendingImages([]);
      setAttachedDatasetIds([]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;
    try {
      const result = await uploadImage(sessionId, file);
      setPendingImages((prev) => [...prev, result]);
    } catch (err) {
      setError('Failed to upload image.');
    }
  };

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;
    try {
      const dataset = await uploadCsvFile(sessionId, file);
      attachDataset(dataset);
    } catch (err) {
      setError('Failed to upload CSV.');
    }
  };

  const handleCsvUrl = async () => {
    if (!csvUrl || !sessionId) return;
    try {
      const dataset = await uploadCsvFromUrl(sessionId, csvUrl);
      attachDataset(dataset);
      setCsvUrl('');
    } catch (err) {
      setError('Unable to fetch dataset from URL.');
    }
  };

  const attachDataset = (dataset: DatasetSummary) => {
    dispatch({ type: 'UPSERT_DATASET', payload: dataset });
    setAttachedDatasetIds((prev) => (prev.includes(dataset.id) ? prev : [...prev, dataset.id]));
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.editor}>
        <textarea
          placeholder="Ask me about your menu, images, or data..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className={styles.toolbar}>
          <label className={styles.uploadButton}>
            📷
            <input type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} hidden />
          </label>
          <label className={styles.uploadButton}>
            📄
            <input type="file" accept=".csv" onChange={handleCsvUpload} hidden />
          </label>
          <div className={styles.csvUrl}>
            <input
              type="url"
              placeholder="Paste CSV URL"
              value={csvUrl}
              onChange={(event) => setCsvUrl(event.target.value)}
            />
            <button type="button" onClick={handleCsvUrl}>
              Import
            </button>
          </div>
          <div className={styles.spacer} />
          <button type="submit" className={styles.sendButton} disabled={!content && pendingImages.length === 0}>
            Send
          </button>
        </div>
      </div>
      {(pendingImages.length > 0 || attachedDatasetIds.length > 0) && (
        <div className={styles.attachments}>
          {pendingImages.map((image) => (
            <span key={image.id} className={styles.attachmentTag}>
              {image.name}
            </span>
          ))}
          {attachedDatasetIds.map((id) => (
            <span key={id} className={styles.attachmentTag}>
              {datasets[id]?.name ?? 'Dataset'}
            </span>
          ))}
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
};
