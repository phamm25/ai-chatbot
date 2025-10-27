const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const Upload = require('../models/upload.model');
const ApiError = require('../utils/ApiError');

const uploadsDir = path.resolve(__dirname, '../../uploads');

const ensureDirectory = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const persistFile = async (fileBuffer, fileName, folder) => {
  const targetDir = path.join(uploadsDir, folder);
  await ensureDirectory(targetDir);
  const filePath = path.join(targetDir, fileName);
  await fs.writeFile(filePath, fileBuffer);
  return filePath;
};

const createUpload = async ({ type, originalName, mimeType, buffer, size, metadata }) => {
  if (!buffer) {
    throw new ApiError(400, 'File buffer is required');
  }
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const storageFolder = type === 'image' ? 'images' : 'csv';
  const extension = path.extname(originalName || '');
  const storedFileName = `${checksum}${extension}`;
  const storagePath = await persistFile(buffer, storedFileName, storageFolder);

  const upload = await Upload.create({
    type,
    originalName,
    mimeType,
    size,
    storagePath,
    checksum,
    metadata,
    publicUrl: `/static/${storageFolder}/${storedFileName}`,
  });

  return upload.toJSON();
};

module.exports = {
  createUpload,
};
