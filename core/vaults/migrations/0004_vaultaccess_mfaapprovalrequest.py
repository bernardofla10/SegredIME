# Generated manually for F3 granular sharing and MFA.

import django.db.models.deletion
import vaults.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("vaults", "0003_merge_20260421_0158"),
    ]

    operations = [
        migrations.CreateModel(
            name="VaultAccess",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "permission",
                    models.CharField(
                        choices=[
                            ("read", "Leitura"),
                            ("write", "Leitura e Escrita"),
                            ("owner", "Dono"),
                        ],
                        default="read",
                        max_length=10,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "granted_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="granted_vault_accesses",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="vault_accesses",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "vault",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="access_grants",
                        to="vaults.vault",
                    ),
                ),
            ],
            options={
                "ordering": ["vault_id", "user_id"],
            },
        ),
        migrations.CreateModel(
            name="MfaApprovalRequest",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pendente"),
                            ("approved", "Aprovado"),
                            ("denied", "Negado"),
                            ("expired", "Expirado"),
                        ],
                        default="pending",
                        max_length=10,
                    ),
                ),
                ("requested_ip", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.TextField(blank=True)),
                ("expires_at", models.DateTimeField(default=vaults.models.default_mfa_expiration)),
                ("decided_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "decided_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="mfa_decisions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "requested_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mfa_requests",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "secret",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="approval_requests",
                        to="vaults.secret",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="vaultaccess",
            constraint=models.UniqueConstraint(fields=("vault", "user"), name="unique_vault_user_access"),
        ),
        migrations.AddIndex(
            model_name="mfaapprovalrequest",
            index=models.Index(fields=["requested_by", "status", "-created_at"], name="vaults_mfaa_request_5ba19b_idx"),
        ),
        migrations.AddIndex(
            model_name="mfaapprovalrequest",
            index=models.Index(fields=["secret", "status"], name="vaults_mfaa_secret__f12b91_idx"),
        ),
        migrations.AddIndex(
            model_name="mfaapprovalrequest",
            index=models.Index(fields=["expires_at"], name="vaults_mfaa_expires_95b2b8_idx"),
        ),
    ]
