'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { PAGE_QUERY } from '@/graphql/pages/queries'
import { PAGE_POSTS_QUERY } from '@/graphql/posts/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type { Page, Post } from '@/graphql/types'
import { PageHeader } from '@/components/pages/page-header'
import { PostComposer } from '@/components/posts/post-composer'
import { ProfileTabs } from '@/components/posts/profile-tabs'

interface PageData {
  page: Page
}

interface PagePostsData {
  pagePosts: Post[]
}

export default function PageDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params.id ?? '')
  const tc = useTranslations('common')
  const t = useTranslations('pages')
  const tp = useTranslations('posts')
  const { user: me } = useAuth()

  const {
    data,
    loading,
    error,
    refetch: refetchPage,
  } = useQuery<PageData>(PAGE_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })

  const { data: postsData, refetch } = useQuery<PagePostsData>(
    PAGE_POSTS_QUERY,
    {
      variables: { pageId: id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    },
  )

  if (loading && !data?.page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  if (error || !data?.page) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{t('notFound')}</div>
      </div>
    )
  }

  const page = data.page
  const isOwner = me?.id === page.owner.id
  const posts = postsData?.pagePosts ?? []

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left column: page header, pinned. */}
        <aside>
          <div className="lg:sticky lg:top-20">
            <PageHeader page={page} isOwner={isOwner} />
          </div>
        </aside>

        {/* Right column: composer (owner only) + the page's posts. */}
        <section className="flex flex-col gap-4">
          {isOwner && (
            <PostComposer
              pageId={page.id}
              identity={{ name: page.name, avatarUrl: page.photoUrl }}
              onCreated={() => {
                void refetch()
                void refetchPage()
              }}
            />
          )}
          <ProfileTabs
            posts={posts}
            currentUserId={me?.id}
            emptyPostsLabel={tp('empty')}
            onDeleted={() => {
              void refetch()
              void refetchPage()
            }}
          />
        </section>
      </div>
    </div>
  )
}
