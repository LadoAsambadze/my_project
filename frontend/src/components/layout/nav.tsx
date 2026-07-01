'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Home,
  User,
  Layers,
  Palette,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useRouter, Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { UserSearch } from '@/components/layout/user-search'
import { Avatar } from '@/components/profile/avatar'

export function Nav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2">
        {/* Left: logo */}
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight"
          aria-label="Event"
        >
          Event
        </Link>

        {/* Right: search + language + profile menu */}
        <div className="flex items-center gap-2">
          <UserSearch className="w-40 sm:w-64" />
          <LanguageSwitcher />
          <ProfileMenu />
        </div>
      </div>
    </nav>
  )
}

function ProfileMenu() {
  const t = useTranslations()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const displayName = fullName || user?.username || user?.email || ''

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    router.push('/sign-in')
  }

  const menuLinks = [
    { href: '/dashboard', label: t('nav.home'), icon: Home },
    { href: '/profile', label: t('nav.profile'), icon: User },
    { href: '/pages', label: t('nav.pages'), icon: Layers },
    { href: '/designs', label: t('nav.designs'), icon: Palette },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ] as const

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
        className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-secondary"
      >
        <Avatar src={user?.avatarUrl} name={displayName || '?'} size="sm" />
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >
          {/* Account summary */}
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-b border-border px-3 py-3 transition-colors hover:bg-accent"
          >
            <Avatar
              src={user?.avatarUrl}
              name={displayName || '?'}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {displayName || t('profile.unnamed')}
              </p>
              {user?.username && (
                <p className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </p>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <div className="py-1">
            {menuLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Link>
            ))}
          </div>

          {/* Log out */}
          <div className="border-t border-border py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
