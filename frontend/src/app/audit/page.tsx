"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuditLog {
  id: number;
  user: number | null;
  user_display_name: string;
  action: string;
  action_display: string;
  resource_type: string;
  resource_id: number | null;
  resource_name: string;
  ip_address: string | null;
  user_agent: string;
  status: "success" | "warning" | "error";
  status_display: string;
  details: string;
  timestamp: string;
}

interface LogStats {
  total: number;
  success: number;
  warning: number;
  error: number;
}

export default function AuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, success: 0, warning: 0, error: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`${API_URL}/api/logs/?${params.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/logs/stats/`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
    fetchStats();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      "Data/Hora",
      "Usuário",
      "Ação",
      "Recurso",
      "IP",
      "Status",
      "Detalhes",
    ];
    const rows = logs.map((log) => [
      formatTimestamp(log.timestamp),
      log.user_display_name,
      log.action_display,
      log.resource_name,
      log.ip_address || "",
      log.status_display,
      log.details,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria_segredime_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("login") || action.includes("logout")) return "🔐";
    if (action.includes("vault")) return "🗄️";
    if (action.includes("secret") || action.includes("reveal")) return "🔑";
    if (action.includes("permission") || action.includes("share")) return "👥";
    if (action.includes("export")) return "📤";
    return "📋";
  };

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Carregando logs de auditoria...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 pb-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trilha de Auditoria</h1>
          <p className="text-muted-foreground">
            Monitore todas as ações e acessos realizados no sistema em tempo real
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
          title="Atualizar"
        >
          <RefreshCw
            className={`w-5 h-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuário, recurso ou detalhes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-10 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="warning">Alerta</option>
              <option value="error">Erro</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all flex items-center gap-2 font-semibold shadow-sm"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mb-1">{stats.total}</div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Total de Eventos
          </div>
        </div>
        <div className="bg-card border border-green-200/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1 text-green-600">
            {stats.success}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Sucessos
          </div>
        </div>
        <div className="bg-card border border-yellow-200/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold mb-1 text-yellow-600">
            {stats.warning}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Alertas
          </div>
        </div>
        <div className="bg-card border border-red-200/50 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold mb-1 text-red-600">
            {stats.error}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Erros Críticos
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[1050px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Ação Realizada</th>
              <th className="px-6 py-4">Recurso</th>
              <th className="px-6 py-4">Endereço IP</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-muted/10 transition-colors text-sm"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-medium text-foreground">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(log.timestamp)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {log.user_display_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <span className="font-bold text-foreground">
                      {log.user_display_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                    <span>{getActionIcon(log.action)}</span>
                    {log.action_display}
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    {log.details}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="font-medium text-foreground">
                    {log.resource_name || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {log.resource_type === "vault" && "Cofre"}
                    {log.resource_type === "secret" && "Segredo"}
                    {log.resource_type === "system" && "Sistema"}
                    {log.resource_type === "user" && "Usuário"}
                    {log.resource_id ? ` #${log.resource_id}` : ""}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap font-mono text-muted-foreground text-xs">
                  {log.ip_address || "—"}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {getStatusIcon(log.status)}
                    {log.status_display}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-20">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              Nenhum log de auditoria encontrado
            </p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Os logs aparecem automaticamente conforme ações são realizadas no sistema
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
