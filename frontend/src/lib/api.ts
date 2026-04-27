export interface Vault {
  id: number;
  name: string;
  description: string;
  secrets_count: number;
  access_level: "read" | "write" | "owner" | null;
  can_manage: boolean;
  members_count: number;
  updated_at: string;
  created_at: string;
}

export interface SecretSummary {
  id: number;
  vault: number;
  vault_name: string;
  title: string;
  description: string;
  username?: string;
  url?: string;
  notes?: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

export type SecretDetail = SecretSummary;

export interface VaultMember {
  id: number;
  vault: number;
  user: number;
  username: string;
  email: string;
  user_display_name: string;
  permission: "read" | "write" | "owner";
  granted_by: number | null;
  granted_by_display_name: string;
  created_at: string;
  updated_at: string;
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

interface VaultPayload {
  name: string;
  description: string;
}

interface SecretPayload {
  vault: number;
  title: string;
  description: string;
  secret_value: string;
}

interface MemberPayload {
  user: number;
  permission: "read" | "write" | "owner";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const entries = payload as Record<string, unknown>;
  if (typeof entries.detail === "string") return entries.detail;
  if (Array.isArray(entries.non_field_errors)) {
    return entries.non_field_errors.join(", ");
  }
  const firstEntry = Object.entries(entries).find(([, value]) => value);
  if (!firstEntry) return fallback;
  const [, value] = firstEntry;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return fallback;
}

async function getCSRFToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/csrf/`, { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const method = (init?.method || "GET").toUpperCase();

  if (!headers.has("Content-Type") && method !== "GET" && method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !headers.has("X-CSRFToken")) {
    headers.set("X-CSRFToken", await getCSRFToken());
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new Error(formatApiError(payload, `Erro HTTP ${response.status}`));
  }

  return payload as T;
}

export const api = {
  listVaults(): Promise<Vault[]> {
    return request<Vault[]>("/api/vaults/");
  },

  listSharedVaults(): Promise<Vault[]> {
    return request<Vault[]>("/api/vaults/shared/");
  },

  createVault(payload: VaultPayload): Promise<Vault> {
    return request<Vault>("/api/vaults/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listVaultMembers(vaultId: number): Promise<VaultMember[]> {
    return request<VaultMember[]>(`/api/vaults/${vaultId}/members/`);
  },

  upsertVaultMember(vaultId: number, payload: MemberPayload): Promise<VaultMember> {
    return request<VaultMember>(`/api/vaults/${vaultId}/members/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteVaultMember(vaultId: number, memberId: number): Promise<void> {
    return request<void>(`/api/vaults/${vaultId}/members/${memberId}/`, {
      method: "DELETE",
    });
  },

  listSecrets(vaultId: number): Promise<SecretSummary[]> {
    return request<SecretSummary[]>(`/api/secrets/?vault=${vaultId}`);
  },

  getSecret(secretId: number): Promise<SecretDetail> {
    return request<SecretDetail>(`/api/secrets/${secretId}/`);
  },

  createSecret(payload: SecretPayload): Promise<SecretSummary> {
    return request<SecretSummary>("/api/secrets/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  requestSecretReveal(secretId: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/secrets/${secretId}/reveal/request/`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  revealSecret(secretId: number, approvalRequestId: number): Promise<{ status: string; secret_value: string }> {
    return request<{ status: string; secret_value: string }>(`/api/secrets/${secretId}/reveal/`, {
      method: "POST",
      body: JSON.stringify({ approval_request_id: approvalRequestId }),
    });
  },

  listMfaRequests(status?: string): Promise<MfaApprovalRequest[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<MfaApprovalRequest[]>(`/api/mfa/requests/${qs}`);
  },

  getMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/`);
  },

  approveMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/approve/`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  denyMfaRequest(id: number): Promise<MfaApprovalRequest> {
    return request<MfaApprovalRequest>(`/api/mfa/requests/${id}/deny/`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};
