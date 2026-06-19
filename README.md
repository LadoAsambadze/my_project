# Event

App for planning events, parties, flowers and invitation letters.

First feature shipped: **authentication** (email/password) with a short-lived
access token + rotating refresh token.

## Stack

| Layer    | Tech                                                         |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui    |
| Backend  | NestJS 11, GraphQL (Apollo, code-first)                      |
| Data     | Prisma 6 ORM, PostgreSQL 16 (Docker)                         |
| Auth     | JWT access token + rotating refresh token (cookie / secure store) |

Package manager: **pnpm**. Two apps live side by side: `backend/` and
`frontend/`. Theming uses Tailwind v4 design tokens (colors + radius) defined
directly in `frontend/src/app/globals.css` (`:root` for light, `.dark` for
dark) — edit there to re-skin.

## Prerequisites

- Node 20+ and pnpm (`npm i -g pnpm`)
- Docker Desktop (for PostgreSQL)

## Running it

### 1. Backend (`backend/`)

```bash
cd backend
cp .env.example .env          # then edit the JWT secrets for anything non-local
docker compose up -d          # PostgreSQL on host port 5433
pnpm install
pnpm prisma migrate dev       # applies migrations + generates the client
pnpm start:dev                # GraphQL at http://localhost:4000/graphql
```

### 2. Frontend (`frontend/`)

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev                      # http://localhost:3001
```

> The frontend is pinned to port **3001** (port 3000 was already taken on the
> dev machine). If you change it, update `CORS_ORIGIN` in `backend/.env` and
> `NEXT_PUBLIC_GRAPHQL_URL` in `frontend/.env.local` to match.

Open http://localhost:3001 → **Get started** to register, then you land on the
protected dashboard.

## How auth works

- **Access token** — short-lived JWT (15 min). Returned in the GraphQL
  response and kept **in memory only** (never in `localStorage`, so XSS can't
  read it), sent as `Authorization: Bearer`. On reload memory is empty, so the
  app silently calls `refreshToken` to get a fresh one.
- **Refresh token** — long-lived (7 days), set as an **httpOnly** cookie scoped
  to `/graphql` so JavaScript can never read it. Only its bcrypt hash is stored
  in the DB.
- When the access token expires, the GraphQL client calls the `refreshToken`
  mutation (cookie sent automatically), which **rotates** the refresh token
  (old one revoked) and returns a new access token. Reusing a rotated token is
  rejected.
- **Social login** — "Continue with Google/Facebook" hit the backend REST routes
  `GET /auth/{google,facebook}` (Passport). On success the backend sets the same
  refresh cookie and redirects to the frontend `/oauth/callback` with the access
  token in the URL fragment. Provider ids are stored on `User.googleId` /
  `User.facebookId`; a social login links to an existing account with the same
  email. Requires the `GOOGLE_*` / `FACEBOOK_*` vars in `backend/.env`.
- **User flags** — `role` (`USER` | `ADMIN`, embedded in the access token; gate
  resolvers with `@Roles(Role.ADMIN)` + `RolesGuard`), `isVerified` (OAuth
  signups start verified), and `isActive` (set `false` to block login/refresh).

### GraphQL API (at `/graphql`)

```graphql
mutation { register(input: { email, password, name }) { accessToken user { id email name } } }
mutation { login(input: { email, password })          { accessToken user { id email } } }
mutation { refreshToken                                { accessToken user { id } } }  # uses cookie
mutation { logout }                                                                    # revokes + clears cookie
query    { me { id email name createdAt } }                                            # requires Bearer token
```
