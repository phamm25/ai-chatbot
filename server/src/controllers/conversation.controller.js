const catchAsync = require('../utils/catchAsync');
const { formatResponse } = require('../utils/response');
const conversationService = require('../services/conversation.service');

const createConversation = catchAsync(async (req, res) => {
  const conversation = await conversationService.createConversation(req.body);
  res.status(201).json(formatResponse(conversation));
});

const listConversations = catchAsync(async (req, res) => {
  const conversations = await conversationService.listConversations();
  res.json(formatResponse(conversations));
});

const getConversation = catchAsync(async (req, res) => {
  const conversation = await conversationService.getConversationWithMessages(req.params.conversationId);
  res.json(formatResponse(conversation));
});

module.exports = {
  createConversation,
  listConversations,
  getConversation,
};
