'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'

/**
 * Landing page for the social-login redirect. The backend sends the access
 * token (or an error) in the URL fragment so it never hits the server; we read
 * it, establish the session via the auth context, then continue to the app.
 */
export default function OAuthCallbackPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { loginWithToken } = useAuth()
  const [failed, setFailed] = useState(false)
  const handled = useRef(false)

  useEffect(() => {
    // Guard against React 18 StrictMode running effects twice.
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const token = params.get('token')
    const hasError = params.get('error') !== null

    // Strip the token from the URL so it isn't left in browser history.
    window.history.replaceState(null, '', window.location.pathname)

    if (hasError || !token) {
      setFailed(true)
      return
    }

    loginWithToken(token)
      .then(() => router.replace('/dashboard'))
      .catch(() => setFailed(true))
  }, [loginWithToken, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      {failed ? (
        <>
          <p className="text-sm text-destructive">{t('oauthError')}</p>
          <button
            onClick={() => router.replace('/sign-in')}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('signIn')}
          </button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t('signingIn')}</p>
      )}
    </div>
  )
}
