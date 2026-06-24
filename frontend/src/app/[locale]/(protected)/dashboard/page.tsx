'use client'

import { useTranslations } from 'next-intl'
import { CalendarHeart, Flower, Mail } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { MY_PROFILE_QUERY } from '@/graphql/users/queries'
import { FEED_QUERY } from '@/graphql/posts/queries'
import type { AuthUser, Post } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { PostComposer } from '@/components/posts/post-composer'
import { PostFeed } from '@/components/posts/post-feed'

interface MyProfileData {
  me: AuthUser
}

interface FeedData {
  feed: Post[]
}

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
  const posts = data?.feed ?? []

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
          <PostFeed
            posts={posts}
            currentUserId={user?.id}
            emptyLabel={tp('feedEmpty')}
            onDeleted={() => void refetch()}
          />
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
