import * as SecureStore from 'expo-secure-store';

// Both tokens live in the OS keychain/keystore (encrypted at rest). Unlike the
// web app — where the refresh token is an httpOnly cookie the JS never sees —
// a native app has no cookie jar, so we hold the refresh token ourselves and
// send it explicitly to the `refreshToken` mutation.
const ACCESS_TOKEN_KEY = 'event_access_token';
const REFRESH_TOKEN_KEY = 'event_refresh_token';

// In-memory mirror so the hot path (attaching the bearer header to every
// request) stays synchronous and avoids a keychain read each time.
let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;
let hydrated = false;

/** Load both tokens from secure storage into the in-memory cache. */
export async function hydrateTokens(): Promise<void> {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  accessTokenCache = access;
  refreshTokenCache = refresh;
  hydrated = true;
}

export function getAccessToken(): string | null {
  return accessTokenCache;
}

export function getRefreshToken(): string | null {
  return refreshTokenCache;
}

export function isHydrated(): boolean {
  return hydrated;
}

export async function setTokens(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<void> {
  accessTokenCache = accessToken;
  refreshTokenCache = refreshToken;

  await Promise.all([
    accessToken
      ? SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
      : SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    refreshToken
      ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
      : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function clearTokens(): Promise<void> {
  await setTokens(null, null);
}
