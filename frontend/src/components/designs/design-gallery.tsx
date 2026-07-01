'use client'

import { useTranslations } from 'next-intl'
import type { Design } from '@/graphql/types'
import { DesignCard } from '@/components/designs/design-card'

interface DesignGalleryProps {
  designs: Design[]
  /** True when the viewer owns these designs' page (shows delete controls). */
  canDelete?: boolean
  onDeleted?: (id: string) => void
  /** Show each design's page (used in the browse grid). */
  showPage?: boolean
}

export function DesignGallery({
  designs,
  canDelete,
  onDeleted,
  showPage,
}: DesignGalleryProps) {
  const t = useTranslations('designs')

  if (designs.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('empty')}
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          canDelete={canDelete}
          onDeleted={onDeleted}
          showPage={showPage}
        />
      ))}
    </div>
  )
}
