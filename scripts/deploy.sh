#!/usr/bin/env bash
# ============================================
# deploy.sh — Script de deploy do SegredIME
# Grupo 02 — Portas 8011-8020
# ============================================
# Uso:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║   🚀 SegredIME — Deploy Grupo 02            ║"
echo "║   Portas: 8011 (front) | 8012 (back) | 8013 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

# ── 1. Verificar Docker ──
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado! Abortando."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado! Abortando."
    exit 1
fi

echo "   ✅ Docker $(docker --version | grep -oP '\d+\.\d+\.\d+')"
echo "   ✅ $(docker compose version)"
echo ""

# ── 2. Carregar variáveis de ambiente ──
ENV_FILE="$PROJECT_DIR/.env.prod"
if [ -f "$ENV_FILE" ]; then
    echo "📋 Carregando variáveis de $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "⚠️  Arquivo .env.prod não encontrado. Usando valores padrão."
fi
echo ""

# ── 3. Parar containers antigos (se existirem) ──
echo "🛑 Parando containers anteriores (se existirem)..."
docker compose -f docker-compose.prod.yml --env-file .env.prod down --remove-orphans 2>/dev/null || true
echo ""

# ── 4. Build e start ──
echo "🔨 Construindo e subindo containers..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

echo ""
echo "⏳ Aguardando serviços ficarem healthy..."

# Esperar o backend ficar healthy (até 120s)
TIMEOUT=120
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' grupo02_backend 2>/dev/null || echo "starting")
    if [ "$STATUS" = "healthy" ]; then
        break
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo "   ⏳ Backend: $STATUS ($ELAPSED/${TIMEOUT}s)"
done

if [ "$STATUS" = "healthy" ]; then
    echo "   ✅ Backend: healthy"
else
    echo "   ⚠️  Backend não ficou healthy em ${TIMEOUT}s. Verificando logs..."
    docker compose -f docker-compose.prod.yml logs --tail=30 backend
fi

echo ""

# ── 5. Verificar status ──
echo "╔══════════════════════════════════════════════╗"
echo "║   📊 Status dos Containers                  ║"
echo "╚══════════════════════════════════════════════╝"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   🌐 URLs de Acesso                         ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Frontend: http://192.168.91.176:8011      ║"
echo "║   Backend:  http://192.168.91.176:8012/api/  ║"
echo "║   Admin:    http://192.168.91.176:8012/admin/ ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📌 Login padrão: joao.dias / Admin@2026"
echo ""
echo "🎉 Deploy concluído!"
