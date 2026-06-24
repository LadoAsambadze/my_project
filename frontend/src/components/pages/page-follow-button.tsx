'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import {
  FOLLOW_PAGE_MUTATION,
  UNFOLLOW_PAGE_MUTATION,
} from '@/graphql/pages/mutations'
import { Button } from '@/components/ui/button'

interface PageFollowButtonProps {
  pageId: string
  /** Current follow state — driven by the cached Page, flips after the mutation. */
  isFollowing: boolean
  size?: 'default' | 'sm'
  className?: string
}

export function PageFollowButton({
  pageId,
  isFollowing,
  size = 'default',
  className,
}: PageFollowButtonProps) {
  const t = useTranslations('pages')

  // Both mutations return the page with refreshed followersCount + isFollowedByMe,
  // which Apollo writes back to the normalized Page, re-rendering this button.
  const [follow, { loading: following }] = useMutation(FOLLOW_PAGE_MUTATION, {
    variables: { pageId },
  })
  const [unfollow, { loading: unfollowing }] = useMutation(
    UNFOLLOW_PAGE_MUTATION,
    { variables: { pageId } },
  )
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
