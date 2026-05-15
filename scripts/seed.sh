#!/usr/bin/env bash
# ============================================
# seed.sh — Carga inicial de dados
# Grupo 02
# ============================================
# Uso:
#   chmod +x scripts/seed.sh
#   ./scripts/seed.sh
# ============================================
# Este script executa o comando Django "seed" que popula
# o banco com usuários, cofres, segredos e logs de exemplo.
# Também cria um superusuário para acesso ao admin.
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔══════════════════════════════════════════════╗"
echo "║   🌱 SegredIME — Carga Inicial de Dados     ║"
echo "║   Grupo 02                                   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

# ── 1. Verificar se o backend está rodando ──
if ! docker ps --format '{{.Names}}' | grep -q "grupo02_backend"; then
    echo "❌ Container grupo02_backend não está rodando!"
    echo "   Execute primeiro: ./scripts/deploy.sh"
    exit 1
fi
echo "✅ Container backend encontrado"
echo ""

# ── 2. Executar migrations ──
echo "📦 Aplicando migrations..."
docker exec grupo02_backend python manage.py migrate
echo "   ✅ Migrations aplicadas"
echo ""

# ── 3. Executar seed ──
echo "🌱 Populando banco de dados..."
docker exec grupo02_backend python manage.py seed
echo ""

# ── 4. Criar superusuário admin (se não existir) ──
echo "👤 Criando superusuário para o Django Admin..."
docker exec grupo02_backend python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    admin = User.objects.filter(username='joao.dias').first()
    if admin:
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        print('   ✅ joao.dias promovido a superusuário')
    else:
        User.objects.create_superuser('admin', 'admin@ime.eb.br', 'Admin@2026', role='admin', first_name='Admin', last_name='Sistema')
        print('   ✅ Superusuário admin criado')
else:
    print('   ⏩ Superusuário já existe')
"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ Carga inicial concluída!                ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Usuários disponíveis:                      ║"
echo "║   • joao.dias    / Admin@2026  (admin)       ║"
echo "║   • maria.silva  / Editor@2026 (editor)      ║"
echo "║   • carlos.santos/ Editor@2026 (editor)      ║"
echo "║   • ana.costa    / Viewer@2026 (viewer)      ║"
echo "╚══════════════════════════════════════════════╝"
