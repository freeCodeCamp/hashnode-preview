import { request, gql, ClientError } from 'graphql-request';
import { logger } from './config/logger.js';

const endpoint =
  process.env.HASHNODE_API_URL || 'https://gql-beta.hashnode.com';

const commonFields = `
  id
  title
  author {
    id
    username
    name
    bio {
      text
    }
    profilePicture
    socialMediaLinks {
      website
      twitter
      facebook
    }
    location
  }
  coverImage {
    url
  }
  content {
    html
  }
  tags {
    id
    name
    slug
  }
  updatedAt
`;

const draftQuery = gql`
  query GetDraft($id: ObjectId!) {
    draft(id: $id) {
      ${commonFields}
    }
  }
`;

const postBySlugQuery = gql`
  query GetPost($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        ${commonFields}
        slug
        readTimeInMinutes
        publishedAt
      }
    }
  }
`;

const postByIdQuery = gql`
  query GetPostById($id: ID!) {
    post(id: $id) {
      ${commonFields}
      slug
      readTimeInMinutes
      publishedAt
    }
  }
`;

// Hashnode signals missing resources with HTTP 200 + `errors[].extensions.code === 'NOT_FOUND'`.
function isNotFoundError(error) {
  if (!(error instanceof ClientError)) return false;
  const errors = error.response?.errors ?? [];
  return (
    errors.length > 0 && errors.every(e => e?.extensions?.code === 'NOT_FOUND')
  );
}

// A missing or expired HASHNODE_TOKEN surfaces as `extensions.code === 'UNAUTHENTICATED'`.
function isAuthError(error) {
  if (!(error instanceof ClientError)) return false;
  const errors = error.response?.errors ?? [];
  return errors.some(e => e?.extensions?.code === 'UNAUTHENTICATED');
}

export async function fetchContent(idOrSlug) {
  const isValidObjectId =
    idOrSlug.length === 24 && /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const HASHNODE_HOST = process.env.HASHNODE_HOST || 'handle.hashnode.dev';

  try {
    if (isValidObjectId) {
      // Drafts are private, so Hashnode requires an authenticated request.
      const draftHeaders = process.env.HASHNODE_TOKEN
        ? { Authorization: process.env.HASHNODE_TOKEN }
        : undefined;

      // Try draft first; published posts share the 24-char hex id shape.
      try {
        const response = await request(
          endpoint,
          draftQuery,
          { id: idOrSlug },
          draftHeaders
        );
        if (response.draft) return response.draft;
      } catch (error) {
        if (isAuthError(error)) {
          logger.error(
            'Hashnode rejected the draft request as unauthenticated. ' +
              'Check that HASHNODE_TOKEN is set and the personal access token is still valid.'
          );
          throw error;
        }
        if (!isNotFoundError(error)) throw error;
      }

      try {
        const response = await request(endpoint, postByIdQuery, {
          id: idOrSlug
        });
        return response.post ?? null;
      } catch (error) {
        if (isNotFoundError(error)) return null;
        throw error;
      }
    }

    try {
      const response = await request(endpoint, postBySlugQuery, {
        host: HASHNODE_HOST,
        slug: idOrSlug
      });
      return response.publication?.post ?? null;
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  } catch (error) {
    logger.error(`fetchContent failed for "${idOrSlug}": ${error.message}`);
    throw error;
  }
}
