'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import {
  REQUEST_LOGIN_CODE_MUTATION,
  LOGIN_WITH_CODE_MUTATION,
} from '@/graphql/auth/mutations'
import type { AuthResponse } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/auth/otp-input'

interface LoginWithCodeData {
  loginWithCode: AuthResponse
}

type Step = 'request' | 'code'

const RESEND_COOLDOWN = 60

export function OtpLoginForm({ onBack }: { onBack?: () => void } = {}) {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()

  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    timer.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timer.current) clearInterval(timer.current)
        return c - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  const [requestCode, { loading: requesting }] = useMutation(
    REQUEST_LOGIN_CODE_MUTATION,
    {
      onCompleted: () => {
        setStep('code')
        setInfo(t('loginCodeSent'))
        startCooldown()
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const [loginWithCode, { loading }] = useMutation<LoginWithCodeData>(
    LOGIN_WITH_CODE_MUTATION,
    {
      onCompleted: (data) => {
        auth.login(data.loginWithCode)
        router.push('/dashboard')
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setInfo(null)
    void requestCode({ variables: { email } })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (code.length !== 6) {
      setFormError(t('codeIncomplete'))
      return
    }
    void loginWithCode({ variables: { input: { email, code } } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('otpLoginTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 'request'
            ? t('otpLoginSubtitle')
            : t('verifySubtitle', { email })}
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
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={loading}
            autoFocus
          />

          {info && <p className="text-center text-sm text-primary">{info}</p>}
          {formError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? t('signingIn') : t('signIn')}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setFormError(null)
                void requestCode({ variables: { email } })
              }}
              disabled={requesting || cooldown > 0}
              className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0
                ? t('resendIn', { seconds: cooldown })
                : t('resendCode')}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-primary hover:underline"
          >
            {t('backToOptions')}
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            {t('signInWithPassword')}
          </Link>
        )}
      </p>
    </div>
  )
}
