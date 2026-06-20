'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import {
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
} from '@/graphql/auth/mutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/auth/otp-input'

type Step = 'request' | 'reset'

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const [requestReset, { loading: requesting }] = useMutation(
    REQUEST_PASSWORD_RESET_MUTATION,
    {
      onCompleted: () => {
        setStep('reset')
        setInfo(t('resetCodeSent'))
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const [resetPassword, { loading: resetting }] = useMutation(
    RESET_PASSWORD_MUTATION,
    {
      onCompleted: () => router.push('/sign-in'),
      onError: (err) => setFormError(err.message),
    },
  )

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setInfo(null)
    void requestReset({ variables: { email } })
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (code.length !== 6) {
      setFormError(t('codeIncomplete'))
      return
    }
    if (password.length < 8) {
      setFormError(t('passwordTooShort'))
      return
    }
    if (password !== confirmPassword) {
      setFormError(t('passwordsNoMatch'))
      return
    }
    void resetPassword({
      variables: { input: { email, code, newPassword: password } },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 'request' ? t('forgotTitle') : t('resetTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 'request'
            ? t('forgotSubtitle')
            : t('resetSubtitle', { email })}
        </p>
      </div>

      {step === 'request' ? (
        <form onSubmit={handleRequest} className="flex flex-col gap-4">
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

          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={requesting} className="w-full">
            {requesting ? t('sending') : t('sendCode')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={resetting}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <PasswordInput
              id="newPassword"
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

          {info && <p className="text-center text-sm text-primary">{info}</p>}
          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" disabled={resetting} className="w-full">
            {resetting ? t('resetting') : t('resetPassword')}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          {t('backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
