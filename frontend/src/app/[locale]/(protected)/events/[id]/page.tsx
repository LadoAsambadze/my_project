'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Pencil } from 'lucide-react'
import { EVENT_QUERY } from '@/graphql/events/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { EventItem } from '@/graphql/types'
import { Link } from '@/i18n/navigation'
import { EventCard } from '@/components/events/event-card'
import { EventComposer } from '@/components/events/event-composer'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'

interface EventData {
  event: EventItem
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params.id ?? '')
  const t = useTranslations('events')
  const tc = useTranslations('common')
  const locale = useLocale()
  const { user: me } = useAuth()
  const [editing, setEditing] = useState(false)

  const { data, loading, error, refetch } = useQuery<EventData>(EVENT_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data?.event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  if (error || !data?.event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{t('notFound')}</div>
      </div>
    )
  }

  const event = data.event
  const isMine = me?.id === event.author.id
  const attendees = event.attendees ?? []

  // The host line: the page identity when hosted as a page, else the author.
  const hostName = event.page
    ? event.page.name
    : event.author.username
      ? `@${event.author.username}`
      : [event.author.firstName, event.author.lastName]
          .filter(Boolean)
          .join(' ') || '—'
  const hostHref = event.page
    ? `/pages/${event.page.id}`
    : event.author.username
      ? `/u/${event.author.username}`
      : '/profile'
  const hostAvatar = event.page ? event.page.photoUrl : event.author.avatarUrl

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {editing ? (
        <EventComposer
          initial={event}
          onCreated={() => {
            setEditing(false)
            void refetch()
          }}
          onCancelEdit={() => setEditing(false)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <EventCard event={event} currentUserId={me?.id} />

          {/* Host */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <Link href={hostHref} className="flex items-center gap-3">
              <Avatar src={hostAvatar} name={hostName} size="md" />
              <div>
                <p className="text-xs text-muted-foreground">{t('hostedBy')}</p>
                <p className="text-sm font-semibold hover:underline">
                  {hostName}
                </p>
              </div>
            </Link>
            {isMine && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                {t('edit')}
              </Button>
            )}
          </div>

          {/* Attendees */}
          {attendees.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">
                {t('attendeesTitle', { count: event.goingCount ?? 0 })}
              </h2>
              <div className="flex flex-wrap gap-3">
                {attendees.map((a) => {
                  const name = a.username
                    ? `@${a.username}`
                    : [a.firstName, a.lastName].filter(Boolean).join(' ') ||
                      '—'
                  return (
                    <Link
                      key={a.id}
                      href={a.username ? `/u/${a.username}` : '/profile'}
                      className="flex flex-col items-center gap-1"
                      title={name}
                    >
                      <Avatar src={a.avatarUrl} name={name} size="md" />
                      <span className="max-w-16 truncate text-xs text-muted-foreground">
                        {name}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: 'full',
              timeStyle: 'short',
            }).format(new Date(event.startsAt))}
          </p>
        </div>
      )}
    </div>
  )
}
