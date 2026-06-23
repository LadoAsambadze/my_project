'use client'

import { cn } from '@/lib/utils'
import type { PostMedia } from '@/graphql/types'

// Renders a post's attachments: images in a tidy grid, videos stacked below
// with native controls.
export function PostMediaView({ media }: { media: PostMedia[] }) {
  if (media.length === 0) return null

  const images = media.filter((m) => m.type === 'IMAGE')
  const videos = media.filter((m) => m.type === 'VIDEO')

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div
          className={cn(
            'grid gap-1 overflow-hidden rounded-lg',
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
          )}
        >
          {images.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.id}
              src={m.url}
              alt=""
              className={cn(
                'w-full bg-muted object-cover',
                images.length === 1 ? 'max-h-[32rem]' : 'aspect-square',
              )}
            />
          ))}
        </div>
      )}

      {videos.map((m) => (
        <video
          key={m.id}
          src={m.url}
          controls
          className="max-h-[32rem] w-full rounded-lg bg-black"
        />
      ))}
    </div>
  )
}
