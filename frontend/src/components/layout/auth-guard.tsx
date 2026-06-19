'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from '@/i18n/navigation'

/**
 * Client-side guard for the (protected) route group. Auth uses in-memory
 * tokens (no readable cookie), so protection happens here rather than in
 * middleware. Redirects to /sign-in once auth has resolved with no user.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common')
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{t('loading')}</div>
      </div>
    )
  }

  return <>{children}</>
}
