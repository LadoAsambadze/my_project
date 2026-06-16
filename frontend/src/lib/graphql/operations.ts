// GraphQL documents + the TypeScript shapes they return.
// Kept as plain strings so we don't need a codegen step for this first feature.

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
}

// Shared user selection set so every operation returns the same shape.
const USER_FIELDS = /* GraphQL */ `
  id
  email
  name
  bio
  avatarUrl
  location
  createdAt
`;

export const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const REFRESH = /* GraphQL */ `
  mutation Refresh {
    refreshToken {
      accessToken
      user { ${USER_FIELDS} }
    }
  }
`;

export const LOGOUT = /* GraphQL */ `
  mutation Logout {
    logout
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
