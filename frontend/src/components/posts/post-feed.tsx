'use client'

import type { Post } from '@/graphql/types'
import { PostCard } from '@/components/posts/post-card'

interface PostFeedProps {
  posts: Post[]
  currentUserId?: string
  emptyLabel: string
  onDeleted?: (id: string) => void
}

export function PostFeed({
  posts,
  currentUserId,
  emptyLabel,
  onDeleted,
}: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  )
}
