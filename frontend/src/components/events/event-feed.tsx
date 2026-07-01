'use client'

import { useTranslations } from 'next-intl'
import type { EventItem } from '@/graphql/types'
import { EventCard } from '@/components/events/event-card'

interface EventFeedProps {
  events: EventItem[]
  currentUserId?: string
  emptyLabel: string
  onDeleted?: (id: string) => void
}

/** Events split into Upcoming (soonest first) and Past (most recent first). */
export function EventFeed({
  events,
  currentUserId,
  emptyLabel,
  onDeleted,
}: EventFeedProps) {
  const t = useTranslations('events')

  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  const now = Date.now()
  const upcoming = events
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
  const past = events
    .filter((e) => new Date(e.startsAt).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    )

  return (
    <div className="flex flex-col gap-4">
      {upcoming.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t('upcoming')}
          </h3>
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
            />
          ))}
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t('pastSection')}
          </h3>
          {past.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              currentUserId={currentUserId}
              onDeleted={onDeleted}
            />
          ))}
        </>
      )}
    </div>
  )
}
