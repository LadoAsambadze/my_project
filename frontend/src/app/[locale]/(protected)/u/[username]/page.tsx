'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { USER_PROFILE_QUERY } from '@/graphql/users/queries'
import { USER_POSTS_QUERY } from '@/graphql/posts/queries'
import { USER_EVENTS_QUERY } from '@/graphql/events/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { AuthUser, EventItem, Post } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { FollowButton } from '@/components/profile/follow-button'
import { EventComposer } from '@/components/events/event-composer'
import { ProfileTabs } from '@/components/posts/profile-tabs'

interface UserProfileData {
  user: AuthUser
}

interface UserPostsData {
  userPosts: Post[]
}

interface UserEventsData {
  userEvents: EventItem[]
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const username = String(params.username ?? '')
  const tc = useTranslations('common')
  const t = useTranslations('profile')
  const tp = useTranslations('posts')
  const { user: me } = useAuth()

  const { data, loading, error } = useQuery<UserProfileData>(
    USER_PROFILE_QUERY,
    {
      variables: { username },
      fetchPolicy: 'cache-and-network',
    },
  )

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

  if (loading && !data?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  if (error || !data?.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{t('userNotFound')}</div>
      </div>
    )
  }

  const profile = data.user
  const isSelf = me?.id === profile.id
  const posts = postsData?.userPosts ?? []
  const events = eventsData?.userEvents ?? []

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left column: profile card + follow action, pinned. */}
        <aside>
          <div className="lg:sticky lg:top-20">
            <ProfileCard
              user={profile}
              canManage={isSelf}
              className="w-full max-w-none px-0 py-0"
              action={
                isSelf ? undefined : (
                  <FollowButton
                    userId={profile.id}
                    isFollowing={!!profile.isFollowedByMe}
                    className="w-full"
                  />
                )
              }
            />
          </div>
        </aside>

        {/* Right column: this user's posts feed. */}
        <section>
          <ProfileTabs
            posts={posts}
            events={events}
            currentUserId={me?.id}
            emptyPostsLabel={tp('empty')}
            onDeleted={() => void refetch()}
            onEventDeleted={() => void refetchEvents()}
            eventComposer={
              isSelf ? (
                <EventComposer onCreated={() => void refetchEvents()} />
              ) : undefined
            }
          />
        </section>
      </div>
    </div>
  )
}
