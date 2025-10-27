import fs from 'fs';
import path from 'path';

const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const resolveStoragePath = (...segments: string[]): string => {
  return path.join(process.cwd(), 'storage', ...segments);
};

export const ensureStorage = () => {
  ensureDirectory(resolveStoragePath('images'));
  ensureDirectory(resolveStoragePath('csv'));
};
