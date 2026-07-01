'use client'

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { Observable } from 'rxjs'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { HttpLink } from '@apollo/client/link/http'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from '@/lib/auth/token'
import type { AuthResponse } from '@/graphql/types'
import { REFRESH_TOKEN_MUTATION } from '@/graphql/auth/mutations'

const API_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql'

// ─── Auth Link ──────────────────────────────────────────────────────────────
// Attaches the in-memory access token to every request header.
const authLink = new SetContextLink((prevContext) => {
  const token = getAccessToken()
  const existingHeaders =
    (prevContext['headers'] as Record<string, string> | undefined) ?? {}

  return {
    headers: {
      ...existingHeaders,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

// Operations that must never trigger a token refresh. RefreshToken is the
// critical one: refreshing in response to its own 401 recurses forever (this
// caused the unbounded request loop on the sign-in/sign-up pages, where no
// valid refresh cookie exists). The public auth mutations legitimately return
// 401 and have no session to refresh either.
const NON_REFRESHABLE_OPERATIONS = new Set([
  'RefreshToken',
  'Login',
  'LoginWithCode',
  'Register',
  'VerifyEmail',
  'Logout',
  'RequestLoginCode',
  'RequestPasswordReset',
  'ResetPassword',
])

// ─── Error Link ───────────────────────────────────────────────────────────────
// Intercepts UNAUTHENTICATED errors, calls refreshToken, retries the operation.
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return
  if (
    operation.operationName &&
    NON_REFRESHABLE_OPERATIONS.has(operation.operationName)
  )
    return

  const isUnauthenticated = error.errors.some(
    (err) =>
      err.extensions?.['code'] === 'UNAUTHENTICATED' ||
      (err.extensions?.['response'] as { statusCode?: number } | undefined)
        ?.statusCode === 401,
  )

  if (!isUnauthenticated) return

  return new Observable<ApolloLink.Result>((observer) => {
    apolloClient
      .mutate<{ refreshToken: AuthResponse }>({
        mutation: REFRESH_TOKEN_MUTATION,
      })
      .then(({ data }) => {
        const newToken = data?.refreshToken.accessToken
        if (!newToken) {
          clearAccessToken()
          observer.error(new Error('Session expired. Please sign in again.'))
          return
        }

        setAccessToken(newToken)

        operation.setContext((ctx: Record<string, unknown>) => ({
          ...ctx,
          headers: {
            ...((ctx['headers'] as Record<string, string>) ?? {}),
            authorization: `Bearer ${newToken}`,
          },
        }))

        forward(operation).subscribe({
          next: (value) => observer.next(value),
          error: (err: unknown) => observer.error(err),
          complete: () => observer.complete(),
        })
      })
      .catch((err: unknown) => {
        clearAccessToken()
        observer.error(err)
      })
  })
})

// ─── HTTP Link ────────────────────────────────────────────────────────────────
const httpLink = new HttpLink({
  uri: API_URL,
  // Always send the httpOnly refresh cookie so refreshToken works.
  credentials: 'include',
})

// ─── Apollo Client ──────────────────────────────────────────────────────────
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    // The FeedItem union needs the concrete types listed so fragment matching
    // works on feedPage results.
    possibleTypes: {
      FeedItem: [
        'Post',
        'Event',
        'Design',
        'CateringOffer',
        'Offering',
        'Work',
        'FloristItem',
        'Request',
      ],
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
