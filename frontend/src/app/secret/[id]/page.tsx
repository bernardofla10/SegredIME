"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Copy,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  Plus,
} from "lucide-react";

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

  const [showCreateSecret, setShowCreateSecret] = useState(false);
  const [newSecretTitle, setNewSecretTitle] = useState("");
  const [newSecretDescription, setNewSecretDescription] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [creatingSecret, setCreatingSecret] = useState(false);

  const selectedSecret = useMemo(
    () => secrets.find((secret) => secret.id === selectedSecretId) || null,
    [secrets, selectedSecretId],
  );

  useEffect(() => {
    if (!vaultId) {
      setListError("ID de cofre invalido.");
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadSecrets() {
      try {
        const data = await api.listSecrets(vaultId);
        if (!mounted) return;
        setSecrets(data);
        setSelectedSecretId((current) => {
          if (current && data.some((secret) => secret.id === current)) return current;
          return data[0]?.id ?? null;
        });
        setListError(null);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Erro ao carregar segredos.";
        setListError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSecrets();

    return () => {
      mounted = false;
    };
  }, [vaultId]);

  useEffect(() => {
    setRevealStatus("hidden");
    setRevealedSecretValue("");
    setSecurityMessage(null);
  }, [selectedSecretId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRevealSecret = async () => {
    if (!selectedSecret) return;

    setRevealStatus("pending");
    setSecurityMessage("Solicitacao enviada. Validando acesso e descriptografando no backend...");
    try {
      const detail = await api.getSecret(selectedSecret.id);
      setRevealedSecretValue(detail.secret_value);
      setRevealStatus("revealed");
      setSecurityMessage("Segredo revelado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao revelar segredo.";
      setRevealStatus("error");
      setSecurityMessage(message);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateSecret = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vaultId) return;

    setCreatingSecret(true);
    setSecurityMessage(null);
    try {
      const created = await api.createSecret({
        vault: vaultId,
        title: newSecretTitle.trim(),
        description: newSecretDescription.trim(),
        secret_value: newSecretValue,
      });

      setSecrets((current) => [...current, created]);
      setSelectedSecretId(created.id);
      setShowCreateSecret(false);
      setNewSecretTitle("");
      setNewSecretDescription("");
      setNewSecretValue("");
      setRevealStatus("hidden");
      setRevealedSecretValue("");
      setSecurityMessage("Segredo salvo com sucesso. Valor persistido de forma criptografada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar o segredo.";
      setSecurityMessage(message);
    } finally {
      setCreatingSecret(false);
    }
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
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
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
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Cofres
        </Link>
        <h1 className="text-2xl font-bold mb-2">Visualizacao de Segredo</h1>
        <p className="text-muted-foreground">
          Cofre{" "}
          <span className="font-medium">
            {selectedSecret ? selectedSecret.vault_name : `#${vaultId}`}
          </span>
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
                onClick={() => setShowCreateSecret((current) => !current)}
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
                    selectedSecret.id === secret.id
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

          {showCreateSecret && (
            <form
              onSubmit={handleCreateSecret}
              className="bg-card border border-border rounded-lg p-5 space-y-3"
            >
              <h3 className="font-semibold">Novo segredo</h3>
              <input
                type="text"
                placeholder="Titulo"
                value={newSecretTitle}
                onChange={(event) => setNewSecretTitle(event.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                placeholder="Descricao"
                value={newSecretDescription}
                onChange={(event) => setNewSecretDescription(event.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <input
                type="text"
                placeholder="Valor secreto"
                value={newSecretValue}
                onChange={(event) => setNewSecretValue(event.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
              <button
                type="submit"
                disabled={
                  creatingSecret ||
                  !newSecretTitle.trim() ||
                  !newSecretValue.trim()
                }
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {creatingSecret && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar segredo
              </button>
            </form>
          )}
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
                  <Shield className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Descricao
                    </label>
                    <textarea
                      value={selectedSecret.description || "Sem descricao"}
                      readOnly
                      rows={3}
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Segredo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={
                          revealStatus === "revealed"
                            ? revealedSecretValue
                            : "********************"
                        }
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
                      className="w-full px-4 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Eye className="w-5 h-5" />
                      Revelar Segredo
                    </button>
                  )}

                  {revealStatus === "pending" && (
                    <div className="w-full px-4 py-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                      <span className="text-yellow-700 font-semibold">
                        Descriptografando no backend...
                      </span>
                    </div>
                  )}

                  {revealStatus === "revealed" && (
                    <div className="w-full px-4 py-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-semibold">
                        Segredo revelado com sucesso
                      </span>
                    </div>
                  )}

                  {revealStatus === "error" && (
                    <div className="w-full px-4 py-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-center">
                      Falha ao revelar segredo. Verifique a configuracao de criptografia.
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
              Clique em <span className="font-medium">Novo</span> para cadastrar o primeiro segredo deste cofre.
              {showCreateSecret ? (
                <div className="mt-3">
                  Preencha o formulario na coluna da esquerda e salve.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
