const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const errorConverter = (err, req, res, next) => {
  if (err instanceof ApiError) {
    next(err);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  next(new ApiError(statusCode, message, err.details || { stack: err.stack }));
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const response = {
    message: err.message,
    details: err.details,
  };

  if (statusCode >= 500) {
    logger.error(`Unhandled error: ${err.stack}`);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
