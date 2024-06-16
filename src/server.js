import express from 'express';
import helmet from 'helmet';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import 'dotenv/config';

import { logger, morganStream } from './config/logger.js';
import helmetConfig from './config/helmet.js';
import rateLimitConfig from './config/rate-limit.js';

import cacheControl from './middlewares/cache-control.js';
import frameOptions from './middlewares/frame-options.js';
import jsonLimit from './middlewares/json-limit.js';

import router from './routes/routes.js';

const app = express();

// Set trust proxy
app.set('trust proxy', true);

// Configure nunjucks
nunjucks.configure('src/templates', {
  autoescape: true,
  express: app
});

// Middleware setup
app.use(morgan('tiny', { stream: morganStream }));
app.use(helmet(helmetConfig));
app.use(frameOptions);
app.use(rateLimitConfig);
app.use(jsonLimit);
app.use(cacheControl);

// Route setup
app.use(router);

// Handle all other routes
app.all('*', (_req, res) => {
  logger.warn('Invalid URI request attempted.');
  res.status(404).render('error.njk', { error: 'Invalid URI Requested' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Handle server errors
server.on('error', error => {
  logger.error(`Server error: ${error.message}`);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = signal => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
