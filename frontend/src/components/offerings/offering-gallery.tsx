'use client'

import { useTranslations } from 'next-intl'
import type { Offering } from '@/graphql/types'
import { OfferingCard } from '@/components/offerings/offering-card'

interface OfferingGalleryProps {
  offerings: Offering[]
  /** True when the viewer owns these offerings' page (shows delete controls). */
  canDelete?: boolean
  onDeleted?: (id: string) => void
  /** Show each offering's page (used in the browse grid). */
  showPage?: boolean
}

export function OfferingGallery({
  offerings,
  canDelete,
  onDeleted,
  showPage,
}: OfferingGalleryProps) {
  const t = useTranslations('offerings')

  if (offerings.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {offerings.map((offering) => (
        <OfferingCard
          key={offering.id}
          offering={offering}
          canDelete={canDelete}
          onDeleted={onDeleted}
          showPage={showPage}
        />
      ))}
    </div>
  )
}
