const { runWithRequestContext, getRequestContext } = require('../utils/requestContext');

const requestContextMiddleware = (req, res, next) => {
  runWithRequestContext(() => {
    const context = getRequestContext();
    context.ip = req.ip;
    context.path = req.path;
    next();
  }, { requestId: req.headers['x-request-id'] });
};

module.exports = requestContextMiddleware;
