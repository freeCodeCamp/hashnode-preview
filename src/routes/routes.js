import express from 'express';
import { fetchContent } from '../fetch-content.js';
import { logger } from '../config/loggerConfig.js';

const router = express.Router();

router.get("/", async (req, res) => {
  const { slugId } = req.query;
  if (slugId) {
    return res.redirect(`/${slugId}`);
  }
  res.render('home.njk');
});

router.get('/:idOrSlug', async (req, res) => {
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

    if (!post.publishedAt)
      post.publishedAt = new Date(post.updatedAt).toLocaleDateString();

    res.render('post.njk', { post });
  } catch (error) {
    logger.error(
      `Error retrieving content for id / slug ${idOrSlug}: ${error.message}`
    );
    res.status(500).render('error.njk', { error: 'Internal Server Error' });
  }
});

export default router;
