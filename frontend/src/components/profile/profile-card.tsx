'use client'

import { useTranslations } from 'next-intl'
import { Cake, MapPin, Mail, CalendarDays, Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { AuthUser } from '@/graphql/types'
import { cn } from '@/lib/utils'
import { PAGE_TYPE_ICONS } from '@/lib/page-types'
import { Avatar } from '@/components/profile/avatar'

function formatDate(value?: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface ProfileCardProps {
  user: AuthUser
  /** Optional action rendered in the identity area (e.g. a Follow button). */
  action?: React.ReactNode
  /** Overrides the outer wrapper (width/padding) — e.g. in a sidebar. */
  className?: string
  /** True when viewing your own profile — shows the "Create page" affordance. */
  canManage?: boolean
}

export function ProfileCard({
  user,
  action,
  className,
  canManage = false,
}: ProfileCardProps) {
  const t = useTranslations('profile')
  const tp = useTranslations('pages')
  const tt = useTranslations('pageTypes')
  const pages = user.pages ?? []

  const intro: Array<{ icon: typeof Cake; value: string | null }> = [
    { icon: Cake, value: formatDate(user.birthDate) },
    { icon: MapPin, value: user.location },
    { icon: Mail, value: user.email },
    {
      icon: CalendarDays,
      value: user.createdAt
        ? `${t('memberSince')} ${formatDate(user.createdAt)}`
        : null,
    },
  ]

  return (
    <div className={cn('max-w-sm px-4 py-8', className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Identity — avatar, @username, counts, optional action */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center">
          <Avatar
            src={user.avatarUrl}
            name={user.username || user.email}
            size="xl"
            className="ring-4 ring-card shadow-md"
          />
          {user.username && (
            <p className="text-base font-semibold text-foreground">
              @{user.username}
            </p>
          )}

          <div className="flex gap-5 text-sm">
            {[
              {
                count: user.followersCount ?? 0,
                label: t('followers'),
                href: `/u/${user.username}/followers`,
              },
              {
                count: user.followingCount ?? 0,
                label: t('following'),
                href: `/u/${user.username}/following`,
              },
            ].map((s) => {
              const inner = (
                <>
                  <span className="font-semibold text-foreground">
                    {s.count}
                  </span>{' '}
                  <span className="text-muted-foreground">{s.label}</span>
                </>
              )
              return user.username ? (
                <Link key={s.label} href={s.href} className="hover:underline">
                  {inner}
                </Link>
              ) : (
                <span key={s.label}>{inner}</span>
              )
            })}
          </div>

          {action && <div className="w-full pt-1">{action}</div>}
        </div>

        {/* Bio — its own separated, centered section when present */}
        {user.bio && (
          <div className="border-t border-border px-6 py-5">
            <p className="text-center text-sm text-muted-foreground">
              {user.bio}
            </p>
          </div>
        )}

        {/* About — read-only details */}
        <div className="border-t border-border px-6 py-5">
          <h2 className="mb-3 text-lg font-semibold">{t('introTitle')}</h2>
          <ul className="flex flex-col gap-3">
            {intro.map((row, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <row.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{row.value || t('notSet')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pages — thematic pages this user owns */}
        {(pages.length > 0 || canManage) && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{tp('title')}</h2>
              {canManage && (
                <Link
                  href="/pages/new"
                  aria-label={tp('create')}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              )}
            </div>

            {pages.length === 0 ? (
              <Link
                href="/pages/new"
                className="text-sm text-primary hover:underline"
              >
                {tp('createFirst')}
              </Link>
            ) : (
              <ul className="flex flex-col gap-1">
                {pages.map((page) => {
                  const Icon = PAGE_TYPE_ICONS[page.type]
                  return (
                    <li key={page.id}>
                      <Link
                        href={`/pages/${page.id}`}
                        className="-mx-1.5 flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-accent"
                      >
                        <Avatar
                          src={page.photoUrl}
                          name={page.name}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {page.name}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon className="h-3 w-3 shrink-0" />
                            {tt(page.type)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
