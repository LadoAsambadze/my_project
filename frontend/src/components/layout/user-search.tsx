'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Loader2, X } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { Link } from '@/i18n/navigation'
import { SEARCH_USERS_QUERY } from '@/graphql/users/queries'
import type { FollowUser } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchData {
  searchUsers: FollowUser[]
}

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

  const { data, loading, error } = useQuery<SearchData>(SEARCH_USERS_QUERY, {
    variables: { query: debounced },
    skip: debounced.length === 0,
    fetchPolicy: 'cache-and-network',
  })

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

  const results = data?.searchUsers ?? []
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
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('searching')}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">
              {t('error')}
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('noResults')}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((u) => {
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
          )}
        </div>
      )}
    </div>
  )
}
