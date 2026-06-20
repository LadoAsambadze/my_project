'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Camera, Pencil, Cake, MapPin, Mail, CalendarDays } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { ME_QUERY } from '@/graphql/auth/queries'
import type { AuthUser } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MeData {
  me: AuthUser
}

function formatDate(value?: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tc = useTranslations('common')

  const { data, loading } = useQuery<MeData>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  if (loading || !data?.me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  const profile = data.me
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  const intro: Array<{ icon: typeof Cake; value: string | null }> = [
    { icon: Cake, value: formatDate(profile.birthDate) },
    { icon: MapPin, value: profile.location },
    { icon: Mail, value: profile.email },
    {
      icon: CalendarDays,
      value: profile.createdAt
        ? `${t('memberSince')} ${formatDate(profile.createdAt)}`
        : null,
    },
  ]

  const tabs = [
    { key: 'posts', label: t('tabPosts') },
    { key: 'about', label: t('tabAbout'), active: true },
    { key: 'friends', label: t('tabFriends') },
    { key: 'photos', label: t('tabPhotos') },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header card: cover + avatar + identity + tabs */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Cover */}
        <div className="relative h-44 bg-linear-to-br from-primary/30 via-primary/15 to-gold/20 sm:h-64">
          <Link
            href="/settings"
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition hover:bg-background"
          >
            <Camera className="h-3.5 w-3.5" />
            {t('editCover')}
          </Link>
        </div>

        {/* Avatar + name — left-aligned, FB-style */}
        <div className="px-4 pb-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div className="-mt-16 sm:-mt-20">
              <Avatar
                src={profile.avatarUrl}
                name={fullName || profile.email}
                size="xl"
                className="ring-4 ring-card shadow-md"
              />
            </div>
            <div className="flex-1 text-center sm:pb-2 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-3xl font-bold tracking-tight">
                  {fullName || t('unnamed')}
                </h1>
                {profile.isVerified ? (
                  <Badge variant="success">{t('verified')}</Badge>
                ) : (
                  <Badge variant="outline">{t('notVerified')}</Badge>
                )}
              </div>
              {profile.bio && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </div>
            <div className="sm:pb-2">
              <Button asChild>
                <Link href="/settings">
                  <Pencil className="h-4 w-4" />
                  {t('edit')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border px-2">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <span
                key={tab.key}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${
                  tab.active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Body: Intro (left sidebar) + timeline (right, wider) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Left column — read-only Intro */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('introTitle')}</h2>
              <Button asChild size="sm" variant="secondary">
                <Link href="/settings">{t('editDetails')}</Link>
              </Button>
            </div>
            <ul className="flex flex-col gap-3">
              {intro.map((row, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <row.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{row.value || t('notSet')}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm">
                <span className="text-xs text-muted-foreground">{t('bio')}:</span>
                <span className={profile.bio ? '' : 'text-muted-foreground'}>
                  {profile.bio || t('noBio')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right column — timeline placeholder */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="font-medium">{t('timelineEmptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('timelineEmptyBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
