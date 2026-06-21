import { gql } from '@apollo/client/core'
import { USER_FIELDS } from '@/graphql/auth/queries'

export const UPDATE_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`

// Both return the affected user with the recomputed count + follow state, so
// Apollo updates the cached User (normalized by id) and the UI reacts.
export const FOLLOW_MUTATION = gql`
  mutation Follow($userId: ID!) {
    follow(userId: $userId) {
      id
      followersCount
      isFollowedByMe
    }
  }
`

export const UNFOLLOW_MUTATION = gql`
  mutation Unfollow($userId: ID!) {
    unfollow(userId: $userId) {
      id
      followersCount
      isFollowedByMe
    }
  }
`
