import base64
import binascii
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

ENCRYPTION_PREFIX = "v1"
NONCE_SIZE = 12


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


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value.encode("ascii"))


def _cipher() -> AESGCM:
    return AESGCM(_decode_encryption_key())


def is_encrypted_secret(value: str) -> bool:
    return value.startswith(f"{ENCRYPTION_PREFIX}:")


def encrypt_secret(plaintext: str) -> str:
    nonce = os.urandom(NONCE_SIZE)
    ciphertext = _cipher().encrypt(nonce, plaintext.encode("utf-8"), None)
    return f"{ENCRYPTION_PREFIX}:{_b64encode(nonce)}:{_b64encode(ciphertext)}"


def decrypt_secret(encrypted_value: str) -> str:
    parts = encrypted_value.split(":", 2)
    if len(parts) != 3 or parts[0] != ENCRYPTION_PREFIX:
        raise ValueError("Formato de segredo criptografado invalido.")
    nonce = _b64decode(parts[1])
    ciphertext = _b64decode(parts[2])
    plaintext = _cipher().decrypt(nonce, ciphertext, None)
    return plaintext.decode("utf-8")
