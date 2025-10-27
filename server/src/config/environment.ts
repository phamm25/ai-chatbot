import dotenv from 'dotenv';

dotenv.config();

const getNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

export const environment = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: getNumber(process.env.PORT, 3001),
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((item) => item.trim()).filter(Boolean),
  maxUploadSizeMb: getNumber(process.env.MAX_UPLOAD_SIZE_MB, 20),
};

if (!environment.openAiApiKey) {
  // eslint-disable-next-line no-console
  console.warn('OPENAI_API_KEY is not defined. OpenAI features will fail until it is provided.');
}
