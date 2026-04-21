"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Lock, Key, Database, Globe, Loader2 } from "lucide-react";

import { api, Vault } from "@/lib/api";

const iconMap = [Database, Key, Lock, Globe];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchVaults = async () => {
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
  };

  useEffect(() => {
    fetchVaults();
  }, []);

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
        <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Cofre
        </button>
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
            <Link
              key={vault.id}
              href={`/secret/${vault.id}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
            >
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
              <div className="flex items-center text-xs text-muted-foreground border-t border-border pt-4">
                <span>Ultimo acesso: {formatLastAccessed(vault.updated_at)}</span>
              </div>
            </Link>
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
    </div>
  );
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
