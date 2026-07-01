'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { PAGE_QUERY } from '@/graphql/pages/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { Page } from '@/graphql/types'
import { PageSettingsForm } from '@/components/pages/page-settings-form'

interface PageData {
  page: Page
}

export default function PageSettingsPage() {
  const params = useParams<{ id: string }>()
  const id = String(params.id ?? '')
  const tc = useTranslations('common')
  const t = useTranslations('pages')
  const { user: me } = useAuth()

  const { data, loading, error } = useQuery<PageData>(PAGE_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data?.page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  // Settings are owner-only: anyone else gets the same "not found" screen.
  const page = data?.page
  const isOwner = !!page && me?.id === page.owner.id
  if (error || !page || !isOwner) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{t('notFound')}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <Link
        href={`/pages/${page.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToPage')}
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{t('settingsTitle')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('settingsSubtitle')}
      </p>
      <PageSettingsForm page={page} />
    </div>
  )
}
