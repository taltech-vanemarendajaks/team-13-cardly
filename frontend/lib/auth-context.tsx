"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  apiFetch,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken
} from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  hasGoogle?: boolean;
  hasPassword?: boolean;
  plan: "free" | "pro" | "business";
  stripeStatus: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      if (!getAccessToken()) {
        await refreshAccessToken();
      }

      const me = await apiFetch<AuthUser>("/auth/me", { skipAuthRefresh: true });
      setUser(me);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;

      if (status === 401) {
        try {
          await refreshAccessToken();
          const me = await apiFetch<AuthUser>("/auth/me", {
            skipAuthRefresh: true
          });
          setUser(me);
          return;
        } catch {
          clearAccessToken();
          setUser(null);
        }
      } else if (status === undefined) {
        clearAccessToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiFetch("/auth/logout", {
      method: "POST",
      skipAuthRefresh: true
    }).catch(() => {});
    clearAccessToken();
    setUser(null);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
