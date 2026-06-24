'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import { useRouter, Link } from '@/i18n/navigation'
import type { Page } from '@/graphql/types'
import { DELETE_PAGE_MUTATION } from '@/graphql/pages/mutations'
import { MY_PAGES_QUERY, PAGES_QUERY } from '@/graphql/pages/queries'
import { PAGE_TYPE_ICONS } from '@/lib/page-types'
import { Avatar } from '@/components/profile/avatar'
import { Button } from '@/components/ui/button'
import { PageFollowButton } from '@/components/pages/page-follow-button'

interface PageHeaderProps {
  page: Page
  /** True when the signed-in user owns this page (shows the delete control). */
  isOwner: boolean
}

export function PageHeader({ page, isOwner }: PageHeaderProps) {
  const t = useTranslations('pages')
  const tt = useTranslations('pageTypes')
  const router = useRouter()
  const TypeIcon = PAGE_TYPE_ICONS[page.type]

  const ownerName = [page.owner.firstName, page.owner.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const ownerHref = page.owner.username
    ? `/u/${page.owner.username}`
    : '/profile'

  const [deletePage, { loading: deleting }] = useMutation(DELETE_PAGE_MUTATION, {
    variables: { id: page.id },
    refetchQueries: [{ query: MY_PAGES_QUERY }, { query: PAGES_QUERY }],
    onCompleted: () => router.push('/pages'),
  })

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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <TypeIcon className="h-3.5 w-3.5" />
          {tt(page.type)}
        </span>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{t('postsCount', { count: page.postsCount ?? 0 })}</span>
          <span>{t('followersCount', { count: page.followersCount ?? 0 })}</span>
        </div>

        {isOwner ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() => {
              if (window.confirm(t('deleteConfirm'))) void deletePage()
            }}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            {t('delete')}
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
