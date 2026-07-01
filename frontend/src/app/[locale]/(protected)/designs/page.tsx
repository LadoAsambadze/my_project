'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { DESIGNS_QUERY } from '@/graphql/designs/queries'
import { DESIGN_OCCASIONS } from '@/lib/design-occasions'
import type { Design } from '@/graphql/types'
import { cn } from '@/lib/utils'
import { DesignCard } from '@/components/designs/design-card'

interface DesignsData {
  designs: Design[]
}

export default function DesignsPage() {
  const t = useTranslations('designs')
  const to = useTranslations('designOccasions')
  // null = all occasions; changing it re-runs the query with the new filter.
  const [occasion, setOccasion] = useState<string | null>(null)

  const { data, loading } = useQuery<DesignsData>(DESIGNS_QUERY, {
    variables: { occasion },
    fetchPolicy: 'cache-and-network',
  })

  const designs = data?.designs ?? []

  const filters: Array<{ id: string | null; label: string; icon?: React.ElementType }> = [
    { id: null, label: t('all') },
    ...DESIGN_OCCASIONS.map(({ id, icon }) => ({
      id,
      label: to(id),
      icon,
    })),
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold">{t('browseTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('browseSubtitle')}</p>
      </div>

      {/* Occasion filter chips */}
      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id ?? 'ALL'}
            type="button"
            onClick={() => setOccasion(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              occasion === id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {designs.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {loading ? t('loading') : t('browseEmpty')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} showPage />
          ))}
        </div>
      )}
    </div>
  )
}
