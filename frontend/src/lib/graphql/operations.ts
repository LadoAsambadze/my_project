// GraphQL documents + the TypeScript shapes they return.
// Kept as plain strings so we don't need a codegen step for this first feature.

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export const REGISTER = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user { id email name createdAt }
    }
  }
`;

export const LOGIN = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user { id email name createdAt }
    }
  }
`;

export const REFRESH = /* GraphQL */ `
  mutation Refresh {
    refreshToken {
      accessToken
      user { id email name createdAt }
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
    me { id email name createdAt }
  }
`;
