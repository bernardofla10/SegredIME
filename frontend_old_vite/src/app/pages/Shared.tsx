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

export function Shared() {
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
        <h1 className="mb-2">Cofres Compartilhados</h1>
        <p className="text-muted-foreground">
          Acesse cofres compartilhados por outros membros da equipe
        </p>
      </div>

      {/* Shared Vaults List */}
      <div className="space-y-4">
        {sharedVaults.map((vault) => (
          <div
            key={vault.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1">{vault.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Compartilhado por {vault.sharedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{vault.sharedWith} membros</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(vault.sharedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    vault.permissions === "Leitura e Escrita"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
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
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum cofre compartilhado com você</p>
        </div>
      )}
    </div>
  );
}
