'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Loader2, X } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { Link } from '@/i18n/navigation'
import { SEARCH_USERS_QUERY } from '@/graphql/users/queries'
import { SEARCH_PAGES_QUERY } from '@/graphql/pages/queries'
import type { FollowUser, Page } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { PageTypeBadges } from '@/components/pages/page-type-badges'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface UserSearchData {
  searchUsers: FollowUser[]
}

interface PageSearchData {
  searchPages: Page[]
}

/** Global search: people and pages together, grouped in one dropdown. */
export function UserSearch({ className }: { className?: string }) {
  const t = useTranslations('search')
  const [term, setTerm] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce keystrokes so we query at most every ~250ms while typing.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 250)
    return () => clearTimeout(id)
  }, [term])

  const { data, loading, error } = useQuery<UserSearchData>(
    SEARCH_USERS_QUERY,
    {
      variables: { query: debounced },
      skip: debounced.length === 0,
      fetchPolicy: 'cache-and-network',
    },
  )
  const { data: pagesData, loading: pagesLoading } = useQuery<PageSearchData>(
    SEARCH_PAGES_QUERY,
    {
      variables: { query: debounced },
      skip: debounced.length === 0,
      fetchPolicy: 'cache-and-network',
    },
  )

  // Close the dropdown when clicking outside the search box.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const users = data?.searchUsers ?? []
  const pages = pagesData?.searchPages ?? []
  const busy = (loading || pagesLoading) && users.length + pages.length === 0
  const showDropdown = open && debounced.length > 0

  function reset() {
    setTerm('')
    setDebounced('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') reset()
          }}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden"
        />
        {term && (
          <button
            type="button"
            onClick={reset}
            aria-label={t('clear')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {busy ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('searching')}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">
              {t('error')}
            </p>
          ) : users.length === 0 && pages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('noResults')}
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {users.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
                    {t('people')}
                  </p>
                  <ul>
                    {users.map((u) => {
                      const name = [u.firstName, u.lastName]
                        .filter(Boolean)
                        .join(' ')
                        .trim()
                      return (
                        <li key={u.id}>
                          <Link
                            href={`/u/${u.username}`}
                            onClick={reset}
                            className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent"
                          >
                            <Avatar
                              src={u.avatarUrl}
                              name={u.username || name || '?'}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                @{u.username}
                              </p>
                              {name && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {name}
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
              {pages.length > 0 && (
                <>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">
                    {t('pagesGroup')}
                  </p>
                  <ul>
                    {pages.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/pages/${p.id}`}
                          onClick={reset}
                          className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-accent"
                        >
                          <Avatar src={p.photoUrl} name={p.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {p.name}
                            </p>
                            <PageTypeBadges types={p.types} size="sm" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
