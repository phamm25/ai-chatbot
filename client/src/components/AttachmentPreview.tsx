import Image from 'next/image';
import { DatasetSummary, Attachment } from '../types/chat';
import styles from './AttachmentPreview.module.css';

interface Props {
  attachment: Attachment;
}

const renderDataset = (dataset: DatasetSummary) => {
  return (
    <div className={styles.dataset}>
      <div className={styles.datasetHeader}>
        <h4>{dataset.name}</h4>
        <span>
          {dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns
        </span>
      </div>
      <div className={styles.datasetColumns}>
        {dataset.columns.slice(0, 3).map((column) => (
          <div key={column.name} className={styles.datasetColumn}>
            <strong>{column.name}</strong>
            <span>{column.type}</span>
            <span>Missing: {column.missingValues}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AttachmentPreview = ({ attachment }: Props) => {
  if (attachment.type === 'image' && attachment.url) {
    return (
      <figure className={styles.imageWrapper}>
        <div className={styles.imageInner}>
          <Image src={attachment.url} alt={attachment.name} fill sizes="(max-width: 768px) 100vw, 640px" />
        </div>
        <figcaption>{attachment.name}</figcaption>
      </figure>
    );
  }

  if (attachment.type === 'dataset' && attachment.metadata) {
    return renderDataset(attachment.metadata as DatasetSummary);
  }

  return null;
};
