'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { EventItem, Page, Post } from '@/graphql/types'
import { cn } from '@/lib/utils'
import { PostFeed } from '@/components/posts/post-feed'
import { EventFeed } from '@/components/events/event-feed'
import { VendorSection } from '@/components/vendor/vendor-section'
import { VENDOR_CONFIGS } from '@/components/vendor/vendor-configs'
import { Button } from '@/components/ui/button'

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
  /**
   * When rendering a page profile, the page itself — enables its vendor
   * sections. Owners additionally see the other sections locked, as a nudge
   * to add more vendor types.
   */
  page?: Page
  isPageOwner?: boolean
}

export function ProfileTabs({
  posts,
  events,
  currentUserId,
  emptyPostsLabel,
  onDeleted,
  onEventDeleted,
  eventComposer,
  page,
  isPageOwner,
}: ProfileTabsProps) {
  const t = useTranslations('posts')
  const te = useTranslations('events')
  const tp = useTranslations('pages')
  // Root-scope translator for the per-config namespaces (works.tab, ...).
  const tRoot = useTranslations()
  const [tab, setTab] = useState<string>('posts')

  // Flatten media across all posts for the Photos / Videos galleries.
  const photos = posts.flatMap((p) => p.media.filter((m) => m.type === 'IMAGE'))
  const videos = posts.flatMap((p) => p.media.filter((m) => m.type === 'VIDEO'))

  // Vendor sections: active ones for everyone, locked ones for the owner only
  // (a nudge to add more vendor types — clicking shows how to unlock).
  const activeConfigs = page
    ? VENDOR_CONFIGS.filter((c) => page.types.includes(c.pageType))
    : []
  const lockedConfigs =
    page && isPageOwner
      ? VENDOR_CONFIGS.filter((c) => !page.types.includes(c.pageType))
      : []

  const tabs: Array<{ key: string; label: string; locked?: boolean }> = [
    { key: 'posts', label: t('tabPosts') },
    ...activeConfigs.map((c) => ({
      key: c.key,
      label: tRoot(`${c.ns}.tab`),
    })),
    { key: 'photos', label: t('tabPhotos') },
    { key: 'videos', label: t('tabVideos') },
    { key: 'events', label: te('tab') },
    ...lockedConfigs.map((c) => ({
      key: c.key,
      label: tRoot(`${c.ns}.tab`),
      locked: true,
    })),
  ]

  const activeConfig = activeConfigs.find((c) => c.key === tab)
  const lockedConfig = lockedConfigs.find((c) => c.key === tab)

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map(({ key, label, locked }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
              locked && 'opacity-60',
            )}
          >
            {locked && <Lock className="h-3.5 w-3.5" />}
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

      {activeConfig && page && (
        <VendorSection
          config={activeConfig}
          page={page}
          isOwner={!!isPageOwner}
          currentUserId={currentUserId}
        />
      )}

      {lockedConfig && page && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            {tp('lockedSection', {
              type: tRoot(`pageTypes.${lockedConfig.pageType}`),
            })}
          </p>
          <Button asChild size="sm">
            <Link href={`/pages/${page.id}/settings`}>
              {tp('settingsButton')}
            </Link>
          </Button>
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
                loading="lazy"
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
