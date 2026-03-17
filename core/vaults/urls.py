from django.urls import path
from .views import SecretDetailView, SecretListCreateView, VaultListCreateView, status_view

urlpatterns = [
    path("status/", status_view, name="status"),
    path("api/vaults/", VaultListCreateView.as_view(), name="vaults-list-create"),
    path("api/secrets/", SecretListCreateView.as_view(), name="secrets-list-create"),
    path("api/secrets/<int:pk>/", SecretDetailView.as_view(), name="secret-detail"),
]
