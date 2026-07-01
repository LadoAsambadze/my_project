'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Megaphone } from 'lucide-react'
import { CREATE_REQUEST_MUTATION } from '@/graphql/requests/operations'
import type { PageType } from '@/graphql/types'
import { PAGE_TYPES, PAGE_TYPE_ICONS } from '@/lib/page-types'
import { DESIGN_OCCASIONS } from '@/lib/design-occasions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RequestComposerProps {
  /** Called after a request is created so the parent can refresh its feed. */
  onCreated?: () => void
}

/**
 * "I'm looking for..." — a structured demand post: vendor category, optional
 * occasion/date/city/budget, and free text. Vendors reply in the comments.
 */
export function RequestComposer({ onCreated }: RequestComposerProps) {
  const t = useTranslations('requests')
  const tt = useTranslations('pageTypes')
  const to = useTranslations('designOccasions')

  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<PageType | null>(null)
  const [occasion, setOccasion] = useState<string | null>(null)
  const [eventDate, setEventDate] = useState('')
  const [city, setCity] = useState('')
  const [budgetFrom, setBudgetFrom] = useState('')
  const [budgetTo, setBudgetTo] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setOpen(false)
    setCategory(null)
    setOccasion(null)
    setEventDate('')
    setCity('')
    setBudgetFrom('')
    setBudgetTo('')
    setBody('')
    setError(null)
  }

  const [createRequest, { loading: creating }] = useMutation(
    CREATE_REQUEST_MUTATION,
    {
      onCompleted: () => {
        reset()
        onCreated?.()
      },
      onError: (err) => setError(err.message || t('createError')),
    },
  )

  const canSubmit = !creating && category !== null && body.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || category === null) return
    const from = Number.parseInt(budgetFrom, 10)
    const to_ = Number.parseInt(budgetTo, 10)
    void createRequest({
      variables: {
        input: {
          category,
          occasion,
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          city: city.trim() || null,
          budgetFrom: Number.isNaN(from) ? null : from,
          budgetTo: Number.isNaN(to_) ? null : to_,
          body: body.trim(),
        },
      },
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Megaphone className="h-4 w-4" />
        {t('create')}
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('formTitle')}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          {t('cancel')}
        </Button>
      </div>

      {/* Vendor category */}
      <div className="flex flex-col gap-1.5">
        <Label>{t('category')}</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAGE_TYPES.map((value) => {
            const Icon = PAGE_TYPE_ICONS[value]
            const selected = category === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-lg border bg-background p-3 text-center text-xs font-medium transition-colors hover:bg-accent',
                  selected ? 'border-primary bg-accent' : 'border-border',
                )}
              >
                <Icon className="h-5 w-5 text-primary" />
                {tt(value)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Occasion chips (optional) */}
      <div className="flex flex-col gap-1.5">
        <Label>{t('occasion')}</Label>
        <div className="flex flex-wrap gap-2">
          {DESIGN_OCCASIONS.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOccasion(occasion === id ? null : id)}
              aria-pressed={occasion === id}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                occasion === id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {to(id)}
            </button>
          ))}
        </div>
      </div>

      {/* Date + city */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="request-date">{t('date')}</Label>
          <Input
            id="request-date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="request-city">{t('city')}</Label>
          <Input
            id="request-city"
            value={city}
            maxLength={120}
            placeholder={t('cityPlaceholder')}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="flex flex-col gap-1.5">
        <Label>{t('budget')}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={budgetFrom}
            placeholder={t('budgetFrom')}
            onChange={(e) => setBudgetFrom(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            value={budgetTo}
            placeholder={t('budgetTo')}
            onChange={(e) => setBudgetTo(e.target.value)}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="request-body">{t('body')}</Label>
        <textarea
          id="request-body"
          value={body}
          rows={3}
          maxLength={5000}
          placeholder={t('bodyPlaceholder')}
          onChange={(e) => setBody(e.target.value)}
          className="resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={reset} disabled={creating}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {creating ? t('creating') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
