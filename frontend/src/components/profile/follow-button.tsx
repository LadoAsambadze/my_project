'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { FOLLOW_MUTATION, UNFOLLOW_MUTATION } from '@/graphql/users/mutations'
import { Button } from '@/components/ui/button'

interface FollowButtonProps {
  userId: string
  /** Current follow state — driven by the cached User, flips after the mutation. */
  isFollowing: boolean
  size?: 'default' | 'sm'
  className?: string
}

export function FollowButton({
  userId,
  isFollowing,
  size = 'default',
  className,
}: FollowButtonProps) {
  const t = useTranslations('profile')

  // Both mutations return the user with refreshed followersCount + isFollowedByMe,
  // which Apollo writes back to the normalized User, re-rendering this button.
  const [follow, { loading: following }] = useMutation(FOLLOW_MUTATION, {
    variables: { userId },
  })
  const [unfollow, { loading: unfollowing }] = useMutation(UNFOLLOW_MUTATION, {
    variables: { userId },
  })
  const loading = following || unfollowing

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'default'}
      size={size}
      className={className}
      disabled={loading}
      onClick={() => void (isFollowing ? unfollow() : follow())}
    >
      {isFollowing ? t('unfollow') : t('follow')}
    </Button>
  )
}
