'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import { REGISTER_MUTATION } from '@/graphql/auth/mutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { OAuthButtons } from '@/components/auth/oauth-buttons'

interface RegisterData {
  register: {
    id: string
    email: string
    isVerified: boolean
  }
}

interface RegisterVariables {
  input: {
    firstName: string
    lastName: string
    birthDate: string
    email: string
    password: string
  }
}

export function SignUpForm() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [registerMutation, { loading }] = useMutation<
    RegisterData,
    RegisterVariables
  >(REGISTER_MUTATION, {
    onCompleted: () => {
      // Account created but unverified — go enter the emailed code.
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
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

    if (password !== confirmPassword) {
      setFormError(t('passwordsNoMatch'))
      return
    }

    void registerMutation({
      variables: {
        input: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate,
          email,
          password,
        },
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
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder={t('firstNamePlaceholder')}
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="lastName">{t('lastName')}</Label>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder={t('lastNamePlaceholder')}
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="birthDate">{t('birthDate')}</Label>
          <Input
            id="birthDate"
            type="date"
            autoComplete="bday"
            required
            max={new Date().toISOString().split('T')[0]}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
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
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder={t('passwordHint')}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder={t('passwordHint')}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
