'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { ME_QUERY } from '@/graphql/auth/queries'
import {
  REFRESH_TOKEN_MUTATION,
  LOGOUT_MUTATION,
} from '@/graphql/auth/mutations'
import { setAccessToken, clearAccessToken } from '@/lib/auth/token'
import type { AuthUser, AuthResponse } from '@/graphql/types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (response: AuthResponse) => void
  loginWithToken: (accessToken: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const gqlErr = err as {
    graphQLErrors?: Array<{
      extensions?: { code?: string; response?: { statusCode?: number } }
    }>
  }
  if (gqlErr.graphQLErrors?.length) {
    return gqlErr.graphQLErrors.some(
      (e) =>
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.extensions?.response?.statusCode === 401,
    )
  }
  // Network errors (no connection) should trigger a refresh attempt.
  const netErr = err as { networkError?: unknown }
  return !!netErr.networkError
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const result = await apolloClient.query<{ me: AuthUser }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    })
    setUser(result.data?.me ?? null)
  }, [])

  const initialize = useCallback(async () => {
    setLoading(true)
    try {
      await fetchMe()
    } catch (err) {
      if (isAuthError(err)) {
        // Token missing or expired — try refresh via the httpOnly cookie.
        try {
          const { data } = await apolloClient.mutate<{
            refreshToken: AuthResponse
          }>({ mutation: REFRESH_TOKEN_MUTATION })
          const payload = data?.refreshToken
          if (payload?.accessToken) {
            setAccessToken(payload.accessToken)
            await fetchMe()
          } else {
            setUser(null)
          }
        } catch {
          setUser(null)
        }
      } else {
        // Not an auth problem (e.g. schema error) — don't loop.
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchMe])

  useEffect(() => {
    void initialize()
  }, [initialize])

  const login = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken)
    setUser(response.user)
  }, [])

  // Used by the OAuth callback: we only receive an access token (the refresh
  // token is set as an httpOnly cookie by the backend), so fetch the user.
  const loginWithToken = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken)
      await fetchMe()
    },
    [fetchMe],
  )

  const logout = useCallback(async () => {
    try {
      await apolloClient.mutate({ mutation: LOGOUT_MUTATION })
    } catch {
      // Ignore — we clear local state regardless.
    }
    clearAccessToken()
    setUser(null)
    apolloClient.clearStore().catch(() => undefined)
  }, [])

  const refetch = useCallback(async () => {
    await fetchMe()
  }, [fetchMe])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithToken, logout, refetch }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
