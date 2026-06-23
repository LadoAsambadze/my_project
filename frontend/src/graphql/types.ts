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
  media: PostMedia[]
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
