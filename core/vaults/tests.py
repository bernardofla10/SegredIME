from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .crypto import decrypt_secret, encrypt_secret, is_encrypted_secret
from .models import Secret, Vault, VaultAccess

User = get_user_model()


class SecretCryptoTests(APITestCase):
    def test_encrypt_and_decrypt_roundtrip(self):
        encrypted_value = encrypt_secret("super-secret")
        self.assertTrue(is_encrypted_secret(encrypted_value))
        self.assertEqual(decrypt_secret(encrypted_value), "super-secret")

    def test_encrypt_same_value_generates_different_ciphertext(self):
        first = encrypt_secret("same-value")
        second = encrypt_secret("same-value")
        self.assertNotEqual(first, second)


class SecretApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="Pass@12345", role="editor")
        self.reader = User.objects.create_user(username="reader", password="Pass@12345", role="viewer")
        self.outsider = User.objects.create_user(username="outsider", password="Pass@12345", role="viewer")
        self.vault = Vault.objects.create(name="Infra", description="Credenciais de infraestrutura")
        VaultAccess.objects.create(vault=self.vault, user=self.owner, permission="owner", granted_by=self.owner)
        VaultAccess.objects.create(vault=self.vault, user=self.reader, permission="read", granted_by=self.owner)

    def test_create_secret_encrypts_value_at_rest(self):
        self.client.force_login(self.owner)
        response = self.client.post(
            "/api/secrets/",
            {
                "vault": self.vault.id,
                "title": "DB Password",
                "description": "Senha principal do banco",
                "secret_value": "super-secret",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Secret.objects.count(), 1)
        secret = Secret.objects.get()
        self.assertEqual(secret.title, "DB Password")
        self.assertTrue(is_encrypted_secret(secret.encrypted_value))
        self.assertNotEqual(secret.encrypted_value, "super-secret")

    def test_reader_cannot_create_secret(self):
        self.client.force_login(self.reader)
        response = self.client.post(
            "/api/secrets/",
            {
                "vault": self.vault.id,
                "title": "DB Password",
                "description": "Senha principal do banco",
                "secret_value": "super-secret",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_secret_returns_metadata_only(self):
        self.client.force_login(self.reader)
        secret = Secret(vault=self.vault, title="AWS Key", description="Acesso ao bucket")
        secret.set_secret_value("abc123")
        secret.save()

        response = self.client.get("/api/secrets/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], secret.id)
        self.assertNotIn("secret_value", response.data[0])

    def test_outsider_cannot_list_vault_secret(self):
        self.client.force_login(self.outsider)
        secret = Secret(vault=self.vault, title="AWS Key", description="Acesso ao bucket")
        secret.set_secret_value("abc123")
        secret.save()

        response = self.client.get(f"/api/secrets/?vault={self.vault.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_retrieve_secret_does_not_return_decrypted_value(self):
        self.client.force_login(self.reader)
        secret = Secret(vault=self.vault, title="SMTP Password", description="Conta de e-mail")
        secret.set_secret_value("mail-secret")
        secret.save()

        response = self.client.get(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "SMTP Password")
        self.assertNotIn("secret_value", response.data)

    def test_reveal_secret_requires_approved_mfa(self):
        self.client.force_login(self.reader)
        secret = Secret(vault=self.vault, title="SMTP Password", description="Conta de e-mail")
        secret.set_secret_value("mail-secret")
        secret.save()

        request_response = self.client.post(f"/api/secrets/{secret.id}/reveal/request/", {}, format="json")
        self.assertEqual(request_response.status_code, status.HTTP_201_CREATED)
        approval_id = request_response.data["id"]

        denied_reveal = self.client.post(
            f"/api/secrets/{secret.id}/reveal/",
            {"approval_request_id": approval_id},
            format="json",
        )
        self.assertEqual(denied_reveal.status_code, status.HTTP_403_FORBIDDEN)

        approve_response = self.client.post(f"/api/mfa/requests/{approval_id}/approve/", {}, format="json")
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)

        reveal_response = self.client.post(
            f"/api/secrets/{secret.id}/reveal/",
            {"approval_request_id": approval_id},
            format="json",
        )
        self.assertEqual(reveal_response.status_code, status.HTTP_200_OK)
        self.assertEqual(reveal_response.data["secret_value"], "mail-secret")

    def test_update_secret_reencrypts_new_value(self):
        self.client.force_login(self.owner)
        secret = Secret(vault=self.vault, title="Token Antigo", description="Versao inicial")
        secret.set_secret_value("old-value")
        secret.save()
        old_encrypted_value = secret.encrypted_value

        response = self.client.put(
            f"/api/secrets/{secret.id}/",
            {
                "vault": self.vault.id,
                "title": "Token Atualizado",
                "description": "Versao corrigida",
                "secret_value": "new-value",
            },
            format="json",
        )

        secret.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(secret.title, "Token Atualizado")
        self.assertTrue(is_encrypted_secret(secret.encrypted_value))
        self.assertNotEqual(secret.encrypted_value, old_encrypted_value)
        self.assertEqual(secret.get_secret_value(), "new-value")

    def test_delete_secret(self):
        self.client.force_login(self.owner)
        secret = Secret(vault=self.vault, title="Chave de API", description="Integracao externa")
        secret.set_secret_value("to-delete")
        secret.save()

        response = self.client.delete(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Secret.objects.filter(id=secret.id).exists())


class VaultSharingApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin", password="Pass@12345", role="admin")
        self.owner = User.objects.create_user(username="owner", password="Pass@12345", role="editor")
        self.viewer = User.objects.create_user(username="viewer", password="Pass@12345", role="viewer")
        self.vault = Vault.objects.create(name="Produção")
        VaultAccess.objects.create(vault=self.vault, user=self.owner, permission="owner", granted_by=self.owner)

    def test_editor_creates_vault_and_becomes_owner(self):
        self.client.force_login(self.owner)
        response = self.client.post("/api/vaults/", {"name": "Novo", "description": "Teste"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vault = Vault.objects.get(name="Novo")
        self.assertTrue(VaultAccess.objects.filter(vault=vault, user=self.owner, permission="owner").exists())

    def test_viewer_cannot_create_vault(self):
        self.client.force_login(self.viewer)
        response = self.client.post("/api/vaults/", {"name": "Novo", "description": "Teste"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_share_vault(self):
        self.client.force_login(self.owner)
        response = self.client.post(
            f"/api/vaults/{self.vault.id}/members/",
            {"user": self.viewer.id, "permission": "read"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(VaultAccess.objects.filter(vault=self.vault, user=self.viewer, permission="read").exists())

    def test_reader_sees_shared_vault(self):
        VaultAccess.objects.create(vault=self.vault, user=self.viewer, permission="read", granted_by=self.owner)
        self.client.force_login(self.viewer)

        response = self.client.get("/api/vaults/shared/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.vault.id)
