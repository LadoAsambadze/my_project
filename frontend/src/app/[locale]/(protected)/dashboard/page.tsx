'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { CalendarDays } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { MY_PROFILE_QUERY } from '@/graphql/users/queries'
import { EVENTS_FEED_QUERY } from '@/graphql/events/queries'
import { PAGES_QUERY } from '@/graphql/pages/queries'
import type { AuthUser, EventItem, Page } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { PostComposer } from '@/components/posts/post-composer'
import { RequestComposer } from '@/components/requests/request-composer'
import { FeedList } from '@/components/feed/feed-list'
import { PageTypeBadges } from '@/components/pages/page-type-badges'
import { Avatar } from '@/components/profile/avatar'

interface MyProfileData {
  me: AuthUser
}

interface EventsFeedData {
  eventsFeed: EventItem[]
}

interface PagesData {
  pages: Page[]
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const te = useTranslations('events')
  const tp = useTranslations('pages')
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  // Full profile (with follower/following counts) for the left-hand card;
  // fall back to the lightweight auth user until it loads.
  const { data: profileData } = useQuery<MyProfileData>(MY_PROFILE_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const me = profileData?.me ?? user

  // Right rail: a few upcoming events and pages to discover.
  const { data: eventsData } = useQuery<EventsFeedData>(EVENTS_FEED_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const upcoming = (eventsData?.eventsFeed ?? [])
    .filter((e) => new Date(e.startsAt).getTime() >= Date.now())
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, 4)

  const { data: pagesData } = useQuery<PagesData>(PAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const suggestedPages = (pagesData?.pages ?? [])
    .filter((p) => p.owner.id !== user?.id)
    .slice(0, 4)

  const refreshFeed = () => setRefreshKey((k) => k + 1)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        {/* Left column: profile card, pinned. */}
        <aside className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-20">
            {me && (
              <ProfileCard
                user={me}
                canManage
                className="w-full max-w-none px-0 py-0"
              />
            )}
          </div>
        </aside>

        {/* Center column: composers + the unified news feed. */}
        <section className="order-1 flex flex-col gap-4 lg:order-2">
          <PostComposer onCreated={refreshFeed} />
          <RequestComposer onCreated={refreshFeed} />
          <FeedList currentUserId={user?.id} refreshKey={refreshKey} />
        </section>

        {/* Right column: upcoming events + pages to discover. */}
        <aside className="order-3">
          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            {/* Upcoming events */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{te('upcoming')}</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">{te('empty')}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {upcoming.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.id}`}
                        className="-mx-1.5 flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-accent"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <CalendarDays className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {event.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat(undefined, {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(event.startsAt))}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pages to discover */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">{tp('discover')}</h2>
              {suggestedPages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('noSuggestions')}
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {suggestedPages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={`/pages/${page.id}`}
                        className="-mx-1.5 flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-accent"
                      >
                        <Avatar
                          src={page.photoUrl}
                          name={page.name}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {page.name}
                          </span>
                          <PageTypeBadges types={page.types} size="sm" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
