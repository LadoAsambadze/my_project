'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Offering } from '@/graphql/types'
import { DELETE_OFFERING_MUTATION } from '@/graphql/offerings/mutations'
import { offeringKindIcon } from '@/lib/offering-kinds'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'

interface OfferingCardProps {
  offering: Offering
  /** True when the viewer owns the offering's page (shows the delete control). */
  canDelete?: boolean
  /** Called after a successful delete so the parent can refresh its list. */
  onDeleted?: (id: string) => void
  /** Show the page the offering belongs to (used in the browse grid). */
  showPage?: boolean
}

export function OfferingCard({
  offering,
  canDelete,
  onDeleted,
  showPage,
}: OfferingCardProps) {
  const t = useTranslations('offerings')
  const tk = useTranslations('offeringKinds')
  const [active, setActive] = useState(0)

  const [deleteOffering, { loading: deleting }] = useMutation(
    DELETE_OFFERING_MUTATION,
    {
      variables: { id: offering.id },
      onCompleted: () => onDeleted?.(offering.id),
    },
  )

  const KindIcon = offeringKindIcon(offering.kind)
  const activeImage = offering.images[active] ?? offering.images[0]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Photos: the active image + a thumbnail strip when there are several. */}
      {activeImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeImage.url}
          alt={offering.title}
          className="aspect-[4/3] w-full bg-muted object-cover"
        />
      )}
      {offering.images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 pt-2">
          {offering.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                i === active ? 'border-primary' : 'border-transparent',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-12 w-12 bg-muted object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold">{offering.title}</h3>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleting}
              onClick={() => {
                if (window.confirm(t('deleteConfirm'))) void deleteOffering()
              }}
              aria-label={t('delete')}
              className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <KindIcon className="h-3.5 w-3.5" />
            {tk(offering.kind)}
          </span>
          {offering.priceFrom !== null && (
            <span className="text-xs font-medium text-muted-foreground">
              {t('priceFrom', { price: offering.priceFrom })}
            </span>
          )}
        </div>

        {offering.description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {offering.description}
          </p>
        )}

        {showPage && (
          <Link
            href={`/pages/${offering.page.id}`}
            className="mt-1 flex items-center gap-2 text-xs text-muted-foreground hover:underline"
          >
            <Avatar
              src={offering.page.photoUrl}
              name={offering.page.name}
              size="sm"
            />
            {t('byPage', { name: offering.page.name })}
          </Link>
        )}
      </div>
    </div>
  )
}
