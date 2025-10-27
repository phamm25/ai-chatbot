const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  if (!schema.body) {
    next();
    return;
  }

  const { error, value } = schema.body.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    next(new ApiError(400, 'Validation error', error.details));
    return;
  }

  req.body = value;
  next();
};

module.exports = validate;
