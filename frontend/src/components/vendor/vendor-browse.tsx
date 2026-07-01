'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { VendorItemCard } from './vendor-item-card'
import type { VendorContentItem, VendorTypeConfig } from './vendor-configs'

interface VendorBrowseProps {
  config: VendorTypeConfig
}

/**
 * A discovery page for one vendor content type: kind filter chips + a
 * responsive card grid. Used by /designs, /catering, /services, /flowers.
 */
export function VendorBrowse({ config }: VendorBrowseProps) {
  const t = useTranslations(config.ns)
  const tk = useTranslations(config.kindNs)
  const { user } = useAuth()
  // null = all kinds; changing it re-runs the query with the new filter.
  const [kind, setKind] = useState<string | null>(null)

  const { data, loading } = useQuery<Record<string, VendorContentItem[]>>(
    config.browseQuery,
    {
      variables: { [config.browseFilterArg]: kind },
      fetchPolicy: 'cache-and-network',
    },
  )
  const items = data?.[config.browseQueryKey] ?? []

  const filters: Array<{ id: string | null; label: string }> = [
    { id: null, label: t('all') },
    ...config.kinds.map(({ id }) => ({ id, label: tk(id) })),
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold">{t('browseTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('browseSubtitle')}</p>
      </div>

      {/* Kind filter chips */}
      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {filters.map(({ id, label }) => (
          <button
            key={id ?? 'ALL'}
            type="button"
            onClick={() => setKind(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              kind === id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {loading ? '…' : t('browseEmpty')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const kindId = config.getKind(item)
            const price = config.getPrice(item)
            return (
              <VendorItemCard
                key={item.id}
                media={config.getMedia(item)}
                title={item.title}
                badgeIcon={config.kindIcon(kindId)}
                badgeLabel={tk(kindId)}
                priceLabel={
                  price !== null ? t(config.priceLabelKey, { price }) : null
                }
                description={item.description}
                page={item.page}
                showPage
                deleteConfirm={t('deleteConfirm')}
                engagement={{
                  target: config.target,
                  targetId: item.id,
                  likesCount: item.likesCount,
                  likedByMe: item.likedByMe,
                  commentsCount: item.commentsCount,
                }}
                currentUserId={user?.id}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
