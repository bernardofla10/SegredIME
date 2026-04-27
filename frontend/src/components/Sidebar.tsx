"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lock, FolderLock, Share2, FileText, Users, Shield, LogOut, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Meus Cofres", href: "/", icon: FolderLock },
    { name: "Compartilhados", href: "/shared", icon: Share2 },
    { name: "Mobile MFA", href: "/mobile", icon: Smartphone },
    { name: "Auditoria", href: "/audit", icon: FileText, adminOnly: true },
    { name: "Gestão de Usuários", href: "/users", icon: Users, adminOnly: true },
    { name: "Configurações de Segurança", href: "/settings", icon: Shield, adminOnly: true },
  ].filter((item) => !item.adminOnly || user?.role === "admin");

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getInitials = () => {
    if (!user) return "??";
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Lock className="w-6 h-6 text-sidebar-foreground mr-3" />
        <span className="text-xl font-semibold text-sidebar-foreground">
          SegredIME
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground text-sm font-bold">
            {getInitials()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm text-sidebar-foreground font-medium truncate">
              {user?.full_name || user?.username || "Usuário"}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {getRoleLabel(user?.role || "viewer")}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
