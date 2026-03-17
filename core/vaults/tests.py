from rest_framework import status
from rest_framework.test import APITestCase

from .models import Secret, Vault


class SecretApiTests(APITestCase):
    def setUp(self):
        self.vault = Vault.objects.create(
            name="Infra",
            description="Credenciais de infraestrutura",
        )

    def test_create_secret(self):
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
        self.assertEqual(Secret.objects.get().title, "DB Password")

    def test_list_secret(self):
        secret = Secret.objects.create(
            vault=self.vault,
            title="AWS Key",
            description="Acesso ao bucket",
            secret_value="abc123",
        )

        response = self.client.get("/api/secrets/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], secret.id)

    def test_retrieve_secret(self):
        secret = Secret.objects.create(
            vault=self.vault,
            title="SMTP Password",
            description="Conta de e-mail",
            secret_value="mail-secret",
        )

        response = self.client.get(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "SMTP Password")
        self.assertEqual(response.data["vault"], self.vault.id)

    def test_update_secret(self):
        secret = Secret.objects.create(
            vault=self.vault,
            title="Token Antigo",
            description="Versão inicial",
            secret_value="old-value",
        )

        response = self.client.put(
            f"/api/secrets/{secret.id}/",
            {
                "vault": self.vault.id,
                "title": "Token Atualizado",
                "description": "Versão corrigida",
                "secret_value": "new-value",
            },
            format="json",
        )

        secret.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(secret.title, "Token Atualizado")
        self.assertEqual(secret.secret_value, "new-value")

    def test_delete_secret(self):
        secret = Secret.objects.create(
            vault=self.vault,
            title="Chave de API",
            description="Integração externa",
            secret_value="to-delete",
        )

        response = self.client.delete(f"/api/secrets/{secret.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Secret.objects.filter(id=secret.id).exists())
