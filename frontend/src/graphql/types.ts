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

// Thematic categories a page can belong to (matches the backend PageType enum).
// A single type for now; more can be added later.
export type PageType = 'PHOTOGRAPHER'

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
  type: PageType
  photoUrl: string | null
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
  type: PageType
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
}

export interface CreatePageInput {
  name: string
  // Optional: the backend defaults to PHOTOGRAPHER when omitted.
  type?: PageType
  photoUrl?: string
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
