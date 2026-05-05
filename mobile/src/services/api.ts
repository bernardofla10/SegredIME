import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── API URL Configuration ──────────────────────────────────────────
// Change this to your computer's LAN IP so the phone on the same Wi-Fi
// can reach the backend. Example: "http://192.168.0.100:8000"
// When running via Docker, the backend listens on port 8000.
const API_URL = "http://192.168.2.103:8000";

// ─── Types ──────────────────────────────────────────────────────────

export interface User {
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

export interface MfaApprovalRequest {
  id: number;
  secret: number;
  secret_title: string;
  vault_id: number;
  vault_name: string;
  requested_by: number;
  requested_by_display_name: string;
  status: "pending" | "approved" | "denied" | "expired";
  requested_ip: string | null;
  user_agent: string;
  expires_at: string;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Token Storage ──────────────────────────────────────────────────

const TOKEN_KEY = "@segredime_token";

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP Client ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    authenticated?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, authenticated = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (authenticated) {
    const token = await getStoredToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorPayload = payload as Record<string, unknown> | null;
    const detail =
      errorPayload && typeof errorPayload.detail === "string"
        ? errorPayload.detail
        : `Erro HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload as T;
}

// ─── API Methods ────────────────────────────────────────────────────

export const api = {
  /** Authenticate with username/password and get a token */
  login(username: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/token/login/", {
      method: "POST",
      body: { username, password },
      authenticated: false,
    });
  },

  /** Invalidate the current token */
  logout(): Promise<void> {
    return request<void>("/api/auth/token/logout/", {
      method: "POST",
    });
  },

  /** Get the current user's profile */
  me(): Promise<User> {
    return request<User>("/api/auth/me/");
  },

  /** List all MFA approval requests */
  listMfaRequests(status?: string): Promise<MfaApprovalRequest[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<MfaApprovalRequest[]>(`/api/mfa/requests/${qs}`);
  },

  /** Get a single MFA approval request */
  getMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/`);
  },

  /** Approve an MFA request */
  approveMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/approve/`, {
      method: "POST",
      body: {},
    });
  },

  /** Deny an MFA request */
  denyMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/deny/`, {
      method: "POST",
      body: {},
    });
  },
};

/** Get the current API URL for display purposes */
export function getApiUrl(): string {
  return API_URL;
}
