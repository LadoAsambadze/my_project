'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { CalendarDays, MapPin, Trash2 } from 'lucide-react'
import type { EventItem } from '@/graphql/types'
import { DELETE_EVENT_MUTATION } from '@/graphql/events/mutations'
import { EVENT_TYPE_ICONS, subtypeIcon } from '@/lib/event-types'

function formatFull(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

interface EventCardProps {
  event: EventItem
  /** Signed-in user's id — shows the delete button on their own events. */
  currentUserId?: string
  /** Called after a successful delete so the parent can refresh its list. */
  onDeleted?: (id: string) => void
}

export function EventCard({ event, currentUserId, onDeleted }: EventCardProps) {
  const t = useTranslations('events')
  const tt = useTranslations('eventTypes')
  const tts = useTranslations('eventSubtypes')
  const locale = useLocale()
  const TypeIcon = EVENT_TYPE_ICONS[event.type]
  const SubIcon = event.subtype ? subtypeIcon(event.subtype) : null

  const [deleteEvent, { loading: deleting }] = useMutation(
    DELETE_EVENT_MUTATION,
    {
      variables: { id: event.id },
      onCompleted: () => onDeleted?.(event.id),
    },
  )

  const start = new Date(event.startsAt)
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(start)
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(start)
  const isMine = currentUserId === event.author.id

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {event.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.coverUrl}
          alt=""
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Date badge */}
          <div className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-md border border-border">
            <span className="w-full bg-primary py-0.5 text-center text-[10px] font-semibold uppercase text-primary-foreground">
              {month}
            </span>
            <span className="py-0.5 text-lg font-bold leading-none">{day}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                <TypeIcon className="h-3 w-3" />
                {tt(event.type)}
              </span>
              {event.subtype && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {SubIcon && <SubIcon className="h-3 w-3" />}
                  {tts(event.subtype)}
                </span>
              )}
            </div>
            <h3 className="break-words text-base font-semibold">
              {event.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <time dateTime={event.startsAt}>
                {formatFull(event.startsAt, locale)}
              </time>
            </p>
            {event.location && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{event.location}</span>
              </p>
            )}
          </div>

          {isMine && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (window.confirm(t('deleteConfirm'))) void deleteEvent()
              }}
              aria-label={t('delete')}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {event.description && (
          <p className="mt-3 whitespace-pre-wrap break-words text-sm">
            {event.description}
          </p>
        )}
      </div>
    </article>
  )
}
