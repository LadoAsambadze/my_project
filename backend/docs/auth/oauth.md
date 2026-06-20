# Social login (Google & Facebook)

The OAuth flow is **fully wired** in code — buttons, redirect routes, callback,
and account linking all exist. It just needs **real provider credentials** in
`backend/.env` to work. This guide is how to get them.

## How the flow works (already built)

1. Frontend button → `GET http://localhost:4000/auth/google` (or `/auth/facebook`).
2. Passport ([strategies/](../../src/auth/strategies)) redirects to the provider.
3. Provider redirects back to `…/auth/<provider>/callback`.
4. [`auth.controller.ts`](../../src/auth/auth.controller.ts) resolves/links the
   user (`oauthLogin`), sets the refresh cookie, and redirects to the frontend
   `…/oauth/callback#token=<accessToken>`.
5. The [callback page](../../../frontend/src/app/[locale]/(auth)/oauth/callback/page.tsx)
   reads the token from the URL fragment and signs the user in.

OAuth accounts are created **verified** and with no password; if the email
already exists, the provider is **linked** to that account.

## Google credentials

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create (or pick) a project.
3. **OAuth consent screen** → External → fill app name + support email → add
   your own Google account under **Test users** (needed while the app is unverified).
4. **Create Credentials → OAuth client ID → Web application**.
5. Under **Authorized redirect URIs** add exactly:
   ```
   http://localhost:4000/auth/google/callback
   ```
6. Copy the **Client ID** and **Client secret** into `backend/.env`:
   ```
   GOOGLE_CLIENT_ID="…apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="…"
   GOOGLE_CALLBACK_URL="http://localhost:4000/auth/google/callback"
   ```

## Facebook credentials

1. Go to [Facebook for Developers → My Apps](https://developers.facebook.com/apps) → **Create App**.
2. Add the **Facebook Login** product.
3. **Facebook Login → Settings → Valid OAuth Redirect URIs** add exactly:
   ```
   http://localhost:4000/auth/facebook/callback
   ```
4. From **App settings → Basic**, copy the **App ID** and **App secret** into
   `backend/.env`:
   ```
   FACEBOOK_APP_ID="…"
   FACEBOOK_APP_SECRET="…"
   FACEBOOK_CALLBACK_URL="http://localhost:4000/auth/facebook/callback"
   ```
5. While the app is in **Development mode**, only users added under
   **App Roles → Roles** (admins/testers) can log in.

> Facebook requires HTTPS for production redirect URIs; `http://localhost` is
> allowed for development.

## After adding credentials

The callback URI in the provider console must match the `*_CALLBACK_URL` env var
**exactly** (scheme, host, port, path) or the provider rejects the request.

Restart the backend so it reads the new env values:

```
npm run start:dev
```

Then the Google/Facebook buttons on sign-in / sign-up will work. Until
credentials are set, the strategies fall back to placeholders and the provider
simply rejects the login.

## Production notes

- Set `NODE_ENV=production` (makes the refresh cookie `Secure`).
- Update each `*_CALLBACK_URL` and `FRONTEND_URL` to your real HTTPS domain, and
  add the production redirect URIs in both provider consoles.
