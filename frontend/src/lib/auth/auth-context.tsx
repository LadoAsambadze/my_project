'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { gql, setAccessToken } from '@/lib/graphql/client';
import {
  LOGIN,
  LOGOUT,
  ME,
  REGISTER,
  type AuthPayload,
  type AuthUser,
} from '@/lib/graphql/operations';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to restore the session. If the access token is missing
  // or expired, gql() will transparently use the refresh cookie.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
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
    setAccessToken(data.login.accessToken);
    setUser(data.login.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await gql<{ register: AuthPayload }>(
        REGISTER,
        { input: { email, password, name: name || undefined } },
        { auth: false },
      );
      setAccessToken(data.register.accessToken);
      setUser(data.register.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await gql<{ logout: boolean }>(LOGOUT);
    } catch {
      // Ignore — we clear local state regardless.
    }
    setAccessToken(null);
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
