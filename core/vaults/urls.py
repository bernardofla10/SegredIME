from django.urls import path
from .views import (
    SecretDetailView,
    SecretListCreateView,
    VaultDetailView,
    VaultListCreateView,
    status_view,
    SecretRevealView,
)

urlpatterns = [
    path("status/", status_view, name="status"),
    path("api/vaults/", VaultListCreateView.as_view(), name="vaults-list-create"),
    path("api/vaults/<int:pk>/", VaultDetailView.as_view(), name="vault-detail"),
    path("api/secrets/", SecretListCreateView.as_view(), name="secrets-list-create"),
    path("api/secrets/<int:pk>/", SecretDetailView.as_view(), name="secret-detail"),
    path("api/secrets/<int:pk>/reveal/", SecretRevealView.as_view(), name="secret-reveal"),
]
