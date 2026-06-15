// GraphQL documents + the TypeScript shapes they return.
// Mirrors backend/src/schema.gql. Kept as plain strings (no codegen step yet).

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

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
      user { id email name createdAt }
    }
  }
`;

export const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user { id email name createdAt }
    }
  }
`;

export const REFRESH = /* GraphQL */ `
  mutation Refresh($token: String) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
      user { id email name createdAt }
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
    me { id email name createdAt }
  }
`;
