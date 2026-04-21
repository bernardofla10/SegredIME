from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import AccessLog, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "username", "email", "first_name", "last_name", "role", "is_active")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")
    fieldsets = BaseUserAdmin.fieldsets + (
        ("SegredIME", {"fields": ("role",)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("SegredIME", {"fields": ("role", "email", "first_name", "last_name")}),
    )


@admin.register(AccessLog)
class AccessLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "timestamp",
        "user_display_name",
        "action",
        "resource_name",
        "ip_address",
        "status",
    )
    list_filter = ("action", "status", "resource_type")
    search_fields = ("user_display_name", "resource_name", "details", "ip_address")
    readonly_fields = (
        "user",
        "user_display_name",
        "action",
        "resource_type",
        "resource_id",
        "resource_name",
        "ip_address",
        "user_agent",
        "status",
        "details",
        "timestamp",
    )
    date_hierarchy = "timestamp"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
