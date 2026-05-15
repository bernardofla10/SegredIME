#!/usr/bin/env bash
# ============================================
# logs.sh — Ver logs dos containers
# Grupo 02
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

SERVICE="${1:-}"
LINES="${2:-50}"

if [ -z "$SERVICE" ]; then
    echo "📋 Logs de todos os serviços (últimas $LINES linhas):"
    echo ""
    docker compose -f docker-compose.prod.yml logs --tail="$LINES"
else
    echo "📋 Logs de '$SERVICE' (últimas $LINES linhas):"
    echo ""
    docker compose -f docker-compose.prod.yml logs --tail="$LINES" "$SERVICE"
fi
