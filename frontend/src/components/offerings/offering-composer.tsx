'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { ChevronLeft, ImagePlus, Loader2, Music, X } from 'lucide-react'
import { CREATE_OFFERING_MUTATION } from '@/graphql/offerings/mutations'
import type { PageType } from '@/graphql/types'
import { uploadFile } from '@/lib/upload'
import { offeringKindsFor, offeringKindIcon } from '@/lib/offering-kinds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX_PHOTOS = 10

interface OfferingComposerProps {
  /** The musician/equipment page the offering is published under. */
  pageId: string
  /** The page's vendor types — drives which kind options are offered. */
  pageTypes: PageType[]
  /** Called after an offering is created so the parent can refresh its list. */
  onCreated?: () => void
}

export function OfferingComposer({
  pageId,
  pageTypes,
  onCreated,
}: OfferingComposerProps) {
  const t = useTranslations('offerings')
  const tk = useTranslations('offeringKinds')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  // Kind is null until its card is picked — the details form stays hidden.
  const [kind, setKind] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const kinds = offeringKindsFor(pageTypes)

  const reset = () => {
    setOpen(false)
    setKind(null)
    setTitle('')
    setPrice('')
    setDescription('')
    setImageUrls([])
    setError(null)
  }

  const [createOffering, { loading: creating }] = useMutation(
    CREATE_OFFERING_MUTATION,
    {
      onCompleted: () => {
        reset()
        onCreated?.()
      },
      onError: (err) => setError(err.message || t('createError')),
    },
  )

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_PHOTOS - imageUrls.length
    const selected = Array.from(files).slice(0, room)
    setError(null)
    setUploading(true)
    try {
      for (const file of selected) {
        const uploaded = await uploadFile(file)
        setImageUrls((prev) => [...prev, uploaded.url])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const canSubmit =
    !creating &&
    !uploading &&
    kind !== null &&
    title.trim().length >= 2 &&
    imageUrls.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || kind === null) return
    const parsedPrice = Number.parseInt(price, 10)
    void createOffering({
      variables: {
        input: {
          pageId,
          title: title.trim(),
          kind,
          description: description.trim() || null,
          priceFrom: Number.isNaN(parsedPrice) ? null : parsedPrice,
          imageUrls,
        },
      },
    })
  }

  // 1. Collapsed — just the trigger.
  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Music className="h-4 w-4" />
        {t('create')}
      </Button>
    )
  }

  // 2. Kind picker — nothing else is shown until a kind is chosen.
  if (kind === null) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('chooseKind')}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            {t('cancel')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kinds.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-5 text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              <Icon className="h-7 w-7 text-primary" />
              {tk(id)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 3. Details form — after the kind is chosen.
  const KindIcon = offeringKindIcon(kind)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      {/* Chosen kind + change */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          <KindIcon className="h-3.5 w-3.5" />
          {tk(kind)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setKind(null)}
          disabled={creating}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('changeKind')}
        </Button>
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url) => (
              <div
                key={url}
                className="relative overflow-hidden rounded-md border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full bg-muted object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((u) => u !== url))
                  }
                  aria-label={t('removePhoto')}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {imageUrls.length < MAX_PHOTOS && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading || creating}
            onClick={() => fileInputRef.current?.click()}
            className="self-start text-muted-foreground"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {t('addPhotos')}
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offering-title">{t('title')}</Label>
        <Input
          id="offering-title"
          value={title}
          maxLength={120}
          placeholder={t('titlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Starting price */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offering-price">{t('price')}</Label>
        <Input
          id="offering-price"
          type="number"
          min={0}
          step={1}
          value={price}
          placeholder={t('pricePlaceholder')}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="offering-description">{t('description')}</Label>
        <textarea
          id="offering-description"
          value={description}
          rows={3}
          maxLength={5000}
          placeholder={t('descriptionPlaceholder')}
          onChange={(e) => setDescription(e.target.value)}
          className="resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          disabled={creating}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {creating ? t('creating') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
