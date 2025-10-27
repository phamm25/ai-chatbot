const Joi = require('joi');

const metadataSchema = Joi.object({
  uploadId: Joi.string().hex().length(24),
  url: Joi.string().uri(),
});

const createMessage = {
  body: Joi.object({
    content: Joi.string().required(),
    type: Joi.string().valid('text', 'image', 'csv').default('text'),
    metadata: metadataSchema.default({}),
  }),
};

module.exports = {
  createMessage,
};
