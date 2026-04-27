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
*   **Mobile (MFA):** Aplicativo híbrido em **React Native** para autorização de acessos críticos e segundo fator de autenticação em tempo real (Planejado).
*   **Infraestrutura:** Ecossistema integralmente conteinerizado via **Docker** e **Docker Compose**, assegurando reprodutibilidade do ambiente de desenvolvimento e deploy.

---

## 🛠️ Funcionalidades Principais

* **F1: Gestão de Cofres e Criptografia de Segredos**
    Implementação de "cofres" lógicos para organização de credenciais. Os segredos são criptografados no backend (ex: AES-256) antes da persistência no banco de dados.
* **F2: Auditoria e Logs de Segurança**
    Registro automático e imutável de todas as ações realizadas (quem acessou qual segredo e quando), garantindo rastreabilidade total para auditorias de conformidade.
* **F3: Controle de Acesso e Compartilhamento Granular (Foco Mobile)**
    Sistema de permissões baseado em funções (RBAC). Esta funcionalidade é o núcleo do sistema mobile: o aplicativo atua como segundo fator de autenticação (MFA), permitindo ao usuário autorizar ou negar acessos críticos em tempo real através de notificações, explorando a portabilidade do dispositivo como fator de segurança.
---

## 🛠️ Tecnologias Principais (Tech Stack)

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | Python 3.12+ / Django REST Framework |
| **Frontend** | Next.js 15 / TypeScript / Tailwind CSS v4 / Lucide |
| **Mobile** | React Native |
| **Banco de Dados** | PostgreSQL 16 |
| **Segurança** | Criptografia AES-256-GCM / RBAC |
| **Infraestrutura** | Docker / Docker Compose |
| **Servidor de Aplicação** | Uvicorn |

---

## 📂 Estrutura do Repositório

Conforme os requisitos da disciplina, o projeto está segregado nos seguintes diretórios:

```text
SegredIME/
├── backend/          # Configurações de infraestrutura, build e Docker do backend
├── core/             # Projeto Django, modelagem das entidades e endpoints da API
├── frontend/         # Interface web administrativa em Next.js (App Router)
│   ├── src/app       # Rotas e páginas da aplicação
│   └── src/components # Base de componentes UI (Radix/Shadcn)
├── mobile/           # Aplicativo de segurança e MFA (planejado)
├── database/         # Scripts de configuração e persistência do PostgreSQL
└── docs/             # Documentação complementar e artefatos auxiliares de validação
```

---

## 🐳 Como Executar o Projeto

Existem duas formas principais de subir o ambiente:

### 1. Via Docker (Ambiente Completo - Recomendado)
Ideal para homologação e testes de integração. O ambiente completo está empacotado e orquestrado com Docker Compose, garantindo que os serviços principais fiquem de pé e configurados com um único comando.
```bash
docker compose up --build
```
*   **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
*   **Backend (Django API):** [http://localhost:8000/api/](http://localhost:8000/api/)
*   **Banco de Dados (PostgreSQL):** Porta `5432`

O backend depende da chave de criptografia `SECRETS_ENCRYPTION_KEY` (32 bytes em Base64). No `docker-compose.yml` ela já está declarada para ambiente local.

Se for necessário aplicar migrations manualmente:

```bash
docker compose up -d
docker compose exec backend python manage.py migrate
```

Para derrubar o ambiente:

```bash
docker compose down
```

_Nota: esse comando encerra os serviços, mas os dados persistidos em volumes, como o banco de dados, permanecem até o uso da flag `-v`._

---

## 📥 Popular o Banco de Dados (Carga Inicial)
Para facilitar os testes, uma coleção do Postman foi configurada para popular o banco de dados com dados de exemplo (cofres e segredos).

1.  Localize o arquivo: `docs/SegredIME_Postman_Collection.json`
2.  Importe-o no seu **Postman**.
3.  Certifique-se de que o Docker está rodando.
4.  Execute as requisições **Step 1 ao Step 6** em sequência.
5.  Atualize o Dashboard do frontend ([localhost:3000](http://localhost:3000)) para ver os dados aparecerem em tempo real.

---

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
2.  **Visualização de Segredo:** Fluxo de revelação protegido por MFA antes de descriptografar `secret_value`.
3.  **Cofres Compartilhados:** Acesso granular a segredos compartilhados por outros membros da equipe.
4.  **Trilha de Auditoria (Audit Trail):** Log imutável de quem acessou qual recurso, quando e de qual IP.
5.  **Gestão de Usuários:** Controle de permissões (Admin, Editor, Viewer).
6.  **Configurações de Segurança:** Políticas de expiração de senha, MFA e rotação de chaves.
7.  **Mobile MFA Simulado:** Tela responsiva em `/mobile` para aprovar ou negar revelações críticas de segredos.

---

## 🔌 Principais Endpoints da API (Backend)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Autenticação via Session/CSRF |
| `POST` | `/api/auth/register/` | Criação de novo usuário / perfil |
| `GET`  | `/api/auth/me/` | Recuperar perfil do logado atual |
| `GET` | `/api/users/` | Listagem da tabela de Usuários e Roles |
| `GET` | `/api/logs/` | Trilha Imutável da Auditoria (Acessos) |
| `GET` | `/api/vaults/` | Lista cofres acessíveis ao usuário logado |
| `POST` | `/api/vaults/` | Cria um novo cofre e torna o criador dono |
| `GET` | `/api/vaults/{id}/members/` | Lista permissões granulares de um cofre |
| `POST` | `/api/vaults/{id}/members/` | Compartilha um cofre com permissão `read`, `write` ou `owner` |
| `GET` | `/api/secrets/?vault={vault_id}` | Lista segredos (metadados) filtrando por cofre |
| `GET` | `/api/secrets/{id}/` | Detalha metadados do segredo sem retornar `secret_value` |
| `POST` | `/api/secrets/{id}/reveal/request/` | Cria solicitação MFA para revelar um segredo |
| `POST` | `/api/secrets/{id}/reveal/` | Revela o segredo após aprovação MFA |
| `GET` | `/api/mfa/requests/` | Lista solicitações MFA do usuário |
| `PUT` | `/api/secrets/{id}/` | Atualiza valores de um segredo |
| `DELETE` | `/api/secrets/{id}/` | Remove um segredo permanentemente |

---

## 📋 Logs e Auditoria
O sistema registra automaticamente todas as ações importantes no banco de dados para segurança:
* **Criação:** Quando um cofre ou segredo é criado.
* **Leitura:** Quando alguém visualiza os detalhes de um segredo.
* **Revelação:** Registro específico de quando a senha/valor foi revelado.
* **Edição/Exclusão:** Rastreio de modificações e remoções.

Os logs incluem: **Usuário, Data/Hora, Ação Realizada e IP.**

---

## 🗃️ Modelagem Inicial do Domínio

Atualmente, o backend já conta com persistência real em PostgreSQL para o núcleo do sistema, permitindo operações de criação, consulta, atualização e exclusão via API.

### Vault
- `id`
- `name`
- `description`
- `created_at`
- `updated_at`

### Secret
- `id`
- `vault` (FK para `Vault`)
- `title`
- `username` (Opcional)
- `url` (Opcional)
- `notes` (Opcional)
- `description`
- `encrypted_value` (persistido no banco como ciphertext AES-256-GCM)
- `created_at`
- `updated_at`

### Relacionamento
- Um `Vault` possui vários `Secrets`.
- Um `Secret` pertence a um único `Vault`.
- A API recebe `secret_value` na escrita e só o expõe no endpoint de detalhe (`GET /api/secrets/{id}/`).

---

## 📦 Exemplo de Payloads

### Criar Vault

```json
{
  "name": "Infra",
  "description": "Cofre principal do ambiente"
}
```

### Criar Secret

```json
{
  "vault": 1,
  "title": "DB Password",
  "description": "Senha principal do banco",
  "secret_value": "super-secret"
}
```

---

## ✅ Validação e Testes
O backend conta com testes automatizados integrados. Para executá-los via Docker:
```bash
docker compose exec backend python manage.py test
```

Os testes automatizados do backend cobrem:

- criação de `Secret`;
- listagem de `Secret`;
- consulta de `Secret` por ID;
- atualização de `Secret`;
- exclusão de `Secret`.

### Cenário E2E de validação manual (fluxo completo)

1. Acesse o frontend em `http://localhost:3000`.
2. Crie um novo cofre.
3. Entre no cofre e cadastre um novo segredo.
4. Recarregue a página e valide que o segredo ainda existe.
5. Clique em **Revelar Segredo** e confirme retorno descriptografado via backend.

### Inspeção do banco (criptografia em repouso)

Com o ambiente em execução:

```bash
docker compose exec postgres psql -U segredime_user -d segredime_local -c "SELECT id, encrypted_value FROM vaults_secret;"
```

O valor de `encrypted_value` deve aparecer em formato cifrado (prefixo `v1:`), e não em texto puro.

Além disso, o repositório inclui artefatos de validação manual, incluindo coleção Postman exportada, ambiente local do Postman e instruções auxiliares em `docs/`.

---

## 📚 Documentação Complementar

Os artefatos auxiliares de validação e documentação complementar estão em `docs/` e no Notion do projeto.

---

## 👨‍🏫 Equipe e Instituição
*   **Professor:** Cap Vanzan
*   **Instituição:** Instituto Militar de Engenharia (IME)
*   **Projeto:** Disciplina de Laboratório de Programação III
