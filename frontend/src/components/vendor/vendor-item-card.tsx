'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Pencil, Trash2, type LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { ContentTarget, PagePreview } from '@/graphql/types'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { Lightbox, type LightboxMedia } from '@/components/ui/lightbox'
import { EngagementBar } from '@/components/engagement/engagement-bar'

export interface VendorItemEngagement {
  target: ContentTarget
  targetId: string
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
}

interface VendorItemCardProps {
  /** Photos/videos in display order; the first one is the card cover. */
  media: LightboxMedia[]
  title: string
  badgeIcon: LucideIcon
  badgeLabel: string
  /** Already-formatted price line (e.g. "from 500 ₾"); hidden when absent. */
  priceLabel?: string | null
  description?: string | null
  /** The page that published the item — shown when `showPage` is set. */
  page: PagePreview
  showPage?: boolean
  /** Owner controls. */
  canManage?: boolean
  onEdit?: () => void
  onDelete?: () => void
  deleting?: boolean
  deleteConfirm: string
  engagement: VendorItemEngagement
  currentUserId?: string
  /** Optional header row rendered inside the card, above the media (used by
   * the news feed for the "page published a design" attribution line). */
  header?: React.ReactNode
}

/**
 * The shared card for every vendor content type (designs, menu offers,
 * services, portfolio works, florist items): media carousel with lightbox,
 * category badge, price, description, page attribution, and the like/comment
 * bar. Type-specific cards are thin wrappers that pick labels and icons.
 */
export function VendorItemCard({
  media,
  title,
  badgeIcon: BadgeIcon,
  badgeLabel,
  priceLabel,
  description,
  page,
  showPage,
  canManage,
  onEdit,
  onDelete,
  deleting,
  deleteConfirm,
  engagement,
  currentUserId,
  header,
}: VendorItemCardProps) {
  const t = useTranslations('common')
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const activeMedia = media[active] ?? media[0]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {header && <div className="px-4 pt-4 pb-3">{header}</div>}
      {/* Media: cover + thumbnail strip; click opens the lightbox. */}
      {activeMedia && (
        <button
          type="button"
          onClick={() => setLightbox(active)}
          className="block w-full"
          aria-label={title}
        >
          {activeMedia.type === 'VIDEO' ? (
            <video
              src={activeMedia.url}
              muted
              playsInline
              className="aspect-[4/3] w-full bg-black object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeMedia.url}
              alt={title}
              loading="lazy"
              className="aspect-[4/3] w-full bg-muted object-cover"
            />
          )}
        </button>
      )}
      {media.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 pt-2">
          {media.map((m, i) => (
            <button
              key={`${m.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                i === active ? 'border-primary' : 'border-transparent',
              )}
            >
              {m.type === 'VIDEO' ? (
                <video
                  src={m.url}
                  muted
                  className="h-12 w-12 bg-black object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 bg-muted object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {canManage && (
            <div className="flex shrink-0 items-center">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  aria-label={t('edit')}
                  className="h-7 w-7 p-0 text-muted-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deleting}
                  onClick={() => {
                    if (window.confirm(deleteConfirm)) onDelete()
                  }}
                  aria-label={t('delete')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <BadgeIcon className="h-3.5 w-3.5" />
            {badgeLabel}
          </span>
          {priceLabel && (
            <span className="text-xs font-medium text-muted-foreground">
              {priceLabel}
            </span>
          )}
        </div>

        {description && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {showPage && (
          <Link
            href={`/pages/${page.id}`}
            className="mt-1 flex items-center gap-2 text-xs text-muted-foreground hover:underline"
          >
            <Avatar src={page.photoUrl} name={page.name} size="sm" />
            {page.name}
          </Link>
        )}

        <div className="mt-auto pt-1">
          <EngagementBar
            target={engagement.target}
            targetId={engagement.targetId}
            likesCount={engagement.likesCount}
            likedByMe={engagement.likedByMe}
            commentsCount={engagement.commentsCount}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      <Lightbox
        media={media}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />
    </div>
  )
}
