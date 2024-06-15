import express from 'express';
import helmet from 'helmet';
import nunjucks from 'nunjucks';
import winston from 'winston';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fetchContent } from './fetch-content.js';
import 'dotenv/config';

const app = express();

// Set trust proxy
app.set('trust proxy', true);

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

// Security headers using Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://webembeds.com',
          'https://cdn.freecodecamp.org'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.freecodecamp.org'
        ],
        imgSrc: ["'self'", 'data:', '*.freecodecamp.org', 'cdn.hashnode.com'],
        connectSrc: [
          "'self'",
          'https://webembeds.com',
          'https://api.spotify.com',
          'https://api.github.com',
          'https://api.twitter.com',
          'https://api.codesandbox.io'
        ],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        frameSrc: [
          "'self'",
          'https://www.youtube.com',
          'https://webembeds.com',
          'https://vimeo.com',
          'https://codepen.io',
          'https://codesandbox.io',
          'https://twitter.com',
          'https://x.com',
          'https://gist.github.com',
          'https://glitch.com',
          'https://soundcloud.com',
          'https://anchor.fm',
          'https://open.spotify.com',
          'https://giphy.com',
          'https://runkit.com'
        ],
        frameAncestors: ["'self'", 'https://hashnode.com']
      }
    },
    referrerPolicy: { policy: 'no-referrer' },
    featurePolicy: {
      features: {
        fullscreen: ["'self'"],
        vibrate: ["'none'"],
        payment: ["'none'"]
      }
    }
  })
);

// Middleware to set X-Frame-Options header
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body size limit
app.use(express.json({ limit: '10kb' }));

// Cache control middleware
const noCache = (_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};
app.use(noCache);

app.get('/x-forwarded-for', (request, response) => {
  if (request.headers['x-forwarded-for']) {
    response.send(
      `X-Forwarded-For header value: ${request.headers['x-forwarded-for']}`
    );
  } else {
    response.send('X-Forwarded-For header is not set');
  }
});

// Main route
app.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    let post = await fetchContent(idOrSlug);

    if (!post) {
      logger.warn(`Post not found for id / slug: ${idOrSlug}`);
      return res
        .status(404)
        .render('error.njk', { error: 'Post not found in CMS' });
    }

    logger.info(`Post retrieved successfully for id / slug: ${idOrSlug}`);

    // Since drafts have no published date, set the publishedAt date to the updatedAt date
    if (!post.publishedAt)
      post.publishedAt = new Date(post.updatedAt).toLocaleDateString();

    res.render('index.njk', { post });
  } catch (error) {
    logger.error(
      `Error retrieving content for id / slug ${idOrSlug}: ${error.message}`
    );
    res.status(500).render('error.njk', { error: 'Internal Server Error' });
  }
});

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
