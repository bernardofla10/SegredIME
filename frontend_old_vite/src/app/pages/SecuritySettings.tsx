import { Shield, Lock, Smartphone, Key, Bell, Activity } from "lucide-react";

export function SecuritySettings() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">Configurações de Segurança</h1>
        <p className="text-muted-foreground">
          Configure políticas de segurança e autenticação do sistema
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Autenticação */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="mb-0">Autenticação</h2>
              <p className="text-sm text-muted-foreground">
                Configurações de login e autenticação
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Autenticação de Dois Fatores (2FA)</div>
                <p className="text-sm text-muted-foreground">
                  Requer aprovação mobile para ações sensíveis
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Biometria</div>
                <p className="text-sm text-muted-foreground">
                  Utilizar impressão digital ou reconhecimento facial
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium mb-1">Tempo de Sessão</div>
                <p className="text-sm text-muted-foreground">
                  Duração máxima da sessão antes de logout automático
                </p>
              </div>
              <select className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option>15 minutos</option>
                <option>30 minutos</option>
                <option selected>1 hora</option>
                <option>4 horas</option>
                <option>8 horas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Políticas de Senha */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="mb-0">Políticas de Senha</h2>
              <p className="text-sm text-muted-foreground">
                Requisitos de segurança para senhas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Comprimento Mínimo</div>
                <p className="text-sm text-muted-foreground">
                  Número mínimo de caracteres
                </p>
              </div>
              <input
                type="number"
                value="12"
                className="w-20 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Rotação de Senhas</div>
                <p className="text-sm text-muted-foreground">
                  Período para troca obrigatória de senhas
                </p>
              </div>
              <select className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                <option>30 dias</option>
                <option>60 dias</option>
                <option selected>90 dias</option>
                <option>180 dias</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium mb-1">Histórico de Senhas</div>
                <p className="text-sm text-muted-foreground">
                  Impedir reutilização das últimas N senhas
                </p>
              </div>
              <input
                type="number"
                value="5"
                className="w-20 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center"
              />
            </div>
          </div>
        </div>

        {/* Criptografia */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="mb-0">Criptografia</h2>
              <p className="text-sm text-muted-foreground">
                Configurações de segurança de dados
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="py-3 border-b border-border">
              <div className="font-medium mb-1">Algoritmo de Criptografia</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded border border-green-200 text-sm">
                  AES-256-GCM
                </span>
                <span className="text-sm text-muted-foreground">
                  (Padrão da indústria)
                </span>
              </div>
            </div>

            <div className="py-3 border-b border-border">
              <div className="font-medium mb-1">Rotação de Chaves de Criptografia</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded border border-primary/20 text-sm">
                  Automática - A cada 90 dias
                </span>
              </div>
            </div>

            <div className="py-3">
              <div className="font-medium mb-1">Última Rotação</div>
              <p className="text-sm text-muted-foreground mt-2">
                15 de Janeiro de 2026 às 03:00 UTC
              </p>
            </div>
          </div>
        </div>

        {/* Notificações de Segurança */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="mb-0">Notificações de Segurança</h2>
              <p className="text-sm text-muted-foreground">
                Alertas de eventos de segurança
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Tentativas de Login Falhadas</div>
                <p className="text-sm text-muted-foreground">
                  Alertar após múltiplas tentativas de acesso
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="font-medium mb-1">Acesso de Novos Dispositivos</div>
                <p className="text-sm text-muted-foreground">
                  Notificar login de dispositivos não reconhecidos
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium mb-1">Alterações de Permissões</div>
                <p className="text-sm text-muted-foreground">
                  Alertar sobre mudanças em permissões de usuários
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispositivos Aprovados */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="mb-0">Dispositivos Aprovados</h2>
              <p className="text-sm text-muted-foreground">
                Gerenciar dispositivos autorizados
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">iPhone 15 Pro</div>
                  <div className="text-xs text-muted-foreground">
                    Último acesso: Hoje às 11:45
                  </div>
                </div>
              </div>
              <button className="text-sm text-destructive hover:underline">Revogar</button>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">MacBook Pro</div>
                  <div className="text-xs text-muted-foreground">
                    Último acesso: Hoje às 09:30
                  </div>
                </div>
              </div>
              <button className="text-sm text-destructive hover:underline">Revogar</button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
            Cancelar
          </button>
          <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
