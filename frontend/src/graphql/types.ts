// Hand-written shapes mirroring the Event backend GraphQL schema. Run
// `pnpm codegen` (with the backend running) to regenerate typed operations
// into src/gql if you prefer fully generated types.

export type Role = 'USER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  username: string | null
  firstName: string | null
  lastName: string | null
  birthDate: string | null
  bio: string | null
  avatarUrl: string | null
  location: string | null
  role: Role
  isVerified: boolean
  isActive: boolean
  createdAt: string
  // Present on profile queries (MyProfile / UserProfile), not on the auth fragment.
  followersCount?: number
  followingCount?: number
  isFollowedByMe?: boolean
  // Pages this user owns — requested by the profile queries.
  pages?: Page[]
}

// Lightweight user shape for follower/following list rows.
export interface FollowUser {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  isFollowedByMe?: boolean
}

export type MediaType = 'IMAGE' | 'VIDEO'

export interface PostMedia {
  id: string
  url: string
  type: MediaType
}

// Thematic categories a page can belong to — the kinds of event vendors
// (matches the backend PageType enum).
export type PageType =
  | 'PHOTOGRAPHER'
  | 'DESIGNER'
  | 'CATERING'
  | 'FLORIST'
  | 'MUSIC_SOUND'

// Lightweight owner shape embedded in a page.
export interface PageOwner {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export interface Page {
  id: string
  name: string
  // One or more vendor categories (a page can be e.g. both a photographer and
  // light & sound). Always at least one.
  types: PageType[]
  photoUrl: string | null
  // Contact links shown on the page header (all optional).
  phone: string | null
  whatsapp: string | null
  telegram: string | null
  // What a MUSIC_SOUND page plays — ids from the MUSIC_KINDS catalog (e.g.
  // "SAXOPHONE"). Empty for other pages.
  instruments: string[]
  postsCount?: number
  followersCount?: number
  isFollowedByMe?: boolean
  createdAt: string
  owner: PageOwner
}

// Lightweight page shape embedded in posts published as a page.
export interface PagePreview {
  id: string
  name: string
  types: PageType[]
  photoUrl: string | null
}

// Lightweight author shape embedded in posts.
export interface PostAuthor {
  id: string
  username: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
}

export interface Post {
  id: string
  body: string | null
  createdAt: string
  author: PostAuthor
  // Set when the post was published as a page; null for personal posts.
  page: PagePreview | null
  media: PostMedia[]
  // Engagement fields (present on queries that request them).
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
}

// Category of an event. Each type may later carry its own extra fields; for now
// it's just a label. Mirrors the backend EventType enum.
export type EventType =
  | 'PARTY'
  | 'BIRTHDAY'
  | 'SPORT'
  | 'HIKING'
  | 'CAMPING'
  | 'OTHER'

export type RsvpStatus = 'GOING' | 'INTERESTED'

// An event hosted by a user or one of their pages. Named EventItem to avoid
// clashing with the DOM `Event` type. `page` is set when hosted as a page.
export interface EventItem {
  id: string
  title: string
  type: EventType
  subtype: string | null
  description: string | null
  location: string | null
  coverUrl: string | null
  startsAt: string
  createdAt: string
  author: PostAuthor
  page: PagePreview | null
  // RSVP fields (present on queries that request them).
  goingCount?: number
  interestedCount?: number
  myRsvp?: RsvpStatus | null
  attendees?: PostAuthor[]
  // Engagement fields (present on queries that request them).
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
}

export interface CreateEventInput {
  title: string
  type?: EventType
  subtype?: string | null
  startsAt: string
  location?: string | null
  description?: string | null
  coverUrl?: string | null
  pageId?: string | null
}

export interface CreatePageInput {
  name: string
  // Vendor categories — at least one.
  types: PageType[]
  photoUrl?: string
}

// Partial update of an owned page. Omitted fields keep their value; for the
// nullable text fields an empty string clears the stored value.
export interface UpdatePageInput {
  pageId: string
  name?: string
  types?: PageType[]
  photoUrl?: string
  phone?: string
  whatsapp?: string
  telegram?: string
  instruments?: string[]
}

// Engagement fields shared by all likeable/commentable content.
export interface Engagement {
  likesCount?: number
  likedByMe?: boolean
  commentsCount?: number
}

// A single photo of a design, in upload order.
export interface DesignImage {
  id: string
  url: string
  order: number
}

// A portfolio item published by a DESIGNER page. `occasion` is an id from the
// DESIGN_OCCASIONS catalog (e.g. "WEDDING"); `priceFrom` is a starting price
// in GEL. `page` links back to the designer for the browse grid.
export interface Design extends Engagement {
  id: string
  title: string
  occasion: string
  description: string | null
  priceFrom: number | null
  images: DesignImage[]
  page: PagePreview
  createdAt: string
}

export interface CreateDesignInput {
  pageId: string
  title: string
  occasion: string
  description?: string | null
  priceFrom?: number | null
  imageUrls: string[]
}

// A single photo of a catering offer, in upload order.
export interface CateringOfferImage {
  id: string
  url: string
  order: number
}

// A menu offer published by a CATERING page. `kind` is an id from the
// CATERING_KINDS catalog (e.g. "FURSHET"); `pricePerPerson` is a per-guest
// price in GEL.
export interface CateringOffer extends Engagement {
  id: string
  title: string
  kind: string
  description: string | null
  pricePerPerson: number | null
  images: CateringOfferImage[]
  page: PagePreview
  createdAt: string
}

export interface CreateCateringOfferInput {
  pageId: string
  title: string
  kind: string
  description?: string | null
  pricePerPerson?: number | null
  imageUrls: string[]
}

// A single photo of an offering, in upload order.
export interface OfferingImage {
  id: string
  url: string
  order: number
}

// A bookable service published by a MUSIC_SOUND page: an act (saxophone
// player, DJ set) or a rental listing (sound system, lighting).
// `kind` is an id from the offering-kinds catalog; `priceFrom` is a starting
// price in GEL.
export interface Offering extends Engagement {
  id: string
  title: string
  kind: string
  description: string | null
  priceFrom: number | null
  images: OfferingImage[]
  page: PagePreview
  createdAt: string
}

export interface CreateOfferingInput {
  pageId: string
  title: string
  kind: string
  description?: string | null
  priceFrom?: number | null
  imageUrls: string[]
}

// A single photo/video of a portfolio work, in upload order.
export interface WorkMedia {
  id: string
  url: string
  type: MediaType
  order: number
}

// A portfolio work published by a Photo & Video page: one shoot/project.
// `workCategory` is the aliased `category` field (see WORK_FIELDS).
export interface Work extends Engagement {
  id: string
  title: string
  workCategory: string
  description: string | null
  priceFrom: number | null
  media: WorkMedia[]
  page: PagePreview
  createdAt: string
}

export interface CreateWorkInput {
  pageId: string
  title: string
  category: string
  description?: string | null
  priceFrom?: number | null
  media: Array<{ url: string; type: MediaType }>
}

// A single photo of a florist catalog item, in upload order.
export interface FloristItemImage {
  id: string
  url: string
  order: number
}

// A catalog item published by a FLORIST page: one arrangement it sells.
export interface FloristItem extends Engagement {
  id: string
  title: string
  kind: string
  description: string | null
  priceFrom: number | null
  images: FloristItemImage[]
  page: PagePreview
  createdAt: string
}

export interface CreateFloristItemInput {
  pageId: string
  title: string
  kind: string
  description?: string | null
  priceFrom?: number | null
  imageUrls: string[]
}

// Everything a user can like or comment on (matches the backend enum).
export type ContentTarget =
  | 'POST'
  | 'EVENT'
  | 'DESIGN'
  | 'CATERING_OFFER'
  | 'OFFERING'
  | 'WORK'
  | 'FLORIST_ITEM'
  | 'REQUEST'

// A comment on any content.
export interface CommentItem {
  id: string
  body: string
  createdAt: string
  author: PostAuthor
}

// A demand post: a user describes what they need; vendors reply in comments.
export interface RequestItem extends Engagement {
  id: string
  category: PageType
  occasion: string | null
  eventDate: string | null
  city: string | null
  budgetFrom: number | null
  budgetTo: number | null
  body: string
  author: PostAuthor
  createdAt: string
}

export interface CreateRequestInput {
  category: PageType
  occasion?: string | null
  eventDate?: string | null
  city?: string | null
  budgetFrom?: number | null
  budgetTo?: number | null
  body: string
}

// One story of the unified news feed — discriminated by __typename.
export type FeedItem =
  | ({ __typename: 'Post' } & Post)
  | ({ __typename: 'Event' } & EventItem)
  | ({ __typename: 'Design' } & Design)
  | ({ __typename: 'CateringOffer' } & CateringOffer)
  | ({ __typename: 'Offering' } & Offering)
  | ({ __typename: 'Work' } & Work)
  | ({ __typename: 'FloristItem' } & FloristItem)
  | ({ __typename: 'Request' } & RequestItem)

export interface FeedPage {
  items: FeedItem[]
  nextCursor: string | null
  hasMore: boolean
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface UpdateProfileInput {
  username?: string
  firstName?: string
  lastName?: string
  birthDate?: string
  bio?: string
  avatarUrl?: string
  location?: string
}
