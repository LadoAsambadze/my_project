import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware(routing)

// Routes that don't require authentication (bare paths, without the locale prefix).
const publicPatterns = ['/', '/sign-in', '/sign-up']

function isPublicPath(pathname: string): boolean {
  const segments = pathname.split('/')
  // pathname looks like /en/sign-in or /sign-in
  const withoutLocale =
    segments.length >= 2 &&
    routing.locales.includes(segments[1] as (typeof routing.locales)[number])
      ? '/' + segments.slice(2).join('/')
      : pathname

  const normalized = withoutLocale === '' ? '/' : withoutLocale

  return publicPatterns.some(
    (pattern) =>
      normalized === pattern ||
      (pattern !== '/' && normalized.startsWith(pattern + '/')),
  )
}

export default function middleware(request: NextRequest) {
  // The intl middleware handles locale detection/redirect. Since auth uses
  // in-memory tokens (not readable cookies), protection happens client-side
  // in the (protected) layout. Middleware only handles locale routing.
  void isPublicPath(request.nextUrl.pathname)
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except API routes, Next internals, and files.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
