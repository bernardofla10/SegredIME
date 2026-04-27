"use client";

import { Shield, Lock, Key, Bell, Activity, ChevronRight } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <div className="p-8 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-2">Configurações de Segurança</h1>
        <p className="text-muted-foreground">
          Configure políticas de segurança global, autenticação e auditoria do sistema
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Autenticação */}
        <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5">Autenticação & Acesso</h2>
              <p className="text-sm text-muted-foreground">
                Configurações de segurança no login e sessões ativas
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between group">
              <div>
                <div className="font-bold text-foreground mb-1">MFA: Autenticação de Dois Fatores</div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Requer aprovação mobile via aplicativo do SegredIME para ações críticas como visualização de senhas.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-14 h-7 bg-primary rounded-full relative cursor-pointer shadow-inner transition-all">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between group">
              <div>
                <div className="font-bold text-foreground mb-1">Biometria & Passkeys</div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Utilizar biometria nativa do dispositivo (FaceID / TouchID) para desbloqueio rápido.
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-14 h-7 bg-primary rounded-full relative cursor-pointer shadow-inner transition-all">
                  <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="font-bold text-foreground mb-1">Tempo de Expiração da Sessão</div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Intervalo de inatividade antes de solicitar nova autenticação.
                </p>
              </div>
              <select className="px-5 py-2.5 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-bold text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                <option>15 minutos</option>
                <option>30 minutos</option>
                <option selected>1 hora</option>
                <option>4 horas</option>
                <option>8 horas</option>
              </select>
            </div>
          </div>
        </section>

        {/* Políticas de Senha */}
        <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5">Políticas de Segredos</h2>
              <p className="text-sm text-muted-foreground">
                Regras de complexidade e ciclo de vida para senhas armazenadas
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground mb-1">Comprimento Mínimo</div>
                <p className="text-xs text-muted-foreground">
                  Número mínimo de caracteres exigidos para qualquer novo segredo.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value="12"
                  className="w-20 px-4 py-2.5 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center font-bold"
                />
                <span className="text-xs text-muted-foreground font-medium">chars</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground mb-1">Rotação Obrigatória (TTL)</div>
                <p className="text-xs text-muted-foreground">
                  Tempo máximo que um segredo pode permanecer sem atualização.
                </p>
              </div>
              <select className="px-5 py-2.5 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-bold text-sm cursor-pointer hover:bg-muted/50 transition-colors text-right">
                <option>30 dias</option>
                <option>60 dias</option>
                <option selected>90 dias</option>
                <option>180 dias</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground mb-1">Histórico de Reutilização</div>
                <p className="text-xs text-muted-foreground">
                  Impedir que usuários voltem a usar as últimas N senhas.
                </p>
              </div>
              <input
                type="number"
                value="5"
                className="w-20 px-4 py-2.5 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center font-bold"
              />
            </div>
          </div>
        </section>

        {/* Criptografia */}
        <section className="bg-card border border-border rounded-xl p-8 shadow-sm bg-gradient-to-br from-card to-green-50/20">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5">Infraestrutura de Criptografia</h2>
              <p className="text-sm text-muted-foreground">
                Padrões de segurança de dados e gerenciamento de chaves
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-2 border-b border-dotted border-border/70 last:border-0 pb-4">
              <div>
                <div className="font-bold text-foreground mb-1">Algoritmo de Estado da Arte</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md border border-green-200 text-xs font-bold uppercase tracking-widest shadow-sm">
                    AES-256-GCM
                  </span>
                  <span className="text-xs text-muted-foreground font-medium italic underline decoration-green-200 underline-offset-4">
                    Padrão Bancário Certificado
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-dotted border-border/70 last:border-0 pb-4">
              <div>
                <div className="font-bold text-foreground mb-1">Rotação de Master Key</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-md border border-primary/20 text-xs font-bold uppercase tracking-wider">
                    Automática - Trimestral
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-bold text-foreground mb-2">Monitoramento de Entropia</div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-green-600 font-bold">
                    <Activity className="w-4 h-4" />
                    Entropia Alta (0.99)
                  </div>
                  <div className="text-muted-foreground">
                    Verificado há 15 min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notificações */}
        <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5">Alertas de Segurança</h2>
              <p className="text-sm text-muted-foreground">
                Notificações em tempo real sobre eventos críticos
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { title: "Tentativas de Login Falhadas", desc: "Alertar após 3 erros consecutivos de autenticação." },
              { title: "Acesso de Novos Dispositivos", desc: "Notificar via e-mail e push sobre novas autorizações." },
              { title: "Modificações de Permissões", desc: "Alertar admins sobre mudanças em grupos de acesso." }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div>
                  <div className="font-bold text-foreground mb-1">{item.title}</div>
                  <p className="text-xs text-muted-foreground max-w-sm">{item.desc}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-14 h-7 bg-primary rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 p-6 bg-muted/20 border border-border rounded-xl shadow-inner-sm">
          <button className="px-8 py-3 bg-card border border-border text-foreground font-bold rounded-lg hover:bg-muted/50 transition-all shadow-sm">
            Cancelar & Descartar
          </button>
          <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md active:scale-95">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
