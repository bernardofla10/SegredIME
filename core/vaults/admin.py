from django.contrib import admin

from .models import MfaApprovalRequest, Secret, Vault, VaultAccess


@admin.register(Vault)
class VaultAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(Secret)
class SecretAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "vault", "created_at", "updated_at")
    list_filter = ("vault",)
    search_fields = ("title", "description")


@admin.register(VaultAccess)
class VaultAccessAdmin(admin.ModelAdmin):
    list_display = ("id", "vault", "user", "permission", "granted_by", "created_at")
    list_filter = ("permission", "vault")
    search_fields = ("vault__name", "user__username", "user__email")


@admin.register(MfaApprovalRequest)
class MfaApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "secret", "requested_by", "status", "expires_at", "decided_at")
    list_filter = ("status",)
    search_fields = ("secret__title", "secret__vault__name", "requested_by__username")
    readonly_fields = (
        "secret",
        "requested_by",
        "decided_by",
        "status",
        "requested_ip",
        "user_agent",
        "expires_at",
        "decided_at",
        "created_at",
        "updated_at",
    )
