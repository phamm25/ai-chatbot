require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const logger = require('./config/logger');
const requestContext = require('./middlewares/requestContext');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || !env.allowedOrigins.length || env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: `${env.maxUploadSizeMb}mb` }));
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use('/static', express.static(path.resolve(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
