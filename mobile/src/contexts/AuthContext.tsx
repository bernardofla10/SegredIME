import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

import {
  api,
  User,
  getStoredToken,
  storeToken,
  removeToken,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await api.me();
      setUser(me);
    } catch {
      setUser(null);
      await removeToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      await storeToken(response.token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro de conexão com o servidor";
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore errors during logout
    }
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
