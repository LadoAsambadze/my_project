'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FeedItem } from '@/graphql/types'
import { formatTimeAgo } from '@/lib/time'
import { Avatar } from '@/components/profile/avatar'
import { PostCard } from '@/components/posts/post-card'
import { EventCard } from '@/components/events/event-card'
import { RequestCard } from '@/components/requests/request-card'
import { VendorItemCard } from '@/components/vendor/vendor-item-card'
import {
  DESIGNS_CONFIG,
  CATERING_CONFIG,
  OFFERINGS_CONFIG,
  WORKS_CONFIG,
  FLORIST_CONFIG,
  type VendorContentItem,
  type VendorTypeConfig,
} from '@/components/vendor/vendor-configs'

const CONFIG_BY_TYPENAME: Record<string, VendorTypeConfig> = {
  Design: DESIGNS_CONFIG,
  CateringOffer: CATERING_CONFIG,
  Offering: OFFERINGS_CONFIG,
  Work: WORKS_CONFIG,
  FloristItem: FLORIST_CONFIG,
}

interface FeedStoryProps {
  item: FeedItem
  currentUserId?: string
  /** Called after the viewer deletes their own story. */
  onDeleted?: () => void
}

/**
 * Renders one news-feed story by its type: posts, events, and requests use
 * their own cards; vendor content uses the shared card with a "page published
 * a design" attribution header.
 */
export function FeedStory({ item, currentUserId, onDeleted }: FeedStoryProps) {
  const tRoot = useTranslations()
  const locale = useLocale()

  if (item.__typename === 'Post') {
    return (
      <PostCard post={item} currentUserId={currentUserId} onDeleted={onDeleted} />
    )
  }
  if (item.__typename === 'Event') {
    return (
      <EventCard
        event={item}
        currentUserId={currentUserId}
        onDeleted={onDeleted}
      />
    )
  }
  if (item.__typename === 'Request') {
    return (
      <RequestCard
        request={item}
        currentUserId={currentUserId}
        onDeleted={onDeleted}
      />
    )
  }

  const config = CONFIG_BY_TYPENAME[item.__typename]
  if (!config) return null
  const vendorItem = item as unknown as VendorContentItem
  const kindId = config.getKind(vendorItem)
  const price = config.getPrice(vendorItem)

  const header = (
    <div className="flex items-center gap-3">
      <Link href={`/pages/${vendorItem.page.id}`}>
        <Avatar
          src={vendorItem.page.photoUrl}
          name={vendorItem.page.name}
          size="sm"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <Link
            href={`/pages/${vendorItem.page.id}`}
            className="font-semibold hover:underline"
          >
            {vendorItem.page.name}
          </Link>{' '}
          <span className="text-muted-foreground">
            {tRoot(`feedActions.${config.key}`)}
          </span>
        </p>
        <time
          dateTime={vendorItem.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatTimeAgo(vendorItem.createdAt, locale)}
        </time>
      </div>
    </div>
  )

  return (
    <VendorItemCard
      header={header}
      media={config.getMedia(vendorItem)}
      title={vendorItem.title}
      badgeIcon={config.kindIcon(kindId)}
      badgeLabel={tRoot(`${config.kindNs}.${kindId}`)}
      priceLabel={
        price !== null ? tRoot(`${config.ns}.${config.priceLabelKey}`, { price }) : null
      }
      description={vendorItem.description}
      page={vendorItem.page}
      deleteConfirm={tRoot(`${config.ns}.deleteConfirm`)}
      engagement={{
        target: config.target,
        targetId: vendorItem.id,
        likesCount: vendorItem.likesCount,
        likedByMe: vendorItem.likedByMe,
        commentsCount: vendorItem.commentsCount,
      }}
      currentUserId={currentUserId}
    />
  )
}
