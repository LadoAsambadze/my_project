'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import {
  Banknote,
  CalendarDays,
  MapPin,
  Megaphone,
  Trash2,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { RequestItem } from '@/graphql/types'
import { DELETE_REQUEST_MUTATION } from '@/graphql/requests/operations'
import { PAGE_TYPE_ICONS } from '@/lib/page-types'
import { formatTimeAgo } from '@/lib/time'
import { Avatar } from '@/components/profile/avatar'
import { EngagementBar } from '@/components/engagement/engagement-bar'

interface RequestCardProps {
  request: RequestItem
  currentUserId?: string
  /** Called after a successful delete so the parent can refresh its list. */
  onDeleted?: (id: string) => void
}

/**
 * A demand post: "@nino is looking for a Photographer" + structured chips
 * (occasion, date, city, budget) + free text. Vendors answer in the comments.
 */
export function RequestCard({
  request,
  currentUserId,
  onDeleted,
}: RequestCardProps) {
  const t = useTranslations('requests')
  const tt = useTranslations('pageTypes')
  const to = useTranslations('designOccasions')
  const locale = useLocale()

  const [deleteRequest, { loading: deleting }] = useMutation(
    DELETE_REQUEST_MUTATION,
    {
      variables: { id: request.id },
      onCompleted: () => onDeleted?.(request.id),
    },
  )

  const { author } = request
  const name = author.username
    ? `@${author.username}`
    : [author.firstName, author.lastName].filter(Boolean).join(' ') || '—'
  const href = author.username ? `/u/${author.username}` : '/profile'
  const isMine = currentUserId === author.id
  const CategoryIcon = PAGE_TYPE_ICONS[request.category]

  const budget =
    request.budgetFrom !== null || request.budgetTo !== null
      ? [request.budgetFrom, request.budgetTo]
          .filter((v) => v !== null)
          .join('–')
      : null

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link href={href}>
          <Avatar src={author.avatarUrl} name={name} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <Link href={href} className="font-semibold hover:underline">
              {name}
            </Link>{' '}
            <span className="text-muted-foreground">{t('isLookingFor')}</span>
          </p>
          <time
            dateTime={request.createdAt}
            className="text-xs text-muted-foreground"
          >
            {formatTimeAgo(request.createdAt, locale)}
          </time>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          <Megaphone className="h-3.5 w-3.5" />
          {t('badge')}
        </span>
        {isMine && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (window.confirm(t('deleteConfirm'))) void deleteRequest()
            }}
            aria-label={t('delete')}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Structured chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          <CategoryIcon className="h-3.5 w-3.5" />
          {tt(request.category)}
        </span>
        {request.occasion && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {to(request.occasion)}
          </span>
        )}
        {request.eventDate && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Intl.DateTimeFormat(locale, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(request.eventDate))}
          </span>
        )}
        {request.city && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {request.city}
          </span>
        )}
        {budget && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <Banknote className="h-3.5 w-3.5" />
            {budget} ₾
          </span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm">
        {request.body}
      </p>

      <div className="mt-3">
        <EngagementBar
          target="REQUEST"
          targetId={request.id}
          likesCount={request.likesCount}
          likedByMe={request.likedByMe}
          commentsCount={request.commentsCount}
          currentUserId={currentUserId}
        />
      </div>
    </article>
  )
}
