import Joi from 'joi';

export const uploadCsvFromUrlSchema = Joi.object({
  url: Joi.string().uri().required(),
  sessionId: Joi.string().required(),
});
