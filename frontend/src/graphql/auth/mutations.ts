import { gql } from '@apollo/client/core'
import { USER_FIELDS } from './queries'

// Register no longer logs the user in — it returns the (unverified) user. The
// session is issued later by verifyEmail.
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      email
      isVerified
    }
  }
`

export const VERIFY_EMAIL_MUTATION = gql`
  ${USER_FIELDS}
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`

export const RESEND_VERIFICATION_CODE_MUTATION = gql`
  mutation ResendVerificationCode($email: String!) {
    resendVerificationCode(email: $email)
  }
`

export const REQUEST_LOGIN_CODE_MUTATION = gql`
  mutation RequestLoginCode($email: String!) {
    requestLoginCode(email: $email)
  }
`

export const LOGIN_WITH_CODE_MUTATION = gql`
  ${USER_FIELDS}
  mutation LoginWithCode($input: LoginWithCodeInput!) {
    loginWithCode(input: $input) {
      accessToken
      user {
        ...UserFields
      }
    }
  }
`

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
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
