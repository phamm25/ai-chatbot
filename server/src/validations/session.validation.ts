import Joi from 'joi';

export const createSessionSchema = Joi.object({
  model: Joi.string().optional(),
});
