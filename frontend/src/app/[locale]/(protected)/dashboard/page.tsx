'use client'

import { useTranslations } from 'next-intl'
import { CalendarHeart, Flower, Mail } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { MY_PROFILE_QUERY } from '@/graphql/users/queries'
import { FEED_QUERY } from '@/graphql/posts/queries'
import { EVENTS_FEED_QUERY } from '@/graphql/events/queries'
import type { AuthUser, EventItem, Post } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { PostComposer } from '@/components/posts/post-composer'
import { PostCard } from '@/components/posts/post-card'
import { EventCard } from '@/components/events/event-card'

interface MyProfileData {
  me: AuthUser
}

interface FeedData {
  feed: Post[]
}

interface EventsFeedData {
  eventsFeed: EventItem[]
}

// One news-feed story: a post or an event, interleaved by creation time.
type FeedEntry =
  | { kind: 'post'; createdAt: string; post: Post }
  | { kind: 'event'; createdAt: string; event: EventItem }

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tp = useTranslations('posts')
  const { user } = useAuth()

  // Full profile (with follower/following counts) for the left-hand card;
  // fall back to the lightweight auth user until it loads.
  const { data: profileData } = useQuery<MyProfileData>(MY_PROFILE_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const me = profileData?.me ?? user

  const { data, refetch } = useQuery<FeedData>(FEED_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const { data: eventsData, refetch: refetchEvents } =
    useQuery<EventsFeedData>(EVENTS_FEED_QUERY, {
      fetchPolicy: 'cache-and-network',
    })
  const posts = data?.feed ?? []
  const events = eventsData?.eventsFeed ?? []

  // Interleave posts and events into one stream, newest first — an event shows
  // up in the feed when it's created, just like a post.
  const entries: FeedEntry[] = [
    ...posts.map(
      (post): FeedEntry => ({ kind: 'post', createdAt: post.createdAt, post }),
    ),
    ...events.map(
      (event): FeedEntry => ({
        kind: 'event',
        createdAt: event.createdAt,
        event,
      }),
    ),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const quickActions = [
    { icon: CalendarHeart, title: t('newParty'), body: t('newPartyDesc') },
    { icon: Flower, title: t('orderFlowers'), body: t('orderFlowersDesc') },
    {
      icon: Mail,
      title: t('writeInvitations'),
      body: t('writeInvitationsDesc'),
    },
  ]

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

        {/* Center column: the news feed, from the top. */}
        <section className="order-1 flex flex-col gap-4 lg:order-2">
          <PostComposer onCreated={() => void refetch()} />
          {entries.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {tp('feedEmpty')}
            </p>
          ) : (
            entries.map((entry) =>
              entry.kind === 'post' ? (
                <PostCard
                  key={`post-${entry.post.id}`}
                  post={entry.post}
                  currentUserId={user?.id}
                  onDeleted={() => void refetch()}
                />
              ) : (
                <EventCard
                  key={`event-${entry.event.id}`}
                  event={entry.event}
                  currentUserId={user?.id}
                  onDeleted={() => void refetchEvents()}
                />
              ),
            )
          )}
        </section>

        {/* Right column: quick-action cards (events, flowers, invitations). */}
        <aside className="order-3">
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            {quickActions.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="flex items-start gap-3 pt-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
