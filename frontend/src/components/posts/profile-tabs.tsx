'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Post } from '@/graphql/types'
import { cn } from '@/lib/utils'
import { PostFeed } from '@/components/posts/post-feed'

type Tab = 'posts' | 'photos' | 'videos'

interface ProfileTabsProps {
  posts: Post[]
  currentUserId?: string
  /** Shown on the Posts tab when there are none. */
  emptyPostsLabel: string
  onDeleted?: (id: string) => void
}

export function ProfileTabs({
  posts,
  currentUserId,
  emptyPostsLabel,
  onDeleted,
}: ProfileTabsProps) {
  const t = useTranslations('posts')
  const [tab, setTab] = useState<Tab>('posts')

  // Flatten media across all posts for the Photos / Videos galleries.
  const photos = posts.flatMap((p) => p.media.filter((m) => m.type === 'IMAGE'))
  const videos = posts.flatMap((p) => p.media.filter((m) => m.type === 'VIDEO'))

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'posts', label: t('tabPosts') },
    { key: 'photos', label: t('tabPhotos') },
    { key: 'videos', label: t('tabVideos') },
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
    </div>
  )
}
