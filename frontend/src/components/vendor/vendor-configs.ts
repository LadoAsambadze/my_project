import type { DocumentNode } from 'graphql'
import {
  Camera,
  Flower2,
  Music,
  Palette,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type {
  ContentTarget,
  PagePreview,
  PageType,
  MediaType,
} from '@/graphql/types'
import type { ComposerMediaItem, ComposerValues } from './vendor-item-composer'
import { DESIGN_OCCASIONS, occasionIcon } from '@/lib/design-occasions'
import { CATERING_KINDS, cateringKindIcon } from '@/lib/catering-kinds'
import { MUSIC_KINDS, EQUIPMENT_KINDS, offeringKindIcon } from '@/lib/offering-kinds'
import { WORK_CATEGORIES, workCategoryIcon } from '@/lib/work-categories'
import { FLORIST_KINDS, floristKindIcon } from '@/lib/florist-kinds'
import { PAGE_DESIGNS_QUERY, DESIGNS_QUERY } from '@/graphql/designs/queries'
import {
  CREATE_DESIGN_MUTATION,
  UPDATE_DESIGN_MUTATION,
  DELETE_DESIGN_MUTATION,
} from '@/graphql/designs/mutations'
import {
  PAGE_CATERING_OFFERS_QUERY,
  CATERING_OFFERS_QUERY,
} from '@/graphql/catering/queries'
import {
  CREATE_CATERING_OFFER_MUTATION,
  UPDATE_CATERING_OFFER_MUTATION,
  DELETE_CATERING_OFFER_MUTATION,
} from '@/graphql/catering/mutations'
import {
  PAGE_OFFERINGS_QUERY,
  OFFERINGS_QUERY,
} from '@/graphql/offerings/queries'
import {
  CREATE_OFFERING_MUTATION,
  UPDATE_OFFERING_MUTATION,
  DELETE_OFFERING_MUTATION,
} from '@/graphql/offerings/mutations'
import { PAGE_WORKS_QUERY, WORKS_QUERY } from '@/graphql/works/queries'
import {
  CREATE_WORK_MUTATION,
  UPDATE_WORK_MUTATION,
  DELETE_WORK_MUTATION,
} from '@/graphql/works/mutations'
import {
  PAGE_FLORIST_ITEMS_QUERY,
  FLORIST_ITEMS_QUERY,
} from '@/graphql/florist/queries'
import {
  CREATE_FLORIST_ITEM_MUTATION,
  UPDATE_FLORIST_ITEM_MUTATION,
  DELETE_FLORIST_ITEM_MUTATION,
} from '@/graphql/florist/mutations'

/// Common shape every vendor content item shares — enough for the shared card.
export interface VendorContentItem {
  id: string
  title: string
  description: string | null
  createdAt: string
  page: PagePreview
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
  [key: string]: unknown
}

export interface VendorTypeConfig {
  /** Tab key + stable identifier. */
  key: string
  /** Page type that unlocks this section. */
  pageType: PageType
  /** i18n namespace for section strings. */
  ns: string
  /** i18n namespace for kind labels. */
  kindNs: string
  kinds: Array<{ id: string; icon: LucideIcon }>
  kindIcon: (id: string) => LucideIcon
  triggerIcon: LucideIcon
  target: ContentTarget
  allowVideo?: boolean
  /** Which ns key formats the price ("priceFrom" or "pricePerPerson"). */
  priceLabelKey: string
  pageQuery: DocumentNode
  pageQueryKey: string
  browseQuery: DocumentNode
  browseQueryKey: string
  /** Browse route + filter arg name (e.g. "occasion"). */
  browseFilterArg: string
  createMutation: DocumentNode
  updateMutation: DocumentNode
  deleteMutation: DocumentNode
  buildCreateInput: (pageId: string, v: ComposerValues) => Record<string, unknown>
  buildUpdateInput: (id: string, v: ComposerValues) => Record<string, unknown>
  getKind: (item: VendorContentItem) => string
  getPrice: (item: VendorContentItem) => number | null
  getMedia: (item: VendorContentItem) => ComposerMediaItem[]
}

const imagesToMedia = (item: VendorContentItem): ComposerMediaItem[] =>
  (item.images as Array<{ url: string }>).map((i) => ({
    url: i.url,
    type: 'IMAGE' as MediaType,
  }))

const imageUrlsFrom = (v: ComposerValues) => v.media.map((m) => m.url)

export const DESIGNS_CONFIG: VendorTypeConfig = {
  key: 'designs',
  pageType: 'DESIGNER',
  ns: 'designs',
  kindNs: 'designOccasions',
  kinds: DESIGN_OCCASIONS,
  kindIcon: occasionIcon,
  triggerIcon: Palette,
  target: 'DESIGN',
  priceLabelKey: 'priceFrom',
  pageQuery: PAGE_DESIGNS_QUERY,
  pageQueryKey: 'pageDesigns',
  browseQuery: DESIGNS_QUERY,
  browseQueryKey: 'designs',
  browseFilterArg: 'occasion',
  createMutation: CREATE_DESIGN_MUTATION,
  updateMutation: UPDATE_DESIGN_MUTATION,
  deleteMutation: DELETE_DESIGN_MUTATION,
  buildCreateInput: (pageId, v) => ({
    pageId,
    title: v.title,
    occasion: v.kind,
    description: v.description || null,
    priceFrom: v.price,
    imageUrls: imageUrlsFrom(v),
  }),
  buildUpdateInput: (designId, v) => ({
    designId,
    title: v.title,
    occasion: v.kind,
    description: v.description,
    priceFrom: v.price ?? -1,
    imageUrls: imageUrlsFrom(v),
  }),
  getKind: (item) => item.occasion as string,
  getPrice: (item) => (item.priceFrom as number | null) ?? null,
  getMedia: imagesToMedia,
}

export const CATERING_CONFIG: VendorTypeConfig = {
  key: 'menu',
  pageType: 'CATERING',
  ns: 'catering',
  kindNs: 'cateringKinds',
  kinds: CATERING_KINDS,
  kindIcon: cateringKindIcon,
  triggerIcon: UtensilsCrossed,
  target: 'CATERING_OFFER',
  priceLabelKey: 'pricePerPerson',
  pageQuery: PAGE_CATERING_OFFERS_QUERY,
  pageQueryKey: 'pageCateringOffers',
  browseQuery: CATERING_OFFERS_QUERY,
  browseQueryKey: 'cateringOffers',
  browseFilterArg: 'kind',
  createMutation: CREATE_CATERING_OFFER_MUTATION,
  updateMutation: UPDATE_CATERING_OFFER_MUTATION,
  deleteMutation: DELETE_CATERING_OFFER_MUTATION,
  buildCreateInput: (pageId, v) => ({
    pageId,
    title: v.title,
    kind: v.kind,
    description: v.description || null,
    pricePerPerson: v.price,
    imageUrls: imageUrlsFrom(v),
  }),
  buildUpdateInput: (offerId, v) => ({
    offerId,
    title: v.title,
    kind: v.kind,
    description: v.description,
    pricePerPerson: v.price ?? -1,
    imageUrls: imageUrlsFrom(v),
  }),
  getKind: (item) => item.kind as string,
  getPrice: (item) => (item.pricePerPerson as number | null) ?? null,
  getMedia: imagesToMedia,
}

export const OFFERINGS_CONFIG: VendorTypeConfig = {
  key: 'services',
  pageType: 'MUSIC_SOUND',
  ns: 'offerings',
  kindNs: 'offeringKinds',
  kinds: [
    ...MUSIC_KINDS,
    ...EQUIPMENT_KINDS,
    { id: 'OTHER', icon: Music },
  ],
  kindIcon: offeringKindIcon,
  triggerIcon: Music,
  target: 'OFFERING',
  priceLabelKey: 'priceFrom',
  pageQuery: PAGE_OFFERINGS_QUERY,
  pageQueryKey: 'pageOfferings',
  browseQuery: OFFERINGS_QUERY,
  browseQueryKey: 'offerings',
  browseFilterArg: 'kind',
  createMutation: CREATE_OFFERING_MUTATION,
  updateMutation: UPDATE_OFFERING_MUTATION,
  deleteMutation: DELETE_OFFERING_MUTATION,
  buildCreateInput: (pageId, v) => ({
    pageId,
    title: v.title,
    kind: v.kind,
    description: v.description || null,
    priceFrom: v.price,
    imageUrls: imageUrlsFrom(v),
  }),
  buildUpdateInput: (offeringId, v) => ({
    offeringId,
    title: v.title,
    kind: v.kind,
    description: v.description,
    priceFrom: v.price ?? -1,
    imageUrls: imageUrlsFrom(v),
  }),
  getKind: (item) => item.kind as string,
  getPrice: (item) => (item.priceFrom as number | null) ?? null,
  getMedia: imagesToMedia,
}

export const WORKS_CONFIG: VendorTypeConfig = {
  key: 'portfolio',
  pageType: 'PHOTOGRAPHER',
  ns: 'works',
  kindNs: 'workCategories',
  kinds: WORK_CATEGORIES,
  kindIcon: workCategoryIcon,
  triggerIcon: Camera,
  target: 'WORK',
  allowVideo: true,
  priceLabelKey: 'priceFrom',
  pageQuery: PAGE_WORKS_QUERY,
  pageQueryKey: 'pageWorks',
  browseQuery: WORKS_QUERY,
  browseQueryKey: 'works',
  browseFilterArg: 'category',
  createMutation: CREATE_WORK_MUTATION,
  updateMutation: UPDATE_WORK_MUTATION,
  deleteMutation: DELETE_WORK_MUTATION,
  buildCreateInput: (pageId, v) => ({
    pageId,
    title: v.title,
    category: v.kind,
    description: v.description || null,
    priceFrom: v.price,
    media: v.media.map((m) => ({ url: m.url, type: m.type })),
  }),
  buildUpdateInput: (workId, v) => ({
    workId,
    title: v.title,
    category: v.kind,
    description: v.description,
    priceFrom: v.price ?? -1,
    media: v.media.map((m) => ({ url: m.url, type: m.type })),
  }),
  getKind: (item) => item.workCategory as string,
  getPrice: (item) => (item.priceFrom as number | null) ?? null,
  getMedia: (item) =>
    (item.media as Array<{ url: string; type: MediaType }>).map((m) => ({
      url: m.url,
      type: m.type,
    })),
}

export const FLORIST_CONFIG: VendorTypeConfig = {
  key: 'catalog',
  pageType: 'FLORIST',
  ns: 'florist',
  kindNs: 'floristKinds',
  kinds: FLORIST_KINDS,
  kindIcon: floristKindIcon,
  triggerIcon: Flower2,
  target: 'FLORIST_ITEM',
  priceLabelKey: 'priceFrom',
  pageQuery: PAGE_FLORIST_ITEMS_QUERY,
  pageQueryKey: 'pageFloristItems',
  browseQuery: FLORIST_ITEMS_QUERY,
  browseQueryKey: 'floristItems',
  browseFilterArg: 'kind',
  createMutation: CREATE_FLORIST_ITEM_MUTATION,
  updateMutation: UPDATE_FLORIST_ITEM_MUTATION,
  deleteMutation: DELETE_FLORIST_ITEM_MUTATION,
  buildCreateInput: (pageId, v) => ({
    pageId,
    title: v.title,
    kind: v.kind,
    description: v.description || null,
    priceFrom: v.price,
    imageUrls: imageUrlsFrom(v),
  }),
  buildUpdateInput: (itemId, v) => ({
    itemId,
    title: v.title,
    kind: v.kind,
    description: v.description,
    priceFrom: v.price ?? -1,
    imageUrls: imageUrlsFrom(v),
  }),
  getKind: (item) => item.kind as string,
  getPrice: (item) => (item.priceFrom as number | null) ?? null,
  getMedia: imagesToMedia,
}

/// All vendor sections in page-tab order.
export const VENDOR_CONFIGS: VendorTypeConfig[] = [
  WORKS_CONFIG,
  DESIGNS_CONFIG,
  CATERING_CONFIG,
  OFFERINGS_CONFIG,
  FLORIST_CONFIG,
]
