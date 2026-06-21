'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { MY_PROFILE_QUERY } from '@/graphql/users/queries'
import type { AuthUser } from '@/graphql/types'
import { ProfileCard } from '@/components/profile/profile-card'

interface MyProfileData {
  me: AuthUser
}

export default function ProfilePage() {
  const tc = useTranslations('common')

  const { data, loading } = useQuery<MyProfileData>(MY_PROFILE_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  if (loading && !data?.me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  if (!data?.me) return null

  return <ProfileCard user={data.me} />
}
