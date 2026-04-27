"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Lock, Key, Database, Globe, Loader2, Share2, X, Trash2, Users } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { api, Vault, VaultMember } from "@/lib/api";

const iconMap = [Database, Key, Lock, Globe];

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharingVault, setSharingVault] = useState<Vault | null>(null);

  const fetchVaults = useCallback(async () => {
    try {
      const data = await api.listVaults();
      setVaults(data);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar cofres.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  const filteredVaults = vaults.filter((vault) =>
    vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Ha poucos minutos";
    if (diffInHours < 24) return `Ha ${diffInHours}h`;
    return `Ha ${Math.floor(diffInHours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando seus cofres...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Meus Cofres</h1>
        <p className="text-muted-foreground">
          Gerencie seus cofres de segredos digitais com seguranca e controle total
        </p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cofres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {(user?.role === "admin" || user?.role === "editor") && (
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Cofre
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVaults.map((vault, index) => {
          const Icon = iconMap[index % iconMap.length];
          return (
            <div
              key={vault.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <Link href={`/secret/${vault.id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-sm">
                    {vault.secrets_count} segredos
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">{vault.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                  {vault.description || "Sem descricao"}
                </p>
              </Link>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                <span>{accessLevelLabel(vault.access_level)} · {formatLastAccessed(vault.updated_at)}</span>
                {vault.can_manage && (
                  <button
                    onClick={() => setSharingVault(vault)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-semibold text-foreground hover:bg-muted"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartilhar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredVaults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cofre encontrado</p>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold mb-1 text-primary">{vaults.length}</div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Cofres Ativos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold mb-1 text-primary">
            {vaults.reduce((acc, vault) => acc + vault.secrets_count, 0)}
          </div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Segredos Armazenados</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold mb-1 text-green-600">AES-256</div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Criptografia em repouso</div>
        </div>
      </div>

      {showCreateModal && (
        <CreateVaultModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchVaults}
        />
      )}

      {sharingVault && (
        <ShareVaultModal
          vault={sharingVault}
          onClose={() => setSharingVault(null)}
          onChanged={fetchVaults}
        />
      )}
    </div>
  );
}

function accessLevelLabel(accessLevel: Vault["access_level"]) {
  switch (accessLevel) {
    case "owner":
      return "Dono";
    case "write":
      return "Leitura e escrita";
    case "read":
      return "Leitura";
    default:
      return "Acesso";
  }
}

function CreateVaultModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorFeedback(null);

    try {
      await api.createVault({
        name: name.trim(),
        description: description.trim(),
      });
      onCreated();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao criar cofre.";
      setErrorFeedback(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold">Novo Cofre</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          {errorFeedback && <p className="text-sm text-red-600">{errorFeedback}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/70 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UserOption {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

function ShareVaultModal({
  vault,
  onClose,
  onChanged,
}: {
  vault: Vault;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [members, setMembers] = useState<VaultMember[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<"read" | "write" | "owner">("read");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [membersData, usersResponse] = await Promise.all([
        api.listVaultMembers(vault.id),
        fetch(`${API_URL}/api/users/`, { credentials: "include" }),
      ]);
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      setMembers(membersData);
      setUsers(Array.isArray(usersData) ? usersData : usersData.results || []);
      setFeedback(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar compartilhamento.";
      setFeedback(message);
    } finally {
      setLoading(false);
    }
  }, [vault.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addMember = async () => {
    if (!selectedUserId) return;
    try {
      await api.upsertVaultMember(vault.id, {
        user: Number(selectedUserId),
        permission,
      });
      setSelectedUserId("");
      await loadData();
      onChanged();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao compartilhar cofre.";
      setFeedback(message);
    }
  };

  const removeMember = async (memberId: number) => {
    try {
      await api.deleteVaultMember(vault.id, memberId);
      await loadData();
      onChanged();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover acesso.";
      setFeedback(message);
    }
  };

  const memberUserIds = new Set(members.map((member) => member.user));
  const availableUsers = users.filter((item) => !memberUserIds.has(item.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Compartilhar Cofre</h2>
              <p className="text-sm text-muted-foreground">{vault.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {feedback && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
              {feedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3">
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecionar usuário</option>
              {availableUsers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name || item.username} ({item.role})
                </option>
              ))}
            </select>
            <select
              value={permission}
              onChange={(event) => setPermission(event.target.value as "read" | "write" | "owner")}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="read">Leitura</option>
              <option value="write">Leitura e escrita</option>
              <option value="owner">Dono</option>
            </select>
            <button
              onClick={addMember}
              disabled={!selectedUserId}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Conceder
            </button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando permissões...</div>
            ) : (
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <div className="font-semibold">{member.user_display_name}</div>
                      <div className="text-xs text-muted-foreground">{member.email || member.username}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
                        {accessLevelLabel(member.permission)}
                      </span>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remover acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">Nenhum usuário com acesso.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
