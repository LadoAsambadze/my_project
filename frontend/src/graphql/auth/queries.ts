import { gql } from '@apollo/client/core'

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    name
    bio
    avatarUrl
    location
    role
    isVerified
    isActive
    createdAt
  }
`

export const ME_QUERY = gql`
  ${USER_FIELDS}
  query Me {
    me {
      ...UserFields
    }
  }
`
