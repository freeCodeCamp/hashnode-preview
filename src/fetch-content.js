import { request, gql } from 'graphql-request';

const endpoint = 'https://gql.hashnode.com/';

const query = gql`
  query GetDraftFromPublication($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        id
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
        title
        tags {
          id
          name
          slug
        }
        brief
        readTimeInMinutes
        coverImage {
          url
          attribution
        }
        content {
          html
        }
        publishedAt
        updatedAt
      }
    }
  }
`;

export async function fetchContent(host, slug) {
  const variables = { host, slug };
  const { publication } = await request(endpoint, query, variables);
  return publication.post;
}
