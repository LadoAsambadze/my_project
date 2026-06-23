'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { CREATE_POST_MUTATION } from '@/graphql/posts/mutations'
import { uploadFile, type UploadedMedia } from '@/lib/upload'
import { useAuth } from '@/lib/auth/auth-context'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'

interface PostComposerProps {
  /** Called after a post is created so the parent can refresh its list. */
  onCreated?: () => void
}

export function PostComposer({ onCreated }: PostComposerProps) {
  const t = useTranslations('posts')
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [body, setBody] = useState('')
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createPost, { loading: posting }] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => {
      setBody('')
      setMedia([])
      setError(null)
      onCreated?.()
    },
    onError: (err) => setError(err.message || t('createError')),
  })

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadFile(file)),
      )
      setMedia((prev) => [...prev, ...uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeMedia = (url: string) =>
    setMedia((prev) => prev.filter((m) => m.url !== url))

  const canSubmit =
    !posting && !uploading && (body.trim().length > 0 || media.length > 0)

  const handleSubmit = () => {
    if (!canSubmit) return
    void createPost({
      variables: {
        input: {
          body: body.trim() || null,
          media: media.map((m) => ({ url: m.url, type: m.type })),
        },
      },
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar
          src={user?.avatarUrl}
          name={user?.username || user?.email || '?'}
          size="sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('composerPlaceholder')}
          rows={3}
          maxLength={5000}
          className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {media.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {media.map((m) => (
            <div
              key={m.url}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              {m.type === 'IMAGE' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <video src={m.url} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeMedia(m.url)}
                aria-label={t('remove')}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-opacity hover:bg-black/80"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={uploading || posting}
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {t('addMedia')}
        </Button>
        <Button type="button" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
          {posting ? t('posting') : t('post')}
        </Button>
      </div>
    </div>
  )
}
