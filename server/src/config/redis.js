const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let redisClient;

const initRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 3,
    reconnectOnError: () => true,
  });

  redisClient.on('connect', () => logger.info('Connected to Redis'));
  redisClient.on('error', (error) => logger.error(`Redis error: ${error.message}`));

  return redisClient;
};

module.exports = { initRedis };
