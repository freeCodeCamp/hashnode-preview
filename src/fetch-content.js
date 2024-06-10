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
    }
  }
`;

const postQuery = gql`
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

export async function fetchContent(idOrSlug) {
  const isValidObjectId =
    idOrSlug.length === 24 && /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const HASHNODE_HOST = process.env.HASHNODE_HOST || 'handle.hashnode.dev';

  try {
    // Fetch if it's a draft from the drafts endpoint
    if (isValidObjectId) {
      const response = await request(endpoint, draftQuery, { id: idOrSlug });
      return response.draft;
      // Fetch if it's a post from the publication endpoint
    } else {
      const response = await request(endpoint, postQuery, {
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
