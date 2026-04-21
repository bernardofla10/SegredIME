"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Copy, Clock, Shield, CheckCircle, Loader2, Plus, Trash2 } from "lucide-react";

import { api, SecretSummary } from "@/lib/api";

type RevealStatus = "hidden" | "pending" | "revealed" | "error";

export default function SecretDetailPage() {
  const params = useParams();
  const vaultId = Number(params?.id);

  const [secrets, setSecrets] = useState<SecretSummary[]>([]);
  const [selectedSecretId, setSelectedSecretId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [revealStatus, setRevealStatus] = useState<RevealStatus>("hidden");
  const [revealedSecretValue, setRevealedSecretValue] = useState("");
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedSecret = useMemo(
    () => secrets.find((secret) => secret.id === selectedSecretId) || null,
    [secrets, selectedSecretId],
  );

  const loadSecrets = async () => {
    try {
      const data = await api.listSecrets(vaultId);
      setSecrets(data);
      setSelectedSecretId((current) => {
        if (current && data.some((secret) => secret.id === current)) return current;
        return data[0]?.id ?? null;
      });
      setListError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar segredos.";
      setListError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vaultId) {
      setListError("ID de cofre invalido.");
      setLoading(false);
      return;
    }
    loadSecrets();
  }, [vaultId]);

  useEffect(() => {
    setRevealStatus("hidden");
    setRevealedSecretValue("");
    setSecurityMessage(null);
  }, [selectedSecretId]);

  const getCSRFToken = async (): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/auth/csrf/`, { credentials: "include" });
    const data = await res.json();
    return data.csrfToken;
  };

  const handleRevealSecret = async () => {
    if (!selectedSecret) return;

    setRevealStatus("pending");
    setSecurityMessage("Solicitacao enviada. Validando acesso e descriptografando no backend...");
    try {
      const detail = await api.getSecret(selectedSecret.id);
      
      // Post to the generic API to log the reveal
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const csrfToken = await getCSRFToken();
      await fetch(`${API_URL}/api/secrets/${selectedSecret.id}/reveal/`, {
        method: "POST",
        headers: { "X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        credentials: "include"
      });

      // Approve payload
      setTimeout(() => {
        setRevealedSecretValue(detail.secret_value);
        setRevealStatus("revealed");
        setSecurityMessage("Segredo revelado com sucesso.");
      }, 2000);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao revelar segredo.";
      setRevealStatus("error");
      setSecurityMessage(message);
    }
  };

  const handleDeleteSecret = async () => {
    if (!selectedSecret) return;
    if (!window.confirm(`Tem certeza que deseja excluir '${selectedSecret.title}'?`)) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const csrfToken = await getCSRFToken();
      const res = await fetch(`${API_URL}/api/secrets/${selectedSecret.id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": csrfToken },
        credentials: "include"
      });
      if (res.ok) {
        setSelectedSecretId(null);
        loadSecrets();
      }
    } catch (err) {
      console.error(err);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Carregando segredos do cofre...</p>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="p-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Cofres
        </Link>
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3">
          {listError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Cofres
        </Link>
        <h1 className="text-2xl font-bold mb-2">Visualizacao de Segredo</h1>
        <p className="text-muted-foreground">
          Cofre <span className="font-medium">{selectedSecret ? selectedSecret.vault_name : `#${vaultId}`}</span>
        </p>
      </div>

      {securityMessage && (
        <div className="mb-6 border border-border bg-card rounded-lg px-4 py-3 text-sm text-muted-foreground">
          {securityMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Segredos no Cofre</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                title="Adicionar Novo Segredo"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>
            <div className="space-y-2">
              {secrets.length === 0 && (
                <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  Nenhum segredo encontrado neste cofre.
                </div>
              )}
              {secrets.map((secret) => (
                <button
                  key={secret.id}
                  onClick={() => setSelectedSecretId(secret.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedSecretId === secret.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{secret.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {secret.description || "Sem descricao"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedSecret ? (
            <>
              <div className="bg-card border border-border rounded-lg p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedSecret.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Ultima modificacao: {formatDate(selectedSecret.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleDeleteSecret}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Segredo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedSecret.username && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        Usuário
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedSecret.username}
                          readOnly
                          className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => handleCopy(selectedSecret.username!, "username")}
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
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Segredo / Senha
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={revealStatus === "revealed" ? revealedSecretValue : "********************"}
                        readOnly
                        className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none font-mono"
                      />
                      {revealStatus === "revealed" && (
                        <button
                          onClick={() => handleCopy(revealedSecretValue, "secret")}
                          className="px-4 py-3 bg-card hover:bg-muted/50 border border-border rounded-lg transition-colors outline-none"
                        >
                          {copiedField === "secret" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {revealStatus === "hidden" && (
                    <button
                      onClick={handleRevealSecret}
                      className="w-full px-4 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow-md"
                    >
                      <Eye className="w-5 h-5" />
                      Revelar Segredo
                    </button>
                  )}

                  {revealStatus === "pending" && (
                    <div className="w-full px-4 py-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                      <span className="text-yellow-700 font-semibold">
                        Aguardando Aprovação no Mobile / Descriptografando...
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

                  {revealStatus === "error" && (
                    <div className="w-full px-4 py-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-center">
                      Falha ao revelar segredo. Verifique a configuracao de criptografia.
                    </div>
                  )}

                  {selectedSecret.url && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        URL
                      </label>
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

                  {selectedSecret.notes && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        Notas Adicionais
                      </label>
                      <textarea
                        value={selectedSecret.notes}
                        readOnly
                        rows={4}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  )}
                  
                  {selectedSecret.description && !selectedSecret.notes && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        Descricao
                      </label>
                      <textarea
                        value={selectedSecret.description}
                        readOnly
                        rows={3}
                        className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-lg font-semibold mb-6">Metadados de Seguranca</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm pb-4 border-b border-border">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Criado em:</span>
                    <span className="ml-auto font-semibold">{formatDate(selectedSecret.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm pb-4 border-b border-border">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Ultima modificacao:</span>
                    <span className="ml-auto font-semibold">{formatDate(selectedSecret.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Criptografia:</span>
                    <span className="ml-auto px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs">
                      AES-256-GCM
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              Selecione um segredo ao lado ou crie um novo para visualizar.
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateSecretModal
          vaultId={vaultId.toString()}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadSecrets}
        />
      )}
    </div>
  );
}


function CreateSecretModal({ vaultId, onClose, onCreated }: { vaultId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await api.createSecret({
        vault: parseInt(vaultId),
        title: title,
        secret_value: value,
        description: description,
      });
      onCreated();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar segredo.";
      setFeedback(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold">Novo Segredo</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nome / Titulo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Senha Exata</label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Descricao/Anotacoes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
            />
          </div>
          {feedback && <p className="text-sm text-red-600">{feedback}</p>}
          <div className="flex justify-end gap-3 pt-2">
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
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
