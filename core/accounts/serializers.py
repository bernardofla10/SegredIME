from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AccessLog

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    vaults_access = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "last_login",
            "date_joined",
            "vaults_access",
        ]
        read_only_fields = ["id", "full_name", "last_login", "date_joined", "vaults_access"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_vaults_access(self, obj):
        """Count distinct vaults this user has interacted with."""
        return (
            AccessLog.objects.filter(
                user=obj,
                resource_type="vault",
            )
            .values("resource_id")
            .distinct()
            .count()
        )


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class AccessLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = AccessLog
        fields = [
            "id",
            "user",
            "user_display_name",
            "action",
            "action_display",
            "resource_type",
            "resource_id",
            "resource_name",
            "ip_address",
            "user_agent",
            "status",
            "status_display",
            "details",
            "timestamp",
        ]
        read_only_fields = fields
