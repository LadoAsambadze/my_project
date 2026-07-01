'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import type { Page, PageType } from '@/graphql/types'
import { PAGE_TYPES, PAGE_TYPE_ICONS } from '@/lib/page-types'
import { cn } from '@/lib/utils'
import { PageCard } from '@/components/pages/page-card'
import { Button } from '@/components/ui/button'

interface MyPagesData {
  myPages: Page[]
}

interface PagesData {
  pages: Page[]
}

export default function PagesPage() {
  const t = useTranslations('pages')
  const tt = useTranslations('pageTypes')
  const [typeFilter, setTypeFilter] = useState<PageType | null>(null)

  const { data: mine } = useQuery<MyPagesData>(MY_PAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const { data: all } = useQuery<PagesData>(PAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const myPages = mine?.myPages ?? []
  const myIds = new Set(myPages.map((p) => p.id))
  // "Discover" excludes pages the viewer already owns (those are listed above)
  // and applies the vendor-type filter chips.
  const discover = (all?.pages ?? []).filter(
    (p) =>
      !myIds.has(p.id) &&
      (typeFilter === null || p.types.includes(typeFilter)),
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button asChild size="sm">
          <Link href="/pages/new">
            <Plus className="h-4 w-4" />
            {t('create')}
          </Link>
        </Button>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('myPages')}
        </h2>
        {myPages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              {t('noPagesYet')}
            </p>
            <Button asChild size="sm">
              <Link href="/pages/new">
                <Plus className="h-4 w-4" />
                {t('createFirst')}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {myPages.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('discover')}
        </h2>

        {/* Vendor-type filter chips */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              typeFilter === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {t('allTypes')}
          </button>
          {PAGE_TYPES.map((value) => {
            const Icon = PAGE_TYPE_ICONS[value]
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setTypeFilter(typeFilter === value ? null : value)
                }
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  typeFilter === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tt(value)}
              </button>
            )
          })}
        </div>

        {discover.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('noDiscoverResults')}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {discover.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
