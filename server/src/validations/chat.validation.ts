import Joi from 'joi';

export const postMessageSchema = Joi.object({
  content: Joi.string().allow('').default(''),
  datasetIds: Joi.array().items(Joi.string()).default([]),
  imageIds: Joi.array().items(Joi.string()).default([]),
  model: Joi.string().optional(),
});
