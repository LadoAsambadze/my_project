'use client'

import { useTranslations } from 'next-intl'
import type { CateringOffer } from '@/graphql/types'
import { OfferCard } from '@/components/catering/offer-card'

interface OfferGalleryProps {
  offers: CateringOffer[]
  /** True when the viewer owns these offers' page (shows delete controls). */
  canDelete?: boolean
  onDeleted?: (id: string) => void
  /** Show each offer's page (used in the browse grid). */
  showPage?: boolean
}

export function OfferGallery({
  offers,
  canDelete,
  onDeleted,
  showPage,
}: OfferGalleryProps) {
  const t = useTranslations('catering')

  if (offers.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          canDelete={canDelete}
          onDeleted={onDeleted}
          showPage={showPage}
        />
      ))}
    </div>
  )
}
