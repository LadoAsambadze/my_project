'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import {
  DELETE_PAGE_MUTATION,
  UPDATE_PAGE_MUTATION,
} from '@/graphql/pages/mutations'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import type { Page, PageType } from '@/graphql/types'
import { PAGE_TYPES, PAGE_TYPE_ICONS } from '@/lib/page-types'
import { MUSIC_KINDS } from '@/lib/offering-kinds'
import { uploadFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PageSettingsFormProps {
  page: Page
}

export function PageSettingsForm({ page }: PageSettingsFormProps) {
  const t = useTranslations('pages')
  const tt = useTranslations('pageTypes')
  const tk = useTranslations('offeringKinds')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(page.name)
  const [types, setTypes] = useState<PageType[]>(page.types)
  const [photoUrl, setPhotoUrl] = useState<string | null>(page.photoUrl)
  const [phone, setPhone] = useState(page.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(page.whatsapp ?? '')
  const [telegram, setTelegram] = useState(page.telegram ?? '')
  const [instruments, setInstruments] = useState<string[]>(page.instruments)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleType = (value: PageType) =>
    setTypes((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )

  const toggleInstrument = (value: string) =>
    setInstruments((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )

  const isMusician = types.includes('MUSIC_SOUND')

  const [updatePage, { loading: saving }] = useMutation(UPDATE_PAGE_MUTATION, {
    onCompleted: () => setSaved(true),
    onError: (err) => setError(err.message || t('updateError')),
  })

  const [deletePage, { loading: deleting }] = useMutation(
    DELETE_PAGE_MUTATION,
    {
      variables: { id: page.id },
      refetchQueries: [{ query: MY_PAGES_QUERY }, { query: PAGES_QUERY }],
      onCompleted: () => router.push('/pages'),
    },
  )

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setError(null)
    setSaved(false)
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
    !saving && !uploading && types.length > 0 && name.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSaved(false)
    // Send every field: empty strings clear the nullable ones on the backend.
    // Instruments only make sense for musician pages — clear them otherwise.
    void updatePage({
      variables: {
        input: {
          pageId: page.id,
          name: name.trim(),
          types,
          photoUrl: photoUrl ?? '',
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          telegram: telegram.trim(),
          instruments: isMusician ? instruments : [],
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-8">
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

        {/* Instruments — only for musician pages */}
        {isMusician && (
          <div className="flex flex-col gap-1.5">
            <Label>{t('instrumentsSection')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('instrumentsHint')}
            </p>
            <div className="flex flex-wrap gap-2">
              {MUSIC_KINDS.map(({ id, icon: Icon }) => {
                const selected = instruments.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleInstrument(id)}
                    aria-pressed={selected}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tk(id)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
              disabled={uploading || saving}
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

        {/* Contacts */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">{t('contactsSection')}</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-phone">{t('phone')}</Label>
            <Input
              id="page-phone"
              type="tel"
              value={phone}
              maxLength={30}
              placeholder={t('phonePlaceholder')}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-whatsapp">{t('whatsapp')}</Label>
            <Input
              id="page-whatsapp"
              type="tel"
              value={whatsapp}
              maxLength={30}
              placeholder={t('whatsappPlaceholder')}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-telegram">{t('telegram')}</Label>
            <Input
              id="page-telegram"
              value={telegram}
              maxLength={60}
              placeholder={t('telegramPlaceholder')}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            {t('saved')}
          </p>
        )}

        <Button type="submit" disabled={!canSubmit} className="w-full">
          {saving ? t('saving') : t('save')}
        </Button>
      </form>

      {/* Danger zone */}
      <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-4">
        <h2 className="text-sm font-semibold text-destructive">
          {t('dangerZone')}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={deleting}
          onClick={() => {
            if (window.confirm(t('deleteConfirm'))) void deletePage()
          }}
          className="self-start text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          {t('delete')}
        </Button>
      </div>
    </div>
  )
}
