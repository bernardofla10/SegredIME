"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  vaults_access: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getCSRFToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/csrf/`, { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me/`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    try {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return { ok: true };
      } else {
        const err = await res.json();
        return { ok: false, error: err.detail || "Erro ao fazer login" };
      }
    } catch {
      return { ok: false, error: "Erro de conexão com o servidor" };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return { ok: true };
      } else {
        const err = await res.json();
        const errorMsg =
          typeof err === "object"
            ? Object.values(err).flat().join(", ")
            : "Erro ao registrar";
        return { ok: false, error: errorMsg };
      }
    } catch {
      return { ok: false, error: "Erro de conexão com o servidor" };
    }
  };

  const logout = async () => {
    try {
      const csrfToken = await getCSRFToken();
      await fetch(`${API_URL}/api/auth/logout/`, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken },
        credentials: "include",
      });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
