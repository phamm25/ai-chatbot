const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const ApiError = require('../utils/ApiError');

const createConversation = async ({ title, model }) => {
  const conversation = await Conversation.create({ title, model });
  return conversation.toJSON();
};

const listConversations = async () => {
  const conversations = await Conversation.find().sort({ updatedAt: -1 }).lean();
  return conversations.map((item) => ({
    id: item._id,
    title: item.title,
    model: item.model,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

const getConversationById = async (id) => {
  const conversation = await Conversation.findById(id).lean();
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  return {
    id: conversation._id,
    title: conversation.title,
    model: conversation.model,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

const getConversationWithMessages = async (id) => {
  const conversation = await getConversationById(id);
  const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 }).lean();
  return {
    ...conversation,
    messages: messages.map((message) => ({
      id: message._id,
      conversation: message.conversation,
      role: message.role,
      content: message.content,
      type: message.type,
      metadata: message.metadata,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    })),
  };
};

module.exports = {
  createConversation,
  listConversations,
  getConversationWithMessages,
  getConversationById,
};
