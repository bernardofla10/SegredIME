"use client";

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

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "editor":
        return "bg-accent/10 text-accent border-accent/20";
      case "viewer":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
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
    <div className="p-8 pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie permissões e acessos dos usuários do sistema
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-semibold shadow-sm">
          <Plus className="w-5 h-5" />
          Adicionar Usuário
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-2xl font-bold mb-1">{users.length}</div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total</div>
        </div>
        <div className="bg-card border border-green-200/50 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-green-600">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Ativos</div>
        </div>
        <div className="bg-card border border-primary/20 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-primary">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Admins</div>
        </div>
        <div className="bg-card border border-accent/20 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-accent">
            {users.filter((u) => u.role === "editor").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Editores</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-left">
              <th className="px-6 py-4">Informações do Usuário</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4 text-center">Cofres Acessíveis</th>
              <th className="px-6 py-4">Última Atividade</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm leading-tight mb-1">{user.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-center font-bold">{user.vaultsAccess}</td>
                <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                  {formatLastActive(user.lastActive)}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full border border-white shadow-sm shadow-black/10 ${
                        user.status === "active" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className={`text-sm font-semibold ${user.status === "active" ? "text-green-700" : "text-gray-500"}`}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-muted rounded-full transition-colors outline-none focus:ring-2 focus:ring-ring">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Nenhum usuário correspondente à sua busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
