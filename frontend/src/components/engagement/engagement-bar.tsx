'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import { Heart, Loader2, MessageCircle, SendHorizontal, Trash2 } from 'lucide-react'
import {
  LIKE_MUTATION,
  UNLIKE_MUTATION,
  COMMENTS_QUERY,
  ADD_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
} from '@/graphql/engagement/operations'
import type { CommentItem, ContentTarget } from '@/graphql/types'
import { formatTimeAgo } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'

interface CommentsData {
  comments: CommentItem[]
}

interface EngagementBarProps {
  target: ContentTarget
  targetId: string
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
  currentUserId?: string
}

/**
 * The like + comment row shown at the bottom of every content card. Likes
 * toggle optimistically; the comment list loads lazily on first expand.
 */
export function EngagementBar({
  target,
  targetId,
  likesCount = 0,
  likedByMe = false,
  commentsCount = 0,
  currentUserId,
}: EngagementBarProps) {
  const t = useTranslations('engagement')
  const locale = useLocale()

  // Local optimistic state, seeded from the fragment data.
  const [liked, setLiked] = useState(likedByMe)
  const [likes, setLikes] = useState(likesCount)
  const [commentCount, setCommentCount] = useState(commentsCount)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const [likeMutation] = useMutation(LIKE_MUTATION)
  const [unlikeMutation] = useMutation(UNLIKE_MUTATION)

  const toggleLike = () => {
    // Optimistic flip; reconciled by the mutation result below.
    const next = !liked
    setLiked(next)
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)))
    const variables = { target, targetId }
    interface LikePayload {
      likesCount: number
      likedByMe: boolean
    }
    void (next
      ? likeMutation({ variables })
      : unlikeMutation({ variables })
    ).then((res) => {
      const result = res.data as
        | { like?: LikePayload; unlike?: LikePayload }
        | null
        | undefined
      const payload = result?.like ?? result?.unlike
      if (payload) {
        setLikes(payload.likesCount)
        setLiked(payload.likedByMe)
      }
    })
  }

  const [loadComments, { data, loading, refetch }] =
    useLazyQuery<CommentsData>(COMMENTS_QUERY, {
      fetchPolicy: 'cache-and-network',
    })

  const toggleComments = () => {
    const next = !open
    setOpen(next)
    if (next) void loadComments({ variables: { target, targetId } })
  }

  const [addComment, { loading: sending }] = useMutation(
    ADD_COMMENT_MUTATION,
    {
      onCompleted: () => {
        setDraft('')
        setCommentCount((n) => n + 1)
        void refetch()
      },
    },
  )

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    onCompleted: () => {
      setCommentCount((n) => Math.max(0, n - 1))
      void refetch()
    },
  })

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    void addComment({ variables: { input: { target, targetId, body } } })
  }

  const comments = (data?.comments ?? []) as CommentItem[]

  return (
    <div className="border-t border-border pt-2">
      {/* Action row */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
            liked ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          {likes > 0 ? likes : t('like')}
        </button>
        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="h-4 w-4" />
          {commentCount > 0 ? commentCount : t('comment')}
        </button>
      </div>

      {/* Comments */}
      {open && (
        <div className="mt-2 flex flex-col gap-3">
          {loading && comments.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              {t('loading')}
            </p>
          ) : comments.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              {t('noComments')}
            </p>
          ) : (
            comments.map((comment) => {
              const name = comment.author.username
                ? `@${comment.author.username}`
                : [comment.author.firstName, comment.author.lastName]
                    .filter(Boolean)
                    .join(' ') || '—'
              return (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar
                    src={comment.author.avatarUrl}
                    name={name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1 rounded-lg bg-secondary px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-semibold">
                        {name}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatTimeAgo(comment.createdAt, locale)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {comment.body}
                    </p>
                  </div>
                  {currentUserId === comment.author.id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t('deleteConfirm'))) {
                          void deleteComment({
                            variables: { id: comment.id },
                          })
                        }
                      }}
                      aria-label={t('delete')}
                      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })
          )}

          {/* Composer */}
          <form onSubmit={submitComment} className="flex items-center gap-2">
            <input
              value={draft}
              maxLength={2000}
              placeholder={t('placeholder')}
              onChange={(e) => setDraft(e.target.value)}
              className="h-9 min-w-0 flex-1 rounded-full border border-input bg-transparent px-3.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label={t('send')}
              className="shrink-0 rounded-full bg-primary p-2 text-primary-foreground transition-opacity disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
