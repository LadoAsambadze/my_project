// The backend origin, derived from the GraphQL URL so there's a single source
// of truth. Used for the OAuth redirect endpoints (REST, not GraphQL).
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql'

export const API_ORIGIN = new URL(GRAPHQL_URL).origin

export type OAuthProvider = 'google' | 'facebook'

/** Full URL the browser navigates to in order to start a social login. */
export function oauthUrl(provider: OAuthProvider): string {
  return `${API_ORIGIN}/auth/${provider}`
}
