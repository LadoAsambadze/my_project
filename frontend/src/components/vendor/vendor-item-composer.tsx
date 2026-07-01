'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import type { DocumentNode } from 'graphql'
import {
  ChevronLeft,
  ImagePlus,
  Loader2,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { MediaType } from '@/graphql/types'
import { uploadFile } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX_MEDIA = 12

export interface ComposerMediaItem {
  url: string
  type: MediaType
}

export interface ComposerValues {
  title: string
  kind: string
  description: string
  /** Parsed integer or null when the field is empty. */
  price: number | null
  media: ComposerMediaItem[]
}

export interface ComposerInitial extends ComposerValues {
  id: string
}

interface VendorItemComposerProps {
  pageId: string
  /** i18n namespace with the composer strings (e.g. "designs"). */
  ns: string
  /** i18n namespace with the kind labels (e.g. "designOccasions"). */
  kindNs: string
  kinds: Array<{ id: string; icon: LucideIcon }>
  kindIcon: (id: string) => LucideIcon
  triggerIcon: LucideIcon
  /** Allow uploading videos alongside photos (portfolio works). */
  allowVideo?: boolean
  createMutation: DocumentNode
  updateMutation: DocumentNode
  buildCreateInput: (pageId: string, v: ComposerValues) => Record<string, unknown>
  buildUpdateInput: (id: string, v: ComposerValues) => Record<string, unknown>
  /** When set the composer opens in edit mode for this item. */
  initial?: ComposerInitial | null
  /** Called after a successful create/save so the parent can refetch. */
  onSaved?: () => void
  /** Called when an edit is cancelled. */
  onCancelEdit?: () => void
}

/**
 * The shared create/edit form for every vendor content type: kind picker →
 * media upload → title/price/description. Type specifics (catalog, i18n
 * namespace, mutations, input shape) come in as configuration.
 */
export function VendorItemComposer({
  pageId,
  ns,
  kindNs,
  kinds,
  kindIcon,
  triggerIcon: TriggerIcon,
  allowVideo,
  createMutation,
  updateMutation,
  buildCreateInput,
  buildUpdateInput,
  initial,
  onSaved,
  onCancelEdit,
}: VendorItemComposerProps) {
  const t = useTranslations(ns)
  const tk = useTranslations(kindNs)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initial
  const [open, setOpen] = useState(isEdit)
  const [kind, setKind] = useState<string | null>(initial?.kind ?? null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : '',
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [media, setMedia] = useState<ComposerMediaItem[]>(initial?.media ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setOpen(false)
    setKind(null)
    setTitle('')
    setPrice('')
    setDescription('')
    setMedia([])
    setError(null)
  }

  const cancel = () => {
    if (isEdit) {
      onCancelEdit?.()
    } else {
      reset()
    }
  }

  const [save, { loading: saving }] = useMutation(
    isEdit ? updateMutation : createMutation,
    {
      onCompleted: () => {
        if (!isEdit) reset()
        onSaved?.()
      },
      onError: (err) => setError(err.message || t('createError')),
    },
  )

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_MEDIA - media.length
    const selected = Array.from(files).slice(0, room)
    setError(null)
    setUploading(true)
    try {
      for (const file of selected) {
        const uploaded = await uploadFile(file)
        setMedia((prev) => [
          ...prev,
          { url: uploaded.url, type: uploaded.type },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const canSubmit =
    !saving &&
    !uploading &&
    kind !== null &&
    title.trim().length >= 2 &&
    media.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || kind === null) return
    const parsedPrice = Number.parseInt(price, 10)
    const values: ComposerValues = {
      title: title.trim(),
      kind,
      description: description.trim(),
      price: Number.isNaN(parsedPrice) ? null : parsedPrice,
      media,
    }
    void save({
      variables: {
        input: isEdit
          ? buildUpdateInput(initial.id, values)
          : buildCreateInput(pageId, values),
      },
    })
  }

  // 1. Collapsed — just the trigger (create mode only).
  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <TriggerIcon className="h-4 w-4" />
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
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
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

  // 3. Details form.
  const KindIcon = kindIcon(kind)

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
          disabled={saving}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('changeKind')}
        </Button>
      </div>

      {/* Media */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowVideo ? 'image/*,video/*' : 'image/*'}
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {media.map((m) => (
              <div
                key={m.url}
                className="relative overflow-hidden rounded-md border border-border"
              >
                {m.type === 'VIDEO' ? (
                  <video
                    src={m.url}
                    muted
                    className="aspect-square w-full bg-black object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt=""
                    className="aspect-square w-full bg-muted object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setMedia((prev) => prev.filter((x) => x.url !== m.url))
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
        {media.length < MAX_MEDIA && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading || saving}
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
        <Label htmlFor={`${ns}-title`}>{t('title')}</Label>
        <Input
          id={`${ns}-title`}
          value={title}
          maxLength={120}
          placeholder={t('titlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${ns}-price`}>{t('price')}</Label>
        <Input
          id={`${ns}-price`}
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
        <Label htmlFor={`${ns}-description`}>{t('description')}</Label>
        <textarea
          id={`${ns}-description`}
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
          onClick={cancel}
          disabled={saving}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {saving
            ? isEdit
              ? t('saving')
              : t('creating')
            : isEdit
              ? t('save')
              : t('submit')}
        </Button>
      </div>
    </form>
  )
}
