const catchAsync = require('../utils/catchAsync');
const { formatResponse } = require('../utils/response');
const messageService = require('../services/message.service');

const createMessage = catchAsync(async (req, res) => {
  const { userMessage, assistantMessage } = await messageService.createMessages(
    req.params.conversationId,
    req.body,
  );
  res.status(201).json(formatResponse({ userMessage, assistantMessage }));
});

const listMessages = catchAsync(async (req, res) => {
  const messages = await messageService.listMessages(req.params.conversationId);
  res.json(formatResponse(messages));
});

module.exports = {
  createMessage,
  listMessages,
};
