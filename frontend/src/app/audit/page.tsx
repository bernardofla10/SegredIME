"use client";

import { useState } from "react";
import { Search, Download, Filter, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: "success" | "warning" | "error";
  details: string;
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2026-02-24T11:45:23",
    user: "João Dias",
    action: "Visualização de Senha",
    resource: "Produção / Banco de Dados Principal",
    ipAddress: "192.168.1.105",
    status: "success",
    details: "Senha revelada após aprovação mobile",
  },
  {
    id: "2",
    timestamp: "2026-02-24T11:30:15",
    user: "Maria Silva",
    action: "Criação de Cofre",
    resource: "APIs Externas",
    ipAddress: "192.168.1.142",
    status: "success",
    details: "Novo cofre criado com sucesso",
  },
  {
    id: "3",
    timestamp: "2026-02-24T11:15:08",
    user: "Carlos Santos",
    action: "Tentativa de Acesso",
    resource: "Certificados SSL",
    ipAddress: "10.0.0.45",
    status: "warning",
    details: "Acesso negado - autenticação 2FA pendente",
  },
  {
    id: "4",
    timestamp: "2026-02-24T10:55:42",
    user: "Ana Costa",
    action: "Visualização de Senha",
    resource: "APIs Externas / Stripe API Key",
    ipAddress: "192.168.1.89",
    status: "success",
    details: "Senha copiada para área de transferência",
  },
  {
    id: "5",
    timestamp: "2026-02-24T10:42:31",
    user: "Pedro Oliveira",
    action: "Modificação de Segredo",
    resource: "Produção / API Gateway",
    ipAddress: "192.168.1.156",
    status: "success",
    details: "Credencial rotacionada com sucesso",
  },
  {
    id: "6",
    timestamp: "2026-02-24T10:30:19",
    user: "Usuário Desconhecido",
    action: "Tentativa de Login",
    resource: "Sistema",
    ipAddress: "203.0.113.45",
    status: "error",
    details: "Múltiplas tentativas de login falhadas",
  },
  {
    id: "7",
    timestamp: "2026-02-24T10:15:05",
    user: "João Dias",
    action: "Compartilhamento de Cofre",
    resource: "Desenvolvimento",
    ipAddress: "192.168.1.105",
    status: "success",
    details: "Cofre compartilhado com 3 usuários",
  },
  {
    id: "8",
    timestamp: "2026-02-24T09:58:47",
    user: "Maria Silva",
    action: "Exportação de Logs",
    resource: "Auditoria",
    ipAddress: "192.168.1.142",
    status: "warning",
    details: "Exportação de logs dos últimos 30 dias",
  },
  {
    id: "9",
    timestamp: "2026-02-24T09:45:33",
    user: "Carlos Santos",
    action: "Atualização de Permissões",
    resource: "Gestão de Usuários / Ana Costa",
    ipAddress: "10.0.0.45",
    status: "success",
    details: "Permissões de leitura concedidas",
  },
  {
    id: "10",
    timestamp: "2026-02-24T09:30:21",
    user: "Ana Costa",
    action: "Visualização de Senha",
    resource: "Banco de Dados / PostgreSQL Prod",
    ipAddress: "192.168.1.89",
    status: "success",
    details: "Acesso autorizado via biometria",
  },
];

export default function AuditTrailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || log.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Sucesso";
      case "warning":
        return "Alerta";
      case "error":
        return "Erro";
      default:
        return status;
    }
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

  return (
    <div className="p-8 pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Trilha de Auditoria</h1>
        <p className="text-muted-foreground">
          Monitore todas as ações e acessos realizados no sistema
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação ou recurso..."
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
          
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all flex items-center gap-2 font-semibold shadow-sm">
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="text-2xl font-bold mb-1">{auditLogs.length}</div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total de Eventos</div>
        </div>
        <div className="bg-card border border-green-200/50 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-green-600">
            {auditLogs.filter((log) => log.status === "success").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Sucessos</div>
        </div>
        <div className="bg-card border border-yellow-200/50 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-yellow-600">
            {auditLogs.filter((log) => log.status === "warning").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Alertas</div>
        </div>
        <div className="bg-card border border-red-200/50 rounded-lg p-5">
          <div className="text-2xl font-bold mb-1 text-red-600">
            {auditLogs.filter((log) => log.status === "error").length}
          </div>
          <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Erros Críticos</div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
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
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/10 transition-colors text-sm">
                <td className="px-6 py-5 whitespace-nowrap font-medium text-muted-foreground">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap font-bold text-foreground">
                  {log.user}
                </td>
                <td className="px-6 py-5">
                  <div className="font-semibold text-foreground mb-1">{log.action}</div>
                  <div className="text-xs text-muted-foreground italic">
                    {log.details}
                  </div>
                </td>
                <td className="px-6 py-5 font-medium text-muted-foreground">
                  {log.resource}
                </td>
                <td className="px-6 py-5 whitespace-nowrap font-mono text-muted-foreground">
                  {log.ipAddress}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(
                      log.status
                    )}`}
                  >
                    {getStatusIcon(log.status)}
                    {getStatusLabel(log.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Nenhum log de auditoria encontrado para essa busca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
