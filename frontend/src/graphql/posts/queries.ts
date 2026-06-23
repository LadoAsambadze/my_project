import { gql } from '@apollo/client/core'

// Everything a PostCard needs: text body, author header, and attached media.
export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    body
    createdAt
    author {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    media {
      id
      url
      type
    }
  }
`

// Home feed: posts from people you follow, plus your own.
export const FEED_QUERY = gql`
  ${POST_FIELDS}
  query Feed {
    feed {
      ...PostFields
    }
  }
`

// A single user's posts (drives the Posts/Photos/Videos tabs on a profile).
export const USER_POSTS_QUERY = gql`
  ${POST_FIELDS}
  query UserPosts($username: String!) {
    userPosts(username: $username) {
      ...PostFields
    }
  }
`
