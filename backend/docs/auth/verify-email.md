# Email verification

After [signup](./signup.md), the account exists but is **unverified** and cannot
sign in. The user confirms a 6-digit code that was emailed to them; on success
the account is verified and signed in.

**Files:** `verifyEmail` / `resendVerificationCode` in
[`auth.resolver.ts`](../../src/auth/auth.resolver.ts) →
[`auth.service.ts`](../../src/auth/auth.service.ts); email sending in
[`mail.service.ts`](../../src/mail/mail.service.ts).

## The code

- **6 digits**, generated with `crypto.randomInt` (zero-padded).
- Stored **hashed** (bcrypt) in the `EmailVerification` table — never plaintext.
- **Expires in 15 minutes.**
- **Max 5 wrong attempts**, then the code is dead and a new one must be requested.
- One row per user (unique `userId`); re-issuing **upserts** the same row.

## `verifyEmail(input: { email, code })` → `AuthPayload`

1. Look up the user by email. (Errors are deliberately generic —
   *"Invalid or expired verification code"* — so they don't reveal which emails
   are registered.)
2. If already verified → `"This email is already verified"`.
3. Load the `EmailVerification` row. Missing or past `expiresAt` → generic error.
4. If `attempts >= 5` → `"Too many incorrect attempts. Request a new code."`
5. `bcrypt.compare(code, codeHash)`:
   - **No match** → increment `attempts`, throw the generic error.
   - **Match** → set `user.isVerified = true`, **delete** the verification row,
     and issue a session via `issueTokens()` (same as login: access token in the
     response, refresh token in the httpOnly cookie + hashed `RefreshToken` row).

So the access/refresh tokens that signup *used* to hand out are issued **here**
instead — this is the moment the user becomes logged in.

## `resendVerificationCode(email)` → `Boolean`

- Always returns `true` (no user enumeration).
- No-op for unknown or already-verified emails.
- **Cooldown:** rejects if the last code was issued less than **60 s** ago
  (`"Please wait a moment before requesting another code"`).
- Otherwise upserts a fresh code (resets `attempts`, new `expiresAt`) and emails it.

## Login is gated on verification

`login()` rejects unverified accounts **after** confirming the password is
correct:

```
Invalid email or password      // wrong credentials
Please verify your email …      // correct credentials, not yet verified
This account has been disabled  // isActive = false
```

## Sending the email (`MailService`)

Uses [Resend](https://resend.com). Designed to work with zero setup in dev:

| `RESEND_API_KEY` | Behaviour |
|---|---|
| **unset** (default) | The code is **logged to the server console** — no email sent. Build & test the whole flow with no account. |
| **set**, no domain | Resend sends from `onboarding@resend.dev` to **your own account email** only. |
| **set** + verified domain (`MAIL_FROM`) | Sends to any recipient (production). |

Env vars: `RESEND_API_KEY`, `MAIL_FROM` (see [`.env.example`](../../.env.example)).
