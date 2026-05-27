"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, type ApiUser } from "./api";

type AuthState = {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = window.localStorage.getItem("pb_token");
    setTokenState(t);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me.user);
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setTokenState(null);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      isLoading,
      login: async (newToken) => {
        setToken(newToken);
        setTokenState(newToken);
        const me = await api.me();
        setUser(me.user);
      },
      logout: () => {
        setToken(null);
        setTokenState(null);
        setUser(null);
      }
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

