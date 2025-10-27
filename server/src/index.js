const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { connectMongoose } = require('./config/mongoose');
const { initRedis } = require('./config/redis');

const server = http.createServer(app);

const start = async () => {
  try {
    await connectMongoose();
    initRedis();
    server.listen(env.port, () => {
      logger.info(`Chatbot server listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();
