from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from .crypto import decrypt_secret, encrypt_secret


def default_mfa_expiration():
    return timezone.now() + timedelta(minutes=5)


class Vault(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


class VaultAccess(models.Model):
    PERMISSION_READ = "read"
    PERMISSION_WRITE = "write"
    PERMISSION_OWNER = "owner"

    PERMISSION_CHOICES = [
        (PERMISSION_READ, "Leitura"),
        (PERMISSION_WRITE, "Leitura e Escrita"),
        (PERMISSION_OWNER, "Dono"),
    ]

    vault = models.ForeignKey(Vault, on_delete=models.CASCADE, related_name="access_grants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vault_accesses")
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES, default=PERMISSION_READ)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_vault_accesses",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["vault_id", "user_id"]
        constraints = [
            models.UniqueConstraint(fields=["vault", "user"], name="unique_vault_user_access"),
        ]

    def __str__(self):
        return f"{self.user} -> {self.vault} ({self.permission})"


class Secret(models.Model):
    vault = models.ForeignKey(Vault, on_delete=models.CASCADE, related_name="secrets")
    title = models.CharField(max_length=120)
    username = models.CharField(max_length=150, blank=True)
    url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    description = models.TextField(blank=True)
    encrypted_value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.title} ({self.vault.name})"

    def set_secret_value(self, secret_value: str) -> None:
        self.encrypted_value = encrypt_secret(secret_value)

    def get_secret_value(self) -> str:
        return decrypt_secret(self.encrypted_value)


class MfaApprovalRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_DENIED = "denied"
    STATUS_EXPIRED = "expired"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pendente"),
        (STATUS_APPROVED, "Aprovado"),
        (STATUS_DENIED, "Negado"),
        (STATUS_EXPIRED, "Expirado"),
    ]

    secret = models.ForeignKey(Secret, on_delete=models.CASCADE, related_name="approval_requests")
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mfa_requests",
    )
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mfa_decisions",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    requested_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    expires_at = models.DateTimeField(default=default_mfa_expiration)
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["requested_by", "status", "-created_at"]),
            models.Index(fields=["secret", "status"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"MFA #{self.id} - {self.secret} - {self.status}"

    @property
    def is_expired(self):
        return self.status == self.STATUS_PENDING and timezone.now() >= self.expires_at

    def expire_if_needed(self):
        if self.is_expired:
            self.status = self.STATUS_EXPIRED
            self.decided_at = timezone.now()
            self.save(update_fields=["status", "decided_at", "updated_at"])
            return True
        return False
