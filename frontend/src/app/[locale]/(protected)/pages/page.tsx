'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import type { Page } from '@/graphql/types'
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

  const { data: mine } = useQuery<MyPagesData>(MY_PAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
  const { data: all } = useQuery<PagesData>(PAGES_QUERY, {
    fetchPolicy: 'cache-and-network',
  })

  const myPages = mine?.myPages ?? []
  const myIds = new Set(myPages.map((p) => p.id))
  // "Discover" excludes pages the viewer already owns (those are listed above).
  const discover = (all?.pages ?? []).filter((p) => !myIds.has(p.id))

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

      {discover.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            {t('discover')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {discover.map((page) => (
              <PageCard key={page.id} page={page} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
