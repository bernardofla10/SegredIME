from rest_framework import status
from rest_framework.test import APITestCase

from .crypto import decrypt_secret, encrypt_secret, is_encrypted_secret
from .models import Secret, Vault


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
        self.vault = Vault.objects.create(
            name="Infra",
            description="Credenciais de infraestrutura",
        )

    def test_create_secret_encrypts_value_at_rest(self):
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

    def test_list_secret_returns_metadata_only(self):
        secret = Secret(vault=self.vault, title="AWS Key", description="Acesso ao bucket")
        secret.set_secret_value("abc123")
        secret.save()

        response = self.client.get("/api/secrets/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], secret.id)
        self.assertNotIn("secret_value", response.data[0])

    def test_list_secret_allows_filter_by_vault(self):
        other_vault = Vault.objects.create(name="App", description="App credentials")

        first_secret = Secret(vault=self.vault, title="DB", description="infra")
        first_secret.set_secret_value("db-secret")
        first_secret.save()

        other_secret = Secret(vault=other_vault, title="Api", description="app")
        other_secret.set_secret_value("api-secret")
        other_secret.save()

        response = self.client.get(f"/api/secrets/?vault={self.vault.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], first_secret.id)
        self.assertNotEqual(response.data[0]["id"], other_secret.id)

    def test_retrieve_secret_returns_decrypted_value(self):
        secret = Secret(vault=self.vault, title="SMTP Password", description="Conta de e-mail")
        secret.set_secret_value("mail-secret")
        secret.save()

        response = self.client.get(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "SMTP Password")
        self.assertEqual(response.data["vault"], self.vault.id)
        self.assertEqual(response.data["secret_value"], "mail-secret")

    def test_update_secret_reencrypts_new_value(self):
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
        secret = Secret(vault=self.vault, title="Chave de API", description="Integracao externa")
        secret.set_secret_value("to-delete")
        secret.save()

        response = self.client.delete(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Secret.objects.filter(id=secret.id).exists())
