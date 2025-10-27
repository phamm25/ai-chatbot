import fs from 'fs';
import path from 'path';
import { resolveStoragePath } from '../config/storage';
import { generateId } from '../utils/id';
import { ApiError } from '../utils/ApiError';

export interface StoredImage {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  url: string;
  mimeType: string;
  size: number;
}

class ImageService {
  private store = new Map<string, StoredImage>();

  saveImage(originalName: string, buffer: Buffer, mimeType: string, size: number) {
    const extension = path.extname(originalName) || '.png';
    const imageId = generateId();
    const fileName = `${imageId}${extension}`;
    const storagePath = resolveStoragePath('images', fileName);
    fs.writeFileSync(storagePath, buffer);
    const record: StoredImage = {
      id: imageId,
      name: originalName,
      fileName,
      filePath: storagePath,
      url: `/static/images/${fileName}`,
      mimeType,
      size,
    };
    this.store.set(imageId, record);
    return record;
  }

  get(imageId: string) {
    return this.store.get(imageId);
  }

  validateSize(bytes: number, maxBytes: number) {
    if (bytes > maxBytes) {
      throw new ApiError(413, 'Image exceeds maximum allowed size');
    }
  }
}

export const imageService = new ImageService();
