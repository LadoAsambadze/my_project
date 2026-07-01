'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery } from '@apollo/client/react'
import type { Page } from '@/graphql/types'
import { VendorItemCard } from './vendor-item-card'
import { VendorItemComposer } from './vendor-item-composer'
import type { VendorContentItem, VendorTypeConfig } from './vendor-configs'

interface VendorSectionProps {
  config: VendorTypeConfig
  page: Page
  isOwner: boolean
  currentUserId?: string
}

/**
 * A page's vendor section (Portfolio / Designs / Menu / Services / Catalog):
 * owns its query, the create composer, edit-in-place, and the card grid.
 */
export function VendorSection({
  config,
  page,
  isOwner,
  currentUserId,
}: VendorSectionProps) {
  const t = useTranslations(config.ns)
  const tk = useTranslations(config.kindNs)
  const [editing, setEditing] = useState<VendorContentItem | null>(null)

  const { data, loading, refetch } = useQuery<
    Record<string, VendorContentItem[]>
  >(config.pageQuery, {
    variables: { pageId: page.id },
    fetchPolicy: 'cache-and-network',
  })
  const items = data?.[config.pageQueryKey] ?? []

  const [deleteItem] = useMutation(config.deleteMutation, {
    onCompleted: () => void refetch(),
  })

  return (
    <div className="flex flex-col gap-4">
      {isOwner && !editing && (
        <VendorItemComposer
          pageId={page.id}
          ns={config.ns}
          kindNs={config.kindNs}
          kinds={config.kinds}
          kindIcon={config.kindIcon}
          triggerIcon={config.triggerIcon}
          allowVideo={config.allowVideo}
          createMutation={config.createMutation}
          updateMutation={config.updateMutation}
          buildCreateInput={config.buildCreateInput}
          buildUpdateInput={config.buildUpdateInput}
          onSaved={() => void refetch()}
        />
      )}

      {isOwner && editing && (
        <VendorItemComposer
          pageId={page.id}
          ns={config.ns}
          kindNs={config.kindNs}
          kinds={config.kinds}
          kindIcon={config.kindIcon}
          triggerIcon={config.triggerIcon}
          allowVideo={config.allowVideo}
          createMutation={config.createMutation}
          updateMutation={config.updateMutation}
          buildCreateInput={config.buildCreateInput}
          buildUpdateInput={config.buildUpdateInput}
          initial={{
            id: editing.id,
            title: editing.title,
            kind: config.getKind(editing),
            description: editing.description ?? '',
            price: config.getPrice(editing),
            media: config.getMedia(editing),
          }}
          onSaved={() => {
            setEditing(null)
            void refetch()
          }}
          onCancelEdit={() => setEditing(null)}
        />
      )}

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {loading ? '…' : t('empty')}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
                  price !== null
                    ? t(config.priceLabelKey, { price })
                    : null
                }
                description={item.description}
                page={item.page}
                canManage={isOwner}
                onEdit={() => setEditing(item)}
                onDelete={() =>
                  void deleteItem({ variables: { id: item.id } })
                }
                deleteConfirm={t('deleteConfirm')}
                engagement={{
                  target: config.target,
                  targetId: item.id,
                  likesCount: item.likesCount,
                  likedByMe: item.likedByMe,
                  commentsCount: item.commentsCount,
                }}
                currentUserId={currentUserId}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
