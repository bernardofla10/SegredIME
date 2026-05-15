#!/usr/bin/env bash
# ============================================
# setup.sh — Preparação do ambiente no servidor
# Grupo 02
# ============================================
# Uso no servidor (via SSH como grupo02):
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║   🔧 SegredIME — Setup do Ambiente           ║"
echo "║   Grupo 02                                   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

# ── 1. Verificar pré-requisitos ──
echo "🔍 Verificando pré-requisitos..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    exit 1
fi
echo "   ✅ Docker encontrado"

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está disponível!"
    exit 1
fi
echo "   ✅ Docker Compose encontrado"

# Verificar se o usuário pode usar Docker sem sudo
if ! docker ps &> /dev/null; then
    echo "❌ O usuário atual não tem permissão para executar Docker!"
    echo "   Solicite ao administrador para adicionar o usuário ao grupo docker."
    exit 1
fi
echo "   ✅ Permissão Docker OK"

# ── 2. Verificar se portas estão livres ──
echo ""
echo "🔍 Verificando portas do Grupo 02..."
PORTS=(8013 8014 8015)
for PORT in "${PORTS[@]}"; do
    if docker ps --format '{{.Ports}}' | grep -q ":${PORT}->" 2>/dev/null; then
        echo "   ⚠️  Porta $PORT já está em uso por outro container!"
    else
        echo "   ✅ Porta $PORT livre"
    fi
done

# ── 3. Verificar .env.prod ──
echo ""
if [ ! -f "$PROJECT_DIR/.env.prod" ]; then
    echo "⚠️  Arquivo .env.prod não encontrado!"
    echo "   Copie o template e configure:"
    echo "   cp .env.prod.example .env.prod"
    echo "   vi .env.prod"
    exit 1
fi
echo "✅ Arquivo .env.prod encontrado"

# ── 4. Verificar estrutura de diretórios ──
echo ""
echo "🔍 Verificando estrutura do projeto..."
REQUIRED_DIRS=("core" "backend" "frontend")
for DIR in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$PROJECT_DIR/$DIR" ]; then
        echo "   ❌ Diretório '$DIR' não encontrado!"
        exit 1
    fi
    echo "   ✅ $DIR/"
done

REQUIRED_FILES=("docker-compose.prod.yml" "backend/Dockerfile" "frontend/Dockerfile" "backend/requirements.txt")
for FILE in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_DIR/$FILE" ]; then
        echo "   ❌ Arquivo '$FILE' não encontrado!"
        exit 1
    fi
    echo "   ✅ $FILE"
done

# ── 5. Resumo ──
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ Ambiente pronto para deploy!            ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Execute: ./scripts/deploy.sh               ║"
echo "╚══════════════════════════════════════════════╝"
