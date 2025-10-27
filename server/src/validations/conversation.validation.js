const Joi = require('joi');

const createConversation = {
  body: Joi.object({
    title: Joi.string().allow('', null),
    model: Joi.string().default('chatgpt'),
  }),
};

module.exports = {
  createConversation,
};
