'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { LOGIN_MUTATION } from '@/graphql/auth/mutations'
import type { AuthResponse } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

interface LoginData {
  login: AuthResponse
}

interface LoginVariables {
  input: {
    email: string
    password: string
  }
}

export function SignInForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('signInTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('signInSubtitle')}</p>
      </div>

      <OAuthButtons />

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
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('signingIn') : t('signIn')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link
          href="/sign-up"
          className="font-medium text-primary hover:underline"
        >
          {t('signUp')}
        </Link>
      </p>
    </div>
  )
}
