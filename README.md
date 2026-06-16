# Event

App for planning events, parties, flowers and invitation letters.

First feature shipped: **authentication** (email/password) with a short-lived
access token + rotating refresh token.

## Stack

| Layer    | Tech                                                         |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4, shadcn/ui    |
| Mobile   | Expo SDK 52 (React Native), expo-router, TypeScript          |
| Backend  | NestJS 11, GraphQL (Apollo, code-first)                      |
| Data     | Prisma 6 ORM, PostgreSQL 16 (Docker)                         |
| Auth     | JWT access token + rotating refresh token (cookie / secure store) |

Package manager: **pnpm**. Three apps live side by side: `backend/`,
`frontend/`, and `mobile/`. A shared **design system** lives in `design/`:
tokens defined once in `design/tokens.json` and generated into web CSS variables
and a mobile TS theme (`node design/generate.mjs`). See `design/README.md`.

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

### 3. Mobile (`mobile/`)

```bash
cd mobile
cp .env.example .env           # point EXPO_PUBLIC_GRAPHQL_URL at your backend
pnpm install
pnpm start                     # press i (iOS), a (Android), or w (web)
```

See `mobile/README.md` for picking the right backend URL per platform (the
Android emulator and physical devices can't reach `localhost`).

## How auth works

- **Access token** — short-lived JWT (15 min). Returned in the GraphQL
  response, stored in `localStorage`, sent as `Authorization: Bearer`.
- **Refresh token** — long-lived (7 days), set as an **httpOnly** cookie scoped
  to `/graphql` so JavaScript can never read it. Only its bcrypt hash is stored
  in the DB. **Native clients** (the mobile app) have no cookie jar, so when a
  request carries the header `x-client-platform: native` the backend returns the
  refresh token in the response body instead; the app stores it in the device's
  secure keychain and passes it back explicitly.
- When the access token expires, the GraphQL client calls the `refreshToken`
  mutation (cookie sent automatically), which **rotates** the refresh token
  (old one revoked) and returns a new access token. Reusing a rotated token is
  rejected.

### GraphQL API (at `/graphql`)

```graphql
mutation { register(input: { email, password, name }) { accessToken user { id email name } } }
mutation { login(input: { email, password })          { accessToken user { id email } } }
mutation { refreshToken                                { accessToken user { id } } }  # uses cookie
mutation { logout }                                                                    # revokes + clears cookie
query    { me { id email name createdAt } }                                            # requires Bearer token
```
