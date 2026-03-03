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

---
* **Professor:** Cap Vanzan 
* **Instituição:** Instituto Militar de Engenharia (IME)
