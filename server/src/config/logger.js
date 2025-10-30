const { createLogger, format, transports } = require('winston');
const { getRequestContext } = require('../utils/requestContext');

const logger = createLogger({
  level: 'info', // any log at the info level or higher (like warn, error, etc.)
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.printf((info) => {
      const ctx = getRequestContext();
      const requestId = ctx ? ctx.requestId : undefined;
      return `${info.timestamp} [${info.level}]${requestId ? ` [${requestId}]` : ''} ${info.message}`;
    }),
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
