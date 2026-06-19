import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

export const REFRESH_COOKIE = 'refresh_token';

/**
 * Base attributes shared by setting and clearing the refresh cookie. The two
 * must match (path/sameSite/secure) or the browser won't clear the cookie.
 * Scoped to `/graphql` because that's the only endpoint that reads it.
 */
function baseCookieOptions(config: ConfigService): CookieOptions {
  return {
    httpOnly: true,
    secure: config.get<string>('NODE_ENV') === 'production',
    sameSite: 'lax',
    path: '/graphql',
  };
}

export function setRefreshCookie(
  res: Response,
  config: ConfigService,
  token: string,
  maxAgeMs: number,
): void {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOptions(config),
    maxAge: maxAgeMs,
  });
}

export function clearRefreshCookie(res: Response, config: ConfigService): void {
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions(config));
}
