const Joi = require('joi');

const summarizeCsvFromUrl = {
  body: Joi.object({
    url: Joi.string().uri().required(),
  }),
};

module.exports = {
  summarizeCsvFromUrl,
};
