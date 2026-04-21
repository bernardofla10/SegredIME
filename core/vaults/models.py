from django.db import models

from .crypto import decrypt_secret, encrypt_secret


class Vault(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


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
