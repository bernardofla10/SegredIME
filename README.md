# 🔐 SegredIME 
### Sistema de Gestão de Criptografia e Cofre de Senhas

> Projeto desenvolvido para a disciplina de **Laboratório de Programação III** do curso de **Engenharia de Computação** no **Instituto Militar de Engenharia (IME)**, 1º Período de 2026.

---

## 📋 Descrição do Sistema
O **SegredIME** é uma solução distribuída de alta segurança voltada para a custódia e gerenciamento de segredos digitais (senhas, chaves de API e certificados). Com foco estrito em segurança de dados e auditoria, a plataforma utiliza criptografia em nível de aplicação (AES-256-GCM) para garantir a confidencialidade desde o banco de dados até o consumo pelo usuário final.

---

## 🚀 Escopo Técnico e Arquitetura
O projeto segue uma arquitetura **API-First**, garantindo integração fluida entre:

*   **Backend (Core):** API RESTful em **Python/Django** para orquestração, criptografia e lógica de RBAC.
*   **Frontend Web (Admin):** Interface administrativa moderna em **Next.js 15+** e **Tailwind v4**.
*   **Mobile (MFA):** App em **React Native** para autorização 2FA em tempo real (Planejado).
*   **Infraestrutura:** Dockerizado para reprodutibilidade total.

---

## 🛠️ Tecnologias Principais (Tech Stack)

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | Python 3.12+ / Django REST Framework |
| **Frontend** | Next.js 15 / TypeScript / Tailwind CSS v4 / Lucide |
| **Banco de Dados** | PostgreSQL 16 |
| **Segurança** | Criptografia AES-256-GCM / RBAC |
| **Infraestrutura** | Docker / Docker Compose |

---

## 📂 Estrutura do Repositório

```text
SegredIME/
├── backend/          # Configurações de infraestrutura e Docker do Backend
├── core/             # Código-fonte da API Django (app principal)
├── frontend/         # Interface Web em Next.js (App Router)
│   ├── src/app       # Rotas e páginas da aplicação
│   └── src/components # Base de componentes UI (Radix/Shadcn)
├── mobile/           # (Planejado) Aplicativo de segurança e MFA
├── database/         # Scripts de configuração do PostgreSQL
└── docs/             # Guia de rotas e coleções Postman
```

---

## 🐳 Como Executar o Projeto

Existem duas formas principais de subir o ambiente:

### 1. Via Docker (Ambiente Completo)
Ideal para homologação e testes de integração:
```bash
docker compose up --build -d
```
*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend:** [http://localhost:8000](http://localhost:8000)

### 2. Via Scripts Locais (Desenvolvimento Rápido)
Para desenvolvedores que desejam iterar rapidamente no frontend ou backend:

*   **Frontend (Next.js):**
    ```bash
    npm run server
    ```
*   **Backend (Django):**
    ```bash
    npm run backend
    ```
*   **Instalar dependências de todos os módulos:**
    ```bash
    npm run install:all
    ```

---

## ✨ Funcionalidades do Frontend Administativo

A interface administrativa em **Next.js** oferece os seguintes módulos:

1.  **Dashboard de Cofres:** Visão geral de todos os cofres (Produção, APIs, SSL) e contagem de segredos.
2.  **Visualização de Segredo:** Sistema com botão de "Revelar Senha" que simula fluxo de aprovação 2FA.
3.  **Cofres Compartilhados:** Acesso granular a segredos compartilhados por outros membros da equipe.
4.  **Trilha de Auditoria (Audit Trail):** Log imutável de quem acessou qual recurso, quando e de qual IP.
5.  **Gestão de Usuários:** Controle de permissões (Admin, Editor, Viewer).
6.  **Configurações de Segurança:** Políticas de expiração de senha, MFA e rotação de chaves.

---

## 🔌 Principais Endpoints da API (Backend)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/vaults/` | Lista todos os cofres lógicos |
| `POST` | `/api/vaults/` | Cria um novo cofre |
| `GET` | `/api/secrets/` | Lista todos os segredos (metadados) |
| `GET` | `/api/secrets/{id}/` | Detalha um segredo específico |
| `PUT` | `/api/secrets/{id}/` | Atualiza valores de um segredo |
| `DELETE` | `/api/secrets/{id}/` | Remove um segredo permanentemente |

---

## ✅ Validação e Testes
O backend conta com testes automatizados integrados. Para executá-los via Docker:
```bash
docker compose exec backend python manage.py test
```

---

## 👨‍🏫 Equipe e Instituição
*   **Professor:** Cap Vanzan
*   **Instituição:** Instituto Militar de Engenharia (IME)
*   **Projeto:** Disciplina de Laboratório de Programação III
