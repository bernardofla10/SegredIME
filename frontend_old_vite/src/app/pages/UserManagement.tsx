import { Search, Plus, Shield, Mail, MoreVertical } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastActive: string;
  vaultsAccess: number;
}

const users: User[] = [
  {
    id: "1",
    name: "João Dias",
    email: "joao.dias@example.com",
    role: "admin",
    status: "active",
    lastActive: "2026-02-24T11:45:00",
    vaultsAccess: 12,
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria.silva@example.com",
    role: "editor",
    status: "active",
    lastActive: "2026-02-24T11:30:00",
    vaultsAccess: 8,
  },
  {
    id: "3",
    name: "Carlos Santos",
    email: "carlos.santos@example.com",
    role: "editor",
    status: "active",
    lastActive: "2026-02-24T10:15:00",
    vaultsAccess: 6,
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    role: "viewer",
    status: "active",
    lastActive: "2026-02-24T09:45:00",
    vaultsAccess: 4,
  },
  {
    id: "5",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@example.com",
    role: "editor",
    status: "inactive",
    lastActive: "2026-02-20T16:30:00",
    vaultsAccess: 5,
  },
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary/10 text-primary";
      case "editor":
        return "bg-accent/10 text-accent";
      case "viewer":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "editor":
        return "Editor";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie permissões e acessos dos usuários do sistema
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Usuário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl mb-1">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total de Usuários</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl mb-1 text-green-600">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-sm text-muted-foreground">Ativos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl mb-1 text-primary">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-sm text-muted-foreground">Administradores</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl mb-1 text-accent">
            {users.filter((u) => u.role === "editor").length}
          </div>
          <div className="text-sm text-muted-foreground">Editores</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Cofres Acessíveis
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Última Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      <Shield className="w-3 h-3" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.vaultsAccess}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatLastActive(user.lastActive)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        user.status === "active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="ml-2 text-sm">
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
