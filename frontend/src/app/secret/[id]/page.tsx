"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

export default function SecretDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
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
    <div className="p-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Cofres
        </Link>
        <h1 className="text-2xl font-bold mb-2">Visualização de Segredo</h1>
        <p className="text-muted-foreground">
          Gerencie e visualize credenciais com segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Secrets List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Segredos no Cofre</h3>
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
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{secret.name}</div>
                  <div className="text-xs text-muted-foreground">{secret.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secret Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedSecret.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Última modificação: {formatDate(selectedSecret.lastModified)}
                </p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Usuário</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedSecret.username}
                    readOnly
                    className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => handleCopy(selectedSecret.username, "username")}
                    className="px-4 py-3 bg-card hover:bg-muted/50 border border-border rounded-lg transition-colors outline-none"
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
                <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Senha</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={
                      revealStatus === "revealed"
                        ? selectedSecret.password
                        : "••••••••••••••••••••"
                    }
                    readOnly
                    className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                  {revealStatus === "revealed" && (
                    <button
                      onClick={() => handleCopy(selectedSecret.password, "password")}
                      className="px-4 py-3 bg-card hover:bg-muted/50 border border-border rounded-lg transition-colors outline-none"
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
                  className="w-full px-4 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md"
                >
                  <Eye className="w-5 h-5" />
                  Revelar Senha
                </button>
              )}

              {revealStatus === "pending" && (
                <div className="w-full px-4 py-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                  <span className="text-yellow-700 font-semibold">
                    Aguardando Aprovação no Mobile...
                  </span>
                </div>
              )}

              {revealStatus === "revealed" && (
                <div className="w-full px-4 py-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-semibold">
                    Senha revelada com sucesso
                  </span>
                </div>
              )}

              {/* URL Field */}
              {selectedSecret.url && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedSecret.url}
                      readOnly
                      className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => handleCopy(selectedSecret.url!, "url")}
                      className="px-4 py-3 bg-card hover:bg-muted/50 border border-border rounded-lg transition-colors outline-none"
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
                  <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Notas</label>
                  <textarea
                    value={selectedSecret.notes}
                    readOnly
                    rows={4}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-6">Metadados de Segurança</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm pb-4 border-b border-border">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Criado em:</span>
                <span className="ml-auto font-semibold">{formatDate(selectedSecret.createdAt)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm pb-4 border-b border-border">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Última modificação:</span>
                <span className="ml-auto font-semibold">{formatDate(selectedSecret.lastModified)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Criptografia:</span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs">AES-256-GCM</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
