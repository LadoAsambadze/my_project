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
