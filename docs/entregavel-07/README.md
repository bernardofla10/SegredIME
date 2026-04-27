# Entregável 7 - Funcionalidade F3

## Objetivo

A F3 implementa controle de acesso granular por cofre e um fluxo MFA com foco mobile. Para este entregável, o aplicativo mobile é simulado por uma tela web responsiva em `/mobile`, permitindo aprovar ou negar solicitações críticas em tempo real.

## O que foi implementado

- RBAC com funções globais: `admin`, `editor`, `viewer`.
- Compartilhamento granular por cofre com permissões `owner`, `write` e `read`.
- Persistência de permissões no banco via `VaultAccess`.
- Solicitações MFA persistidas via `MfaApprovalRequest`.
- Revelação de segredo apenas após aprovação MFA.
- Logs de auditoria para compartilhamento, acesso negado, MFA solicitado, aprovado, negado, expirado e revelação.
- Frontend web consumindo a API real:
  - Dashboard com nível de acesso e modal de compartilhamento.
  - Cofres compartilhados sem mocks.
  - Fluxo de revelação aguardando aprovação mobile.
  - Tela `/mobile` para aprovar ou negar acessos críticos.

## Como executar

```bash
docker compose up --build
```

Serviços:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API status: http://localhost:8000/status/

O backend executa `migrate` e `seed` automaticamente ao subir pelo Docker Compose.

## Usuários de teste

| Usuário | Senha | Função |
| --- | --- | --- |
| `joao.dias` | `Admin@2026` | admin |
| `maria.silva` | `Editor@2026` | editor |
| `carlos.santos` | `Editor@2026` | editor |
| `ana.costa` | `Viewer@2026` | viewer |

## Fluxo de validação

1. Entrar em http://localhost:3000 com `joao.dias / Admin@2026`.
2. Abrir um cofre e clicar em **Revelar Segredo**.
3. Abrir `/mobile` em outra aba.
4. Aprovar a solicitação pendente.
5. Voltar à tela do segredo e confirmar que o valor foi revelado.
6. Acessar **Auditoria** e confirmar os eventos `MFA Solicitado`, `MFA Aprovado` e `Revelação de Senha`.
7. No Dashboard, usar **Compartilhar** para conceder acesso a outro usuário.
8. Entrar como o usuário compartilhado e validar o cofre em **Compartilhados**.

## Endpoints principais

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/vaults/` | Lista cofres acessíveis ao usuário |
| `POST` | `/api/vaults/` | Cria cofre e torna o criador dono |
| `GET` | `/api/vaults/shared/` | Lista cofres compartilhados |
| `GET` | `/api/vaults/{id}/members/` | Lista membros de um cofre |
| `POST` | `/api/vaults/{id}/members/` | Concede ou altera permissão |
| `DELETE` | `/api/vaults/{id}/members/{member_id}/` | Remove acesso |
| `POST` | `/api/secrets/{id}/reveal/request/` | Cria solicitação MFA |
| `GET` | `/api/mfa/requests/` | Lista solicitações MFA do usuário |
| `POST` | `/api/mfa/requests/{id}/approve/` | Aprova solicitação |
| `POST` | `/api/mfa/requests/{id}/deny/` | Nega solicitação |
| `POST` | `/api/secrets/{id}/reveal/` | Revela segredo com MFA aprovado |

## Observações

- O endpoint `GET /api/secrets/{id}/` não retorna mais `secret_value`.
- O MFA usa polling no frontend para simular notificação em tempo real.
- A granularidade da F3 é por cofre, conforme definido para este entregável.
