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
    secret_value = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = Secret
        fields = [
            "id",
            "vault",
            "vault_name",
            "title",
            "username",
            "url",
            "notes",
            "description",
            "secret_value",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "vault_name", "created_at", "updated_at"]

    def validate(self, attrs):
        if self.instance is None and "secret_value" not in attrs:
            raise serializers.ValidationError({"secret_value": "Este campo e obrigatorio."})
        return attrs

    def create(self, validated_data):
        secret_value = validated_data.pop("secret_value")
        instance = Secret(**validated_data)
        instance.set_secret_value(secret_value)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        secret_value = validated_data.pop("secret_value", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if secret_value is not None:
            instance.set_secret_value(secret_value)
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if self.context.get("include_secret_value", False):
            data["secret_value"] = instance.get_secret_value()
        return data
