'use client'

import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { useRouter, Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { UserSearch } from '@/components/layout/user-search'

export function Nav() {
  const t = useTranslations()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/pages', label: t('nav.pages') },
    { href: '/profile', label: t('nav.profile') },
    { href: '/settings', label: t('nav.settings') },
  ] as const

  const handleLogout = async () => {
    await logout()
    router.push('/sign-in')
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-1 px-4 py-2">
        <Link href="/dashboard" className="mr-4 text-lg font-bold tracking-tight">
          Event
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <UserSearch className="mx-1 w-full max-w-xs flex-1" />

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => void handleLogout()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
