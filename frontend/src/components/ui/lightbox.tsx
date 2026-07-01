'use client'

import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface LightboxMedia {
  url: string
  /** IMAGE by default; VIDEO renders a playable <video>. */
  type?: 'IMAGE' | 'VIDEO'
}

interface LightboxProps {
  media: LightboxMedia[]
  /** Index of the open item, or null when closed. */
  index: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}

/**
 * Full-screen media viewer: backdrop click / Esc closes, arrows and keyboard
 * navigate. Used by every gallery (works, designs, offers, florist items).
 */
export function Lightbox({ media, index, onClose, onNavigate }: LightboxProps) {
  const count = media.length
  const prev = useCallback(() => {
    if (index !== null && count > 0) onNavigate((index - 1 + count) % count)
  }, [index, count, onNavigate])
  const next = useCallback(() => {
    if (index !== null && count > 0) onNavigate((index + 1) % count)
  }, [index, count, onNavigate])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    // Lock body scroll while open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, onClose, prev, next])

  if (index === null || !media[index]) return null
  const item = media[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="Previous"
          className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-5xl"
      >
        {item.type === 'VIDEO' ? (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-h-[85vh] w-auto max-w-full rounded-md"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            className="max-h-[85vh] w-auto max-w-full rounded-md object-contain"
          />
        )}
        {count > 1 && (
          <p className="mt-2 text-center text-xs text-white/70">
            {index + 1} / {count}
          </p>
        )}
      </div>

      {count > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="Next"
          className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
