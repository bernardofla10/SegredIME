import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
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
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[
                            django.contrib.auth.validators.UnicodeUsernameValidator()
                        ],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, verbose_name="email address"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("admin", "Administrador"),
                            ("editor", "Editor"),
                            ("viewer", "Visualizador"),
                        ],
                        default="viewer",
                        max_length=10,
                        verbose_name="Função",
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "verbose_name": "Usuário",
                "verbose_name_plural": "Usuários",
                "ordering": ["id"],
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="AccessLog",
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
                    "user_display_name",
                    models.CharField(
                        blank=True,
                        help_text="Snapshot do nome no momento da ação",
                        max_length=150,
                        verbose_name="Nome do Usuário (snapshot)",
                    ),
                ),
                (
                    "action",
                    models.CharField(
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
                            ("failed_login", "Tentativa de Login Falha"),
                            ("export_logs", "Exportação de Logs"),
                        ],
                        max_length=30,
                        verbose_name="Ação",
                    ),
                ),
                (
                    "resource_type",
                    models.CharField(
                        blank=True,
                        help_text="vault, secret, system, user",
                        max_length=30,
                        verbose_name="Tipo de Recurso",
                    ),
                ),
                (
                    "resource_id",
                    models.IntegerField(
                        blank=True, null=True, verbose_name="ID do Recurso"
                    ),
                ),
                (
                    "resource_name",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Nome do Recurso"
                    ),
                ),
                (
                    "ip_address",
                    models.GenericIPAddressField(
                        blank=True, null=True, verbose_name="Endereço IP"
                    ),
                ),
                (
                    "user_agent",
                    models.TextField(blank=True, verbose_name="User Agent"),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("success", "Sucesso"),
                            ("warning", "Alerta"),
                            ("error", "Erro"),
                        ],
                        default="success",
                        max_length=10,
                        verbose_name="Status",
                    ),
                ),
                (
                    "details",
                    models.TextField(blank=True, verbose_name="Detalhes"),
                ),
                (
                    "timestamp",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="Data/Hora"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="access_logs",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Usuário",
                    ),
                ),
            ],
            options={
                "verbose_name": "Log de Acesso",
                "verbose_name_plural": "Logs de Acesso",
                "ordering": ["-timestamp"],
                "indexes": [
                    models.Index(
                        fields=["-timestamp"],
                        name="accounts_ac_timesta_idx",
                    ),
                    models.Index(
                        fields=["user", "-timestamp"],
                        name="accounts_ac_user_id_idx",
                    ),
                    models.Index(
                        fields=["action", "-timestamp"],
                        name="accounts_ac_action_idx",
                    ),
                    models.Index(
                        fields=["resource_type", "resource_id"],
                        name="accounts_ac_resourc_idx",
                    ),
                ],
            },
        ),
    ]
