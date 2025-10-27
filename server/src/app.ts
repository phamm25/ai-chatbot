import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { environment } from './config/environment';
import { ensureStorage, resolveStoragePath } from './config/storage';
import routes from './routes';
import { errorHandler } from './middlewares/error';

ensureStorage();

export const createApp = () => {
  const app = express();
  app.use(cors({
    origin: environment.allowedOrigins.length ? environment.allowedOrigins : undefined,
    credentials: true,
  }));
  app.use(express.json({ limit: `${environment.maxUploadSizeMb}mb` }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/static/images', express.static(resolveStoragePath('images')));

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
};
