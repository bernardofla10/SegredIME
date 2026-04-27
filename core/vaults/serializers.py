from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import MfaApprovalRequest, Secret, Vault, VaultAccess
from .permissions import can_manage_vault, can_write_vault, get_vault_permission

User = get_user_model()


class VaultSerializer(serializers.ModelSerializer):
    secrets_count = serializers.IntegerField(source="secrets.count", read_only=True)
    access_level = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()
    members_count = serializers.IntegerField(source="access_grants.count", read_only=True)

    class Meta:
        model = Vault
        fields = [
            "id",
            "name",
            "description",
            "secrets_count",
            "access_level",
            "can_manage",
            "members_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "secrets_count",
            "access_level",
            "can_manage",
            "members_count",
            "created_at",
            "updated_at",
        ]

    def get_access_level(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        return get_vault_permission(request.user, obj)

    def get_can_manage(self, obj):
        request = self.context.get("request")
        return can_manage_vault(request.user, obj) if request else False


class SecretSerializer(serializers.ModelSerializer):
    vault_name = serializers.CharField(source="vault.name", read_only=True)
    secret_value = serializers.CharField(write_only=True, required=False, allow_blank=False)
    can_edit = serializers.SerializerMethodField()

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
            "can_edit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "vault_name", "can_edit", "created_at", "updated_at"]

    def get_can_edit(self, obj):
        request = self.context.get("request")
        return can_write_vault(request.user, obj.vault) if request else False

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


class VaultAccessSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    user_display_name = serializers.SerializerMethodField()
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    granted_by_display_name = serializers.SerializerMethodField()

    class Meta:
        model = VaultAccess
        fields = [
            "id",
            "vault",
            "user",
            "username",
            "email",
            "user_display_name",
            "permission",
            "granted_by",
            "granted_by_display_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "vault",
            "granted_by",
            "granted_by_display_name",
            "created_at",
            "updated_at",
        ]

    def get_user_display_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_granted_by_display_name(self, obj):
        if not obj.granted_by:
            return ""
        return obj.granted_by.get_full_name() or obj.granted_by.username


class MfaApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_display_name = serializers.SerializerMethodField()
    secret_title = serializers.CharField(source="secret.title", read_only=True)
    vault_id = serializers.IntegerField(source="secret.vault_id", read_only=True)
    vault_name = serializers.CharField(source="secret.vault.name", read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = MfaApprovalRequest
        fields = [
            "id",
            "secret",
            "secret_title",
            "vault_id",
            "vault_name",
            "requested_by",
            "requested_by_display_name",
            "status",
            "requested_ip",
            "user_agent",
            "expires_at",
            "decided_at",
            "created_at",
            "updated_at",
            "is_expired",
        ]
        read_only_fields = fields

    def get_requested_by_display_name(self, obj):
        return obj.requested_by.get_full_name() or obj.requested_by.username
