from django.db import models


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
    description = models.TextField(blank=True)
    secret_value = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.title} ({self.vault.name})"
