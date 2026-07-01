'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import {
  REQUESTS_QUERY,
  REQUESTS_FOR_MY_PAGES_QUERY,
} from '@/graphql/requests/operations'
import { useAuth } from '@/lib/auth/auth-context'
import type { PageType, RequestItem } from '@/graphql/types'
import { PAGE_TYPES } from '@/lib/page-types'
import { cn } from '@/lib/utils'
import { RequestCard } from '@/components/requests/request-card'
import { RequestComposer } from '@/components/requests/request-composer'

interface RequestsData {
  requests: RequestItem[]
}

interface MyPageRequestsData {
  requestsForMyPages: RequestItem[]
}

export default function RequestsPage() {
  const t = useTranslations('requests')
  const tt = useTranslations('pageTypes')
  const { user } = useAuth()

  // "mine" = requests matching my pages' categories (the vendor inbox).
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const [category, setCategory] = useState<PageType | null>(null)

  const { data: allData, loading, refetch } = useQuery<RequestsData>(
    REQUESTS_QUERY,
    {
      variables: { category },
      skip: scope !== 'all',
      fetchPolicy: 'cache-and-network',
    },
  )
  const { data: mineData, refetch: refetchMine } =
    useQuery<MyPageRequestsData>(REQUESTS_FOR_MY_PAGES_QUERY, {
      skip: scope !== 'mine',
      fetchPolicy: 'cache-and-network',
    })

  const requests =
    scope === 'all'
      ? (allData?.requests ?? [])
      : (mineData?.requestsForMyPages ?? [])

  const refresh = () => {
    if (scope === 'all') void refetch()
    else void refetchMine()
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold">{t('browseTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('browseSubtitle')}</p>
      </div>

      {/* Scope toggle */}
      <div className="mb-3 mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setScope('all')}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            scope === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-accent',
          )}
        >
          {t('scopeAll')}
        </button>
        <button
          type="button"
          onClick={() => setScope('mine')}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            scope === 'mine'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-accent',
          )}
        >
          {t('scopeMine')}
        </button>
      </div>

      {/* Category chips (all-scope only) */}
      {scope === 'all' && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              category === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent',
            )}
          >
            {t('all')}
          </button>
          {PAGE_TYPES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                category === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent',
              )}
            >
              {tt(value)}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4">
        <RequestComposer onCreated={refresh} />
      </div>

      {requests.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {loading ? '…' : t('empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={user?.id}
              onDeleted={refresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
