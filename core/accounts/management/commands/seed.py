from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import AccessLog
from vaults.models import MfaApprovalRequest, Secret, Vault, VaultAccess

User = get_user_model()


class Command(BaseCommand):
    help = "Popula o banco com usuários, cofres, segredos e logs de exemplo"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Populando banco de dados...")

        # ── Users ──────────────────────────────────────
        users_data = [
            {
                "username": "joao.dias",
                "password": "Admin@2026",
                "first_name": "João",
                "last_name": "Dias",
                "email": "joao.dias@ime.eb.br",
                "role": "admin",
                "is_staff": True,
            },
            {
                "username": "maria.silva",
                "password": "Editor@2026",
                "first_name": "Maria",
                "last_name": "Silva",
                "email": "maria.silva@ime.eb.br",
                "role": "editor",
            },
            {
                "username": "carlos.santos",
                "password": "Editor@2026",
                "first_name": "Carlos",
                "last_name": "Santos",
                "email": "carlos.santos@ime.eb.br",
                "role": "editor",
            },
            {
                "username": "ana.costa",
                "password": "Viewer@2026",
                "first_name": "Ana",
                "last_name": "Costa",
                "email": "ana.costa@ime.eb.br",
                "role": "viewer",
            },
            {
                "username": "pedro.oliveira",
                "password": "Editor@2026",
                "first_name": "Pedro",
                "last_name": "Oliveira",
                "email": "pedro.oliveira@ime.eb.br",
                "role": "editor",
                "is_active": False,
            },
        ]

        created_users = []
        for udata in users_data:
            password = udata.pop("password")
            user, created = User.objects.get_or_create(
                username=udata["username"],
                defaults=udata,
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(f"  ✅ Usuário criado: {user.username} ({user.role})")
            else:
                self.stdout.write(f"  ⏩ Usuário já existe: {user.username}")
            created_users.append(user)

        joao, maria, carlos, ana, pedro = created_users

        # ── Vaults ─────────────────────────────────────
        vaults_data = [
            {"name": "Produção", "description": "Credenciais de servidores e bancos de dados de produção"},
            {"name": "APIs Externas", "description": "Chaves de API de serviços terceiros (Stripe, AWS, etc.)"},
            {"name": "Certificados SSL", "description": "Certificados digitais e chaves privadas"},
            {"name": "Desenvolvimento", "description": "Credenciais de ambientes de desenvolvimento e staging"},
        ]

        created_vaults = []
        for vdata in vaults_data:
            vault, created = Vault.objects.get_or_create(
                name=vdata["name"],
                defaults=vdata,
            )
            status = "✅ Criado" if created else "⏩ Já existe"
            self.stdout.write(f"  {status}: Cofre '{vault.name}'")
            created_vaults.append(vault)

        prod, apis, ssl, dev = created_vaults

        access_data = [
            (prod, joao, "owner", joao),
            (prod, maria, "write", joao),
            (prod, ana, "read", joao),
            (apis, maria, "owner", maria),
            (apis, carlos, "write", maria),
            (apis, ana, "read", maria),
            (ssl, carlos, "owner", joao),
            (ssl, joao, "write", carlos),
            (dev, joao, "owner", joao),
            (dev, maria, "write", joao),
            (dev, carlos, "write", joao),
            (dev, ana, "read", joao),
        ]

        for vault, user, permission, granted_by in access_data:
            VaultAccess.objects.update_or_create(
                vault=vault,
                user=user,
                defaults={"permission": permission, "granted_by": granted_by},
            )
        self.stdout.write(f"  ✅ {len(access_data)} permissões de cofre configuradas")

        # ── Secrets ────────────────────────────────────
        secrets_data = [
            {"vault": prod, "title": "Banco de Dados Principal", "description": "PostgreSQL de produção", "secret_value": "P@ssw0rd!Secure#2026$DB"},
            {"vault": prod, "title": "API Gateway", "description": "Credencial do API Gateway", "secret_value": "Gw@y!2026#Secure$Pass"},
            {"vault": prod, "title": "Redis Cache", "description": "Senha do Redis em produção", "secret_value": "R3d1s#Pr0d!2026"},
            {"vault": apis, "title": "Stripe API Key", "description": "Chave de API Live do Stripe", "secret_value": "sk_live_51ABC123xyz789"},
            {"vault": apis, "title": "AWS Access Key", "description": "IAM User para deploy", "secret_value": "AKIAIOSFODNN7EXAMPLE"},
            {"vault": apis, "title": "SendGrid Token", "description": "API de envio de e-mails", "secret_value": "SG.xxxxx.yyyyy"},
            {"vault": ssl, "title": "Wildcard *.segredime.com", "description": "Certificado wildcard principal", "secret_value": "-----BEGIN CERTIFICATE-----\nMIIBxTCCAW..."},
            {"vault": dev, "title": "PostgreSQL Dev", "description": "Banco local de desenvolvimento", "secret_value": "dev_password_123"},
            {"vault": dev, "title": "JWT Secret", "description": "Secret para tokens JWT de staging", "secret_value": "jwt_staging_secret_2026"},
        ]

        for sdata in secrets_data:
            secret = Secret.objects.filter(
                vault=sdata["vault"],
                title=sdata["title"],
            ).first()
            created = secret is None
            if created:
                secret = Secret(
                    vault=sdata["vault"],
                    title=sdata["title"],
                    description=sdata["description"],
                )
                secret.set_secret_value(sdata["secret_value"])
                secret.save()
            status = "✅" if created else "⏩"
            self.stdout.write(f"  {status} Segredo: '{secret.title}' em '{secret.vault.name}'")

        first_secret = Secret.objects.filter(vault=prod, title="Banco de Dados Principal").first()
        if first_secret and not MfaApprovalRequest.objects.exists():
            MfaApprovalRequest.objects.create(
                secret=first_secret,
                requested_by=joao,
                requested_ip="192.168.1.105",
                user_agent="SegredIME Mobile Web Seed",
            )
            self.stdout.write("  ✅ Solicitação MFA pendente criada")

        # ── Access Logs ────────────────────────────────
        if AccessLog.objects.count() == 0:
            logs_data = [
                {"user": joao, "action": "login", "resource_type": "system", "resource_name": "Login", "status": "success", "details": "Login realizado com sucesso", "ip_address": "192.168.1.105"},
                {"user": joao, "action": "view_vault", "resource_type": "vault", "resource_id": prod.id, "resource_name": "Produção", "status": "success", "details": "Cofre 'Produção' visualizado", "ip_address": "192.168.1.105"},
                {"user": joao, "action": "reveal_secret", "resource_type": "secret", "resource_id": 1, "resource_name": "Produção / Banco de Dados Principal", "status": "success", "details": "Senha revelada após aprovação mobile", "ip_address": "192.168.1.105"},
                {"user": maria, "action": "create_vault", "resource_type": "vault", "resource_id": apis.id, "resource_name": "APIs Externas", "status": "success", "details": "Novo cofre criado com sucesso", "ip_address": "192.168.1.142"},
                {"user": carlos, "action": "view_vault", "resource_type": "vault", "resource_id": ssl.id, "resource_name": "Certificados SSL", "status": "warning", "details": "Acesso negado - autenticação 2FA pendente", "ip_address": "10.0.0.45"},
                {"user": ana, "action": "view_secret", "resource_type": "secret", "resource_id": 4, "resource_name": "APIs Externas / Stripe API Key", "status": "success", "details": "Senha copiada para área de transferência", "ip_address": "192.168.1.89"},
                {"user": pedro, "action": "update_secret", "resource_type": "secret", "resource_id": 2, "resource_name": "Produção / API Gateway", "status": "success", "details": "Credencial rotacionada com sucesso", "ip_address": "192.168.1.156"},
                {"user": None, "action": "failed_login", "resource_type": "system", "resource_name": "Sistema", "status": "error", "details": "Múltiplas tentativas de login falhadas", "ip_address": "203.0.113.45", "user_display_name": "Usuário Desconhecido"},
                {"user": joao, "action": "share_vault", "resource_type": "vault", "resource_id": dev.id, "resource_name": "Desenvolvimento", "status": "success", "details": "Cofre compartilhado com 3 usuários", "ip_address": "192.168.1.105"},
                {"user": maria, "action": "export_logs", "resource_type": "system", "resource_name": "Auditoria", "status": "warning", "details": "Exportação de logs dos últimos 30 dias", "ip_address": "192.168.1.142"},
                {"user": carlos, "action": "permission_change", "resource_type": "user", "resource_id": ana.id, "resource_name": "Gestão de Usuários / Ana Costa", "status": "success", "details": "Permissões de leitura concedidas", "ip_address": "10.0.0.45"},
                {"user": ana, "action": "view_secret", "resource_type": "secret", "resource_id": 8, "resource_name": "Desenvolvimento / PostgreSQL Dev", "status": "success", "details": "Acesso autorizado via biometria", "ip_address": "192.168.1.89"},
            ]

            for log_data in logs_data:
                user = log_data.pop("user")
                if "user_display_name" not in log_data and user:
                    log_data["user_display_name"] = user.get_full_name() or user.username
                elif "user_display_name" not in log_data:
                    log_data["user_display_name"] = "Anônimo"

                AccessLog.objects.create(user=user, **log_data)

            self.stdout.write(f"  ✅ {len(logs_data)} logs de auditoria criados")
        else:
            self.stdout.write(f"  ⏩ Logs já existem ({AccessLog.objects.count()} registros)")

        self.stdout.write(self.style.SUCCESS("\n🎉 Seed concluído com sucesso!"))
        self.stdout.write(f"   → {User.objects.count()} usuários")
        self.stdout.write(f"   → {Vault.objects.count()} cofres")
        self.stdout.write(f"   → {Secret.objects.count()} segredos")
        self.stdout.write(f"   → {AccessLog.objects.count()} logs de acesso")
        self.stdout.write(self.style.WARNING("\n📌 Login padrão: joao.dias / Admin@2026"))
