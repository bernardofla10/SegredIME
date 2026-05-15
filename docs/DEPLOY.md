# 🚀 SegredIME — Documentação de Deploy

## Entregável 9 – Deploy no Servidor Compartilhado

**Grupo 02** | Portas 8011-8020 | Servidor `192.168.91.176`

---

## 📋 Visão Geral

O deploy utiliza **Docker Compose** para orquestrar 3 containers de produção:

| Serviço | Tecnologia | Porta | Container |
|---------|-----------|:-----:|-----------|
| Frontend | Next.js 16 (standalone) | 8011 | `grupo02_frontend` |
| Backend | Django 6 / Uvicorn | 8012 | `grupo02_backend` |
| Banco de Dados | PostgreSQL 16 | 8013 | `grupo02_postgres` |

### Diagrama de Comunicação

```
┌─────────────────────────────────────────────────────────┐
│                 Servidor (192.168.91.176)                │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Frontend    │───>│  Backend    │───>│ PostgreSQL   │  │
│  │  :8011       │    │  :8012      │    │  :8013       │  │
│  │  (Next.js)   │    │  (Django)   │    │  (Postgres)  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│        ▲                  ▲                              │
└────────│──────────────────│──────────────────────────────┘
         │                  │
    Navegador          API REST
    do Usuário
```

---

## 🔧 Arquivos de Configuração

### `docker-compose.prod.yml`
Compose de produção com:
- Target `production` no Dockerfile do backend (sem `--reload`)
- Sem volume mounts (código embutido na imagem)
- Health checks para garantir ordem de inicialização
- Restart policy `unless-stopped`
- Nomes de containers com prefixo `grupo02_`

### `.env.prod`
Variáveis de ambiente de produção:
- Portas mapeadas para o Grupo 02
- URL da API apontando para o IP do servidor
- `DEBUG=0` desligado

### Scripts (`scripts/`)
| Script | Função |
|--------|--------|
| `setup.sh` | Valida pré-requisitos do servidor |
| `deploy.sh` | Build, start e verificação automática |
| `seed.sh` | Carga inicial de dados no banco |
| `teardown.sh` | Para containers e limpa ambiente |
| `logs.sh` | Visualiza logs dos containers |

---

## 📝 Procedimento de Deploy

### 1. Conexão SSH
```bash
ssh grupo02@192.168.91.176
```

### 2. Copiar código
```bash
# Via Git (recomendado)
git clone <URL_REPO> ~/SegredIME && cd ~/SegredIME

# Ou via SCP (do Windows)
scp -r C:\programas\labprog3\SegredIME grupo02@192.168.91.176:~/SegredIME
```

### 3. Configurar ambiente
```bash
cp .env.prod.example .env.prod
nano .env.prod  # verificar IP do servidor
```

### 4. Executar deploy
```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 5. Verificar
- Frontend: http://192.168.91.176:8011
- Backend: http://192.168.91.176:8012/api/
- Health: http://192.168.91.176:8012/status/

---

## 🌱 Carga Inicial de Dados

O seed é executado automaticamente pelo `deploy.sh`. Popula o banco com:

- **5 usuários** (admin, editores, viewer)
- **4 cofres** (Produção, APIs Externas, Certificados SSL, Desenvolvimento)
- **9 segredos** criptografados com AES-256-GCM
- **12 logs de auditoria** de exemplo
- **1 solicitação MFA** pendente

### Credenciais de Teste

| Usuário | Senha | Papel |
|---------|-------|-------|
| `joao.dias` | `Admin@2026` | Administrador |
| `maria.silva` | `Editor@2026` | Editor |
| `carlos.santos` | `Editor@2026` | Editor |
| `ana.costa` | `Viewer@2026` | Visualizador |

---

## 🔐 Variáveis de Ambiente

| Variável | Serviço | Descrição | Valor Produção |
|----------|---------|-----------|----------------|
| `FRONTEND_PORT` | Frontend | Porta HTTP | `8011` |
| `BACKEND_PORT` | Backend | Porta HTTP | `8012` |
| `POSTGRES_PORT` | Banco | Porta PostgreSQL | `8013` |
| `DB_NAME` | Backend/Banco | Nome do banco | `segredime_prod` |
| `DB_USER` | Backend/Banco | Usuário do banco | `segredime_user` |
| `DB_PASSWORD` | Backend/Banco | Senha do banco | *(definido no .env.prod)* |
| `SECRET_KEY` | Backend | Django secret key | *(definido no .env.prod)* |
| `SECRETS_ENCRYPTION_KEY` | Backend | Chave AES-256 (base64) | *(definido no .env.prod)* |
| `DEBUG` | Backend | Modo debug | `0` |
| `ALLOWED_HOSTS` | Backend | Hosts permitidos | `*` |
| `NEXT_PUBLIC_API_URL` | Frontend | URL da API | `http://192.168.91.176:8012` |

---

## ✅ Validação da Integração

### Backend ↔ Banco de Dados
```bash
# Testar conexão
docker exec grupo02_backend python manage.py check --database default

# Verificar migrations
docker exec grupo02_backend python manage.py showmigrations

# Verificar dados no banco
docker exec grupo02_postgres psql -U segredime_user -d segredime_prod -c "SELECT count(*) FROM accounts_user;"
```

### Frontend ↔ Backend
```bash
# Testar health check
curl http://192.168.91.176:8012/status/

# Testar API
curl http://192.168.91.176:8012/api/auth/csrf/

# Acessar frontend no navegador
# http://192.168.91.176:8011
```

### Testes Automatizados
```bash
docker exec grupo02_backend python manage.py test
```

---

## 🔄 Manutenção

```bash
# Ver status
docker compose -f docker-compose.prod.yml ps

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart backend

# Re-deploy completo
./scripts/deploy.sh

# Limpar tudo
./scripts/teardown.sh

# Ver logs
./scripts/logs.sh backend 100
docker compose -f docker-compose.prod.yml logs -f
```

---

## 📅 Data de Deploy
**Maio 2026** — Laboratório de Programação III, IME
