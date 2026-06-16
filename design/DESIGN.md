# Event — design language

A practical mix of three references:

- **Facebook** — content-first cards, clear feed/profile structure, avatars
  everywhere, friendly density.
- **Google (Material)** — disciplined spacing scale, strong type hierarchy,
  predictable component states (hover/focus/active/disabled), accessible focus
  rings.
- **Netflix** — confident, immersive **hero** surfaces (profile cover, landing),
  bold imagery, comfortable on dark.

The brand accent is **purple (`brand.500` = `#6d5dfc`)**. All values come from
`design/tokens.json` — never hardcode colors.

## Principles

1. **Token-driven.** Color, spacing, radius, type, shadow come from tokens.
2. **Light + dark.** Web defaults to light with full dark support (`.dark`).
   Mobile is dark-first. Both read the same semantic roles.
3. **Responsive (web).** Mobile-first; layouts adapt at `sm` / `md` / `lg`.
   Content max-width ~`max-w-2xl` for feeds, wider for dashboards.
4. **Generous spacing & rounded surfaces.** Cards use `lg` radius + soft shadow.
5. **Every interactive state is designed.** hover, focus-visible ring, active,
   disabled, loading.
6. **Feedback always.** Mutations show a loader and a toast (success/error).
   Forms validate inline with specific, human error messages.

## Layout

- **Web:** sticky top app bar (logo left, avatar menu right). Page content in a
  centered container. Auth pages are a split/centered card on a subtle gradient.
- **Mobile:** top bar per screen; tab-free for now (stack navigation).
- **Profile:** a hero/cover band, large avatar overlapping it, name + location +
  bio, then an edit action. Edit is a form (modal on web, screen on mobile).

## Shared component inventory

Both platforms expose the same conceptual set (web via shadcn/Tailwind, mobile
via `mobile/src/components`):

Button, Input/Field (label + error + helper), Textarea, Avatar, Badge, Card,
Divider, Spinner/Loader, Skeleton, Toast, Modal/Dialog, ListItem, AppBar/Header,
FormField (label+control+error wiring).

## Validation rules (match the backend)

- **email** — required, valid email.
- **password** — register: ≥ 8 chars; login: required.
- **name** — optional, ≤ 80.
- **bio** — optional, ≤ 280.
- **location** — optional, ≤ 120.
- **avatarUrl** — optional; if present must be a valid `http(s)` URL, ≤ 2048.

## GraphQL the UI uses

```graphql
mutation Register($input: RegisterInput!) { register(input:$input){ accessToken refreshToken user{...} } }
mutation Login($input: LoginInput!)       { login(input:$input){ accessToken refreshToken user{...} } }
mutation Refresh($token: String)          { refreshToken(token:$token){ accessToken refreshToken user{...} } }
mutation Logout($token: String)           { logout(token:$token) }
query    Me                               { me { id email name bio avatarUrl location createdAt } }
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input:$input) { id email name bio avatarUrl location createdAt }
}
```

`User` now includes `bio`, `avatarUrl`, `location`.
