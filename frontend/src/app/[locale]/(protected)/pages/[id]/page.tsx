'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuery } from '@apollo/client/react'
import { PAGE_QUERY } from '@/graphql/pages/queries'
import { PAGE_POSTS_QUERY } from '@/graphql/posts/queries'
import { PAGE_EVENTS_QUERY } from '@/graphql/events/queries'
import { PAGE_DESIGNS_QUERY } from '@/graphql/designs/queries'
import { PAGE_CATERING_OFFERS_QUERY } from '@/graphql/catering/queries'
import { PAGE_OFFERINGS_QUERY } from '@/graphql/offerings/queries'
import { useAuth } from '@/lib/auth/auth-context'
import type {
  CateringOffer,
  Design,
  EventItem,
  Offering,
  Page,
  Post,
} from '@/graphql/types'
import { PageHeader } from '@/components/pages/page-header'
import { PostComposer } from '@/components/posts/post-composer'
import { EventComposer } from '@/components/events/event-composer'
import { DesignComposer } from '@/components/designs/design-composer'
import { OfferComposer } from '@/components/catering/offer-composer'
import { OfferingComposer } from '@/components/offerings/offering-composer'
import { ProfileTabs } from '@/components/posts/profile-tabs'

interface PageData {
  page: Page
}

interface PagePostsData {
  pagePosts: Post[]
}

interface PageEventsData {
  pageEvents: EventItem[]
}

interface PageDesignsData {
  pageDesigns: Design[]
}

interface PageCateringOffersData {
  pageCateringOffers: CateringOffer[]
}

interface PageOfferingsData {
  pageOfferings: Offering[]
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

  const { data: eventsData, refetch: refetchEvents } =
    useQuery<PageEventsData>(PAGE_EVENTS_QUERY, {
      variables: { pageId: id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    })

  // Vendor sections exist only for the matching page types — skip their
  // queries until the page is loaded and the type matches.
  const isDesigner = !!data?.page?.types.includes('DESIGNER')
  const { data: designsData, refetch: refetchDesigns } =
    useQuery<PageDesignsData>(PAGE_DESIGNS_QUERY, {
      variables: { pageId: id },
      skip: !id || !isDesigner,
      fetchPolicy: 'cache-and-network',
    })

  const isCaterer = !!data?.page?.types.includes('CATERING')
  const { data: offersData, refetch: refetchOffers } =
    useQuery<PageCateringOffersData>(PAGE_CATERING_OFFERS_QUERY, {
      variables: { pageId: id },
      skip: !id || !isCaterer,
      fetchPolicy: 'cache-and-network',
    })

  // Music & sound pages sell acts and list rentals in one Services section.
  const hasOfferings = !!data?.page?.types.includes('MUSIC_SOUND')
  const { data: offeringsData, refetch: refetchOfferings } =
    useQuery<PageOfferingsData>(PAGE_OFFERINGS_QUERY, {
      variables: { pageId: id },
      skip: !id || !hasOfferings,
      fetchPolicy: 'cache-and-network',
    })

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
  const events = eventsData?.pageEvents ?? []

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
            events={events}
            currentUserId={me?.id}
            emptyPostsLabel={tp('empty')}
            onDeleted={() => {
              void refetch()
              void refetchPage()
            }}
            onEventDeleted={() => void refetchEvents()}
            eventComposer={
              isOwner ? (
                <EventComposer
                  pageId={page.id}
                  onCreated={() => void refetchEvents()}
                />
              ) : undefined
            }
            designs={isDesigner ? (designsData?.pageDesigns ?? []) : undefined}
            canDeleteDesigns={isOwner}
            onDesignDeleted={() => void refetchDesigns()}
            designComposer={
              isDesigner && isOwner ? (
                <DesignComposer
                  pageId={page.id}
                  onCreated={() => void refetchDesigns()}
                />
              ) : undefined
            }
            cateringOffers={
              isCaterer ? (offersData?.pageCateringOffers ?? []) : undefined
            }
            canDeleteOffers={isOwner}
            onOfferDeleted={() => void refetchOffers()}
            offerComposer={
              isCaterer && isOwner ? (
                <OfferComposer
                  pageId={page.id}
                  onCreated={() => void refetchOffers()}
                />
              ) : undefined
            }
            offerings={
              hasOfferings ? (offeringsData?.pageOfferings ?? []) : undefined
            }
            canDeleteOfferings={isOwner}
            onOfferingDeleted={() => void refetchOfferings()}
            offeringComposer={
              hasOfferings && isOwner ? (
                <OfferingComposer
                  pageId={page.id}
                  pageTypes={page.types}
                  onCreated={() => void refetchOfferings()}
                />
              ) : undefined
            }
          />
        </section>
      </div>
    </div>
  )
}
