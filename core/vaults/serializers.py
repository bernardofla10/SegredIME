from rest_framework import serializers

from .models import Secret, Vault


class VaultSerializer(serializers.ModelSerializer):
    secrets_count = serializers.IntegerField(source="secrets.count", read_only=True)

    class Meta:
        model = Vault
        fields = ["id", "name", "description", "secrets_count", "created_at", "updated_at"]
        read_only_fields = ["id", "secrets_count", "created_at", "updated_at"]


class SecretSerializer(serializers.ModelSerializer):
    vault_name = serializers.CharField(source="vault.name", read_only=True)

    class Meta:
        model = Secret
        fields = [
            "id",
            "vault",
            "vault_name",
            "title",
            "description",
            "secret_value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "vault_name", "created_at", "updated_at"]
