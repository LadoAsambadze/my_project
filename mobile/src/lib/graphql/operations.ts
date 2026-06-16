// GraphQL documents + the TypeScript shapes they return.
// Mirrors backend/src/schema.gql. Kept as plain strings (no codegen step yet).

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
}

// Fields requested everywhere a User is returned. Kept in one place so the
// shape stays consistent across operations.
const USER_FIELDS = /* GraphQL */ `id email name bio avatarUrl location createdAt`;

export interface AuthPayload {
  accessToken: string;
  // Native clients receive the refresh token in the body (web gets a cookie).
  refreshToken: string | null;
  user: AuthUser;
}

export const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const REFRESH = /* GraphQL */ `
  mutation Refresh($token: String) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const LOGOUT = /* GraphQL */ `
  mutation Logout($token: String) {
    logout(token: $token)
  }
`;

export const ME = /* GraphQL */ `
  query Me {
    me { ${USER_FIELDS} }
  }
`;

export const UPDATE_PROFILE = /* GraphQL */ `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { ${USER_FIELDS} }
  }
`;
