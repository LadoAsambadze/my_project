'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Post } from '@/graphql/types'
import { DELETE_POST_MUTATION } from '@/graphql/posts/mutations'
import { Avatar } from '@/components/profile/avatar'
import { PageTypeBadges } from '@/components/pages/page-type-badges'
import { PostMediaView } from '@/components/posts/post-media'

function formatTimeAgo(iso: string, locale: string): string {
  const date = new Date(iso)
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]
  for (const [unit, secs] of units) {
    if (seconds >= secs) return rtf.format(-Math.floor(seconds / secs), unit)
  }
  return rtf.format(-Math.max(seconds, 1), 'second')
}

interface PostCardProps {
  post: Post
  /** Signed-in user's id — shows the delete button on their own posts. */
  currentUserId?: string
  /** Called after a successful delete so the parent can refresh its list. */
  onDeleted?: (id: string) => void
}

export function PostCard({ post, currentUserId, onDeleted }: PostCardProps) {
  const t = useTranslations('posts')
  const locale = useLocale()

  const [deletePost, { loading: deleting }] = useMutation(DELETE_POST_MUTATION, {
    variables: { id: post.id },
    onCompleted: () => onDeleted?.(post.id),
  })

  const { author, page } = post
  const authorName = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  // A post published as a page shows the page's identity; otherwise the
  // personal author's. The delete control still keys off the actual author.
  const displayName = page
    ? page.name
    : author.username
      ? `@${author.username}`
      : authorName || t('someone')
  const displayAvatar = page ? page.photoUrl : author.avatarUrl
  const displayHref = page
    ? `/pages/${page.id}`
    : author.username
      ? `/u/${author.username}`
      : '/profile'
  const isMine = currentUserId === author.id

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-center gap-3">
        <Link href={displayHref}>
          <Avatar src={displayAvatar} name={displayName} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={displayHref} className="min-w-0 hover:underline">
              <span className="block truncate text-sm font-semibold">
                {displayName}
              </span>
            </Link>
            {page && (
              <PageTypeBadges
                types={page.types}
                size="sm"
                className="shrink-0"
              />
            )}
          </div>
          <time
            dateTime={post.createdAt}
            className="text-xs text-muted-foreground"
          >
            {formatTimeAgo(post.createdAt, locale)}
          </time>
        </div>
        {isMine && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (window.confirm(t('deleteConfirm'))) void deletePost()
            }}
            aria-label={t('delete')}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {post.body && (
        <p className="mt-3 whitespace-pre-wrap break-words text-sm">
          {post.body}
        </p>
      )}

      {post.media.length > 0 && (
        <div className="mt-3">
          <PostMediaView media={post.media} />
        </div>
      )}
    </article>
  )
}
