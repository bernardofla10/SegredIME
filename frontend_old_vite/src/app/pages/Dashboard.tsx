import { useState } from "react";
import { Link } from "react-router";
import { Search, Plus, Lock, Key, Database, Globe } from "lucide-react";

interface Vault {
  id: string;
  name: string;
  description: string;
  secretCount: number;
  icon: any;
  lastAccessed: string;
}

const vaults: Vault[] = [
  {
    id: "1",
    name: "Produção",
    description: "Credenciais do ambiente de produção",
    secretCount: 24,
    icon: Database,
    lastAccessed: "2026-02-24T10:30:00",
  },
  {
    id: "2",
    name: "APIs Externas",
    description: "Chaves de integração com serviços externos",
    secretCount: 18,
    icon: Key,
    lastAccessed: "2026-02-24T09:15:00",
  },
  {
    id: "3",
    name: "Certificados SSL",
    description: "Certificados digitais e chaves privadas",
    secretCount: 12,
    icon: Lock,
    lastAccessed: "2026-02-23T16:45:00",
  },
  {
    id: "4",
    name: "Desenvolvimento",
    description: "Credenciais do ambiente de desenvolvimento",
    secretCount: 32,
    icon: Globe,
    lastAccessed: "2026-02-24T11:20:00",
  },
  {
    id: "5",
    name: "Banco de Dados",
    description: "Credenciais de acesso aos bancos de dados",
    secretCount: 15,
    icon: Database,
    lastAccessed: "2026-02-24T08:00:00",
  },
  {
    id: "6",
    name: "Homologação",
    description: "Credenciais do ambiente de homologação",
    secretCount: 20,
    icon: Globe,
    lastAccessed: "2026-02-23T14:30:00",
  },
];

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVaults = vaults.filter((vault) =>
    vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vault.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Há poucos minutos";
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    return `Há ${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Meus Cofres</h1>
        <p className="text-muted-foreground">
          Gerencie seus cofres de segredos digitais com segurança e controle total
        </p>
      </div>

      {/* Search and Actions */}
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
        <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Cofre
        </button>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVaults.map((vault) => {
          const Icon = vault.icon;
          return (
            <Link
              key={vault.id}
              to={`/secret/${vault.id}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-sm">
                  {vault.secretCount} segredos
                </span>
              </div>
              <h3 className="mb-2">{vault.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {vault.description}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Último acesso: {formatLastAccessed(vault.lastAccessed)}</span>
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

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl mb-1 text-primary">{vaults.length}</div>
          <div className="text-sm text-muted-foreground">Cofres Ativos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl mb-1 text-primary">
            {vaults.reduce((acc, vault) => acc + vault.secretCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Segredos Armazenados</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl mb-1 text-green-600">100%</div>
          <div className="text-sm text-muted-foreground">Conformidade de Segurança</div>
        </div>
      </div>
    </div>
  );
}
