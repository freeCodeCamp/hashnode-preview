import { request, gql } from 'graphql-request';

const endpoint = 'https://gql.hashnode.com/';

const query = gql`
  query GetDraft($id: ObjectId!) {
    draft(id: $id) {
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
      # tagsV2 {
      #   __typename
      # }
      readTimeInMinutes
      coverImage {
        url
        attribution
      }
      content {
        html
      }
      updatedAt
    }
  }
`;

export async function fetchContent(id) {
  const variables = { id };
  const { draft } = await request(endpoint, query, variables);
  return draft;
}
