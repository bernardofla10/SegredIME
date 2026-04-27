"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Loader2, Lock, Users } from "lucide-react";

import { api, Vault } from "@/lib/api";

export default function SharedPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVaults = async () => {
      try {
        const data = await api.listSharedVaults();
        setVaults(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar cofres compartilhados.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadVaults();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const permissionLabel = (permission: Vault["access_level"]) => {
    switch (permission) {
      case "owner":
        return "Dono";
      case "write":
        return "Leitura e Escrita";
      case "read":
        return "Leitura";
      default:
        return "Acesso";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando cofres compartilhados...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Cofres Compartilhados</h1>
        <p className="text-muted-foreground">
          Acesse cofres liberados por outros membros da equipe
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4 max-w-5xl">
        {vaults.map((vault) => (
          <Link
            key={vault.id}
            href={`/secret/${vault.id}`}
            className="block bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-0.5">{vault.name}</h3>
                    <p className="text-sm text-muted-foreground">{vault.description || "Sem descricao"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{vault.members_count} membros</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(vault.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {permissionLabel(vault.access_level)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {vaults.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-lg max-w-5xl">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Nenhum cofre compartilhado</h3>
          <p className="text-muted-foreground italic">Quando alguém compartilhar um cofre com você, ele aparecerá aqui.</p>
        </div>
      )}
    </div>
  );
}
