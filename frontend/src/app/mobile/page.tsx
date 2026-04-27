"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle, Clock, Loader2, RefreshCw, ShieldCheck, Smartphone, XCircle } from "lucide-react";

import { api, MfaApprovalRequest } from "@/lib/api";

export default function MobileMfaPage() {
  const [requests, setRequests] = useState<MfaApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.listMfaRequests();
      setRequests(data);
      setFeedback(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar solicitações MFA.";
      setFeedback(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    const interval = window.setInterval(loadRequests, 4000);
    return () => window.clearInterval(interval);
  }, [loadRequests]);

  const decide = async (requestId: number, action: "approve" | "deny") => {
    try {
      if (action === "approve") {
        await api.approveMfaRequest(requestId);
      } else {
        await api.denyMfaRequest(requestId);
      }
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao processar MFA.";
      setFeedback(message);
    }
  };

  const pendingRequests = requests.filter((item) => item.status === "pending");
  const history = requests.filter((item) => item.status !== "pending").slice(0, 8);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Sincronizando Mobile MFA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
              <Smartphone className="w-4 h-4" />
              SegredIME Mobile
            </div>
            <h1 className="text-2xl font-bold">Aprovações MFA</h1>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              loadRequests();
            }}
            className="p-2.5 border border-border rounded-lg bg-card hover:bg-muted transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {feedback && (
          <div className="mb-4 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
            {feedback}
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Notificações pendentes</h2>
                <p className="text-xs text-muted-foreground mt-1">Ações críticas aguardando confirmação</p>
              </div>
              <div className="relative">
                <Bell className="w-6 h-6 text-primary" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-yellow-100 p-2 text-yellow-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-tight">{request.secret_title}</h3>
                    <p className="text-sm text-muted-foreground">{request.vault_name}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Expira {formatTime(request.expires_at)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => decide(request.id, "deny")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="w-5 h-5" />
                    Negar
                  </button>
                  <button
                    onClick={() => decide(request.id, "approve")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprovar
                  </button>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                Nenhuma solicitação pendente.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="font-bold">Histórico recente</h2>
          </div>
          <div className="divide-y divide-border">
            {history.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{request.secret_title}</div>
                  <div className="text-xs text-muted-foreground">{request.vault_name}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(request.status)}`}>
                  {statusLabel(request.status)}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-5 text-sm text-muted-foreground">Sem decisões recentes.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status: MfaApprovalRequest["status"]) {
  switch (status) {
    case "approved":
      return "Aprovado";
    case "denied":
      return "Negado";
    case "expired":
      return "Expirado";
    default:
      return "Pendente";
  }
}

function statusClass(status: MfaApprovalRequest["status"]) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 border border-green-200";
    case "denied":
      return "bg-red-50 text-red-700 border border-red-200";
    case "expired":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}
