'use client'

import { useTranslations } from 'next-intl'
import type { PageType } from '@/graphql/types'
import { PAGE_TYPE_ICONS } from '@/lib/page-types'
import { cn } from '@/lib/utils'

interface PageTypeBadgesProps {
  /** The page's vendor categories — one pill per type. */
  types: PageType[]
  /** `sm` for tight rows like post bylines; `md` (default) elsewhere. */
  size?: 'sm' | 'md'
  className?: string
}

export function PageTypeBadges({
  types,
  size = 'md',
  className,
}: PageTypeBadgesProps) {
  const tt = useTranslations('pageTypes')

  return (
    <span className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {types.map((type) => {
        const Icon = PAGE_TYPE_ICONS[type]
        return (
          <span
            key={type}
            className={cn(
              'inline-flex items-center rounded-full bg-secondary font-medium text-secondary-foreground',
              size === 'md'
                ? 'gap-1.5 px-3 py-1 text-xs'
                : 'gap-1 px-2 py-0.5 text-xs',
            )}
          >
            <Icon className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
            {tt(type)}
          </span>
        )
      })}
    </span>
  )
}
