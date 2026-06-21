'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Link } from '@/i18n/navigation'
import { FOLLOWING_QUERY } from '@/graphql/users/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { FollowUser } from '@/graphql/types'
import { FollowList } from '@/components/profile/follow-list'

interface FollowingData {
  user: { id: string; username: string | null; following: FollowUser[] }
}

export default function FollowingPage() {
  const params = useParams<{ username: string }>()
  const username = String(params.username ?? '')
  const tc = useTranslations('common')
  const t = useTranslations('profile')
  const { user: me } = useAuth()

  const { data, loading, error } = useQuery<FollowingData>(FOLLOWING_QUERY, {
    variables: { username },
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

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link
        href={`/u/${data.user.username}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        ← @{data.user.username}
      </Link>
      <h1 className="mb-4 mt-2 text-xl font-bold tracking-tight">
        {t('followingTitle')}
      </h1>
      <FollowList
        users={data.user.following}
        currentUserId={me?.id}
        emptyLabel={t('noFollowing')}
      />
    </div>
  )
}
