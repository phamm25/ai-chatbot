const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const Upload = require('../models/upload.model');
const ApiError = require('../utils/ApiError');
const { getConversationById } = require('./conversation.service');
const { createCompletion } = require('./openai.service');
const { getSummaryFromUpload, getSummaryFromUrl } = require('./csv.service');

const SYSTEM_PROMPT = `You are an insightful restaurant technology assistant helping users analyze images and CSV datasets.
When the conversation references an image, use the visual context provided to ground your answer.
When CSV summaries are supplied, reason over the statistics and refer to concrete numbers when possible.
Respond with concise, helpful markdown.`;

const buildHistoryForModel = async (conversationId, newMessage) => {
  const history = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 }).lean();
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT, type: 'text' },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
      type: message.type,
      metadata: message.metadata,
    })),
    newMessage,
  ];
  return messages;
};

const resolveUploadMetadata = async ({ type, uploadId }) => {
  if (!uploadId) {
    throw new ApiError(400, 'Image uploadId is required');
  }
  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new ApiError(404, 'Referenced upload not found');
  }
  if (upload.type !== type) {
    throw new ApiError(400, `Upload is not a ${type}`);
  }
  return {
    id: upload.id,
    url: upload.publicUrl,
    originalName: upload.originalName,
  };
};

const attachCsvSummary = async (metadata = {}) => {
  if (metadata.uploadId) {
    const summary = await getSummaryFromUpload(metadata.uploadId);
    return { ...metadata, summary };
  }
  if (metadata.url) {
    const summary = await getSummaryFromUrl(metadata.url);
    return { ...metadata, summary };
  }
  throw new ApiError(400, 'CSV metadata requires uploadId or url');
};

const createMessages = async (conversationId, payload) => {
  const conversation = await getConversationById(conversationId);
  const { content, type = 'text', metadata = {} } = payload;
  if (!content) {
    throw new ApiError(400, 'Message content is required');
  }

  let enrichedMetadata = metadata;

  if (type === 'image') {
    const uploadMetadata = await resolveUploadMetadata({ type: 'image', uploadId: metadata.uploadId });
    enrichedMetadata = { ...metadata, ...uploadMetadata };
  }

  if (type === 'csv') {
    enrichedMetadata = await attachCsvSummary(metadata);
  }

  const userMessage = await Message.create({
    conversation: conversationId,
    role: 'user',
    content,
    type,
    metadata: enrichedMetadata,
  });

  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  const modelHistory = await buildHistoryForModel(conversationId, {
    role: 'user',
    content,
    type,
    metadata: enrichedMetadata,
  });

  const assistantText = await createCompletion(modelHistory, { model: conversation.model });
  let assistantMetadata = {};
  if (type === 'image') {
    assistantMetadata = { referencedUpload: enrichedMetadata };
  } else if (type === 'csv') {
    assistantMetadata = { dataset: enrichedMetadata.summary };
  }

  const assistantMessage = await Message.create({
    conversation: conversationId,
    role: 'assistant',
    content: assistantText,
    type: 'text',
    metadata: assistantMetadata,
  });

  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  return {
    userMessage: userMessage.toJSON(),
    assistantMessage: assistantMessage.toJSON(),
  };
};

const listMessages = async (conversationId) => {
  await getConversationById(conversationId);
  const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 }).lean();
  return messages.map((message) => ({
    id: message._id,
    conversation: message.conversation,
    role: message.role,
    content: message.content,
    type: message.type,
    metadata: message.metadata,
    createdAt: message.createdAt,
  }));
};

module.exports = {
  createMessages,
  listMessages,
};
