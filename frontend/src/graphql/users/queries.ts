import { gql } from '@apollo/client/core'
import { USER_FIELDS } from '@/graphql/auth/queries'

// The signed-in user's own profile, with follower/following counts.
export const MY_PROFILE_QUERY = gql`
  ${USER_FIELDS}
  query MyProfile {
    me {
      ...UserFields
      followersCount
      followingCount
    }
  }
`

// Another user's public profile by @username, including whether the viewer
// follows them so we can render the Follow/Unfollow button.
export const USER_PROFILE_QUERY = gql`
  ${USER_FIELDS}
  query UserProfile($username: String!) {
    user(username: $username) {
      ...UserFields
      followersCount
      followingCount
      isFollowedByMe
    }
  }
`

// Shared shape for follower/following list rows.
const FOLLOW_USER_FIELDS = gql`
  fragment FollowUserFields on User {
    id
    username
    firstName
    lastName
    avatarUrl
    isFollowedByMe
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
