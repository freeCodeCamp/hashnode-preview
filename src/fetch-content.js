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

  if (isValidObjectId) {
    const { draft } = await request(endpoint, draftQuery, { id: idOrSlug });

    return draft;
  }

  const HASHNODE_HOST = process.env.HOST || 'handle.hashnode.dev';
  const { publication } = await request(endpoint, postQuery, {
    host: HASHNODE_HOST,
    slug: idOrSlug
  });

  return publication.post;
}
