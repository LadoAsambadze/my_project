# Signup flow

How a new user registers with email + password.

Signup is **two steps**: `register` creates the account and emails a 6-digit
code; `verifyEmail` confirms the code and signs the user in. An account
**cannot sign in until it is verified** (see [verify-email.md](./verify-email.md)).

**Entry point:** `register` mutation in
[`auth.resolver.ts`](../../src/auth/auth.resolver.ts) →
`register()` in [`auth.service.ts`](../../src/auth/auth.service.ts).

## GraphQL contract

`register` returns the created **User** — note there is **no `accessToken`**.
The session is only issued later by `verifyEmail`.

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    id
    email
    isVerified # => false
  }
}
```

**Input** ([`RegisterInput`](../../src/auth/dto/register.input.ts)):

| Field | Type | Rules |
|---|---|---|
| `email` | String! | must be a valid email (`@IsEmail`) |
| `password` | String! | 8–72 characters |
| `firstName` | String! | 1–80 characters |
| `lastName` | String! | 1–80 characters |
| `birthDate` | String! | ISO date string, e.g. `"1995-06-20"` (`@IsDateString`) — produced by the frontend's `<input type="date">` |

> `confirmPassword` is **not** here — repeat-password is a client-side check only
> and is never sent to the backend.

**Output:** the created `User` with `isVerified: false`. No tokens, no cookie —
the user is **not** logged in yet.

## Step by step

1. **Validate input.** NestJS's `ValidationPipe` runs the `class-validator`
   rules on `RegisterInput` before the resolver is even called. Bad input →
   `400`-style GraphQL error, nothing touches the DB.

2. **Reject duplicate email.** `register()` calls `users.findByEmail()`. If a
   user already exists → `ConflictException("An account with this email already
   exists")`.

3. **Hash the password.** `bcrypt.hash(password, 12)`. The plaintext is never
   stored or logged.

4. **Create the User row.** `users.create()` writes the new user with
   `isVerified` defaulting to `false`.

5. **Issue a verification code.** `issueVerificationCode()` generates a random
   6-digit code, stores its **bcrypt hash** in a `EmailVerification` row (15-min
   expiry), and hands the plaintext code to
   [`MailService`](../../src/mail/mail.service.ts) to email. No session is
   created.

The user must now enter the code → see [verify-email.md](./verify-email.md),
which is where the access/refresh tokens are finally issued.

## What lands in the database

Signup creates **two rows**: the account and its pending verification code.

### `User` — 1 row

| Column | Source at signup | Value |
|---|---|---|
| `id` | default | generated cuid |
| `email` | form | the email entered (unique) |
| `firstName` | form | first name |
| `lastName` | form | last name |
| `birthDate` | form | `new Date(birthDate)` (stored as a DATE) |
| `password` | derived | **bcrypt hash** (never plaintext) |
| `bio` | — | `null` |
| `avatarUrl` | — | `null` |
| `location` | — | `null` |
| `googleId` | — | `null` (OAuth only) |
| `facebookId` | — | `null` (OAuth only) |
| `role` | default | `USER` |
| `isVerified` | default | `false` (email not confirmed yet) |
| `isActive` | default | `true` |
| `createdAt` | default | `now()` |
| `updatedAt` | auto | `now()` |

### `EmailVerification` — 1 row (the pending code)

| Column | Source at signup | Value |
|---|---|---|
| `id` | default | generated cuid |
| `userId` | FK | the new user's `id` (unique — one row per user) |
| `codeHash` | derived | **bcrypt hash** of the 6-digit code (never plaintext) |
| `expiresAt` | derived | `now + 15 min` |
| `attempts` | default | `0` (incremented on each wrong guess; max 5) |
| `createdAt` | default | `now()` (the resend cooldown measures from here) |

> No `RefreshToken` row is created at signup anymore — a session only exists
> once the email is verified. See [verify-email.md](./verify-email.md).

## What is NOT stored

- **Plaintext password** — only the bcrypt hash.
- **Plaintext verification code** — only its bcrypt hash; the code itself only
  exists in the email (and the dev console).
- **`confirmPassword`** — client-side only.

## OAuth signup differs

A Google/Facebook signup (`oauthLogin` → `resolveOAuthUser` in
[`auth.service.ts`](../../src/auth/auth.service.ts)) creates the `User` row
differently:

| Field | Email/password signup | OAuth signup |
|---|---|---|
| `password` | bcrypt hash | `null` |
| `googleId` / `facebookId` | `null` | set to the provider id |
| `isVerified` | `false` | `true` (provider already confirmed the email) |
| `firstName` / `lastName` | from the form | split from the provider's display name (`splitName()`) |
| `birthDate` | from the form | `null` (providers don't share it) |

If an account with the same email already exists, OAuth **links** the provider
to it instead of creating a duplicate (`linkProvider()`).
