'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Page } from '@/graphql/types'
import { PAGE_TYPE_ICONS } from '@/lib/page-types'
import { Avatar } from '@/components/profile/avatar'

interface PageCardProps {
  page: Page
}

export function PageCard({ page }: PageCardProps) {
  const tt = useTranslations('pageTypes')
  const tp = useTranslations('pages')
  const TypeIcon = PAGE_TYPE_ICONS[page.type]

  return (
    <Link
      href={`/pages/${page.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
    >
      <Avatar src={page.photoUrl} name={page.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{page.name}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TypeIcon className="h-3.5 w-3.5 shrink-0" />
          {tt(page.type)}
        </p>
      </div>
      <div className="shrink-0 text-right text-xs text-muted-foreground">
        <p>{tp('postsCount', { count: page.postsCount ?? 0 })}</p>
        <p>{tp('followersCount', { count: page.followersCount ?? 0 })}</p>
      </div>
    </Link>
  )
}
