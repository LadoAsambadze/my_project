import { gql } from '@apollo/client/core'
import { USER_FIELDS } from '@/graphql/auth/queries'

// Compact page shape shown in the "Pages" section of a profile card.
export const PROFILE_PAGE_FIELDS = gql`
  fragment ProfilePageFields on Page {
    id
    name
    type
    photoUrl
    postsCount
  }
`

// The signed-in user's own profile, with follower/following counts and pages.
export const MY_PROFILE_QUERY = gql`
  ${USER_FIELDS}
  ${PROFILE_PAGE_FIELDS}
  query MyProfile {
    me {
      ...UserFields
      followersCount
      followingCount
      pages {
        ...ProfilePageFields
      }
    }
  }
`

// Another user's public profile by @username, including whether the viewer
// follows them (for the Follow button) and the pages they own.
export const USER_PROFILE_QUERY = gql`
  ${USER_FIELDS}
  ${PROFILE_PAGE_FIELDS}
  query UserProfile($username: String!) {
    user(username: $username) {
      ...UserFields
      followersCount
      followingCount
      isFollowedByMe
      pages {
        ...ProfilePageFields
      }
    }
  }
`

// Shared shape for follower/following/search list rows.
export const FOLLOW_USER_FIELDS = gql`
  fragment FollowUserFields on User {
    id
    username
    firstName
    lastName
    avatarUrl
    isFollowedByMe
  }
`

// Live search by @username or name; backend excludes the viewer and returns
// only users with a username, so each result links to /u/[username].
export const SEARCH_USERS_QUERY = gql`
  ${FOLLOW_USER_FIELDS}
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      ...FollowUserFields
    }
  }
`

export const FOLLOWERS_QUERY = gql`
  ${FOLLOW_USER_FIELDS}
  query Followers($username: String!) {
    user(username: $username) {
      id
      username
      followers {
        ...FollowUserFields
      }
    }
  }
`

export const FOLLOWING_QUERY = gql`
  ${FOLLOW_USER_FIELDS}
  query Following($username: String!) {
    user(username: $username) {
      id
      username
      following {
        ...FollowUserFields
      }
    }
  }
`
