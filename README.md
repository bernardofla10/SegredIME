# SegredIME - Sistema de Gestão de Criptografia e Cofre de Senhas

Projeto desenvolvido para a disciplina de **Laboratório de Programação III** do curso de **Engenharia de Computação** no 1º Período de 2026.

## 📋 Descrição do Sistema
O **SegredIME** é uma solução distribuída voltada para a custódia e gerenciamento de segredos digitais (senhas, chaves de API e certificados) com foco estrito em segurança de dados e auditoria de acessos. A plataforma utiliza criptografia em nível de aplicação para garantir que informações sensíveis permaneçam confidenciais desde a persistência no banco de dados até o consumo pelo usuário final.

## 🚀 Escopo Técnico
O projeto é construído sob uma arquitetura **API-first**, garantindo a integração entre os seguintes componentes:

* **Backend:** API RESTful para orquestração de dados, criptografia e lógica de controle de acesso.
* **Frontend Web:** Interface para administração de cofres lógicos, usuários e visualização de trilhas de auditoria.
* **Mobile:** Aplicativo híbrido para autorização de acessos críticos e segundo fator de autenticação (MFA).
* **Infraestrutura:** Ecossistema integralmente conteinerizado via **Docker** para assegurar a reprodutibilidade do ambiente de desenvolvimento e deploy.



## 🛠️ Funcionalidades Principais

* **F1: Gestão de Cofres e Criptografia de Segredos**
    Implementação de "cofres" lógicos para organização de credenciais. Os segredos são criptografados no backend (ex: AES-256) antes da persistência no banco de dados.
* **F2: Controle de Acesso e Compartilhamento Granular (Foco Mobile)**
    Sistema de permissões baseado em funções (RBAC). Esta funcionalidade é o núcleo do sistema mobile: o aplicativo atua como segundo fator de autenticação (MFA), permitindo ao usuário autorizar ou negar acessos críticos em tempo real através de notificações, explorando a portabilidade do dispositivo como fator de segurança.
* **F3: Auditoria e Logs de Segurança**
    Registro automático e imutável de todas as ações realizadas (quem acessou qual segredo e quando), garantindo rastreabilidade total para auditorias de conformidade.

## 💻 Tech Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | Python / Django REST Framework (DRF) |
| **Frontend Web** | React |
| **Mobile** | React Native |
| **Banco de Dados** | PostgreSQL |
| **Infraestrutura** | Docker / Docker Compose |

## 📂 Estrutura do Repositório

Conforme os requisitos da disciplina, o projeto está segregado nos seguintes diretórios:

* `/backend`: API e lógica de negócio. (Configurado via Docker)
* `/frontend`: Interface administrativa Web. (Mockado via Docker)
* `/mobile`: Aplicativo de segurança e MFA.
* `/database`: Scripts de configuração e persistência. (PostgreSQL via Docker)

## 🐳 Executando o Ambiente de Desenvolvimento

O ambiente completo do projeto está empacotado e orquestrado através do Docker Compose, garantindo que todos os serviços fiquem de pé e totalmente configurados com um simples comando. Os serviços atualmente provisionados e suas respectivas portas são:

* **PostgreSQL (Database):** Porta `5432` 
* **Backend API (Django + Uvicorn):** Porta `8000` 
* **Frontend Web (Nginx/Mock):** Porta `3000`

### Como Subir o Ambiente
No terminal, a partir do diretório raiz do projeto (`SegredIME`), execute:
```bash
docker compose up -d
```
Todos os serviços serão construídos (se necessário) e iniciados em segundo plano.

### Como Derrubar o Ambiente
Para desligar o ambiente e parar os containers, execute o comando:
```bash
docker compose down
```
_Nota: Este comando apenas finaliza os serviços, mas as portas e dados nos volumes (ex: banco de dados) serão mantidos até rodar o comando com a flag `-v`._

## 🔌 API Endpoints (Rudimentary Version)

The current backend is in a rudimentary phase. It exposes basic mockup endpoints for database operations related to **Clients** and **Secrets**. These endpoints currently have no active functionality (e.g., business logic, authentication, or encryption) and only return mocked responses.

### Clients

* `GET /api/clients/`
  * **Description**: Retrieve a list of all registered clients.
  * **Status**: Mocked. Returns a static list of dummy clients.
  
* `GET /api/clients/{id}/`
  * **Description**: Retrieve details of a specific client by its ID.
  * **Status**: Mocked. Returns details of a dummy client.

* `POST /api/clients/`
  * **Description**: Create a new client record in the database.
  * **Status**: Mocked. Accepts client payloads but does not persist them. Returns a success message.

* `PUT /api/clients/{id}/`
  * **Description**: Update an existing client's information.
  * **Status**: Mocked. Accepts updated data but does not perform the actual update in the database.

* `DELETE /api/clients/{id}/`
  * **Description**: Delete a client from the system.
  * **Status**: Mocked. Returns a success response but performs no real deletion.

### Secrets

* `GET /api/secrets/`
  * **Description**: Retrieve a list of all stored secrets.
  * **Status**: Mocked. Returns a dummy list of secrets without any actual decryption.
  
* `GET /api/secrets/{id}/`
  * **Description**: Retrieve a specific secret's details by its ID.
  * **Status**: Mocked. Returns a mocked secret.
  
* `POST /api/secrets/`
  * **Description**: Store a new secret in the vault.
  * **Status**: Mocked. Accepts secret data (e.g., title, value) but does not encrypt or save it. Returns a placeholder success response.

* `PUT /api/secrets/{id}/`
  * **Description**: Update an existing secret.
  * **Status**: Mocked. Accepts the new secret data but does not process it. Returns a success confirmation.

* `DELETE /api/secrets/{id}/`
  * **Description**: Remove a specific secret from the vault.
  * **Status**: Mocked. Simulates deletion and returns a success response.

---
* **Professor:** Cap Vanzan 
* **Instituição:** Instituto Militar de Engenharia (IME)
