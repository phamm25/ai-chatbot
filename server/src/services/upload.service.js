const path = require('path');
const crypto = require('crypto');
const Upload = require('../models/upload.model');
const ApiError = require('../utils/ApiError');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createUpload = async ({ type, originalName, mimeType, buffer, size, metadata }) => {
  if (!buffer) {
    throw new ApiError(400, 'File buffer is required');
  }

  // unique hash
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const extension = path.extname(originalName || '');
  const storedFileName = `${checksum}${extension}`;

  const resourceType = type === 'image' ? 'image' : 'raw'; // 'raw' = CSV

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: storedFileName,
            folder: type === 'image' ? 'images' : 'csv',
            resource_type: resourceType,
            use_filename: true,
            unique_filename: false,
          },
          async (error, result) => {
            if (error) {
              return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
            }
            resolve(result);
          },
        )
        .end(buffer);
    });

    // Create database record
    const upload = await Upload.create({
      type,
      originalName,
      mimeType,
      size,
      storagePath: uploadResult.public_id,
      checksum,
      metadata,
      publicUrl: uploadResult.secure_url, // https
    });

    return upload.toJSON();
  } catch (error) {
    throw new ApiError(500, `Upload failed: ${error.message}`);
  }
};

module.exports = {
  createUpload,
};
