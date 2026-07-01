import { gql } from '@apollo/client/core'

// Everything a PostCard needs: text body, author header, the page it was
// published as (if any), and attached media.
export const POST_FIELDS = gql`
  fragment PostFields on Post {
    id
    body
    createdAt
    likesCount
    likedByMe
    commentsCount
    author {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    page {
      id
      name
      types
      photoUrl
    }
    media {
      id
      url
      type
    }
  }
`

// Home feed: a global timeline of everyone's posts (users and pages), newest
// first. (Not personalized to who you follow.)
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

// A single page's posts (drives the page detail feed and its Photos/Videos).
export const PAGE_POSTS_QUERY = gql`
  ${POST_FIELDS}
  query PagePosts($pageId: ID!) {
    pagePosts(pageId: $pageId) {
      ...PostFields
    }
  }
`
