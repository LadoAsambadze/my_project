'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { CREATE_PAGE_MUTATION } from '@/graphql/pages/mutations'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import type { Page, PageType } from '@/graphql/types'
import { PAGE_TYPES, PAGE_TYPE_ICONS } from '@/lib/page-types'
import { uploadFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreatePageData {
  createPage: Page
}

export function CreatePageForm() {
  const t = useTranslations('pages')
  const tt = useTranslations('pageTypes')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // A page can offer several services at once, so types is a toggleable list.
  const [types, setTypes] = useState<PageType[]>([])
  const [name, setName] = useState('')

  const toggleType = (value: PageType) =>
    setTypes((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value],
    )
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

  const canSubmit =
    !creating && !uploading && types.length > 0 && name.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    void createPage({
      variables: {
        input: { name: name.trim(), types, photoUrl: photoUrl ?? null },
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Vendor types (one or more) */}
      <div className="flex flex-col gap-1.5">
        <Label>{t('type')}</Label>
        <p className="text-xs text-muted-foreground">{t('typesHint')}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAGE_TYPES.map((value) => {
            const Icon = PAGE_TYPE_ICONS[value]
            const selected = types.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleType(value)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-lg border bg-background p-4 text-center text-xs font-medium transition-colors hover:bg-accent',
                  selected ? 'border-primary bg-accent' : 'border-border',
                )}
              >
                <Icon className="h-6 w-6 text-primary" />
                {tt(value)}
              </button>
            )
          })}
        </div>
      </div>

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
