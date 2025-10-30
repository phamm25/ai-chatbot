const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

module.exports = {
  port: parseNumber(process.env.PORT, 3000),
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  openAiApiKey: process.env.OPENAI_API_KEY,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  maxUploadSizeMb: parseNumber(process.env.MAX_UPLOAD_SIZE_MB, 10),
};
