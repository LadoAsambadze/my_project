// Hand-written shapes mirroring the Event backend GraphQL schema. Run
// `pnpm codegen` (with the backend running) to regenerate typed operations
// into src/gql if you prefer fully generated types.

export type Role = 'USER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  location: string | null
  role: Role
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface UpdateProfileInput {
  name?: string
  bio?: string
  avatarUrl?: string
  location?: string
}
