'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Mail, KeyRound } from 'lucide-react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { LOGIN_MUTATION } from '@/graphql/auth/mutations'
import type { AuthResponse } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { OtpLoginForm } from '@/components/auth/otp-login-form'

interface LoginData {
  login: AuthResponse
}

interface LoginVariables {
  input: {
    email: string
    password: string
  }
}

type Mode = 'choose' | 'password' | 'code'

export function SignInForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()

  const [mode, setMode] = useState<Mode>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [loginMutation, { loading }] = useMutation<LoginData, LoginVariables>(
    LOGIN_MUTATION,
    {
      onCompleted: (data) => {
        auth.login(data.login)
        router.push('/dashboard')
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    void loginMutation({ variables: { input: { email, password } } })
  }

  // Email-code sign-in: reuse the standalone OTP form inline.
  if (mode === 'code') {
    return <OtpLoginForm onBack={() => setMode('choose')} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('signInTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('signInSubtitle')}</p>
      </div>

      {mode === 'choose' ? (
        <>
          <OAuthButtons />

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode('code')}
            >
              <Mail />
              {t('useEmailCode')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode('password')}
            >
              <KeyRound />
              {t('usePassword')}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t('noAccount')}{' '}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              {t('signUp')}
            </Link>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {formError && (
              <div className="text-sm text-destructive">
                <p>{formError}</p>
                {formError.toLowerCase().includes('verify') && (
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(email)}`}
                    className="font-medium underline"
                  >
                    {t('verifyNow')}
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setFormError(null)
                setMode('choose')
              }}
              className="font-medium text-primary hover:underline"
            >
              {t('backToOptions')}
            </button>
          </p>
        </>
      )}
    </div>
  )
}
