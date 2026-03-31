import base64
import binascii
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import migrations


def _decode_encryption_key() -> bytes:
    raw_key = getattr(settings, "SECRETS_ENCRYPTION_KEY", "")
    if not raw_key:
        raise ImproperlyConfigured("SECRETS_ENCRYPTION_KEY nao configurada.")
    try:
        key = base64.urlsafe_b64decode(raw_key)
    except (binascii.Error, ValueError) as exc:
        raise ImproperlyConfigured("SECRETS_ENCRYPTION_KEY invalida (base64).") from exc
    if len(key) != 32:
        raise ImproperlyConfigured("SECRETS_ENCRYPTION_KEY deve ter 32 bytes.")
    return key


def encrypt_legacy_secrets(apps, schema_editor):
    Secret = apps.get_model("vaults", "Secret")
    cipher = AESGCM(_decode_encryption_key())
    for secret in Secret.objects.all().iterator():
        current_value = secret.encrypted_value
        if not current_value or current_value.startswith("v1:"):
            continue
        nonce = os.urandom(12)
        ciphertext = cipher.encrypt(nonce, current_value.encode("utf-8"), None)
        encoded_nonce = base64.urlsafe_b64encode(nonce).decode("ascii")
        encoded_ciphertext = base64.urlsafe_b64encode(ciphertext).decode("ascii")
        secret.encrypted_value = f"v1:{encoded_nonce}:{encoded_ciphertext}"
        secret.save(update_fields=["encrypted_value"])


def noop_reverse(apps, schema_editor):
    return None


class Migration(migrations.Migration):
    dependencies = [
        ("vaults", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="secret",
            old_name="secret_value",
            new_name="encrypted_value",
        ),
        migrations.RunPython(encrypt_legacy_secrets, noop_reverse),
    ]
