'use client'

import { Link } from '@/i18n/navigation'
import type { FollowUser } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { FollowButton } from '@/components/profile/follow-button'

interface FollowListProps {
  users: FollowUser[]
  /** The signed-in user's id, so we hide the Follow button on their own row. */
  currentUserId?: string
  emptyLabel: string
}

export function FollowList({
  users,
  currentUserId,
  emptyLabel,
}: FollowListProps) {
  if (users.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {users.map((u) => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
        const isSelf = currentUserId === u.id
        return (
          <li key={u.id} className="flex items-center gap-3 py-3">
            <Link
              href={u.username ? `/u/${u.username}` : '/profile'}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <Avatar src={u.avatarUrl} name={u.username || name || '?'} size="sm" />
              <div className="min-w-0">
                {u.username && (
                  <p className="truncate text-sm font-semibold">
                    @{u.username}
                  </p>
                )}
                {name && (
                  <p className="truncate text-xs text-muted-foreground">
                    {name}
                  </p>
                )}
              </div>
            </Link>
            {!isSelf && (
              <FollowButton
                userId={u.id}
                isFollowing={!!u.isFollowedByMe}
                size="sm"
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
