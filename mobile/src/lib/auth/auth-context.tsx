import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { gql } from '../graphql/client';
import {
  LOGIN,
  LOGOUT,
  ME,
  REGISTER,
  type AuthPayload,
  type AuthUser,
} from '../graphql/operations';
import {
  clearTokens,
  getRefreshToken,
  hydrateTokens,
  setTokens,
} from './token-store';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On first launch, load any stored tokens from the keychain, then try to
  // restore the session. If the access token is missing or expired, gql() will
  // transparently use the stored refresh token.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await hydrateTokens();
        const data = await gql<{ me: AuthUser }>(ME);
        if (active) setUser(data.me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await gql<{ login: AuthPayload }>(
      LOGIN,
      { input: { email, password } },
      { auth: false },
    );
    await setTokens(data.login.accessToken, data.login.refreshToken);
    setUser(data.login.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await gql<{ register: AuthPayload }>(
        REGISTER,
        { input: { email, password, name: name || undefined } },
        { auth: false },
      );
      await setTokens(data.register.accessToken, data.register.refreshToken);
      setUser(data.register.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      // Pass the refresh token so the server can revoke that session.
      await gql<{ logout: boolean }>(LOGOUT, { token: getRefreshToken() });
    } catch {
      // Ignore — we clear local state regardless.
    }
    await clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
