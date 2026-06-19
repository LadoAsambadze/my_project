'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { REGISTER_MUTATION } from '@/graphql/auth/mutations'
import type { AuthResponse } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

interface RegisterData {
  register: AuthResponse
}

interface RegisterVariables {
  input: {
    name?: string
    email: string
    password: string
  }
}

export function SignUpForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [registerMutation, { loading }] = useMutation<
    RegisterData,
    RegisterVariables
  >(REGISTER_MUTATION, {
    onCompleted: (data) => {
      auth.login(data.register)
      router.push('/dashboard')
    },
    onError: (err) => setFormError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (password.length < 8) {
      setFormError(t('passwordTooShort'))
      return
    }

    void registerMutation({
      variables: {
        input: { name: name.trim() || undefined, email, password },
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('signUpTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('signUpSubtitle')}</p>
      </div>

      <OAuthButtons />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t('nameHint')}</p>
        </div>

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
            autoComplete="new-password"
            placeholder={t('passwordHint')}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {formError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('creatingAccount') : t('signUp')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}
