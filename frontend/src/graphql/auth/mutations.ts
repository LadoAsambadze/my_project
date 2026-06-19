import { gql } from '@apollo/client/core'
import { USER_FIELDS } from './queries'

export const REGISTER_MUTATION = gql`
  ${USER_FIELDS}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  ${USER_FIELDS}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

// The Event backend's refreshToken returns the full AuthPayload (a new access
// token plus the user), not a bare token string.
export const REFRESH_TOKEN_MUTATION = gql`
  ${USER_FIELDS}
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`
