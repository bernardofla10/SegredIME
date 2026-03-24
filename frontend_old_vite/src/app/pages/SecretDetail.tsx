import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Eye, Copy, Clock, Shield, CheckCircle, Loader2 } from "lucide-react";

interface Secret {
  id: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: string;
  lastModified: string;
}

const secrets: Record<string, Secret[]> = {
  "1": [
    {
      id: "s1",
      name: "Banco de Dados Principal",
      username: "admin_prod",
      password: "P@ssw0rd!Secure#2024$DB",
      url: "postgres://prod.example.com:5432",
      notes: "Credencial principal do banco de produção. Rotacionar a cada 90 dias.",
      createdAt: "2024-01-15T10:00:00",
      lastModified: "2026-02-20T14:30:00",
    },
    {
      id: "s2",
      name: "API Gateway",
      username: "api_gateway_user",
      password: "Gw@y!2024#Secure$Pass",
      url: "https://api.example.com",
      notes: "Credencial de acesso ao API Gateway de produção.",
      createdAt: "2024-02-10T09:00:00",
      lastModified: "2026-02-22T11:15:00",
    },
  ],
  "2": [
    {
      id: "s3",
      name: "Stripe API Key",
      username: "stripe_integration",
      password: "sk_live_51ABC123xyz789...",
      url: "https://stripe.com/docs/api",
      notes: "Chave de API de produção do Stripe. Não compartilhar.",
      createdAt: "2024-03-01T08:00:00",
      lastModified: "2026-02-18T16:45:00",
    },
  ],
};

export function SecretDetail() {
  const { id } = useParams();
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(
    secrets[id || "1"]?.[0] || null
  );
  const [revealStatus, setRevealStatus] = useState<"hidden" | "pending" | "revealed">("hidden");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const vaultSecrets = secrets[id || "1"] || [];

  const handleRevealPassword = () => {
    setRevealStatus("pending");
    // Simular aprovação mobile após 3 segundos
    setTimeout(() => {
      setRevealStatus("revealed");
    }, 3000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!selectedSecret) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum segredo encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Cofres
        </Link>
        <h1 className="mb-2">Visualização de Segredo</h1>
        <p className="text-muted-foreground">
          Gerencie e visualize credenciais com segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secrets List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="mb-4">Segredos no Cofre</h3>
            <div className="space-y-2">
              {vaultSecrets.map((secret) => (
                <button
                  key={secret.id}
                  onClick={() => {
                    setSelectedSecret(secret);
                    setRevealStatus("hidden");
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedSecret.id === secret.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{secret.name}</div>
                  <div className="text-xs text-muted-foreground">{secret.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secret Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="mb-1">{selectedSecret.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Última modificação: {formatDate(selectedSecret.lastModified)}
                </p>
              </div>
              <Shield className="w-6 h-6 text-primary" />
            </div>

            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Usuário</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedSecret.username}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleCopy(selectedSecret.username, "username")}
                    className="px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors"
                  >
                    {copiedField === "username" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Senha</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={
                      revealStatus === "revealed"
                        ? selectedSecret.password
                        : "••••••••••••••••••••"
                    }
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                  {revealStatus === "revealed" && (
                    <button
                      onClick={() => handleCopy(selectedSecret.password, "password")}
                      className="px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors"
                    >
                      {copiedField === "password" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Reveal Button or Pending Status */}
              {revealStatus === "hidden" && (
                <button
                  onClick={handleRevealPassword}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Revelar Senha
                </button>
              )}

              {revealStatus === "pending" && (
                <div className="w-full px-4 py-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-warning animate-spin" />
                  <span className="text-warning font-medium">
                    Aguardando Aprovação no Mobile...
                  </span>
                </div>
              )}

              {revealStatus === "revealed" && (
                <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Senha revelada com sucesso
                  </span>
                </div>
              )}

              {/* URL Field */}
              {selectedSecret.url && (
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedSecret.url}
                      readOnly
                      className="flex-1 px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => handleCopy(selectedSecret.url!, "url")}
                      className="px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors"
                    >
                      {copiedField === "url" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Field */}
              {selectedSecret.notes && (
                <div>
                  <label className="block text-sm mb-2 text-muted-foreground">Notas</label>
                  <textarea
                    value={selectedSecret.notes}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="mb-4">Metadados</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criado em:</span>
                <span className="ml-auto">{formatDate(selectedSecret.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Última modificação:</span>
                <span className="ml-auto">{formatDate(selectedSecret.lastModified)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Criptografia:</span>
                <span className="ml-auto">AES-256-GCM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
