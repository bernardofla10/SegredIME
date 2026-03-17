# Entregável 3 - Banco, Modelagem e CRUD Persistido

## Conteúdo desta pasta
- `postman/SegredIME_Entregavel_03.postman_collection.json`: coleção com requests para Vault e CRUD completo de Secret.
- `postman/SegredIME_Local.postman_environment.json`: ambiente local para executar a coleção.

## Como validar manualmente
1. Suba os containers com `docker compose up --build`.
2. Aplique as migrations no backend com `docker compose exec backend python manage.py migrate`.
3. Acesse `http://localhost:8000/status/` e confirme resposta `{"status":"ok","service":"segredime"}`.
4. Importe a coleção e o ambiente do Postman presentes nesta pasta.
5. Execute primeiro `Create Vault`, depois os 4 requests de `Secret`:
   - `Create Secret`
   - `List Secrets`
   - `Update Secret`
   - `Delete Secret`

## Observações
- Nesta entrega o campo `secret_value` é salvo em texto simples apenas para validar integração e persistência.
- Criptografia, autenticação e auditoria ficam para as próximas etapas do projeto.
