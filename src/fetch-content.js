import { request, gql } from 'graphql-request';

const endpoint = 'https://gql.hashnode.com/';

const commonFields = `
  id
  title
  slug
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
  readTimeInMinutes
  updatedAt
`;

const draftQuery = gql`
  query GetDraft($id: ObjectId!) {
    draft(id: $id) {
      ${commonFields}
      tags: tagsV2 {
        __typename
          ... on Tag {
          id
          name
          slug
        }
        ... on DraftBaseTag {
          name
          slug
        }
      }
    }
  }
`;

const postBySlugQuery = gql`
  query GetPost($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        ${commonFields}
        tags {
          id
          name
          slug
        }
        publishedAt
      }
    }
  }
`;

const postByIdQuery = gql`
  query GetPostById($id: ID!) {
    post(id: $id) {
      ${commonFields}
      tags {
        id
        name
        slug
      }
      publishedAt
    }
  }
`;

export async function fetchContent(idOrSlug) {
  const isValidObjectId =
    idOrSlug.length === 24 && /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const HASHNODE_HOST = process.env.HASHNODE_HOST || 'handle.hashnode.dev';

  try {
    if (isValidObjectId) {
      // Try draft first, then fall back to post-by-id (published posts also
      // have 24-char hex cuid values)
      try {
        const response = await request(endpoint, draftQuery, {
          id: idOrSlug
        });
        if (response.draft) return response.draft;
      } catch {
        // Draft not found — try as a published post id
      }

      const response = await request(endpoint, postByIdQuery, {
        id: idOrSlug
      });
      return response.post;
    } else {
      const response = await request(endpoint, postBySlugQuery, {
        host: HASHNODE_HOST,
        slug: idOrSlug
      });
      return response.publication.post;
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
}
