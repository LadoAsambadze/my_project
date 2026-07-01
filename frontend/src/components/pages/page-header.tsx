'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle, Phone, Send, Settings } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Page } from '@/graphql/types'
import { offeringKindIcon } from '@/lib/offering-kinds'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { PageFollowButton } from '@/components/pages/page-follow-button'
import { PageTypeBadges } from '@/components/pages/page-type-badges'

interface PageHeaderProps {
  page: Page
  /** True when the signed-in user owns this page (shows the settings link). */
  isOwner: boolean
}

export function PageHeader({ page, isOwner }: PageHeaderProps) {
  const t = useTranslations('pages')
  const tk = useTranslations('offeringKinds')

  const ownerName = [page.owner.firstName, page.owner.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const ownerHref = page.owner.username
    ? `/u/${page.owner.username}`
    : '/profile'

  // Contact links: phone dials, WhatsApp wants digits only, Telegram wants the
  // bare username (stored without @).
  const contacts = [
    page.phone && {
      key: 'phone',
      label: t('call'),
      icon: Phone,
      href: `tel:${page.phone.replace(/\s+/g, '')}`,
      external: false,
    },
    page.whatsapp && {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/${page.whatsapp.replace(/\D/g, '')}`,
      external: true,
    },
    page.telegram && {
      key: 'telegram',
      label: 'Telegram',
      icon: Send,
      href: `https://t.me/${page.telegram}`,
      external: true,
    },
  ].filter(Boolean) as Array<{
    key: string
    label: string
    icon: typeof Phone
    href: string
    external: boolean
  }>

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center">
        <Avatar
          src={page.photoUrl}
          name={page.name}
          size="xl"
          className="ring-4 ring-card shadow-md"
        />
        <h1 className="text-xl font-bold">{page.name}</h1>
        <PageTypeBadges types={page.types} className="justify-center" />

        {/* What a musician page plays, e.g. saxophone + piano. */}
        {page.instruments.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {page.instruments.map((id) => {
              const Icon = offeringKindIcon(id)
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {tk(id)}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{t('postsCount', { count: page.postsCount ?? 0 })}</span>
          <span>{t('followersCount', { count: page.followersCount ?? 0 })}</span>
        </div>

        {contacts.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {contacts.map(({ key, label, icon: Icon, href, external }) => (
              <a
                key={key}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </a>
            ))}
          </div>
        )}

        {isOwner ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/pages/${page.id}/settings`}>
              <Settings className="h-4 w-4" />
              {t('settingsButton')}
            </Link>
          </Button>
        ) : (
          <PageFollowButton
            pageId={page.id}
            isFollowing={!!page.isFollowedByMe}
            size="sm"
            className="w-full"
          />
        )}
      </div>

      <div className="border-t border-border px-6 py-4">
        <p className="text-xs text-muted-foreground">
          {t('createdBy')}{' '}
          <Link href={ownerHref} className="font-medium hover:underline">
            {page.owner.username ? `@${page.owner.username}` : ownerName || '—'}
          </Link>
        </p>
      </div>
    </div>
  )
}
