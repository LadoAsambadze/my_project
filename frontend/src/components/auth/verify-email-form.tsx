'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import {
  VERIFY_EMAIL_MUTATION,
  RESEND_VERIFICATION_CODE_MUTATION,
} from '@/graphql/auth/mutations'
import type { AuthResponse } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/auth/otp-input'

interface VerifyEmailData {
  verifyEmail: AuthResponse
}

const RESEND_COOLDOWN = 60

export function VerifyEmailForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const auth = useAuth()
  const params = useSearchParams()
  const email = params.get('email') ?? ''

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

  const [verify, { loading }] = useMutation<VerifyEmailData>(
    VERIFY_EMAIL_MUTATION,
    {
      onCompleted: (data) => {
        auth.login(data.verifyEmail)
        router.push('/dashboard')
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const [resend, { loading: resending }] = useMutation(
    RESEND_VERIFICATION_CODE_MUTATION,
    {
      onCompleted: () => {
        setInfo(t('codeResent'))
        startCooldown()
      },
      onError: (err) => setFormError(err.message),
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setInfo(null)
    if (code.length !== 6) {
      setFormError(t('codeIncomplete'))
      return
    }
    void verify({ variables: { input: { email, code } } })
  }

  if (!email) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('verifyTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('noEmailProvided')}</p>
        <Link
          href="/sign-up"
          className="font-medium text-primary hover:underline"
        >
          {t('signUp')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('verifyTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('verifySubtitle', { email })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />

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
          {loading ? t('verifying') : t('verify')}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            void resend({ variables: { email } })
          }}
          disabled={resending || cooldown > 0}
          className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? t('resendIn', { seconds: cooldown }) : t('resendCode')}
        </button>
      </div>
    </div>
  )
}
