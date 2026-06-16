# Event — Mobile

Native iOS/Android app for Event, built with **Expo (React Native)** in
TypeScript. It talks to the same NestJS GraphQL backend as the web app.

First feature, mirroring the web app: **authentication** (email/password) with a
short-lived access token + rotating refresh token.

## Stack

| Layer      | Tech                                          |
| ---------- | --------------------------------------------- |
| App        | Expo SDK 52, React Native 0.76, expo-router   |
| Language   | TypeScript                                    |
| Data       | GraphQL over `fetch` (shared backend)         |
| Auth store | `expo-secure-store` (OS keychain/keystore)    |

Package manager: **pnpm** (note the `.npmrc` pins `node-linker=hoisted`, which
Expo's Metro bundler needs).

## How mobile auth differs from web

The web app keeps the refresh token in an **httpOnly cookie** the browser sends
automatically. A native app has no cookie jar, so instead:

- The app sends the header `x-client-platform: native` on every request.
- For that header, the backend returns the **refresh token in the response
  body** (the `AuthPayload.refreshToken` field) instead of setting a cookie.
- The app stores both tokens in **`expo-secure-store`** and passes the refresh
  token explicitly to the `refreshToken` / `logout` mutations.

The web flow is unchanged: with no header, the backend uses the cookie exactly
as before.

## Running it

The backend must be running first (see `../backend/README.md`).

```bash
cd mobile
cp .env.example .env          # point EXPO_PUBLIC_GRAPHQL_URL at your backend
pnpm install
pnpm start                    # then press i (iOS), a (Android), or w (web)
```

### Pointing the app at the backend

`EXPO_PUBLIC_GRAPHQL_URL` depends on where the app runs:

- **iOS simulator / web:** `http://localhost:4000/graphql`
- **Android emulator:** `http://10.0.2.2:4000/graphql`
- **Physical device:** your machine's LAN IP, e.g. `http://192.168.1.20:4000/graphql`

> The backend's CORS only matters for the **web** target. On a physical device
> or emulator there's no browser origin, so native requests aren't subject to
> CORS. If you run the web target on a different port, add it to `CORS_ORIGIN`
> in `backend/.env`.

## Project layout

```
app/                     # expo-router file-based routes
  _layout.tsx            # root: providers + auth gate (redirects in/out)
  index.tsx              # entry redirect
  (auth)/                # public: welcome, login, register
  (app)/                 # authenticated: home (feed shell)
src/
  components/ui.tsx      # shared Button / Field / Screen primitives
  lib/auth/              # auth context + secure token store
  lib/graphql/           # GraphQL client (transparent refresh) + operations
  theme.ts               # design tokens
```

## What's next

The home screen is a feed shell. The Facebook-style features (profiles, posts,
friends, likes/comments, chat) land here as the backend grows the matching
GraphQL models — added one feature at a time.
