'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { CalendarPlus, ChevronLeft, ImagePlus, Loader2, X } from 'lucide-react'
import { CREATE_EVENT_MUTATION } from '@/graphql/events/mutations'
import { uploadFile } from '@/lib/upload'
import {
  EVENT_TYPES,
  EVENT_TYPE_ICONS,
  subtypesFor,
  subtypeIcon,
} from '@/lib/event-types'
import type { EventType } from '@/graphql/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EventComposerProps {
  /** Called after an event is created so the parent can refresh its list. */
  onCreated?: () => void
  /** When set, the event is hosted as this page (you must own it). */
  pageId?: string
}

export function EventComposer({ onCreated, pageId }: EventComposerProps) {
  const t = useTranslations('events')
  const tt = useTranslations('eventTypes')
  const tts = useTranslations('eventSubtypes')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  // type/subtype are null until their card is picked — later steps stay hidden.
  const [type, setType] = useState<EventType | null>(null)
  const [subtype, setSubtype] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setOpen(false)
    setType(null)
    setSubtype(null)
    setTitle('')
    setStartsAt('')
    setLocation('')
    setDescription('')
    setCoverUrl(null)
    setError(null)
  }

  const [createEvent, { loading: creating }] = useMutation(
    CREATE_EVENT_MUTATION,
    {
      onCompleted: () => {
        reset()
        onCreated?.()
      },
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
      setCoverUrl(uploaded.url)
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
    type !== null &&
    title.trim().length >= 2 &&
    startsAt !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || type === null) return
    void createEvent({
      variables: {
        input: {
          title: title.trim(),
          type,
          subtype: subtype ?? null,
          startsAt: new Date(startsAt).toISOString(),
          location: location.trim() || null,
          description: description.trim() || null,
          coverUrl: coverUrl ?? null,
          pageId: pageId ?? null,
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
        <CalendarPlus className="h-4 w-4" />
        {t('create')}
      </Button>
    )
  }

  // 2. Type picker — nothing else is shown until a type is chosen.
  if (type === null) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('chooseType')}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            {t('cancel')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVENT_TYPES.map((value) => {
            const Icon = EVENT_TYPE_ICONS[value]
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-5 text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
              >
                <Icon className="h-7 w-7 text-primary" />
                {tt(value)}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 3. Subtype picker — only when the chosen type has subtypes.
  const subtypes = subtypesFor(type)
  if (subtypes.length > 0 && subtype === null) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setType(null)}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            {tt(type)}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            {t('cancel')}
          </Button>
        </div>
        <h3 className="text-sm font-semibold">{t('chooseSubtype')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {subtypes.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubtype(id)}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background p-5 text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              <Icon className="h-7 w-7 text-primary" />
              {tts(id)}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // 4. Details form — after the category is fully chosen.
  const TypeIcon = EVENT_TYPE_ICONS[type]
  const SubIcon = subtype ? subtypeIcon(subtype) : null
  // "Change" steps back one level: to the subtype picker if the type has
  // subtypes, otherwise to the type picker.
  const goBack = () =>
    subtypes.length > 0 ? setSubtype(null) : setType(null)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      {/* Chosen category + change */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            <TypeIcon className="h-3.5 w-3.5" />
            {tt(type)}
          </span>
          {subtype && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
              {tts(subtype)}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={creating}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('changeType')}
        </Button>
      </div>

      {/* Cover */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => void handleFile(e.target.files)}
        />
        {coverUrl ? (
          <div className="relative overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              className="aspect-video w-full object-cover"
            />
            <button
              type="button"
              onClick={() => setCoverUrl(null)}
              aria-label={t('removeCover')}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
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
            {t('addCover')}
          </Button>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event-title">{t('title')}</Label>
        <Input
          id="event-title"
          value={title}
          maxLength={120}
          placeholder={t('titlePlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Date & time */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event-date">{t('date')}</Label>
        <Input
          id="event-date"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event-location">{t('location')}</Label>
        <Input
          id="event-location"
          value={location}
          maxLength={120}
          placeholder={t('locationPlaceholder')}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="event-description">{t('description')}</Label>
        <textarea
          id="event-description"
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
