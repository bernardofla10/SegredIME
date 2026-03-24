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

export function AuditTrail() {
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Trilha de Auditoria</h1>
        <p className="text-muted-foreground">
          Monitore todas as ações e acessos realizados no sistema
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação ou recurso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="warning">Alerta</option>
              <option value="error">Erro</option>
            </select>
          </div>
          
          <button className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl mb-1">{auditLogs.length}</div>
          <div className="text-sm text-muted-foreground">Total de Eventos</div>
        </div>
        <div className="bg-card border border-green-200 rounded-lg p-4">
          <div className="text-2xl mb-1 text-green-600">
            {auditLogs.filter((log) => log.status === "success").length}
          </div>
          <div className="text-sm text-muted-foreground">Sucessos</div>
        </div>
        <div className="bg-card border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl mb-1 text-yellow-600">
            {auditLogs.filter((log) => log.status === "warning").length}
          </div>
          <div className="text-sm text-muted-foreground">Alertas</div>
        </div>
        <div className="bg-card border border-red-200 rounded-lg p-4">
          <div className="text-2xl mb-1 text-red-600">
            {auditLogs.filter((log) => log.status === "error").length}
          </div>
          <div className="text-sm text-muted-foreground">Erros</div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Ação Realizada
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{log.action}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {log.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getStatusColor(
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
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum log de auditoria encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
