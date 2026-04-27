from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access control."""

    ROLE_CHOICES = [
        ("admin", "Administrador"),
        ("editor", "Editor"),
        ("viewer", "Visualizador"),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="viewer",
        verbose_name="Função",
    )

    class Meta:
        ordering = ["id"]
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class AccessLog(models.Model):
    """Immutable audit trail of every user action on vaults and secrets."""

    ACTION_CHOICES = [
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
    ]

    STATUS_CHOICES = [
        ("success", "Sucesso"),
        ("warning", "Alerta"),
        ("error", "Erro"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="access_logs",
        verbose_name="Usuário",
    )
    user_display_name = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Nome do Usuário (snapshot)",
        help_text="Snapshot do nome no momento da ação",
    )
    action = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES,
        verbose_name="Ação",
    )
    resource_type = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="Tipo de Recurso",
        help_text="vault, secret, system, user",
    )
    resource_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="ID do Recurso",
    )
    resource_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Nome do Recurso",
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="Endereço IP",
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent",
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="success",
        verbose_name="Status",
    )
    details = models.TextField(
        blank=True,
        verbose_name="Detalhes",
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Data/Hora",
    )

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Log de Acesso"
        verbose_name_plural = "Logs de Acesso"
        indexes = [
            models.Index(fields=["-timestamp"]),
            models.Index(fields=["user", "-timestamp"]),
            models.Index(fields=["action", "-timestamp"]),
            models.Index(fields=["resource_type", "resource_id"]),
        ]

    def __str__(self):
        return f"[{self.timestamp}] {self.user_display_name} - {self.get_action_display()}"

    def save(self, *args, **kwargs):
        # Snapshot the user display name at creation time
        if not self.pk and self.user and not self.user_display_name:
            self.user_display_name = self.user.get_full_name() or self.user.username
        super().save(*args, **kwargs)

    @classmethod
    def log(cls, user, action, request=None, **kwargs):
        """Convenience factory to create an access log entry."""
        ip = None
        user_agent = ""
        if request:
            ip = cls._get_client_ip(request)
            user_agent = request.META.get("HTTP_USER_AGENT", "")

        return cls.objects.create(
            user=user if user and user.is_authenticated else None,
            user_display_name=kwargs.pop(
                "user_display_name",
                (user.get_full_name() or user.username) if user and user.is_authenticated else "Anônimo",
            ),
            action=action,
            ip_address=ip,
            user_agent=user_agent,
            **kwargs,
        )

    @staticmethod
    def _get_client_ip(request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
