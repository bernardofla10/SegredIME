"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Shield,
  AlertCircle,
  Loader2,
  Mail,
  User,
  KeyRound,
} from "lucide-react";

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register additional fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);
    if (!result.ok) {
      setError(result.error || "Erro ao autenticar");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register({
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "viewer",
    });
    if (!result.ok) {
      setError(result.error || "Erro ao registrar");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] via-[#2c5282] to-[#1a365d] relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/3 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">SegredIME</h1>
              <p className="text-white/60 text-sm font-medium mt-0.5">
                Gestão de Criptografia e Cofre de Senhas
              </p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Segurança de Nível Bancário</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Criptografia AES-256-GCM com rotação automática de chaves e monitoramento de entropia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Controle de Acesso Granular</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  RBAC com papéis de Administrador, Editor e Visualizador para gestão precisa de permissões.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Eye className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Trilha de Auditoria Completa</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Registro imutável de cada acesso, visualização e modificação com IP e timestamp.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-white/30 text-xs font-medium">
              Instituto Militar de Engenharia — Lab. de Programação III — 2026
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SegredIME</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Bem-vindo de volta" : "Criar nova conta"}
            </h2>
            <p className="text-muted-foreground mt-1.5">
              {mode === "login"
                ? "Entre com suas credenciais para acessar o sistema"
                : "Preencha os dados para registrar uma nova conta"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-5">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="João"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Sobrenome</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dias"
                    required
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.usuario"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === "login" ? "Entrando..." : "Registrando..."}
                </>
              ) : (
                <>
                  {mode === "login" ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  {mode === "login" ? "Entrar" : "Criar Conta"}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
                className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
              >
                {mode === "login" ? "Registre-se" : "Fazer login"}
              </button>
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground/60">
              Protegido por criptografia AES-256-GCM • SegredIME v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
