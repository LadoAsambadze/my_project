import { REFRESH, type AuthPayload } from './operations';

const ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';
const ACCESS_TOKEN_KEY = 'event_access_token';

// Access token lives in memory (fast) and is mirrored to localStorage so it
// survives a page reload. The refresh token is an httpOnly cookie we never see.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

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
  };
  const token = useAuth ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    // Always send the httpOnly refresh cookie so refreshToken works.
    credentials: 'include',
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
        const data = await rawRequest<{ refreshToken: AuthPayload }>(
          REFRESH,
          {},
          false,
        );
        setAccessToken(data.refreshToken.accessToken);
        return data.refreshToken.accessToken;
      } catch {
        setAccessToken(null);
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
