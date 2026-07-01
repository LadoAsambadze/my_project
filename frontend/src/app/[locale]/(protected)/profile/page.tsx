'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { MY_PROFILE_QUERY } from '@/graphql/users/queries'
import { USER_POSTS_QUERY } from '@/graphql/posts/queries'
import { USER_EVENTS_QUERY } from '@/graphql/events/queries'
import type { AuthUser, EventItem, Post } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { PostComposer } from '@/components/posts/post-composer'
import { EventComposer } from '@/components/events/event-composer'
import { ProfileTabs } from '@/components/posts/profile-tabs'

interface MyProfileData {
  me: AuthUser
}

interface UserPostsData {
  userPosts: Post[]
}

interface UserEventsData {
  userEvents: EventItem[]
}

export default function ProfilePage() {
  const tc = useTranslations('common')
  const t = useTranslations('posts')

  const { data, loading } = useQuery<MyProfileData>(MY_PROFILE_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const me = data?.me
  const username = me?.username ?? ''

  const { data: postsData, refetch } = useQuery<UserPostsData>(
    USER_POSTS_QUERY,
    {
      variables: { username },
      skip: !username,
      fetchPolicy: 'cache-and-network',
    },
  )

  const { data: eventsData, refetch: refetchEvents } =
    useQuery<UserEventsData>(USER_EVENTS_QUERY, {
      variables: { username },
      skip: !username,
      fetchPolicy: 'cache-and-network',
    })

  if (loading && !me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  if (!me) return null

  const posts = postsData?.userPosts ?? []
  const events = eventsData?.userEvents ?? []

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left column: profile card, pinned. */}
        <aside>
          <div className="lg:sticky lg:top-20">
            <ProfileCard
              user={me}
              canManage
              className="w-full max-w-none px-0 py-0"
            />
          </div>
        </aside>

        {/* Right column: composer + the user's posts feed. */}
        <section className="flex flex-col gap-6">
          <PostComposer onCreated={() => void refetch()} />
          <ProfileTabs
            posts={posts}
            events={events}
            currentUserId={me.id}
            emptyPostsLabel={t('empty')}
            onDeleted={() => void refetch()}
            onEventDeleted={() => void refetchEvents()}
            eventComposer={
              <EventComposer onCreated={() => void refetchEvents()} />
            }
          />
        </section>
      </div>
    </div>
  )
}
