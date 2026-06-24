'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { CREATE_PAGE_MUTATION } from '@/graphql/pages/mutations'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import type { Page } from '@/graphql/types'
import { uploadFile } from '@/lib/upload'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreatePageData {
  createPage: Page
}

export function CreatePageForm() {
  const t = useTranslations('pages')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createPage, { loading: creating }] = useMutation<CreatePageData>(
    CREATE_PAGE_MUTATION,
    {
      // Refresh both the "my pages" list and the browse list after creating.
      refetchQueries: [{ query: MY_PAGES_QUERY }, { query: PAGES_QUERY }],
      onCompleted: (data) => router.push(`/pages/${data.createPage.id}`),
      onError: (err) => setError(err.message || t('createError')),
    },
  )

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const uploaded = await uploadFile(file)
      setPhotoUrl(uploaded.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const canSubmit = !creating && !uploading && name.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void createPage({
      variables: {
        input: { name: name.trim(), photoUrl: photoUrl ?? null },
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Photo */}
      <div className="flex flex-col items-center gap-3">
        <Avatar src={photoUrl} name={name || '?'} size="xl" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void handleFile(e.target.files)}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || creating}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {t('addPhoto')}
          </Button>
          {photoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPhotoUrl(null)}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
              {t('removePhoto')}
            </Button>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="page-name">{t('name')}</Label>
        <Input
          id="page-name"
          value={name}
          maxLength={80}
          placeholder={t('namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {creating ? t('creating') : t('create')}
      </Button>
    </form>
  )
}
