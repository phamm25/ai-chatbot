import { createServer } from 'http';
import { createApp } from './app';
import { environment } from './config/environment';
import { logger } from './config/logger';

const app = createApp();
const server = createServer(app);

server.listen(environment.port, () => {
  logger.info(`Chatbot server listening on port ${environment.port}`);
});
