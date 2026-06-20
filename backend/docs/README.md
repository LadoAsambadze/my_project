# Backend docs

Plain-language explanations of how the backend works — the "why" and the
end-to-end flow that the code alone doesn't make obvious.

> These docs describe behaviour. When you change the code, update the doc in the
> same PR. Each doc links to the source files it describes.

## Index

### Authentication (`src/auth`)
- [Auth overview](./auth/README.md) — the moving parts: tokens, cookies, guards, mail.
- [Signup flow](./auth/signup.md) — what happens, step by step, when a user registers.
- [Email verification](./auth/verify-email.md) — confirming the emailed code; login is gated on it.
- [Social login (OAuth)](./auth/oauth.md) — Google/Facebook credential setup.

<!-- Add new docs here as the backend grows, e.g. profile, events, flowers… -->
