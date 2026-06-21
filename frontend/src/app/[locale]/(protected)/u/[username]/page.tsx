'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { USER_PROFILE_QUERY } from '@/graphql/users/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { AuthUser } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'
import { FollowButton } from '@/components/profile/follow-button'

interface UserProfileData {
  user: AuthUser
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const username = String(params.username ?? '')
  const tc = useTranslations('common')
  const t = useTranslations('profile')
  const { user: me } = useAuth()

  const { data, loading, error } = useQuery<UserProfileData>(
    USER_PROFILE_QUERY,
    {
      variables: { username },
      fetchPolicy: 'cache-and-network',
    },
  )

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

  return (
    <ProfileCard
      user={profile}
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
  )
}
