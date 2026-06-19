'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Public landing / main page. Kept intentionally simple for now — brand,
 * tagline, and entry points.
 */
export default function MainPage() {
  const t = useTranslations('main')
  const { user, loading } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
          E
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Event</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t('tagline')}</p>
      </div>

      {!loading && (
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className={cn(buttonVariants())}>
              {t('goToDashboard')}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className={cn(buttonVariants())}>
                {t('signIn')}
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </div>
      )}
    </main>
  )
}
