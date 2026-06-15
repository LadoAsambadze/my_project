import { REFRESH, type AuthPayload } from './operations';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../auth/token-store';

const ENDPOINT =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

// Tells the backend to return the refresh token in the response body instead
// of setting an httpOnly cookie (see backend AuthResolver.isNativeClient).
const NATIVE_HEADERS = { 'x-client-platform': 'native' } as const;

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'GraphQLRequestError';
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

async function rawRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  useAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...NATIVE_HEADERS,
  };
  const token = useAuth ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    const err = json.errors[0];
    throw new GraphQLRequestError(err.message, err.extensions?.code);
  }
  if (!json.data) {
    throw new GraphQLRequestError('Empty GraphQL response');
  }
  return json.data;
}

// De-duplicate concurrent refreshes: many failing requests share one refresh.
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return null;
        const data = await rawRequest<{ refreshToken: AuthPayload }>(
          REFRESH,
          { token: refreshToken },
          false,
        );
        await setTokens(
          data.refreshToken.accessToken,
          data.refreshToken.refreshToken,
        );
        return data.refreshToken.accessToken;
      } catch {
        await setTokens(null, null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Run a GraphQL operation. If it fails with an auth error and `auth` is on,
 * transparently refresh the access token once and retry.
 */
export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: { auth?: boolean } = {},
): Promise<T> {
  const auth = options.auth ?? true;
  try {
    return await rawRequest<T>(query, variables, auth);
  } catch (error) {
    if (
      auth &&
      error instanceof GraphQLRequestError &&
      error.code === 'UNAUTHENTICATED'
    ) {
      const newToken = await tryRefresh();
      if (newToken) return rawRequest<T>(query, variables, true);
    }
    throw error;
  }
}
