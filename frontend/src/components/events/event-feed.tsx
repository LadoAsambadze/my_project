'use client'

import type { EventItem } from '@/graphql/types'
import { EventCard } from '@/components/events/event-card'

interface EventFeedProps {
  events: EventItem[]
  currentUserId?: string
  emptyLabel: string
  onDeleted?: (id: string) => void
}

export function EventFeed({
  events,
  currentUserId,
  emptyLabel,
  onDeleted,
}: EventFeedProps) {
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          currentUserId={currentUserId}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}
