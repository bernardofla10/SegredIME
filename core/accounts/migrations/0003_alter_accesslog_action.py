# Generated manually for F3 audit actions.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_rename_accounts_ac_timesta_idx_accounts_ac_timesta_cc23ad_idx_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="accesslog",
            name="action",
            field=models.CharField(
                choices=[
                    ("login", "Login"),
                    ("logout", "Logout"),
                    ("view_vault", "Visualização de Cofre"),
                    ("create_vault", "Criação de Cofre"),
                    ("update_vault", "Atualização de Cofre"),
                    ("delete_vault", "Exclusão de Cofre"),
                    ("view_secret", "Visualização de Segredo"),
                    ("reveal_secret", "Revelação de Senha"),
                    ("create_secret", "Criação de Segredo"),
                    ("update_secret", "Atualização de Segredo"),
                    ("delete_secret", "Exclusão de Segredo"),
                    ("copy_secret", "Cópia de Segredo"),
                    ("share_vault", "Compartilhamento de Cofre"),
                    ("permission_change", "Alteração de Permissão"),
                    ("access_denied", "Acesso Negado"),
                    ("mfa_requested", "MFA Solicitado"),
                    ("mfa_approved", "MFA Aprovado"),
                    ("mfa_denied", "MFA Negado"),
                    ("mfa_expired", "MFA Expirado"),
                    ("failed_login", "Tentativa de Login Falha"),
                    ("export_logs", "Exportação de Logs"),
                ],
                max_length=30,
                verbose_name="Ação",
            ),
        ),
    ]
