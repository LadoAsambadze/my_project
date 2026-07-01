'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type {
  CateringOffer,
  Design,
  EventItem,
  Offering,
  Post,
} from '@/graphql/types'
import { cn } from '@/lib/utils'
import { PostFeed } from '@/components/posts/post-feed'
import { EventFeed } from '@/components/events/event-feed'
import { DesignGallery } from '@/components/designs/design-gallery'
import { OfferGallery } from '@/components/catering/offer-gallery'
import { OfferingGallery } from '@/components/offerings/offering-gallery'

type Tab =
  | 'posts'
  | 'designs'
  | 'menu'
  | 'services'
  | 'photos'
  | 'videos'
  | 'events'

interface ProfileTabsProps {
  posts: Post[]
  events: EventItem[]
  currentUserId?: string
  /** Shown on the Posts tab when there are none. */
  emptyPostsLabel: string
  onDeleted?: (id: string) => void
  /** Called after an event is deleted so the parent can refresh its list. */
  onEventDeleted?: (id: string) => void
  /** Rendered at the top of the Events tab (e.g. a create-event form) for owners. */
  eventComposer?: React.ReactNode
  /** When set, a Designs tab appears showing this portfolio (designer pages). */
  designs?: Design[]
  /** True when the viewer owns the designs' page (shows delete controls). */
  canDeleteDesigns?: boolean
  /** Called after a design is deleted so the parent can refresh its list. */
  onDesignDeleted?: (id: string) => void
  /** Rendered at the top of the Designs tab (a create-design form) for owners. */
  designComposer?: React.ReactNode
  /** When set, a Menu tab appears showing these offers (catering pages). */
  cateringOffers?: CateringOffer[]
  /** True when the viewer owns the offers' page (shows delete controls). */
  canDeleteOffers?: boolean
  /** Called after an offer is deleted so the parent can refresh its list. */
  onOfferDeleted?: (id: string) => void
  /** Rendered at the top of the Menu tab (a create-offer form) for owners. */
  offerComposer?: React.ReactNode
  /** When set, a Services tab appears (musician/equipment pages). */
  offerings?: Offering[]
  /** True when the viewer owns the offerings' page (shows delete controls). */
  canDeleteOfferings?: boolean
  /** Called after an offering is deleted so the parent can refresh its list. */
  onOfferingDeleted?: (id: string) => void
  /** Rendered at the top of the Services tab (a create form) for owners. */
  offeringComposer?: React.ReactNode
}

export function ProfileTabs({
  posts,
  events,
  currentUserId,
  emptyPostsLabel,
  onDeleted,
  onEventDeleted,
  eventComposer,
  designs,
  canDeleteDesigns,
  onDesignDeleted,
  designComposer,
  cateringOffers,
  canDeleteOffers,
  onOfferDeleted,
  offerComposer,
  offerings,
  canDeleteOfferings,
  onOfferingDeleted,
  offeringComposer,
}: ProfileTabsProps) {
  const t = useTranslations('posts')
  const te = useTranslations('events')
  const td = useTranslations('designs')
  const tm = useTranslations('catering')
  const to = useTranslations('offerings')
  const [tab, setTab] = useState<Tab>('posts')

  // Flatten media across all posts for the Photos / Videos galleries.
  const photos = posts.flatMap((p) => p.media.filter((m) => m.type === 'IMAGE'))
  const videos = posts.flatMap((p) => p.media.filter((m) => m.type === 'VIDEO'))

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'posts', label: t('tabPosts') },
    // Vendor tabs appear only for the matching page types (right after Posts,
    // as the portfolio/menu is their main content).
    ...(designs !== undefined
      ? [{ key: 'designs' as const, label: td('tab') }]
      : []),
    ...(cateringOffers !== undefined
      ? [{ key: 'menu' as const, label: tm('tab') }]
      : []),
    ...(offerings !== undefined
      ? [{ key: 'services' as const, label: to('tab') }]
      : []),
    { key: 'photos', label: t('tabPhotos') },
    { key: 'videos', label: t('tabVideos') },
    { key: 'events', label: te('tab') },
  ]

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-border">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <PostFeed
          posts={posts}
          currentUserId={currentUserId}
          emptyLabel={emptyPostsLabel}
          onDeleted={onDeleted}
        />
      )}

      {tab === 'designs' && designs !== undefined && (
        <div className="flex flex-col gap-4">
          {designComposer}
          <DesignGallery
            designs={designs}
            canDelete={canDeleteDesigns}
            onDeleted={onDesignDeleted}
          />
        </div>
      )}

      {tab === 'menu' && cateringOffers !== undefined && (
        <div className="flex flex-col gap-4">
          {offerComposer}
          <OfferGallery
            offers={cateringOffers}
            canDelete={canDeleteOffers}
            onDeleted={onOfferDeleted}
          />
        </div>
      )}

      {tab === 'services' && offerings !== undefined && (
        <div className="flex flex-col gap-4">
          {offeringComposer}
          <OfferingGallery
            offerings={offerings}
            canDelete={canDeleteOfferings}
            onDeleted={onOfferingDeleted}
          />
        </div>
      )}

      {tab === 'photos' &&
        (photos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('noPhotos')}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {photos.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.url}
                alt=""
                className="aspect-square w-full rounded-md bg-muted object-cover"
              />
            ))}
          </div>
        ))}

      {tab === 'videos' &&
        (videos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('noVideos')}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {videos.map((m) => (
              <video
                key={m.id}
                src={m.url}
                controls
                className="aspect-video w-full rounded-md bg-black"
              />
            ))}
          </div>
        ))}

      {tab === 'events' && (
        <div className="flex flex-col gap-4">
          {eventComposer}
          <EventFeed
            events={events}
            currentUserId={currentUserId}
            emptyLabel={te('empty')}
            onDeleted={onEventDeleted}
          />
        </div>
      )}
    </div>
  )
}
