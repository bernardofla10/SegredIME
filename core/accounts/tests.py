from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AccessLog

User = get_user_model()


class AuthApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="Test@12345",
            first_name="Test",
            last_name="User",
            email="test@example.com",
            role="editor",
        )

    def test_login_success(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "Test@12345"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        # Check access log was created
        self.assertTrue(AccessLog.objects.filter(action="login", user=self.user).exists())

    def test_login_failure(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "testuser", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # Should log a failed login
        self.assertTrue(AccessLog.objects.filter(action="failed_login").exists())

    def test_register(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "newuser",
                "password": "Secure@123",
                "email": "new@example.com",
                "first_name": "New",
                "last_name": "User",
                "role": "viewer",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_me_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")

    def test_me_unauthenticated(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        self.client.force_login(self.user)
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserManagementApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            password="Admin@12345",
            first_name="Admin",
            last_name="User",
            role="admin",
        )
        self.client.force_login(self.admin)

    def test_list_users(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_user(self):
        response = self.client.post(
            "/api/users/",
            {
                "username": "novo",
                "password": "Senha@123",
                "email": "novo@example.com",
                "first_name": "Novo",
                "last_name": "Usuário",
                "role": "viewer",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="novo").exists())

    def test_update_user(self):
        user = User.objects.create_user(
            username="editme",
            password="Pass@12345",
            role="viewer",
        )
        response = self.client.patch(
            f"/api/users/{user.id}/",
            {"role": "editor"},
            format="json",
        )
        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(user.role, "editor")

    def test_delete_user(self):
        user = User.objects.create_user(
            username="deleteme",
            password="Pass@12345",
        )
        response = self.client.delete(f"/api/users/{user.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username="deleteme").exists())


class AccessLogApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="logger",
            password="Log@12345",
            first_name="Logger",
            last_name="Test",
        )
        # Create some log entries
        AccessLog.log(self.user, "login", resource_type="system", resource_name="Login", status="success")
        AccessLog.log(self.user, "view_vault", resource_type="vault", resource_id=1, resource_name="Test Vault")
        AccessLog.log(None, "failed_login", user_display_name="hacker", resource_type="system", status="error")

    def test_list_logs(self):
        response = self.client.get("/api/logs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_status(self):
        response = self.client.get("/api/logs/?status=error")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_log_stats(self):
        response = self.client.get("/api/logs/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 3)
        self.assertIn("success", response.data)
        self.assertIn("error", response.data)
