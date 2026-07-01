'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Loader2 } from 'lucide-react'
import { FEED_PAGE_QUERY } from '@/graphql/feed/queries'
import type { FeedPage } from '@/graphql/types'
import { FeedStory } from '@/components/feed/feed-story'

const PAGE_SIZE = 12

interface FeedData {
  feedPage: FeedPage
}

interface FeedListProps {
  currentUserId?: string
  /** Bumped by the parent to force a refetch (e.g. after composing). */
  refreshKey?: number
}

/**
 * The unified news feed: cursor-paginated stories with infinite scroll (an
 * IntersectionObserver sentinel triggers fetchMore near the bottom).
 */
export function FeedList({ currentUserId, refreshKey }: FeedListProps) {
  const t = useTranslations('posts')
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, loading, fetchMore, refetch } = useQuery<FeedData>(
    FEED_PAGE_QUERY,
    {
      variables: { limit: PAGE_SIZE },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  )

  // Parent-driven refresh (after creating a post/request).
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) void refetch()
  }, [refreshKey, refetch])

  const feed = data?.feedPage
  const items = feed?.items ?? []

  // Infinite scroll: load the next page when the sentinel becomes visible.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !feed?.hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || loading || !feed.nextCursor) return
        void fetchMore({
          variables: { cursor: feed.nextCursor, limit: PAGE_SIZE },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev
            return {
              feedPage: {
                ...fetchMoreResult.feedPage,
                items: [
                  ...prev.feedPage.items,
                  ...fetchMoreResult.feedPage.items,
                ],
              },
            }
          },
        })
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [feed?.hasMore, feed?.nextCursor, loading, fetchMore])

  if (items.length === 0) {
    return loading ? (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </div>
    ) : (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t('feedEmpty')}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <FeedStory
          key={`${item.__typename}-${item.id}`}
          item={item}
          currentUserId={currentUserId}
          onDeleted={() => void refetch()}
        />
      ))}
      {feed?.hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
