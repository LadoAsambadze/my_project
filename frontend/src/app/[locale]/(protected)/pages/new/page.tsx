'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { CreatePageForm } from '@/components/pages/create-page-form'

export default function NewPagePage() {
  const t = useTranslations('pages')

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <Link
        href="/pages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToPages')}
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold">{t('createTitle')}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('createSubtitle')}
        </p>
        <CreatePageForm />
      </div>
    </div>
  )
}
