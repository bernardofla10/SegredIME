from django.contrib import admin

from .models import Secret, Vault


@admin.register(Vault)
class VaultAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(Secret)
class SecretAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "vault", "created_at", "updated_at")
    list_filter = ("vault",)
    search_fields = ("title", "description")
