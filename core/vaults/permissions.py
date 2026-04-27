from .models import Vault, VaultAccess


ROLE_ADMIN = "admin"
ROLE_EDITOR = "editor"
ROLE_VIEWER = "viewer"


def is_admin(user):
    return bool(user and user.is_authenticated and user.role == ROLE_ADMIN)


def accessible_vaults_for(user):
    if is_admin(user):
        return Vault.objects.all()
    if not user or not user.is_authenticated:
        return Vault.objects.none()
    return Vault.objects.filter(access_grants__user=user).distinct()


def get_vault_permission(user, vault):
    if is_admin(user):
        return VaultAccess.PERMISSION_OWNER
    if not user or not user.is_authenticated:
        return None
    grant = vault.access_grants.filter(user=user).first()
    return grant.permission if grant else None


def can_read_vault(user, vault):
    return get_vault_permission(user, vault) in {
        VaultAccess.PERMISSION_READ,
        VaultAccess.PERMISSION_WRITE,
        VaultAccess.PERMISSION_OWNER,
    }


def can_write_vault(user, vault):
    return get_vault_permission(user, vault) in {
        VaultAccess.PERMISSION_WRITE,
        VaultAccess.PERMISSION_OWNER,
    }


def can_manage_vault(user, vault):
    return get_vault_permission(user, vault) == VaultAccess.PERMISSION_OWNER


def can_create_vault(user):
    return bool(user and user.is_authenticated and user.role in {ROLE_ADMIN, ROLE_EDITOR})
