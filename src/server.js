import express from 'express';
import nunjucks from 'nunjucks';
import winston from 'winston';
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
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

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
app.get('/', async (req, res) => {
  const { slug } = req.query;
  if (!slug) {
    logger.warn('Request without slug attempted.');
    return res
      .status(400)
      .render('error.njk', { error: 'Slug not found in URI' });
  }

  try {
    const post = await fetchContent(process.env.CMS_HOST, slug);
    if (!post) {
      logger.warn(`Post not found for slug: ${slug}`);
      return res
        .status(404)
        .render('error.njk', { error: 'Post not found in CMS' });
    }
    logger.info(`Post retrieved successfully for slug: ${slug}`);
    res.render('index.njk', { post });
  } catch (error) {
    logger.error(`Error retrieving content for slug ${slug}: ${error.message}`);
    res.status(500).render('error.njk', { error: 'Internal Server Error' });
  }
});

// Handle all other routes
app.all('*', (req, res) => {
  logger.warn('Invalid URI request attempted.');
  res.status(404).render('error.njk', { error: 'Invalid URI Requested' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
