"use client";

import {
  Search,
  Plus,
  Shield,
  Mail,
  MoreVertical,
  Loader2,
  Trash2,
  Edit3,
  X,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  vaults_access: number;
}

async function getCSRFToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/csrf/`, { credentials: "include" });
  const data = await res.json();
  return data.csrfToken;
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const csrfToken = await getCSRFToken();
      await fetch(`${API_URL}/api/users/${userId}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrfToken },
        credentials: "include",
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
    setOpenMenuId(null);
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const csrfToken = await getCSRFToken();
      await fetch(`${API_URL}/api/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
    setEditingUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Carregando usuários...
        </p>
      </div>
    );
  }

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
            placeholder="Buscar por nome, usuário ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Adicionar Usuário
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-2xl font-bold mb-1">{users.length}</div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Total
          </div>
        </div>
        <div className="bg-card border border-green-200/50 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-green-600">
            {users.filter((u) => u.is_active).length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Ativos
          </div>
        </div>
        <div className="bg-card border border-primary/20 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-primary">
            {users.filter((u) => u.role === "admin").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Admins
          </div>
        </div>
        <div className="bg-card border border-accent/20 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-accent">
            {users.filter((u) => u.role === "editor").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Editores
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider text-left">
              <th className="px-6 py-4">Informações do Usuário</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4 text-center">Cofres Acessados</th>
              <th className="px-6 py-4">Último Login</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-muted/10 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-sm leading-tight mb-1">
                        {user.full_name || user.username}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email || user.username}
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
                <td className="px-6 py-5 text-sm text-center font-bold">
                  {user.vaults_access}
                </td>
                <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                  {formatLastActive(user.last_login)}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full border border-white shadow-sm shadow-black/10 ${
                        user.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        user.is_active ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {user.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }
                    className="p-2 hover:bg-muted rounded-full transition-colors outline-none focus:ring-2 focus:ring-ring"
                  >
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>

                  {openMenuId === user.id && (
                    <div className="absolute right-6 top-14 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-48 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2.5 font-medium"
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                        Editar Função
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2.5 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir Usuário
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              Nenhum usuário correspondente à sua busca.
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchUsers}
        />
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateRole}
        />
      )}

      {/* Click outside to close menu */}
      {openMenuId !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "viewer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`${API_URL}/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        const msg =
          typeof data === "object"
            ? Object.values(data).flat().join(", ")
            : "Erro ao criar usuário";
        setError(msg);
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold">Novo Usuário</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nome</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                placeholder="João"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Sobrenome</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                placeholder="Dias"
                required
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="joao.dias"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="joao@example.com"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Mín. 8 caracteres"
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Função</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRoleModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (userId: number, role: string) => void;
}) {
  const [role, setRole] = useState(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold">Editar Função</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Alterar a função de <strong>{user.full_name || user.username}</strong>
          </p>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/70 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(user.id, role)}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
