const _ = require('lodash');
const redisClient = require('../../utils/redis');
const Upload = require('../models/upload.model');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');

/**
 * FLOW: Fetch CLS -> Fetch Redis (if not CLS) -> Fetch Database (if not Redis)
 */

// Fetch metadata from CLS (if available)
const getMetadataFromCLS = (itemId) => {
  let metadata = getRestaurantFlagFromSession({ itemId });
  if (!_.isEmpty(metadata)) {
    return metadata;
  }
  return null;
};

// Fetch metadata from Redis (if available)
const getMetadataFromRedis = async (itemId) => {
  if (!redisClient.isRedisConnected()) {
    return null;
  }

  const key = `metadata_${itemId}`;
  const cachedMetadata = await redisClient.getJson(key);

  if (!_.isEmpty(cachedMetadata)) {
    return cachedMetadata;
  }

  return null;
};

// Fetch metadata from the Database (if Redis and CLS are empty)
const getMetadataFromDb = async (model, itemId) => {
  try {
    let metadata;
    if (model === 'upload') {
      metadata = await Upload.findById(itemId);
    } else if (model === 'message') {
      metadata = await Message.findById(itemId);
    } else if (model === 'conversation') {
      metadata = await Conversation.findById(itemId);
    }

    if (!metadata) {
      throw new Error(`${model} not found with ID: ${itemId}`);
    }

    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata for ${model} from DB:`, error);
    return null;
  }
};

const getMetadata = async (model, itemId) => {
  let metadata = getMetadataFromCLS(itemId);
  if (metadata) {
    return metadata;
  }

  metadata = await getMetadataFromRedis(itemId);
  if (metadata) {
    return metadata;
  }

  metadata = await getMetadataFromDb(model, itemId);
  return metadata;
};

const getUploadMetadata = async (uploadId) => {
  return await getMetadata('upload', uploadId);
};

const getMessageMetadata = async (messageId) => {
  return await getMetadata('message', messageId);
};

const getConversationMetadata = async (conversationId) => {
  return await getMetadata('conversation', conversationId);
};

const getUploadMetadataAndProcess = async (uploadId) => {
  const uploadMetadata = await getUploadMetadata(uploadId);
  console.log('Upload metadata:', uploadMetadata);
  return uploadMetadata;
};

const getMessageMetadataAndProcess = async (messageId) => {
  const messageMetadata = await getMessageMetadata(messageId);
  console.log('Message metadata:', messageMetadata);
  return messageMetadata;
};

const getConversationMetadataAndProcess = async (conversationId) => {
  const conversationMetadata = await getConversationMetadata(conversationId);
  console.log('Conversation metadata:', conversationMetadata);
  return conversationMetadata;
};

module.exports = {
  getUploadMetadata,
  getMessageMetadata,
  getConversationMetadata,
  getUploadMetadataAndProcess,
  getMessageMetadataAndProcess,
  getConversationMetadataAndProcess,
};
