from rest_framework import serializers

from .models import Secret, Vault


class VaultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vault
        fields = ["id", "name", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


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
