# Auth overview

How authentication works in the Event backend. Auth lives in
[`src/auth`](../../src/auth) and is built on NestJS + Passport + GraphQL.

## The moving parts

| Piece | File | Role |
|---|---|---|
| Resolver | [`auth.resolver.ts`](../../src/auth/auth.resolver.ts) | GraphQL entry points: `register`, `login`, `refreshToken`, `logout`, `me`. Also sets/clears the refresh cookie. |
| Service | [`auth.service.ts`](../../src/auth/auth.service.ts) | All the logic: hashing, user lookup, token issuing/rotation, OAuth resolution. |
| Register input | [`dto/register.input.ts`](../../src/auth/dto/register.input.ts) | Validates the signup payload (email, password, firstName, lastName, birthDate). |
| Login input | [`dto/login.input.ts`](../../src/auth/dto/login.input.ts) | Validates the login payload. |
| Cookie helpers | [`auth.cookie.ts`](../../src/auth/auth.cookie.ts) | Reads/sets/clears the httpOnly `refresh_token` cookie. |
| OAuth strategies | [`strategies/`](../../src/auth/strategies) | Google & Facebook login; normalize a provider profile into `OAuthProfile`. |
| Guard | [`guards/gql-auth.guard.ts`](../../src/auth/guards) | Protects resolvers that require a logged-in user (e.g. `me`, `updateProfile`). |
| Mail | [`mail.service.ts`](../../src/mail/mail.service.ts) | Sends signup verification codes via Resend (logs to console in dev). |

## Two kinds of token

| | Access token | Refresh token |
|---|---|---|
| **Lifetime** | Short (`JWT_ACCESS_EXPIRES_IN`) | Long (`JWT_REFRESH_EXPIRES_IN`) |
| **Sent to client as** | GraphQL response field (`accessToken`) | httpOnly cookie `refresh_token`, scoped to `/graphql` |
| **Stored in DB?** | No | Yes — **only the bcrypt hash** (`RefreshToken.tokenHash`) |
| **Used for** | `Authorization: Bearer` on each request | Getting a fresh access token when it expires |

Why split them: the access token is small and disposable, so leaking one is
low-impact. The refresh token is powerful, so it's kept out of JavaScript's
reach (httpOnly cookie) and never stored in raw form — a DB leak can't be
replayed because we only keep its hash.

## Refresh token rotation

Every refresh **rotates**: the used token is revoked (`revokedAt` set) and a
brand-new pair is issued. If a refresh token that was already used/revoked is
presented again, it's rejected — and if a token doesn't match its stored hash,
that row is revoked as a compromise signal. See `refresh()` in
[`auth.service.ts`](../../src/auth/auth.service.ts).

## Flows documented here

- [Signup](./signup.md) — email/password registration; creates an **unverified**
  account and emails a code (and how OAuth signup differs).
- [Email verification](./verify-email.md) — confirming the code, which is what
  finally issues a session. Login is blocked until verified.
- [Social login (OAuth)](./oauth.md) — Google/Facebook setup: getting the
  provider credentials and where they go in `.env`.

Other sign-in paths (code-only, see `auth.service.ts`):
- **Passwordless login** — `requestLoginCode` emails a one-time code,
  `loginWithCode` confirms it and signs in (also marks the email verified).
- **Password reset** — `requestPasswordReset` + `resetPassword`; revokes all
  existing sessions on success.

<!-- Future: refresh.md -->
