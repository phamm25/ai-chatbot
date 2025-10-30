const { OpenAI } = require('openai');
const logger = require('../config/logger');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

let client;

const getClient = () => {
  if (!env.openAiApiKey) {
    throw new ApiError(500, 'OpenAI API key is not configured');
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openAiApiKey });
  }
  return client;
};

const mapMessagesToInput = (messages) =>
  messages.map((message) => {
    if (message.type === 'image' && message.metadata && message.metadata.url) {
      return {
        role: message.role,
        content: [
          { type: 'input_text', text: message.content },
          { type: 'input_image', image_url: message.metadata.url },
        ],
      };
    }
    if (message.type === 'csv' && message.metadata && message.metadata.summary) {
      const summaryText = `CSV Context:\n${JSON.stringify(message.metadata.summary, null, 2)}\nUser question: ${message.content}`;
      return {
        role: message.role,
        content: [{ type: 'input_text', text: summaryText }],
      };
    }
    return {
      role: message.role,
      content: [{ type: 'input_text', text: message.content }],
    };
  });

const createCompletion = async (messages, { model }) => {
  try {
    const api = getClient();
    const formattedMessages = mapMessagesToInput(messages);
    console.log('\n\n formattedMessages', formattedMessages); // Debugging formatted messages
    for (const item of formattedMessages) {
      console.log('item', item);
    }
    const response = await api.responses.create({
      model: model === 'chatgpt' ? 'gpt-4o-mini' : model,
      input: formattedMessages,
    });

    console.log('OpenAI API response:', response); // Debugging API response

    // The correct location of output_text is at the top-level of the response object
    const textContent = response.output_text;

    if (!textContent) {
      logger.warn('No output_text in the response');
      return "Sorry, I couldn't process that request. Internal Server Error";
    }
    return textContent.trim();
  } catch (error) {
    logger.error(`OpenAI request failed: ${error.message}`);
    throw new ApiError(502, 'Failed to communicate with ChatGPT', { cause: error.message });
  }
};

module.exports = {
  createCompletion,
};
