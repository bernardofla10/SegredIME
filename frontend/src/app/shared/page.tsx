"use client";

import { Users, Lock, Calendar } from "lucide-react";

interface SharedVault {
  id: string;
  name: string;
  sharedBy: string;
  sharedWith: number;
  permissions: string;
  sharedDate: string;
}

const sharedVaults: SharedVault[] = [
  {
    id: "1",
    name: "APIs de Integração",
    sharedBy: "Maria Silva",
    sharedWith: 5,
    permissions: "Leitura",
    sharedDate: "2026-02-20",
  },
  {
    id: "2",
    name: "Desenvolvimento Frontend",
    sharedBy: "Carlos Santos",
    sharedWith: 8,
    permissions: "Leitura e Escrita",
    sharedDate: "2026-02-18",
  },
  {
    id: "3",
    name: "Infraestrutura Cloud",
    sharedBy: "Ana Costa",
    sharedWith: 3,
    permissions: "Leitura",
    sharedDate: "2026-02-15",
  },
];

export default function SharedPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Cofres Compartilhados</h1>
        <p className="text-muted-foreground">
          Acesse cofres compartilhados por outros membros da equipe
        </p>
      </div>

      {/* Shared Vaults List */}
      <div className="space-y-4 max-w-5xl">
        {sharedVaults.map((vault) => (
          <div
            key={vault.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-0.5">{vault.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Compartilhado por <span className="font-medium text-foreground">{vault.sharedBy}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{vault.sharedWith} membros</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDate(vault.sharedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    vault.permissions === "Leitura e Escrita"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {vault.permissions}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sharedVaults.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-lg max-w-5xl">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Cofre Vazio</h3>
          <p className="text-muted-foreground italic">Nenhum cofre compartilhado com você no momento</p>
        </div>
      )}
    </div>
  );
}
