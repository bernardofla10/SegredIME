#!/usr/bin/env bash
# ============================================
# teardown.sh — Derrubar e limpar o ambiente
# Grupo 02
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "🛑 Parando containers do Grupo 02..."
docker compose -f docker-compose.prod.yml --env-file .env.prod down --remove-orphans

echo ""
read -p "🗑️  Deseja remover os volumes (dados do banco)? [s/N]: " REMOVE_VOLUMES
if [[ "$REMOVE_VOLUMES" =~ ^[sS]$ ]]; then
    docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
    echo "   ✅ Volumes removidos"
else
    echo "   ⏩ Volumes mantidos"
fi

echo ""
read -p "🧹 Deseja remover as imagens Docker do projeto? [s/N]: " REMOVE_IMAGES
if [[ "$REMOVE_IMAGES" =~ ^[sS]$ ]]; then
    docker rmi $(docker images --filter "reference=*grupo02*" -q) 2>/dev/null || true
    docker rmi $(docker images --filter "reference=*segredime*" -q) 2>/dev/null || true
    echo "   ✅ Imagens removidas"
else
    echo "   ⏩ Imagens mantidas"
fi

echo ""
echo "🎉 Ambiente limpo!"
