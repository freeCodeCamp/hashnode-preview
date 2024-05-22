import express from 'express';
import nunjucks from 'nunjucks';
import winston from 'winston';
import morgan from 'morgan';
import { fetchContent } from './fetch-content.js';
import 'dotenv/config';

const app = express();

// Configure nunjucks
nunjucks.configure('src/templates', {
  autoescape: true,
  express: app
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [new winston.transports.Console()]
});
const morganStream = {
  write: message => logger.info(message.trim())
};
app.use(morgan('tiny', { stream: morganStream }));

// Cache control middleware
const noCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};
app.use(noCache);

// Main route
app.get(
  '/:id',
  async (req, res, next) => {
    const { id } = req.params;
    const isValidObjectId = id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);

    if (!isValidObjectId) {
      logger.warn(`Invalid ObjectId: ${id}`);
      return res
        .status(400)
        .render('error.njk', { error: 'Invalid ObjectId in URI' });
    }
    next();
  },
  async (req, res) => {
    const { id } = req.params;

    try {
      let post = await fetchContent(id);

      // Set the publishedAt date to the updated date because the published date is not available in the CMS
      post.publishedAt = new Date(post.updatedAt).toLocaleDateString();

      if (!post) {
        logger.warn(`Post not found for id: ${id}`);
        return res
          .status(404)
          .render('error.njk', { error: 'Post not found in CMS' });
      }

      logger.info(`Post retrieved successfully for id: ${id}`);
      res.render('index.njk', { post });
    } catch (error) {
      logger.error(`Error retrieving content for id ${id}: ${error.message}`);
      res.status(500).render('error.njk', { error: 'Internal Server Error' });
    }
  }
);

// Handle all other routes
app.all('*', (req, res) => {
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

  // Forcefully shut down after 10 seconds
  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
