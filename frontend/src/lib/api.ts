export interface Vault {
  id: number;
  name: string;
  description: string;
  secrets_count: number;
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
  created_at: string;
  updated_at: string;
}

export interface SecretDetail extends SecretSummary {
  secret_value: string;
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
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

  createVault(payload: VaultPayload): Promise<Vault> {
    return request<Vault>("/api/vaults/", {
      method: "POST",
      body: JSON.stringify(payload),
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
};
